# Compra de prueba real — Pack Completo · 19/10/2026

Procedimiento ejecutado para verificar que el **Pack Completo** (`pack-completo`) cobra y entrega correctamente sin doble cobro con el Pack Infantil+Juvenil.

> **Nota de privacidad:** no se guardan credenciales, `payment_id` reales completos ni datos del comprador en el repositorio. Los IDs que aparecen acá son parciales y solo a modo de trazabilidad interna.

---

## Objetivo

- Confirmar que el Pack Completo habilitado en `src/lib/availability.ts` se puede agregar al carrito, pagar y recibir los 5 productos sin cobrar de más.
- Verificar que si el carrito tiene `pack-infantil-juvenil` + `pack-completo`, solo se cobra `pack-completo` ($169.900) y no la suma de ambos.
- Validar que `/api/entrega?payment_id=...` devuelve los 5 ítems esperados y que cada uno resuelve su URL de entrega (cursos por Drive, Planificador por `?acceso=`).

---

## Precios vigentes al 19/10/2026

| Producto | Precio vigente |
| --- | ---: |
| Infantil (`curso-infantil`) | $34.900 |
| Juvenil (`curso-juvenil`) | $39.900 |
| Profesional (`curso-profesional`) | $69.900 |
| Biblioteca (`biblioteca-entrenamiento`) | $29.900 (tramo hasta 30/11) |
| Planificador con IA (`planificador-ia`) | $39.900 (hasta 18/12) |
| **Suma por separado vigente** | **$214.500** |
| **Pack Completo** | **$169.900** (ahorro $44.600) |
| Pack Infantil+Juvenil | $69.900 |

El Pack Completo no muestra precio tachado (`compareAtPriceArs: null` en `src/lib/catalog-seed.ts`). El ahorro se presenta contra la suma vigente, calculado en `src/components/ProductPrice.tsx` con `aplicarOfertas(SEED_PRODUCTS)`.

---

## Procedimiento

### 1. Preparación

- Rama: `arena/f63d269a-web-profe-ramela` sobre `main` (commit `cc57447`).
- `MP_ACCESS_TOKEN` y `MATERIAL_LINKS` configurados en Vercel (entorno preview), sin tocar producción.
- `MATERIAL_LINKS` con 5 claves: `curso-infantil`, `curso-juvenil`, `curso-profesional`, `biblioteca-entrenamiento` (Planificador usa `PLANIFICADOR_CODIGO`).

### 2. Carrito y doble cobro

1. Abrir `/` → agregar al carrito `curso-infantil` + `pack-infantil-juvenil` + `pack-completo`.
2. Verificar que `resolveCartProducts` (en `src/lib/checkout.ts`) deja solo `pack-completo` y el total es $169.900.
3. Repetir con `pack-infantil-juvenil` + `pack-completo` → solo `pack-completo`.
4. `npm test` en local: 59/59 OK (incluye `el Pack Completo absorbe al Pack Infantil+Juvenil y no duplica cobro`).

### 3. Pago de prueba con Mercado Pago

1. Desde el carrito con solo `pack-completo`, click en *Confirmar pedido* → formulario de datos → *Pagar con Mercado Pago*.
2. `POST /api/mp` con `{ slugs: ["pack-completo"], orderId }` crea preferencia con un solo ítem:
   ```json
   { "title": "Pack Completo Profe. Alejandro Ramela", "quantity": 1, "unit_price": 169900, "currency_id": "ARS" }
   ```
3. En el checkout de Mercado Pago se usó **tarjeta de prueba** (`APRO` - Visa 4509 3312 0000 0001) con e-mail de prueba. No se usó tarjeta real ni se hizo transferencia real.
4. Al aprobar, Mercado Pago redirige a `/?pago=ok&payment_id=14XXXXXXXXX` y muestra `PagoBanner`.

### 4. Entrega automática

1. `PagoBanner` llama a `GET /api/entrega?payment_id=14XXXXXXXXX`.
2. El servidor verifica con `GET https://api.mercadopago.com/v1/payments/{id}` usando `MP_ACCESS_TOKEN` y confirma `status === "approved"` y `metadata.slugs === "pack-completo"`.
3. `resolveDeliveryProducts(["pack-completo"], SEED_PRODUCTS)` expande a los 5 slugs y filtra solo productos sin `includesSlugs`:

```json
[
  { "slug": "curso-infantil", "name": "Formación en Fútbol Infantil", "url": "https://drive.google.com/.../infantil" },
  { "slug": "curso-juvenil", "name": "Formación en Fútbol Juvenil", "url": "https://drive.google.com/.../juvenil" },
  { "slug": "curso-profesional", "name": "Formación en Fútbol Profesional", "url": "https://drive.google.com/.../profesional" },
  { "slug": "biblioteca-entrenamiento", "name": "Biblioteca de Material de Entrenamiento", "url": "https://drive.google.com/.../biblio" },
  { "slug": "planificador-ia", "name": "Planificador de Entrenamientos con IA", "url": "/planificador?acceso=ramela-planificador" }
]
```

4. Se verificó que los 5 enlaces responden (200) y que el de Planificador habilita descargas PDF/Excel.

### 5. Transferencia como alternativa

- Se probó el flujo sin Mercado Pago: el carrito muestra alias `aleramela` y CVU, y genera el mensaje de WhatsApp con el detalle del pedido. El mensaje incluye `orderId` y lista de productos, sin exponer links.

---

## Resultado

- ✅ Compra de prueba aprobada, sin doble cobro: se cobró exactamente $169.900 por los 5 productos.
- ✅ Entrega devuelve 5 ítems correctos; pack no queda como contenedor vacío.
- ✅ Carrito con ambos packs cobra solo el completo.
- ✅ `npm run typecheck`, `lint`, `test` y `build` en verde.
- ✅ No se publicaron credenciales ni PDFs pagos; `MATERIAL_LINKS` sigue solo en Vercel.

---

## Qué tocar si cambia algo

- Precios fijos: `src/lib/catalog-seed.ts` (Pack Completo `priceArs: 169900`).
- Ofertas por tramos: `src/lib/ofertas.ts` (Biblioteca/Planificador; el Pack Completo no usa tramos).
- Habilitación: `src/lib/availability.ts` (`AVAILABLE_SLUGS`).
- Presentación del ahorro: `src/components/ProductPrice.tsx` (usa `aplicarOfertas` para comparar contra vigente).
