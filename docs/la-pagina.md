# La página — qué tiene, cómo cobra y cómo se toca

Guía rápida de todo lo que está en el aire en `ramelafutbol.vercel.app` (y `web-profe-ramela.vercel.app`), cómo funciona por dentro y qué archivo tocar cuando haya que cambiar un precio, una fecha o un enlace.

---

## 1. Qué se vende hoy y a qué precio

Todos los precios están en pesos argentinos (ARS) y son de **pago único** (sin suscripción).

| Producto (`slug`) | Estado | Precio de lista | Precio actual | Cómo se define el descuento |
| --- | --- | ---: | ---: | --- |
| Formación en Fútbol Infantil (`curso-infantil`) | Habilitado | $44.900 | **$34.900** | Fijo en `src/lib/catalog-seed.ts` |
| Formación en Fútbol Juvenil (`curso-juvenil`) | Habilitado | $54.900 | **$39.900** ($34.900 p/ compradores del Infantil por WhatsApp) | Fijo en `src/lib/catalog-seed.ts` |
| Pack Infantil + Juvenil (`pack-infantil-juvenil`) | Habilitado (destacado) | — | **$69.900** (ahorro de $4.900 sobre $74.800) | Fijo en `src/lib/catalog-seed.ts` |
| Formación en Fútbol Profesional (`curso-profesional`) | Habilitado | $89.900 | **$69.900** | Fijo en `src/lib/catalog-seed.ts` |
| Biblioteca de Material (`biblioteca-entrenamiento`) | Habilitado | $39.900 | **$29.900** (hasta 30/11) → **$32.900** (hasta 18/12) → $39.900 | Por tramos con fecha en `src/lib/ofertas.ts` |
| Planificador con IA (`planificador-ia`) | Habilitado | $49.900 | **$39.900** (hasta 18/12) → $49.900 | Por tramos con fecha en `src/lib/ofertas.ts` |
| Pack Completo (`pack-completo`) | Habilitado (destacado) | — | **$169.900** (por separado vigente $214.500, ahorro $44.600) | Sin precio tachado; compara contra la suma vigente de sus 5 productos (`src/components/ProductPrice.tsx` + `src/lib/ofertas.ts`) |

### Ofertas con vencimiento automático (`src/lib/ofertas.ts`)

La Biblioteca y el Planificador tienen ofertas en **dos tramos** con fecha de cierre en hora de Argentina (`-03:00`):

1. **Hasta el 30 de noviembre a las 23:59** (*Cierre de temporada / Lanzamiento*): Biblioteca a $29.900, Planificador a $39.900.
2. **Del 1 al 18 de diciembre a las 23:59** (*Antes de la pretemporada*, coincide con el aguinaldo): Biblioteca a $32.900, Planificador a $39.900.
3. **Desde el 19 de diciembre**: vencen todos los tramos, desaparece la franja superior de oferta y cada producto vuelve solo a su precio de lista ($39.900 y $49.900), sin tener que acordarse de editar nada.

Tanto la vitrina como `/api/mp` llaman a `aplicarOfertas(SEED_PRODUCTS)` para que el número que se ve en pantalla sea siempre el mismo que cobra Mercado Pago.

---

## 2. Las páginas del sitio

| Ruta | Qué muestra | Archivo principal |
| --- | --- | --- |
| `/` | Portada, los 3 niveles, catálogo de cursos y herramientas, bloque destacado de la Biblioteca (con 3 diagramas SVG reales), sección del Planificador con IA (con una sesión real armada en el servidor), historia del Profe y preguntas frecuentes. | `src/app/page.tsx` |
| `/biblioteca` | Los **120 ejercicios** con filtros por nivel (`Infantil`, `Juvenil`, `Profesional`), por objetivo (`Técnica`, `Táctica`, `Físico`, `Cognitivo`, `Transición`) y buscador por código o texto. **15 fichas** (5 por nivel, 1 por objetivo) se abren gratis con su diagrama SVG (10 con animación). El contenido de las otras 105 no viaja al navegador. | `src/app/biblioteca/page.tsx`, `src/components/BibliotecaCatalog.tsx` |
| `/planificador` | Herramienta completa para **Infantil, Juvenil y Profesional**. Arma **Sesiones** (45', 60', 75', 90'), **Microciclos MD-5 → MD+1** y **Mesociclos ATR** (2 a 6 semanas). Usar y mirar en pantalla es gratis e ilimitado; bajar en **PDF y Excel** se habilita al comprar. | `src/app/planificador/page.tsx`, `src/components/PlanificadorApp.tsx` |
| `/muestra-gratis` | Descarga directa del PDF de muestra Infantil (`/muestra-gratis.pdf`), selector para ir a `/muestra-gratis/juvenil` y `/muestra-gratis/profesional`, y bloque de invitación a probar los 15 ejercicios gratis de la Biblioteca. | `src/app/muestra-gratis/page.tsx`, `src/components/MuestraContent.tsx` |
| `/terminos` y `/arrepentimiento` | Términos y condiciones de contratación y formulario de revocación de compra (botón de arrepentimiento). | `src/app/terminos/page.tsx`, `src/app/arrepentimiento/page.tsx` |

---

## 3. Cómo funciona el Planificador con IA

Está documentado en detalle en [`docs/planificador-ia.md`](./planificador-ia.md). En resumen:

