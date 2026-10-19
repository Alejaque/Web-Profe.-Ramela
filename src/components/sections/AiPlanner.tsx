import Link from "next/link";

import { AddToCartButton } from "@/components/AddToCartButton";
import { ArrowRightIcon, SparkIcon } from "@/components/icons";
import { formatARS } from "@/lib/format";
import { armarSesion } from "@/lib/planificador/motor";
import { ROLES } from "@/lib/planificador/tipos";
import type { Parametros } from "@/lib/planificador/tipos";
import type { Product } from "@/lib/types";

const steps = [
  {
    title: "Elegí categoría y nivel",
    text: "Infantil, juvenil o profesional: la herramienta adapta la propuesta a la edad y al nivel de tus jugadores.",
  },
  {
    title: "Decile con qué contás",
    text: "Objetivo, duración, cuántos jugadores tenés, qué cancha y qué material. Nada de eso se asume.",
  },
  {
    title: "Llevate la planificación",
    text: "Sesiones, microciclos MD-5 → MD+1 y mesociclos ATR, en la pantalla y en PDF y Excel.",
  },
];

/**
 * La sesión de muestra se arma en el servidor con el mismo motor que usa la
 * herramienta. No es una captura ni un ejemplo escrito a mano: si mañana cambia
 * la biblioteca, cambia la muestra.
 */
const MUESTRA: Parametros = {
  nivel: "Juvenil",
  objetivo: "Táctica",
  minutos: 60,
  jugadores: 16,
  largo: 100,
  ancho: 64,
  material: ["balon", "conos", "petos", "arco", "aros", "vallas", "arquero"],
  semilla: 0,
};

export function AiPlanner({ product }: { product?: Product }) {
  const sesion = armarSesion(MUESTRA);

  return (
    <section id="planificador-ia" className="bg-white py-20 text-[#071634] lg:py-28">
      <div className="mx-auto grid max-w-7xl items-start gap-14 px-5 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
            <SparkIcon className="h-4 w-4" />
            Planificador
          </p>
          <h2 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-6xl">
            Dejá de armar la práctica a mano
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Elegís categoría, objetivo, cancha, jugadores y material. El planificador arma la
            sesión con los 120 ejercicios de la biblioteca, y los minutos{" "}
            <strong className="font-semibold text-[#071634]">cierran exactos</strong>: si pedís 60,
            son 60. También arma la semana completa y el mesociclo entero.
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

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/planificador"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#071634] px-7 py-3.5 font-bold text-white transition hover:bg-[#0d2149] sm:w-auto"
            >
              Probalo gratis ahora
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            {product ? (
              <p className="text-sm text-slate-600">
                Bajarlo en PDF y Excel{" "}
                <span className="font-display text-3xl font-extrabold text-[#071634]">
                  {formatARS(product.priceArs)}
                </span>{" "}
                · pago único
              </p>
            ) : null}
          </div>

          {product ? (
            <div className="mt-6">
              <AddToCartButton slug={product.slug} className="w-full sm:w-auto" />
            </div>
          ) : null}
        </div>

        {/* Una sesión real, armada por el motor. */}
        <div className="relative min-w-0">
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-sky-200 to-blue-200 blur-2xl"
          />
          <div className="relative overflow-hidden rounded-[2rem] bg-[#071634] text-white shadow-2xl ring-1 ring-black/10">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
                  {sesion.nivel} · {sesion.objetivo} · {sesion.minutosReales} minutos
                </p>
                <p className="mt-0.5 font-display text-2xl font-bold uppercase">
                  {sesion.titulo}
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sky-500 text-white">
                <SparkIcon className="h-5 w-5" />
              </span>
            </div>

            <ul className="space-y-2 px-6 py-6">
              {sesion.bloques.map((b) => (
                <li
                  key={`${b.ejercicio.id}-${b.rol}`}
                  className="flex items-center gap-4 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10"
                >
                  <span className="w-11 shrink-0 font-display text-2xl font-bold text-sky-300">
                    {b.min}&apos;
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{b.ejercicio.nombre}</p>
                    <p className="truncate text-sm text-slate-300">
                      {ROLES.find((r) => r.rol === b.rol)?.etiqueta} · {b.ejercicio.categoria}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="border-t border-white/10 px-6 py-3 text-xs text-slate-400">
              Esta sesión la armó el planificador recién, con los ejercicios de la biblioteca.
              Entrá y armá la tuya: es gratis mirarla todas las veces que quieras.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
