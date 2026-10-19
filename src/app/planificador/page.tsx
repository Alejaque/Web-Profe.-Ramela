import type { Metadata } from "next";
import Link from "next/link";

import { AddToCartButton } from "@/components/AddToCartButton";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartProvider";
import { CheckIcon, SparkIcon } from "@/components/icons";
import { PagoBanner } from "@/components/PagoBanner";
import { PlanificadorApp } from "@/components/PlanificadorApp";
import { WhatsappFloat } from "@/components/WhatsappFloat";
import { getActiveProducts } from "@/lib/catalog";
import { formatARS } from "@/lib/format";
import { tieneAcceso } from "@/lib/planificador/acceso";

export const metadata: Metadata = {
  title: "Planificador de entrenamientos | Profe. Alejandro Ramela",
  description:
    "Armá sesiones, microciclos MD-5 a MD+1 y mesociclos ATR con los 120 ejercicios de la biblioteca. Los minutos cierran exactos. Bajalo en PDF y Excel.",
  openGraph: {
    title: "Planificador de entrenamientos | Profe. Alejandro Ramela",
    description:
      "Sesiones, microciclos y mesociclos armados con los 120 ejercicios de la biblioteca. Los minutos cierran exactos.",
    locale: "es_AR",
    type: "website",
  },
};

const QUE_HACE = [
  "Arma la sesión con ejercicios reales de la biblioteca, no con texto inventado",
  "Los minutos cierran exactos: si pedís 75&apos;, son 75&apos;",
  "Respeta tu cancha, tus jugadores y el material que tengas",
  "Microciclo MD-5 → MD+1, con el día de mayor carga donde va",
  "Mesociclo ATR de 2 a 6 semanas, con la descarga antes de competir",
];

export default async function PlanificadorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const acceso = tieneAcceso(params.acceso);
  const productos = await getActiveProducts();
  const producto = productos.find((p) => p.slug === "planificador-ia");

  return (
    <CartProvider products={productos}>
      <div className="min-h-screen bg-[#071634] text-white">
        <main>
          <section className="px-5 pb-10 pt-16 lg:px-8 lg:pt-24">
            <div className="mx-auto max-w-7xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sky-300 ring-1 ring-inset ring-sky-400/30">
                <SparkIcon className="h-4 w-4" />
                Planificador
              </p>
              <h1 className="mt-5 max-w-3xl font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-6xl">
                Armá la práctica en lo que tardás en leer esto
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
                Elegís categoría, objetivo, cuántos jugadores tenés, qué cancha y qué material.
                El planificador arma la sesión con los 120 ejercicios de la biblioteca, la semana
                completa MD-5 → MD+1 o el mesociclo entero.
              </p>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {QUE_HACE.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="px-5 pb-16 lg:px-8">
            <PlanificadorApp acceso={acceso} />
          </section>

          <section className="border-t border-white/10 px-5 py-16 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="font-display text-4xl font-extrabold uppercase leading-tight">
                  Llevatelas en PDF y en Excel
                </h2>
                <p className="mt-4 leading-relaxed text-slate-300">
                  En la pantalla podés armar y mirar todo, las veces que quieras y sin pagar nada.
                  Lo que se compra es el archivo: el PDF para imprimir y llevar a la cancha, y el
                  Excel para tocar lo que quieras.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Sesiones, microciclos y mesociclos ilimitados",
                    "PDF listo para imprimir, con la consigna de cada bloque",
                    "Excel con una hoja por día, para editar a tu gusto",
                    "Pago único: es tuyo para siempre, no vence",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm leading-relaxed text-slate-400">
                  Al aprobarse el pago aparecen los enlaces de descarga en la pantalla, igual que
                  con los cursos. Sin mail, sin usuario y sin esperar a que te respondamos. Si
                  querés, mirá antes la{" "}
                  <Link href="/biblioteca" className="font-semibold text-sky-300 underline underline-offset-4">
                    biblioteca de ejercicios
                  </Link>
                  .
                </p>
              </div>

              <div id="planificador-ia" className="h-fit">
                {producto ? (
                  <div className="rounded-3xl bg-white/5 p-8 ring-1 ring-inset ring-white/10">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
                      Acceso permanente
                    </p>
                    <div className="mt-4 flex flex-wrap items-baseline gap-3">
                      {producto.compareAtPriceArs ? (
                        <span className="font-display text-2xl font-bold text-slate-500 line-through">
                          {formatARS(producto.compareAtPriceArs)}
                        </span>
                      ) : null}
                      <span className="font-display text-5xl font-extrabold">
                        {formatARS(producto.priceArs)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      Pago único. No es una suscripción: pagás una vez y no vence.
                    </p>
                    <div className="mt-7">
                      <AddToCartButton slug={producto.slug} className="w-full" />
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-slate-400">
                      Se paga por Mercado Pago, en pesos y en cuotas. Apenas se acredita, los
                      enlaces aparecen en la pantalla.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/10 px-5 py-10 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-slate-400">
            <p>© {new Date().getFullYear()} Profe. Alejandro Ramela</p>
            <nav aria-label="Enlaces" className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/" className="transition hover:text-white">
                Inicio
              </Link>
              <Link href="/biblioteca" className="transition hover:text-white">
                Biblioteca
              </Link>
              <Link href="/muestra-gratis" className="transition hover:text-white">
                Muestra gratis
              </Link>
              <Link href="/terminos" className="transition hover:text-white">
                Términos
              </Link>
            </nav>
          </div>
        </footer>
      </div>

      <CartDrawer />
      <WhatsappFloat />
      <PagoBanner />
    </CartProvider>
  );
}
