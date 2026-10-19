# Campaña de difusión · Pack Completo · 19/10 → 18/12

Documento de trabajo para salir a difundir el **Pack Completo** (`pack-completo`), ya habilitado y destacado en la web.

Este archivo **no cambia precios ni disponibilidad**: todos los números de acá salen del repositorio y se pueden verificar en el código que se indica en cada fila. Si algún día cambia un precio, lo que manda es `src/lib/` y no este documento.

---

## 1. Qué se comunica

| Dato | Valor | Dónde se define |
| --- | ---: | --- |
| Pack Completo | **$169.900** | `src/lib/catalog-seed.ts` (`priceArs`) |
| Precio por separado vigente (hasta el 30/11) | **$214.500** | suma de los 5 productos con `aplicarOfertas()` |
| Ahorro que se muestra (hasta el 30/11) | **$44.600** | `src/components/ProductPrice.tsx` |
| Precio tachado | **Ninguno** | `compareAtPriceArs: null` — no hay precio anterior |
| Badge de la tarjeta | **Más elegido** | `src/lib/catalog-seed.ts` (`badge`) |
| Moneda y forma de pago | Pesos argentinos (ARS) · pago único, sin suscripción | `src/lib/legal.ts`, `ProductPrice.tsx` |
| Incluye | Infantil + Juvenil + Profesional + Biblioteca + Planificador con IA | `includesSlugs` |
| Acceso | Automático apenas se aprueba el pago, sin mail ni usuario | `src/app/api/entrega/route.ts` |
| Arrepentimiento | **10 días corridos**, devolución del 100 % en 10 días hábiles | `src/lib/legal.ts` |
| Contacto | WhatsApp **3644 670461** | `src/lib/legal.ts` |
| Link de la campaña | `https://ramelafutbol.vercel.app/#cursos` | — |

### Desglose del ahorro (hasta el 30/11)

| Producto incluido | Precio vigente |
| --- | ---: |
| Formación en Fútbol Infantil | $34.900 |
| Formación en Fútbol Juvenil | $39.900 |
| Formación en Fútbol Profesional | $69.900 |
| Biblioteca de Material de Entrenamiento | $29.900 |
| Planificador de Entrenamientos con IA | $39.900 |
| **Suma por separado** | **$214.500** |
| **Pack Completo** | **$169.900** |
| **Ahorro** | **$44.600** |

### ⚠️ El ahorro cambia con los tramos

La web calcula el ahorro **en el momento**, sumando lo que valen hoy los cinco productos sueltos. Los tramos de la Biblioteca y del Planificador vencen, así que el número de las piezas gráficas hay que revisarlo en estas dos fechas:

| Período | Suma por separado | Ahorro a comunicar |
| --- | ---: | ---: |
| 19/10 → 30/11 | $214.500 | **$44.600** |
| 01/12 → 18/12 | $217.500 | **$47.600** |
| Desde el 19/12 | $234.500 | **$64.600** |

Las piezas de `docs/campana/` se generaron con el número del primer tramo ($44.600). Antes de publicarlas en diciembre, regenerarlas o avisar que el ahorro ya es mayor.

### Reglas para escribir cualquier pieza

1. **No mostrar precio tachado.** No existe un precio anterior de $214.500: esa es la suma de comprar todo suelto hoy. Se dice *"por separado $214.500"*, nunca ~~$214.500~~.
2. **No inventar cupo ni fecha de cierre del Pack.** El Pack Completo no tiene tramo ni vencimiento (ver `src/lib/ofertas.ts`).
3. **Sí se puede usar la fecha de los tramos** para apurar: el 30/11 sube la Biblioteca y el 18/12 vencen las ofertas de la Biblioteca y del Planificador. Eso sí está en el código.
4. **El pack absorbe al Pack Infantil + Juvenil**: si alguien agrega los dos, se cobra solo el Completo ($169.900). Se puede decir sin miedo.
5. **El beneficio para compradores del Infantil** (Juvenil a $34.900) **no se acumula con el pack**. Siempre aclararlo en las respuestas.
6. **Nada de credenciales ni enlaces privados** en las piezas, los copies ni el repositorio.
7. Enviar los mensajes de WhatsApp **de a uno y a contactos que dieron su número**; nada de mensajes masivos a desconocidos.

---

## 2. Calendario · 19 de octubre → 18 de diciembre

