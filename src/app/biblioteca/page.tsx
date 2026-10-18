import type { Metadata } from "next";
import Link from "next/link";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartProvider";
import { PagoBanner } from "@/components/PagoBanner";
import { WhatsappFloat } from "@/components/WhatsappFloat";
import { BibliotecaCatalog } from "@/components/BibliotecaCatalog";
import { AddToCartButton } from "@/components/AddToCartButton";
import { getActiveProducts } from "@/lib/catalog";
import { formatARS } from "@/lib/format";
import { EJERCICIOS } from "@/lib/biblioteca";

export const metadata: Metadata = {
  title: "Biblioteca de Material de Entrenamiento | Profe. Alejandro Ramela",
  description:
    "120 ejercicios de fútbol con diagrama, filtrados por nivel y objetivo. Material para infantil, juvenil y profesional, en PDF y Excel. Pago único.",
  openGraph: {
    title: "Biblioteca de Material de Entrenamiento | Profe. Alejandro Ramela",
    description:
      "120 ejercicios con diagrama, filtrados por nivel y objetivo. Infantil, juvenil y profesional. En PDF y Excel, pago único.",
    locale: "es_AR",
    type: "website",
  },
};

const CIFRAS = [
  { valor: "120", label: "ejercicios" },
  { valor: "3", label: "niveles" },
  { valor: "5", label: "objetivos" },
  { valor: "31", label: "categorías" },
];

const INCLUYE = [
  "Las 120 fichas en PDF, una por página y lista para imprimir",
  "Planilla de Excel con autofiltro y planificador de sesión",
  "Diagrama de la tarea en cada ejercicio",
  "Variantes y error común en todas las fichas",
  "Infantil, Juvenil y Profesional en el mismo material",
];

export default async function BibliotecaPage() {
  const products = await getActiveProducts();
  const product = products.find((p) => p.slug === "biblioteca-entrenamiento");
  const precio = product ? formatARS(product.priceArs) : null;

  return (
    <CartProvider products={products}>
      <div className="min-h-screen bg-[#050f26] text-white">
        <header className="border-b border-white/10">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
            <Link href="/" className="flex items-center gap-3" aria-label="Volver al inicio">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-500 font-display text-lg font-extrabold text-white">
                AR
              </span>
              <span className="font-display text-xl font-bold uppercase leading-none tracking-wide text-white">
                Profe. <span className="text-sky-400">Alejandro Ramela</span>
              </span>
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              ← Ir a la web
            </Link>
          </div>
        </header>

        <main>
          {/* --------------------------------------------------------- héroe */}
          <section className="relative isolate overflow-hidden px-5 pb-12 pt-14 lg:px-8 lg:pt-20">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[radial-gradient(900px_420px_at_50%_-10%,rgba(42,164,244,0.22),transparent_70%)]"
            />
            <div className="mx-auto max-w-7xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                Material de entrenamiento
              </p>
              <h1 className="mt-4 max-w-4xl font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-6xl lg:text-7xl">
                120 ejercicios para no quedarte{" "}
                <span className="text-sky-400">sin ideas</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-slate-300">
                Cada ejercicio viene con su diagrama de cancha, el desarrollo paso a paso,
                tres variantes y el error común que hay que corregir. Filtrá por nivel y por
                objetivo y encontrá lo que necesitás en segundos, desde el celular o la PC.
              </p>

              <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
                {CIFRAS.map((c) => (
                  <div key={c.label} className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                    <dt className="sr-only">{c.label}</dt>
                    <dd>
                      <span className="block font-display text-4xl font-extrabold leading-none text-sky-400">
                        {c.valor}
                      </span>
                      <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {c.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* ------------------------------------------------------ catálogo */}
          <section className="px-5 pb-20 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-extrabold uppercase sm:text-4xl">
                    Explorá el material
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-400">
                    Los filtros recorren las {EJERCICIOS.length} fichas. Las que dicen
                    <span className="text-slate-200"> “Ver ficha completa” </span>
                    son de muestra y se abren gratis; el resto se habilita con la biblioteca.
                  </p>
                </div>
              </div>

              <BibliotecaCatalog />
            </div>
          </section>

          {/* ---------------------------------------------------------- cierre */}
          <section className="border-t border-white/10 bg-[#071634] px-5 py-20 lg:px-8">
            <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-4xl font-extrabold uppercase leading-tight sm:text-5xl">
                  Llevate las 120 fichas
                </h2>
                <p className="mt-4 text-lg text-slate-300">
                  Pago único, sin suscripción. Apenas se acredita el pago, los enlaces para
                  bajar el PDF y el Excel aparecen en la pantalla.
                </p>
                <ul className="mt-7 space-y-3">
                  {INCLUYE.map((item) => (
                    <li key={item} className="flex gap-3 text-[15px] text-slate-200">
                      <span aria-hidden="true" className="mt-0.5 text-sky-400">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-white/[0.04] p-7 ring-1 ring-white/10 sm:p-9">
                {precio ? (
                  <>
                    <p className="text-sm text-slate-400">Biblioteca completa</p>
                    <p className="mt-1 font-display text-6xl font-extrabold leading-none text-white">
                      {precio}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Pago único · pesos argentinos (ARS)
                    </p>
                  </>
                ) : null}
                <div className="mt-6">
                  <AddToCartButton slug="biblioteca-entrenamiento" className="w-full" label="Agregar la biblioteca" />
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-400">
                  Apenas se aprueba el pago aparecen los enlaces de descarga en la pantalla:
                  bajás el PDF con las 120 fichas y la planilla de Excel con el planificador
                  de sesión. Sin mail, sin usuario y sin esperar a que te respondamos.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/10 px-5 py-10 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-slate-400">
            <p>© {new Date().getFullYear()} Profe. Alejandro Ramela</p>
            <nav aria-label="Enlaces" className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/" className="transition hover:text-white">Inicio</Link>
              <Link href="/muestra-gratis" className="transition hover:text-white">Muestra gratis</Link>
              <Link href="/terminos" className="transition hover:text-white">Términos</Link>
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
