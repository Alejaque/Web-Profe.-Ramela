import type { ReactNode } from "react";

export function LegalShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050f26] pb-16">
      <header className="border-b border-white/10 bg-[#050f26]/85">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-5">
          <a href="/" className="flex items-center gap-3" aria-label="Volver al inicio">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-500 font-display text-lg font-extrabold text-white">AR</span>
            <span className="font-display text-xl font-bold uppercase leading-none tracking-wide text-white">
              Profe. <span className="text-sky-400">Alejandro Ramela</span>
            </span>
          </a>
          <a href="/" className="text-sm font-medium text-slate-300 transition hover:text-white">← Volver al inicio</a>
        </div>
      </header>
      <main className="mx-auto mt-10 max-w-3xl px-5">
        <h1 className="font-display text-4xl font-extrabold uppercase leading-none text-white sm:text-5xl">{title}</h1>
        {intro ? <p className="mt-4 text-base leading-relaxed text-slate-300">{intro}</p> : null}
        <div className="mt-8 rounded-3xl bg-white p-6 text-[15px] leading-relaxed text-slate-700 shadow-xl sm:p-10">{children}</div>
      </main>
    </div>
  );
}
