import { FeaturedProductCard, ProductCard } from "@/components/ProductCard";
import { ArrowRightIcon } from "@/components/icons";
import { formatARS } from "@/lib/format";
import { isAvailable } from "@/lib/availability";
import type { Product } from "@/lib/types";

export function Catalog({ products }: { products: Product[] }) {
  const available = products.filter((p) => isAvailable(p.slug));
  const biblioteca = available.find((p) => p.slug === "biblioteca-entrenamiento");
  const featured = available.find((p) => p.featured);
  const courses = available.filter((p) => p.slug !== featured?.slug);
  const upcoming = products.filter((p) => !isAvailable(p.slug));

  return (
    <section id="cursos" className="relative isolate overflow-hidden bg-[#071634] py-20 text-white lg:py-28">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(800px_400px_at_50%_0%,rgba(42,164,244,0.18),transparent_70%)]" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Ofertas de lanzamiento</p>
          <h2 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-6xl">Elegí tu formación</h2>
          <p className="mt-5 text-lg text-slate-300">
            Infantil, Juvenil, Profesional, la Biblioteca de Material y el Planificador con IA ya
            están disponibles. Elegí uno o llevate Infantil + Juvenil en el pack, que sale menos que
            los dos sueltos. Pago único, material digital y precios en pesos argentinos.
          </p>
        </div>
        {products.length === 0 ? (
          <p className="mt-14 rounded-2xl bg-white/5 p-8 text-center text-slate-300 ring-1 ring-white/10">Estamos actualizando el catálogo. Volvé en unos minutos.</p>
        ) : (
          <div className="mt-14 space-y-6">
            {biblioteca ? (
              <a
                href="#biblioteca"
                className="flex w-full flex-wrap flex-col gap-4 rounded-2xl bg-amber-300/10 p-5 ring-1 ring-amber-300/40 transition hover:bg-amber-300/15 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-wrap flex-col gap-3 sm:flex-row sm:items-center">
                  <span className="inline-flex w-fit shrink-0 rounded-full bg-amber-300 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-amber-950">
                    Empezá por acá
                  </span>
                  <p className="min-w-0 break-words text-sm leading-relaxed text-sky-50">
                    ¿No sabés por dónde arrancar? Llevate la <strong>Biblioteca de Material</strong> por{" "}
                    {formatARS(biblioteca.priceArs)} (pago único) y probá 15 ejercicios gratis antes de decidir.
                  </p>
                </div>
                <span className="inline-flex shrink-0 flex-wrap items-center gap-2 font-bold text-amber-200">
                  Ver la Biblioteca
                  <ArrowRightIcon className="h-5 w-5" />
                </span>
              </a>
            ) : null}
            {featured ? <FeaturedProductCard product={featured} /> : null}
            <div className="grid gap-6 md:grid-cols-2">
              {courses.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  startHere={product.slug === biblioteca?.slug}
                />
              ))}
            </div>
            {upcoming.length ? (
              <div className="pt-12">
                <h3 className="font-display text-3xl font-bold uppercase">Próximos lanzamientos</h3>
                <p className="mt-2 text-sm text-slate-300">Estos productos todavía no están disponibles para comprar. No están incluidos en el Pack Infantil + Juvenil.</p>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {upcoming.map((product) => (
                    <ProductCard
                      key={product.slug}
                      product={product}
                      startHere={product.slug === biblioteca?.slug}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
