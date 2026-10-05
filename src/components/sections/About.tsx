import {
  BrainIcon,
  HandshakeIcon,
  HeartIcon,
  TrophyIcon,
  UsersIcon,
  BoardIcon,
  ClockIcon,
  FolderIcon,
} from "@/components/icons";

const highlights = [
  {
    Icon: ClockIcon,
    title: "Experiencia",
    text: "Más de 30 años formando y dirigiendo jugadores en el fútbol argentino.",
  },
  {
    Icon: FolderIcon,
    title: "Trayectoria",
    text: "Pasó por clubes de renombre del interior del fútbol argentino, dejando huella en su trayectoria.",
  },
  {
    Icon: UsersIcon,
    title: "Categorías",
    text: "Amplia experiencia en todas las categorías formativas y en planteles de primera división.",
  },
  {
    Icon: BoardIcon,
    title: "Metodología",
    text: "Enfoque en la formación integral del jugador, tanto en lo técnico-táctico como en lo personal.",
  },
  {
    Icon: HandshakeIcon,
    title: "Compromiso",
    text: "Dedicación, responsabilidad y pasión por desarrollar el máximo potencial de cada jugador.",
  },
];

const pillars = [
  { Icon: BrainIcon, label: "Cerebro" },
  { Icon: HeartIcon, label: "Pasión" },
  { Icon: UsersIcon, label: "Formación" },
  { Icon: TrophyIcon, label: "Resultados" },
];

export function About() {
  return (
    <section
      id="profe"
      className="relative isolate overflow-hidden bg-[#050f26] py-20 text-white lg:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(700px_500px_at_100%_0%,rgba(42,164,244,0.2),transparent_60%)]"
      />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">El Profe</p>
            <h2 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-6xl">
              Aprendé con quien lo vivió desde adentro
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-300">
              Alejandro Ramela transformó tres décadas de cancha, vestuarios y formación de
              jugadores en cursos, material y herramientas para que vos entrenes mejor.
            </p>

            <div className="mt-8 flex items-center gap-5 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
              <p className="font-display text-8xl font-extrabold leading-none text-sky-400">30</p>
              <div>
                <p className="font-display text-2xl font-bold uppercase leading-tight">
                  años de experiencia
                </p>
                <p className="mt-1 font-script text-4xl leading-none text-slate-200">
                  Alejandro Ramela
                </p>
              </div>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {highlights.map(({ Icon, title, text }, index) => (
              <li
                key={title}
                className={`rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:bg-white/10 ${
                  index === 0 ? "sm:col-span-2" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-500/15 text-sky-300">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="font-display text-2xl font-bold uppercase">{title}</h3>
                </div>
                <p className="mt-3 leading-relaxed text-slate-300">{text}</p>
              </li>
            ))}
          </ul>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-4 border-t border-white/10 pt-10 sm:grid-cols-4">
          {pillars.map(({ Icon, label }) => (
            <li key={label} className="flex flex-col items-center gap-3 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15">
                <Icon className="h-7 w-7" />
              </span>
              <span className="font-display text-xl font-bold uppercase tracking-wider text-slate-200">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
