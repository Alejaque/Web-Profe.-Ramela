import { BoardIcon, CheckIcon, TrophyIcon, UsersIcon } from "@/components/icons";

const levels = [
  {
    number: "01",
    title: "Fútbol infantil",
    age: "6 a 12 años",
    Icon: UsersIcon,
    accent: "from-sky-400 to-sky-600",
    text: "Enseñar a través del juego, con fundamentos técnicos y valores para que los chicos disfruten y aprendan.",
    points: [
      "Iniciación y fundamentos técnicos",
      "Juegos y progresiones por edad",
      "Planificación anual y semanal",
    ],
  },
  {
    number: "02",
    title: "Fútbol juvenil",
    age: "13 a 19 años",
    Icon: BoardIcon,
    accent: "from-blue-500 to-indigo-700",
    text: "Modelo de juego, periodización y formación personal para preparar al jugador antes del salto competitivo.",
    points: [
      "Principios tácticos y modelo de juego",
      "Carga y periodización en crecimiento",
      "Sesiones paso a paso",
    ],
  },
  {
    number: "03",
    title: "Fútbol profesional",
    age: "Primera división y ascenso",
    Icon: TrophyIcon,
    accent: "from-slate-700 to-[#071634]",
    text: "Conducción de planteles, análisis y preparación de partidos con la experiencia de 3 décadas dirigiendo jugadores.",
    points: [
      "Microciclos de competencia",
      "Análisis del rival y variantes",
      "Conducción de grupo y vestuario",
    ],
  },
];

export function Levels() {
  return (
    <section id="niveles" className="bg-slate-50 py-20 text-[#071634] lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
            Formación académica en fútbol
          </p>
          <h2 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-6xl">
            Un camino de formación para cada etapa
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Accedé a material de entrenamiento y planificaciones para todos los niveles. Elegí
            el curso que se adapta a la categoría que dirigís o sumá todo en un solo pack.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {levels.map(({ number, title, age, Icon, accent, text, points }) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-6 select-none font-display text-[9rem] font-extrabold leading-none text-slate-100"
              >
                {number}
              </span>
              <div
                className={`relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}
              >
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="relative mt-6 font-display text-4xl font-extrabold uppercase leading-none">
                {title}
              </h3>
              <p className="relative mt-2 text-sm font-bold text-sky-700">{age}</p>
              <p className="relative mt-4 leading-relaxed text-slate-600">{text}</p>
              <ul className="relative mt-6 space-y-2.5">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.4} />
                    {point}
                  </li>
                ))}
              </ul>
              <a
                href="#cursos"
                className="relative mt-7 inline-flex items-center text-sm font-bold text-sky-700 underline-offset-4 hover:underline"
              >
                Ver curso y precio →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
