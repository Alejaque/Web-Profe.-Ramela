# Ofertas de lanzamiento · 16/10/2026

Precios y habilitación aprobados por el titular en la conversación. No se inventó fecha de cierre ni cupo de oferta.

| Producto | Precio de lista mostrado tachado | Precio de lanzamiento |
| --- | ---: | ---: |
| Infantil | $44.900 | $34.900 |
| Juvenil | $54.900 | $39.900 |
| Pack Infantil + Juvenil | No se presenta un precio anterior ficticio | $69.900 |

El pack se compara explícitamente con **las ofertas individuales actuales** ($74.800), con ahorro de $4.900. No es el Pack Completo de todos los niveles: solo incluye Infantil y Juvenil. Profesional, Biblioteca, Planificador IA y Pack Completo siguen deshabilitados.

## Compradores previos del Infantil

Juvenil a $34.900, previa verificación por WhatsApp de la compra anterior. El botón de la tarjeta genera un mensaje con el beneficio y la solicitud de verificación. No agrega un producto de precio reducido al carrito ni confía en una casilla del navegador. Después de verificar, el vendedor coordina ese pago manualmente. No se acumula con el pack.

## Precio y entrega

- `src/lib/catalog-seed.ts` es la fuente de precios tanto de la vitrina como de `/api/mp`.
- `src/lib/availability.ts` habilita Infantil, Juvenil y Pack Infantil + Juvenil.
- El servidor ignora importes enviados por el navegador; rechaza productos desconocidos o futuros. Deduplica y evita cobrar de nuevo cursos incluidos en un pack.
- Al agregar ambos cursos por separado, el carrito ofrece cambiarlos por el pack con el ahorro exacto.
- `/api/entrega` verifica el pago con Mercado Pago antes de devolver los cursos. El pack resuelve dos cursos, sin un enlace adicional del contenedor.
- El banner no da por confirmado un pago solo porque la URL diga `pago=ok`.

### Configuración existente del vendedor

Se mantiene `MP_ACCESS_TOKEN` en el entorno del servidor. **No guardar credenciales en Git ni en documentación.** No se modificaron las variables del proyecto de producción desde esta sesión.

`MATERIAL_LINKS` admite el enlace infantil existente o un JSON de enlaces por curso. Para entrega automática de ambos, configurar en el entorno del servidor las claves `curso-infantil` y `curso-juvenil`, con sus enlaces finales de acceso y permisos adecuados, y desplegar nuevamente. **No hace falta una clave de enlace para el pack.**

No se publicaron los archivos pagos en `public/`, no se incorporaron al commit web y no se cambiaron los permisos de Drive. Si falta el enlace de un curso, la pantalla indica que se habilita por WhatsApp. El acceso manual requiere revisar el pago y entregar al comprador el material correspondiente, normalmente dentro de las 24 horas hábiles, como se informa en FAQ y términos. Hasta configurar el enlace juvenil, su entrega utiliza ese circuito manual; esto no se anuncia como entrega automática completa.

## Comprobación

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
# Con el servidor iniciado y Chromium instalado para Playwright:
npm run dev -- --hostname 0.0.0.0 --port 3000
npm run test:e2e
```

- Nueve pruebas de precios, carrito, preferencias de Mercado Pago y entrega.
- Cuatro pruebas Playwright: navegación y compra hasta medios de pago en 1440/390 px; retorno sin pago verificable; retorno de pack con dos cursos.
- Se verificaron tachados, importes, ahorro, mensaje de WhatsApp, carrito, cambio al pack, formulario, importe en el botón de pago y fallback de transferencia. Sin errores de página ni desbordamiento horizontal móvil.
- TypeScript, ESLint y build de producción aprobados.
- Las llamadas a Mercado Pago en pruebas fueron **simuladas**; no se crearon preferencias ni cobros reales ni se comprobó la credencial de producción.
- Las mismas familias tipográficas (Inter, Barlow Condensed y Great Vibes) se alojan localmente con sus licencias OFL para evitar dependencias de Google Fonts durante el build.

Los PDF, XLSX, DOCX y ZIP del curso definitivo se mantienen intactos. Estas modificaciones afectan la web y la oferta, no el contenido editorial aprobado.
