import { isAvailable } from "@/lib/availability";
import { SEED_PRODUCTS } from "@/lib/catalog-seed";
import { formatARS } from "@/lib/format";
import { LEGAL } from "@/lib/legal";
import type { Product } from "@/lib/types";

/** Un solo bloque de precio para las tarjetas estándar y el pack destacado. */
export function ProductPrice({ product, inverted = false }: { product: Product; inverted?: boolean }) {
  const offer = isAvailable(product.slug) && product.compareAtPriceArs != null && product.compareAtPriceArs > product.priceArs;
  const separatePrice = product.slug === "pack-infantil-juvenil"
    ? SEED_PRODUCTS.filter((p) => product.includesSlugs.includes(p.slug)).reduce((sum, p) => sum + p.priceArs, 0)
    : null;
  const muted = inverted ? "text-sky-100/80" : "text-slate-500";

  return (
    <div>
      {offer ? (
        <p className={`mb-2 text-sm ${muted}`}>
          Precio de lista <del className="ml-1 decoration-2">{formatARS(product.compareAtPriceArs!)}</del>
        </p>
      ) : null}
      {isAvailable(product.slug) ? (
        <p className={`mb-2 text-xs font-extrabold uppercase tracking-wider ${inverted ? "text-amber-300" : "text-sky-700"}`}>
          Oferta lanzamiento
        </p>
      ) : null}
      <p className={`font-display text-5xl font-extrabold leading-none sm:text-6xl ${inverted ? "text-white" : "text-[#071634]"}`}>
        {formatARS(product.priceArs)}
      </p>
      <p className={`mt-2 text-xs ${muted}`}>Pago único · pesos argentinos (ARS)</p>
      {offer ? (
        <p className={`mt-2 text-sm font-semibold ${inverted ? "text-emerald-300" : "text-emerald-700"}`}>
          Ahorrás {formatARS(product.compareAtPriceArs! - product.priceArs)} sobre el precio de lista
        </p>
      ) : null}
      {separatePrice && separatePrice > product.priceArs ? (
        <div className={`mt-3 text-sm ${muted}`}>
          <p>Por separado en lanzamiento: {formatARS(separatePrice)}</p>
          <p className={`mt-1 font-bold ${inverted ? "text-emerald-300" : "text-emerald-700"}`}>
            Con el pack ahorrás {formatARS(separatePrice - product.priceArs)}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** Se verifica la compra anterior antes de cobrar; no es un descuento público del carrito. */
export function PreviousBuyerOffer({ product }: { product: Product }) {
  if (!product.previousBuyerPriceArs || !isAvailable(product.slug)) return null;
  const message = `Hola Profe! Ya compré el curso Infantil y quiero acceder al Juvenil con el beneficio de ${formatARS(product.previousBuyerPriceArs)}. Te envío el comprobante o los datos de mi compra anterior para que lo verifiques antes de pagar.`;
  return (
    <div className="mt-5 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
      <p className="text-sm font-bold text-[#071634]">¿Ya compraste el Infantil?</p>
      <p className="mt-1 text-sm text-slate-700">
        Tu precio para el Juvenil: <strong className="text-lg text-sky-800">{formatARS(product.previousBuyerPriceArs)}</strong>
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        Verificamos tu compra anterior por WhatsApp antes del pago. No se aplica automáticamente en el carrito ni se acumula con el pack.
      </p>
      <a
        href={`https://wa.me/${LEGAL.whatsapp}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-emerald-700 px-3 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        Validar mi compra del Infantil
      </a>
    </div>
  );
}
