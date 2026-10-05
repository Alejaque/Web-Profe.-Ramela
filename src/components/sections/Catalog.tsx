import { FeaturedProductCard, ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export function Catalog({ products }: { products: Product[] }) {
  const featured = products.find((product) => product.featured);
  const rest = products.filter((product) => !product.featured);

  // Reparte las tarjetas en una grilla de 6 columnas sin dejar huecos.
  const full = Math.floor(rest.length / 3) * 3;
  const remainder = rest.length - full;
  const spanFor = (index: number) => {
    if (index < full) return "lg:col-span-2";
    if (remainder === 2) return "lg:col-span-3";
    if (remainder === 1) return "lg:col-span-6";
    return "lg:col-span-2";
  };

  return (
    <section
      id="cursos"
      className="relative isolate overflow-hidden bg-[#071634] py-20 text-white lg:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(800px_400px_at_50%_0%,rgba(42,164,244,0.18),transparent_70%)]"
      />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
            Cursos y materiales
          </p>
          <h2 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-6xl">
            Elegí tu formación
          </h2>
          <p className="mt-5 text-lg text-slate-300">
            Pago único, acceso a tu material y valores en pesos argentinos. Sumá lo que
            necesitás al carrito y finalizá tu compra en un minuto.
          </p>
        </div>

        {products.length === 0 ? (
          <p className="mt-14 rounded-2xl bg-white/5 p-8 text-center text-slate-300 ring-1 ring-white/10">
            Estamos actualizando el catálogo. Volvé en unos minutos.
          </p>
        ) : (
          <div className="mt-14 space-y-6">
            {featured ? <FeaturedProductCard product={featured} /> : null}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
              {rest.map((product, index) => (
                <ProductCard key={product.slug} product={product} className={spanFor(index)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
