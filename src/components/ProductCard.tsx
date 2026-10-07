import { AddToCartButton } from "@/components/AddToCartButton";
import { CheckIcon } from "@/components/icons";
import { isAvailable } from "@/lib/availability";
import { formatARS } from "@/lib/format";
import type { Product } from "@/lib/types";

function discountPercent(product: Product): number | null {
  if (!product.compareAtPriceArs || product.compareAtPriceArs <= product.priceArs) return null;
  return Math.round((1 - product.priceArs / product.compareAtPriceArs) * 100);
}

/** Tarjeta destacada para el pack completo. */
export function FeaturedProductCard({ product }: { product: Product }) {
  const badge = isAvailable(product.slug) ? product.badge : "Próximamente";
  const discount = discountPercent(product);
  const saving =
    product.compareAtPriceArs && product.compareAtPriceArs > product.priceArs
      ? product.compareAtPriceArs - product.priceArs
      : null;

  return (
    <article className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-500 via-sky-600 to-blue-800 text-white shadow-2xl shadow-sky-900/40 ring-1 ring-white/20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
      />
      <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {badge ? (
              <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-amber-950">
                {badge}
              </span>
            ) : null}
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
              {product.audience}
            </span>
          </div>
          <h3 className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl">
            {product.name}
          </h3>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-sky-50/90">
            {product.summary}
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {product.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm font-medium">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-sky-700">
                  <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.6} />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-end rounded-3xl bg-[#071634]/70 p-6 ring-1 ring-white/15 backdrop-blur">
          {discount ? (
            <span className="mb-3 w-fit rounded-full bg-emerald-400 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-950">
              {discount}% de ahorro
            </span>
          ) : null}
          {product.compareAtPriceArs ? (
            <p className="text-lg font-medium text-sky-200/80 line-through">
              {formatARS(product.compareAtPriceArs)}
            </p>
          ) : null}
          <p className="font-display text-6xl font-extrabold leading-none">
            {formatARS(product.priceArs)}
          </p>
          <p className="mt-2 text-sm text-sky-100/80">
            Pago único · precio en pesos argentinos
            {saving ? ` · ahorrás ${formatARS(saving)}` : ""}
          </p>
          <AddToCartButton slug={product.slug} variant="light" className="mt-6 w-full" />
        </div>
      </div>
    </article>
  );
}

/** Tarjeta estándar de curso. */
export function ProductCard({ product, className = "" }: { product: Product; className?: string }) {
  const badge = isAvailable(product.slug) ? product.badge : "Próximamente";
  return (
    <article
      className={`flex flex-col rounded-3xl bg-white p-7 text-slate-900 shadow-xl shadow-black/20 ring-1 ring-white/10 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-sky-700">
          {product.level}
        </span>
        {badge ? (
          <span className="rounded-full bg-[#071634] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-sky-300">
            {badge}
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 font-display text-3xl font-extrabold uppercase leading-[0.98] text-[#071634]">
        {product.name}
      </h3>
      <p className="mt-1 text-sm font-semibold text-sky-700">{product.audience}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{product.summary}</p>

      <ul className="mt-5 space-y-2.5">
        {product.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.4} />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <div className="flex items-end justify-between gap-3 border-t border-slate-200 pt-5">
          <div>
            <p className="font-display text-4xl font-extrabold leading-none text-[#071634]">
              {formatARS(product.priceArs)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Pago único · ARS</p>
          </div>
        </div>
        <AddToCartButton slug={product.slug} className="mt-4 w-full" />
      </div>
    </article>
  );
}