- **Es híbrido**: el motor determinista (`src/lib/planificador/motor.ts` y `ciclos.ts`) elige los ejercicios entre los 120 de la biblioteca y garantiza que **los minutos cierren exactos** (si pedís 75', la suma de los bloques da 75').
- **La IA (Groq, `openai/gpt-oss-120b`) redacta la capa de texto** a través de `POST /api/planificador-ia`: título, introducción, el *por qué* de cada bloque, la consigna en voz de profe adaptada a los jugadores/cancha/material del pedido, y la nota de cierre (o las notas de cada día/semana en microciclo y mesociclo).
- **Nunca bloquea**: la sesión aparece al instante con los textos base del Profe (`consignas.ts`) y, cuando llega la respuesta de la IA en ~2–6 segundos, se mezcla sin tocar ni un minuto ni cambiar ningún ejercicio. Si la IA no está o falla, queda el texto del motor.
- **Descarga en el navegador**: tanto el PDF (`jsPDF`) como el Excel (`.xlsx` generado como ZIP con sus XML) salen del objeto ya mezclado.

---

## 4. Cómo funciona el cobro y la entrega automática

No hay cuentas de usuario, contraseñas ni envío de mails. Todo el circuito ocurre entre la página y Mercado Pago:

1. **Carrito (`src/components/CartDrawer.tsx`)**:
   - Deduplica productos y no permite agregar productos futuros.
   - Si el comprador agrega `curso-infantil` y `curso-juvenil` por separado, el carrito le ofrece cambiarlos con un clic al `pack-infantil-juvenil` y ahorrar $4.900.
2. **Pago online (`POST /api/mp` → `src/app/api/mp/route.ts`)**:
   - Recibe sólo los `slugs` y el `orderId`. Ignora cualquier precio enviado desde el navegador.
   - Calcula el precio vigente en el servidor (`aplicarOfertas(SEED_PRODUCTS)`) y crea la preferencia en Mercado Pago con retorno automático a `/?pago=ok`.
   - Si el comprador prefiere transferencia (o si Mercado Pago falla), el carrito muestra el alias (`aleramela`), el CVU y el botón para mandar el pedido y el comprobante por WhatsApp.
3. **Entrega automática (`GET /api/entrega` → `src/app/api/entrega/route.ts` y `src/components/PagoBanner.tsx`)**:
   - Cuando el comprador vuelve de Mercado Pago con `?pago=ok&payment_id=...`, `PagoBanner` consulta a `/api/entrega?payment_id=...`.
   - El servidor verifica directamente contra la API de Mercado Pago que ese `payment_id` exista y tenga `status === "approved"` (nunca confía sólo en que la URL diga `pago=ok`).
   - Si compró el **Pack Infantil + Juvenil**, `resolveDeliveryProducts` lo abre en los dos cursos individuales (`curso-infantil` y `curso-juvenil`).
   - Para los cursos y la biblioteca, devuelve el enlace configurado en `MATERIAL_LINKS`.
   - Para el **Planificador con IA** (`planificador-ia`), devuelve `/planificador?acceso=ramela-planificador` (o el código que esté en `PLANIFICADOR_CODIGO`), que habilita los botones **PDF** y **Excel**.
   - Si a algún producto le faltara su enlace en `MATERIAL_LINKS`, la tarjeta avisa que se entrega por WhatsApp y deja el botón armado con el número de operación.

---

## 5. Variables de entorno en Vercel

En el proyecto `web-profe-ramela` de Vercel:

| Variable | Obligatoria | Qué hace |
| --- | --- | --- |
| `MP_ACCESS_TOKEN` | Sí (producción) | Token de Mercado Pago para crear preferencias en `/api/mp` y verificar pagos aprobados en `/api/entrega`. |
| `MATERIAL_LINKS` | Sí | JSON con los enlaces de Google Drive por producto: `{"curso-infantil":"https://...","curso-juvenil":"https://...","curso-profesional":"https://...","biblioteca-entrenamiento":"https://..."}`. No hace falta clave para el pack ni para el planificador. |
| `GROQ_API_KEY` | Recomendada | Clave de Groq para que el Planificador redacte con IA. Sin ella, el planificador funciona igual con los textos base del motor. |
| `GROQ_MODEL` | No | Modelo de Groq. Por defecto usa `openai/gpt-oss-120b`. |
| `PLANIFICADOR_CODIGO` | No | Código que desbloquea las descargas en `/planificador?acceso=...`. Por defecto `ramela-planificador`. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | No | Número para todos los enlaces de WhatsApp. Por defecto `5493644670461`. |

> **Importante:** nunca guardar tokens ni enlaces privados de descarga dentro del repositorio Git.

---

## 6. Dónde tocar cada cosa cuando quieras hacer un cambio

- **Precios, títulos o textos de las tarjetas de productos:** `src/lib/catalog-seed.ts`.
- **Fechas y montos de las ofertas por tramos:** `src/lib/ofertas.ts`.
- **Habilitar o deshabilitar la venta de un producto (ej. cuando salga el Pack Completo):** `src/lib/availability.ts` (`AVAILABLE_SLUGS`).
- **Preguntas frecuentes de la home:** `src/components/sections/Faq.tsx`.
- **Datos bancarios para transferencia (alias / CVU):** `src/components/CartDrawer.tsx` (constante `PAY`).
- **Ejercicios de la biblioteca (los 120 metadatos y las 15 fichas abiertas):** `src/lib/biblioteca.ts` y `src/lib/biblioteca-fichas.ts`.

---

## 7. Cómo correr las pruebas antes de publicar

```sh
npm run typecheck   # Verifica tipos de TypeScript
npm run lint        # Verifica reglas de ESLint
npm test            # Corre los tests unitarios (ofertas, checkout, entrega, motor, ciclos e IA)
npm run build       # Compila el sitio completo como en Vercel
npm run test:e2e    # Corre las pruebas de extremo a extremo con Playwright
```
