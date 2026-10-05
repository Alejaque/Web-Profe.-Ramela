import { AddToCartButton } from "@/components/AddToCartButton";
import { SparkIcon } from "@/components/icons";
import { formatARS } from "@/lib/format";
import type { Product } from "@/lib/types";

const steps = [
  {
    title: "Elegí categoría y nivel",
    text: "Infantil, juvenil o profesional: la IA adapta la propuesta a la edad y al nivel de tus jugadores.",
  },
  {
    title: "Definí tu objetivo",
    text: "Indicá el contenido a trabajar, la duración, la cantidad de jugadores y el espacio disponible.",
  },
  {
    title: "Recibí tu planificación",
    text: "Obtené sesiones, microciclos y mesociclos listos para llevar a la cancha, y ajustalos a tu criterio.",
  },
];

const blocks = [
  { minutes: "10'", name: "Activación", detail: "Pases en cuadrados con movilidad" },
  { minutes: "20'", name: "Juego reducido", detail: "4 vs 4 + 2 comodines, zonas de salida" },
  { minutes: "15'", name: "Práctica específica", detail: "Progresión 6 vs 4 en media cancha" },
  { minutes: "15'", name: "Partido condicionado", detail: "7 vs 7, puntos por salida limpia" },
];

export function AiPlanner({ product }: { product?: Product }) {
  return (
    <section id="planificador-ia" className="bg-white py-20 text-[#071634] lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
            <SparkIcon className="h-4 w-4" />
            Inteligencia artificial
          </p>
          <h2 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-6xl">
            Planificaciones de entrenamiento con IA
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Ahorrá horas de trabajo. Generá planificaciones para fútbol infantil, juvenil y
            profesional con una herramienta basada en la metodología del Profe Alejandro y
            potenciada con inteligencia artificial.
          </p>

          <ol className="mt-9 space-y-6">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#071634] font-display text-xl font-bold text-sky-300">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="mt-1 leading-relaxed text-slate-600">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          {product ? (
            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <AddToCartButton slug={product.slug} className="w-full sm:w-auto" />
              <p className="text-sm text-slate-600">
                <span className="font-display text-3xl font-extrabold text-[#071634]">
                  {formatARS(product.priceArs)}
                </span>{" "}
                · acceso por 12 meses
              </p>
            </div>
          ) : null}
        </div>

        {/* Ejemplo ilustrativo de una planificación */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-sky-200 to-blue-200 blur-2xl"
          />
          <div className="relative overflow-hidden rounded-[2rem] bg-[#071634] text-white shadow-2xl ring-1 ring-black/10">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
                  Sesión · Sub-13 · 60 min
                </p>
                <p className="mt-0.5 font-display text-2xl font-bold uppercase">
                  Salida limpia desde el fondo
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sky-500 text-white">
                <SparkIcon className="h-5 w-5" />
              </span>
            </div>

            {/* Esquema de cancha */}
            <div className="px-6 pt-6">
              <svg
                viewBox="0 0 300 170"
                role="img"
                aria-label="Esquema ilustrativo de un ejercicio de salida desde el fondo"
                className="w-full rounded-xl"
              >
                <rect width="300" height="170" rx="10" fill="#15803d" />
                <g fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.5">
                  <rect x="10" y="10" width="280" height="150" />
                  <path d="M150 10v150" />
                  <circle cx="150" cy="85" r="22" />
                  <rect x="10" y="50" width="38" height="70" />
                  <rect x="252" y="50" width="38" height="70" />
                </g>
                <g stroke="#ffffff" strokeWidth="1.8" strokeDasharray="5 4" fill="none" strokeLinecap="round">
                  <path d="M40 85 C70 60, 90 55, 118 50" />
                  <path d="M118 50 C140 70, 150 90, 172 100" />
                  <path d="M60 130 C90 120, 120 125, 150 115" />
                </g>
                {[
                  [36, 85],
                  [60, 130],
                  [118, 50],
                  [150, 115],
                  [172, 100],
                ].map(([cx, cy]) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" fill="#38bdf8" stroke="#fff" strokeWidth="1.5" />
                ))}
                {[
                  [200, 60],
                  [215, 105],
                  [235, 80],
                ].map(([cx, cy]) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" fill="#f87171" stroke="#fff" strokeWidth="1.5" />
                ))}
              </svg>
            </div>

            <ul className="space-y-2 px-6 py-6">
              {blocks.map((block) => (
                <li
                  key={block.name}
                  className="flex items-center gap-4 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10"
                >
                  <span className="w-11 shrink-0 font-display text-2xl font-bold text-sky-300">
                    {block.minutes}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{block.name}</p>
                    <p className="truncate text-sm text-slate-300">{block.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="border-t border-white/10 px-6 py-3 text-xs text-slate-400">
              Ejemplo ilustrativo de una planificación generada. Podés ajustarla a tu categoría
              y a tu cancha.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