| Semana | Fechas | Eje de la semana | Pieza | Canal |
| --- | --- | --- | --- | --- |
| 1 | Lun 19/10 → Dom 25/10 | **Anuncio**: ya está el Pack Completo | `placa-01` | WhatsApp 1 · IG feed · historia |
| 2 | Lun 26/10 → Dom 01/11 | **Qué incluye**: los 5 productos, uno por uno | `placa-02` | IG feed · WhatsApp 3 |
| 3 | Lun 02/11 → Dom 08/11 | **El número**: $214.500 suelto vs $169.900 | `placa-03` | IG feed · historia |
| 4 | Lun 09/11 → Dom 15/11 | **Planificador con IA**: probalo gratis, llevá el PDF | `placa-02` | IG historia · WhatsApp 4 |
| 5 | Lun 16/11 → Dom 22/11 | **Biblioteca**: 120 ejercicios, 15 gratis para probar | `placa-01` | IG historia · WhatsApp 3 |
| 6 | Lun 23/11 → Dom 29/11 | **Cierra el primer tramo** el 30/11: la Biblioteca sube | `placa-extra-historia` | IG historia con cuenta atrás |
| 7 | Lun 30/11 → Dom 06/12 | **Pretemporada**: llega el momento de planificar | `placa-03` | IG feed · WhatsApp 5 |
| 8 | Lun 07/12 → Dom 13/12 | **Aguinaldo**: pago único y queda para siempre | `placa-04` | WhatsApp 5 · IG feed |
| 9 | Lun 14/12 → Dom 18/12 | **Últimos días** de los tramos (vencen el 18/12) | `placa-extra-historia` | IG historia diaria · WhatsApp 5 |

Repetir `placa-04` (la del QR) como cierre fijo de cualquier conversación de WhatsApp: es la que convierte.

---

## 3. Cinco copies de WhatsApp

> Pegar tal cual, cambiando **[Nombre]**. El link va siempre al final y sin acortar: `https://ramelafutbol.vercel.app/#cursos`

### 1 · Anuncio general — semana 1

> Hola [Nombre], ¿cómo va? Te aviso que ya sumé el **Pack Completo**: los tres cursos (Infantil, Juvenil y Profesional), la Biblioteca con 120 ejercicios y el Planificador con IA, todo junto.
>
> Sale **$169.900** pago único en pesos argentinos. Comprado suelto hoy son $214.500, así que te ahorrás **$44.600**.
>
> El acceso es automático: pagás con Mercado Pago y apenas se aprueba te aparecen los enlaces, sin mail ni usuario. Y tenés 10 días para arrepentirte si no te convence.
>
> Te dejo el link: https://ramelafutbol.vercel.app/#cursos

### 2 · Para quien ya compró el Infantil — semanas 1 a 3

> Hola [Nombre]! Como ya tenés el curso Infantil, te comento dos caminos:
>
> · El **Juvenil a $34.900** para vos, verificando tu compra anterior (no se acumula con el pack).
> · O pasar directo al **Pack Completo** por **$169.900**: llevás Infantil, Juvenil, Profesional, Biblioteca y Planificador con IA. Suelto son $214.500.
>
> Si estás trabajando con varias categorías, el pack te conviene. Si querés sumar solo el Juvenil, me pasás el comprobante del Infantil y lo vemos.
>
> Link: https://ramelafutbol.vercel.app/#cursos

### 3 · Para el que consultó y no compró — semanas 2 y 5

> Hola [Nombre], ¿seguís dándole vueltas? Te resumo el Pack Completo en una línea:
>
> · Infantil, Juvenil y Profesional
> · Biblioteca de 120 ejercicios
> · Planificador con IA (sesiones, microciclos y mesociclos, PDF y Excel)
>
> **$169.900** pago único. Por separado, hoy, son $214.500.
>
> Si querés probar antes de decidir: en la web podés usar el Planificador gratis todas las veces que quieras y abrir 15 ejercicios de la Biblioteca sin comprar nada.
>
> https://ramelafutbol.vercel.app/#cursos

### 4 · Para cuerpos técnicos y el nivel Profesional — semana 4

> Hola [Nombre], te escribo por el lado del **Profesional**.
>
> Si además del curso te sirven los otros dos niveles, la Biblioteca y el Planificador con IA, conviene el **Pack Completo**: **$169.900** en vez de $214.500 sueltos.
>
> El Planificador arma microciclos MD-5 → MD+1 y mesociclos ATR con los 120 ejercicios de la biblioteca, cierra los minutos exactos y te deja bajar todo en PDF y Excel. Podés probarlo gratis antes de comprar.
>
> https://ramelafutbol.vercel.app/#cursos

### 5 · Cierre de tramo — semanas 8 y 9

> Hola [Nombre], aviso corto: las ofertas de la Biblioteca y del Planificador **vencen el 18/12**. Después de esa fecha, comprar todo suelto pasa a $234.500.
>
> El **Pack Completo** sigue en **$169.900** pago único, con los 5 productos incluidos y 10 días para arrepentirte.
>
> Si lo estabas esperando para el aguinaldo, este es el momento.
>
> https://ramelafutbol.vercel.app/#cursos

---

## 4. Copy para Instagram

### Post de feed (con `placa-01`)

> **Todo lo que necesitás para entrenar, en un solo lugar.**
>
> Infantil · Juvenil · Profesional · Biblioteca con 120 ejercicios · Planificador con IA.
>
> Por separado, hoy: $214.500.
> **Pack Completo: $169.900.** Pago único, en pesos argentinos.
>
> Acceso automático apenas se aprueba el pago. Sin mail, sin usuario, sin esperar que te respondamos. Y 10 días para arrepentirte.
>
> Link en la bio 👆

