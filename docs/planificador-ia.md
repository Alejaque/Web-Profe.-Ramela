# Planificador IA — cómo funciona

El planificador es **híbrido**: un motor determinista decide y una IA redacta.

## División de responsabilidades

| Qué | Quién | Garantía |
| --- | --- | --- |
| Qué ejercicios entran | Motor (`motor.ts`, los 120 ejercicios de la biblioteca) | Nunca inventa nada que no esté en la ficha |
| Cuántos minutos dura cada bloque y la sesión | Motor | Cierran exactos o se avisa (`exacta: false`) |
| Orden de la semana (MD-5 → MD+1) y el mesociclo ATR | Motor (`ciclos.ts`) | MD-3 es el día de mayor intensidad, siempre |
| Título, intro, "por qué" de cada bloque, consigna en voz de profe, notas de cierre | IA (Groq) | Adaptada al nivel, los jugadores, la cancha y el material del pedido |
| Lo mismo, cuando la IA no está o falla | Textos de capa 1 (`consignas.ts`, escritos por el profe) | La página nunca se cae ni se bloquea |

La clave: **la IA solo reescribe la capa de texto**. El cliente arma la sesión
con el motor al instante y la muestra; después le pide al servidor la versión
redactada y, si llega en ~2–6 s, la reemplaza. PDF y Excel se generan desde el
mismo objeto ya mezclado, así que la IA también va a la descarga (o no, según
llegue: nunca hay texto "a medio camino").

## Flujo

```
Navegador                                   Vercel
─────────                                   ──────
armarSesion(params)  ──►  sesión completa   (motor, sin red, al instante)
se muestra YA (texto capa 1)

POST /api/planificador-ia
  { tipo, params, bloques/dias/semanas }   ──►  Groq (openai/gpt-oss-120b)
  (payload compacto, sin la biblioteca)        respuesta JSON validada campo
                                               por campo (ia.ts)
  ◄── { titulo, intro, bloques[porQue, consigna], cierre }

Se mezcla: solo el texto cambia, los minutos no se tocan.
Badge "⚡ Texto generado por IA".
```

Si algo falla en la cadena (sin `GROQ_API_KEY`, cuota agotada 429, timeout de
25 s, JSON que no pasa la validación) el endpoint devuelve un error y el
navegador simplemente se queda con el texto del motor. No hay retries en el
cliente, no hay estado pendiente, no se promete lo que no llegó.

## Archivos

- `src/lib/planificador/ia.ts` — puro: payload, prompt, validación, mezcla, firma.
- `src/lib/planificador/useTextoIA.ts` — hook del cliente (aborta peticiones viejas).
- `src/app/api/planificador-ia/route.ts` — la única llamada a Groq; la key no llega al bundle.
- `tests/planificador-ia.test.ts` — valida que la mezcla no toca minutos ni ejercicios.

## Variables de entorno (Vercel)

| Variable | Para qué |
| --- | --- |
| `GROQ_API_KEY` | La key de Groq. Sin ella la IA está apagada y todo funciona igual. |
| `GROQ_MODEL` | Opcional. Default `openai/gpt-oss-120b`; `openai/gpt-oss-20b` es el doble de rápido. |

Límites del plan gratis de Groq (al oct/2026): 30 peticiones/min y ~1.000/día
por organización, sobre el modelo gpt-oss. Cada generación de sesión consume
**una** petición; el microciclo y el mesociclo también una cada uno (los
payloads son compactos a propósito, para no pegarse el tope de tokens por
minuto).

## Verificación

- Estado (sin consumir cuota): `GET /api/planificador-ia` → `{ "ia": true }`.
- Ping real (1 llamada mínima): `GET /api/planificador-ia?ping=1` →
  `{ "ia": true, "ok": true, "modelo": "openai/gpt-oss-120b" }`.

## Seguridad

- La key vive solo en el entorno de Vercel; el navegador nunca la ve.
- El endpoint valida la forma del payload y pone tope de 60 KB.
- No se guarda nada del entrenador: ni parámetros ni sesiones (no hay cuentas).
