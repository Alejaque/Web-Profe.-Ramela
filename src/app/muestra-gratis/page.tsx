import type { Metadata } from "next";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Muestra gratis: 3 fichas de fútbol infantil | Profe. Alejandro Ramela",
  description: "Descargá gratis 3 fichas con diagramas de cancha, una para cada etapa de 6 a 12 años.",
};

const wa = `https://wa.me/${LEGAL.whatsapp}?text=${encodeURIComponent("Hola Profe! Descargué la muestra gratis y quiero consultar por el curso de fútbol infantil.")}`;

export default function MuestraGratisPage() {
  return (
    <div className="min-h-screen bg-[#050f26] pb-16">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5">
          <a href="/" className="flex items-center gap-3" aria-label="Volver al inicio">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-500 font-display text-lg font-extrabold text-white">AR</span>
            <span className="font-display text-xl font-bold uppercase leading-none tracking-wide text-white">
              Profe. <span className="text-sky-400">Alejandro Ramela</span>
            </span>
          </a>
          <a href="/" className="text-sm font-medium text-slate-300 transition hover:text-white">← Ir a la web</a>
        </div>
      </header>

      <main className="mx-auto mt-10 grid max-w-5xl items-center gap-10 px-5 md:grid-cols-2">
        <div className="mx-auto w-full max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/muestra-portada.jpg" alt="Portada de la muestra gratis" className="w-full rounded-2xl shadow-2xl shadow-sky-500/20 ring-1 ring-white/10" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">Muestra gratis</p>
          <h1 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.95] text-white sm:text-6xl">
            3 fichas para entrenar mejor <span className="text-sky-400">desde hoy</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            Una ficha para cada etapa (6-7, 8-9 y 10-12 años), con diagrama de cancha, consignas y versiones más fácil y más difícil. Listas para usar en tu próximo entrenamiento.
          </p>
          <ul className="mt-5 space-y-2 text-slate-200">
            <li>✓ 3 juegos reales del curso, con su diagrama</li>
            <li>✓ Cómo organizar, jugar y corregir cada uno</li>
            <li>✓ PDF para imprimir o ver en el celular</li>
          </ul>
          <a
            href="/muestra-gratis.pdf"
            download
            className="mt-7 flex w-full items-center justify-center rounded-xl bg-sky-500 px-6 py-4 text-base font-bold text-white transition hover:bg-sky-400 sm:w-auto"
          >
            Descargar la muestra gratis (PDF)
          </a>
          <div className="mt-8 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <p className="font-semibold text-white">¿Te gustó? Mirá el curso completo</p>
            <p className="mt-1 text-sm text-slate-300">4 guías y una planilla de Excel: metodología, 30 juegos con diagramas, planificación anual y gestión de familias.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="/#cursos" className="rounded-xl border border-sky-400/50 px-5 py-2.5 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/10">Ver el curso</a>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95">Consultar por WhatsApp</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