### Historias (3)

1. `placa-01` — *"Ya está el Pack Completo"* + sticker de link a `/#cursos`.
2. `placa-03` — *"Suelto $214.500 → Pack $169.900"* + sticker *"¿Cuánto te ahorrás?"* (encuesta: $44.600 / $0).
3. `placa-04` — *"Escaneá y entrá directo"* + sticker de link.

### Cuenta atrás (`placa-extra-historia`)

> Faltan **XX días** para que venzan las ofertas de la Biblioteca y del Planificador (18/12). El Pack Completo sigue a $169.900.

### Hashtags

`#futbolinfantil #fútboljuvenil #entrenadoresdefutbol #escueladefutbol #formaciondeportiva #planificaciondeportiva #futbolformativo #futbolargentino #entrenador #futbolbase`

### Respuestas rápidas para comentarios y DM

- *"¿Es por mes?"* → No: es pago único, queda para siempre.
- *"¿Cómo me llega?"* → Apenas se aprueba el pago volvés a la página y ahí aparecen los enlaces.
- *"¿Y si no me gusta?"* → Tenés 10 días corridos para arrepentirte y te devolvemos el 100 %.
- *"Ya tengo el Infantil"* → Te dejo el Juvenil a $34.900 verificando tu compra. No se acumula con el pack.

---

## 5. Piezas gráficas

Carpeta: `docs/campana/`. Se generaron a partir de la **foto real** del Profe (`public/images/profe-alejandro.jpg`), sin inventar rostros.

| Archivo | Medida | Uso | Texto fijo que lleva |
| --- | --- | --- | --- |
| `placa-01-pack-completo-portada.jpg` | 1080 × 1080 | Feed IG · apertura de la campaña | MÁS ELEGIDO · PACK COMPLETO · Profe. Alejandro Ramela · **$169.900** · Pago único · Pesos argentinos |
| `placa-02-que-incluye.jpg` | 1080 × 1080 | Feed IG · semana 2 | Los 5 productos incluidos, uno por uno |
| `placa-03-ahorro.jpg` | 1080 × 1080 | Feed IG · semanas 3 y 7 | $214.500 → **$169.900** · Ahorrás $44.600 |
| `placa-04-cta-qr.jpg` | 1080 × 1080 | Cierre de todas las piezas | QR a `/#cursos` · $169.900 · *Quiero el Pack Completo* · ramelafutbol.vercel.app/#cursos · 10 días para arrepentirte · WhatsApp 3644 670461 |
| `placa-extra-historia-countdown.jpg` | 1080 × 1920 | Historia IG · semanas 6 y 9 | Cuenta atrás al 18/12 · $169.900 |
| `qr-cursos.png` | 1160 × 1160 | Respaldo del QR real | Código verificable a `https://ramelafutbol.vercel.app/#cursos` |

Paleta: azul **#071634** (el mismo de la web), amarillo para el badge y acentos, césped en la base, tipografía condensada y en mayúsculas.

> **Sobre el QR:** `qr-cursos.png` es el código real, generado y verificado por lectura (apunta a `https://ramelafutbol.vercel.app/#cursos`). Si se imprime o se publica una placa cuyo QR no se lea bien, reemplazarlo por ese archivo antes de difundir.

---

## 6. Checklist

### Antes de publicar

- [ ] `npm test` en verde (59/59) y `npm run build` sin errores.
- [ ] El precio de la placa coincide con `src/lib/catalog-seed.ts` ($169.900).
- [ ] El ahorro de la placa coincide con el tramo en curso (ver tabla de la sección 1).
- [ ] La placa no tiene precio tachado.
- [ ] El link de la bio y de las historias apunta a `https://ramelafutbol.vercel.app/#cursos`.
- [ ] El QR se escanea y abre la sección `#cursos`.
- [ ] El número de WhatsApp de la pieza es 3644 670461.
- [ ] Ninguna pieza promete cupo, fecha de cierre del pack ni entrega por mail.

### Al publicar

- [ ] Feed del anuncio con `placa-01` y el copy de la sección 4.
- [ ] Historia con sticker de link.
- [ ] WhatsApp 1 a los contactos que dieron su número, de a uno.
- [ ] Guardar la historia del anuncio en destacados ("Pack Completo").

### Después

- [ ] Responder consultas con las respuestas rápidas de la sección 4.
- [ ] A los 7 días: segundo post con `placa-02` (qué incluye).
- [ ] A los 14 días: `placa-03` con el número del ahorro.
- [ ] Semana del 23/11: historia con cuenta atrás al 30/11.
- [ ] Semana del 07/12: WhatsApp 5 (aguinaldo) y `placa-04`.
- [ ] Antes del 19/12: revisar el ahorro, que pasa a $64.600, y actualizar las piezas si se siguen usando.
