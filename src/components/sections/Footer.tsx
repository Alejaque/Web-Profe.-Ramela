export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#030a1a] py-12 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            Profe. <span className="text-sky-400">Alejandro Ramela</span>
          </p>
          <p className="mt-1 text-sm">
            Profesor y entrenador de fútbol · Más de 30 años de experiencia
          </p>
        </div>

        <nav aria-label="Pie de página" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a href="#niveles" className="transition hover:text-white">Niveles</a>
          <a href="#cursos" className="transition hover:text-white">Cursos</a>
          <a href="#planificador-ia" className="transition hover:text-white">Planificador IA</a>
          <a href="#profe" className="transition hover:text-white">El Profe</a>
          <a href="#preguntas" className="transition hover:text-white">Preguntas</a>
          <a href="/muestra-gratis" className="transition hover:text-white">Muestra gratis</a>
          <a href="/terminos" className="transition hover:text-white">Términos y condiciones</a>
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-7xl px-5 lg:px-8">
        <a
          href="/arrepentimiento"
          className="inline-flex items-center rounded-xl border border-sky-400/50 px-5 py-2.5 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/10"
        >
          Botón de arrepentimiento
        </a>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 px-5 pt-6 text-xs lg:px-8">
        © {year} Profe. Alejandro Ramela. Todos los derechos reservados. Los precios están
        expresados en pesos argentinos (ARS).
      </div>
    </footer>
  );
}
