import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ArrowRightIcon, CheckIcon, FolderIcon } from "@/components/icons";
import { formatARS } from "@/lib/format";
import type { Product } from "@/lib/types";

/** Tres ejercicios reales de muestra, uno por nivel. Los SVG salen del mismo motor que el PDF. */
const MUESTRAS = [
  {
    id: "INF-02",
    nivel: "Infantil",
    nombre: "Circuito de conducción con cambio de dirección",
    svg: "/biblioteca/bib-inf-02.svg",
  },
  {
    id: "JUV-05",
    nivel: "Juvenil",
    nombre: "Finalización tras centro lateral",
    svg: "/biblioteca/bib-juv-05.svg",
  },
  {
    id: "PRO-05",
    nivel: "Profesional",
    nombre: "Rueda de finalización con pared y tercer hombre",
    svg: "/biblioteca/bib-pro-05.svg",
  },
];

const COLOR_NIVEL: Record<string, string> = {
  Infantil: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  Juvenil: "bg-indigo-500/15 text-indigo-300 ring-indigo-400/30",
  Profesional: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
};

export function BibliotecaStrip({ product }: { product?: Product }) {
  if (!product) return null;

  return (
    <section
      id="biblioteca"
      aria-labelledby="biblioteca-titulo"
      className="relative isolate overflow-hidden bg-[#0a1f4a] py-20 text-white lg:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(900px_460px_at_16%_8%,rgba(42,164,244,0.22),transparent_62%),radial-gradient(700px_460px_at_88%_94%,rgba(30,64,175,0.30),transparent_62%)]"
      />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sky-300 ring-1 ring-white/15">
            <FolderIcon className="h-4 w-4" />
            Biblioteca de Material · Novedad
          </p>
          <h2
            id="biblioteca-titulo"
            className="mt-6 font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl"
          >
            Probá 15 ejercicios gratis,{" "}
            <span className="text-sky-400">sin mail y sin registro</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            Son 120 ejercicios con diagrama, desarrollo, variantes y errores a corregir, para
            infantil, juvenil y profesional. Los 15 de muestra se abren acá mismo: entrás, filtrás
            por nivel y objetivo, y los usás hoy.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {MUESTRAS.map((muestra) => (
            <li
              key={muestra.id}
              className="overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10 transition hover:bg-white/[0.10]"
            >
              <div className="bg-[#0b2a52] p-3">
                {/* Son SVG estáticos servidos desde /public: next/image los bloquea por config. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={muestra.svg}
                  alt={`Diagrama del ejercicio ${muestra.id}: ${muestra.nombre}`}
                  width={466}
                  height={234}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full rounded-lg"
                />
              </div>
              <div className="p-5">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${COLOR_NIVEL[muestra.nivel]}`}
                >
                  {muestra.nivel}
                </span>
                <p className="mt-3 font-semibold leading-snug">{muestra.nombre}</p>
                <p className="mt-1.5 text-xs text-slate-400">{muestra.id} · se abre gratis</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-8 rounded-3xl bg-white/[0.05] p-7 ring-1 ring-white/10 lg:flex-row lg:items-center lg:justify-between lg:p-9">
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="font-display text-5xl font-extrabold leading-none">
                {formatARS(product.priceArs)}
              </p>
              {product.compareAtPriceArs ? (
                <p className="text-xl font-semibold text-slate-400 line-through">
                  {formatARS(product.compareAtPriceArs)}
                </p>
              ) : null}
              {product.badge ? (
                <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-300 ring-1 ring-inset ring-amber-400/30">
                  {product.badge}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Pago único en pesos argentinos · sin suscripción y sin renovación
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              {[
                "PDF con las 120 fichas",
                "Planilla Excel para armar sesiones",
                "Se usa desde el celular",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-sky-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:w-72 lg:shrink-0 lg:flex-col">
            <AddToCartButton
              slug={product.slug}
              variant="solid"
              label="Llevate las 120 fichas"
              className="w-full"
            />
            <Link
              href="/biblioteca"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-bold text-white ring-1 ring-inset ring-white/30 transition hover:bg-white/10"
            >
              Ver los 15 gratis
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
