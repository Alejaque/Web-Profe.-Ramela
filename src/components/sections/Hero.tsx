import Image from "next/image";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { formatARS } from "@/lib/format";

export function Hero({ fromPrice }: { fromPrice: number | null }) {
  return (
    <section
      id="inicio"
      className="relative isolate overflow-hidden bg-[#050f26] text-white"
    >
      {/* Fondo: degradé azul + líneas de cancha */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(900px_520px_at_82%_30%,rgba(42,164,244,0.30),transparent_60%),radial-gradient(700px_500px_at_0%_100%,rgba(30,64,175,0.35),transparent_60%),linear-gradient(180deg,#050f26_0%,#071634_100%)]"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 600 600"
        className="absolute -bottom-40 -left-40 -z-10 h-[620px] w-[620px] text-white opacity-[0.05]"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        <circle cx="300" cy="300" r="180" />
        <circle cx="300" cy="300" r="8" fill="currentColor" />
        <path d="M0 300h600M300 0v600" />
      </svg>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-8 lg:pb-24 lg:pt-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sky-300 ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            Profesor y entrenador de fútbol
          </p>

          <h1 className="mt-6 font-display text-[3.4rem] font-extrabold uppercase leading-[0.92] tracking-tight sm:text-7xl lg:text-[5.6rem]">
            Formate como entrenador con{" "}
            <span className="text-sky-400">30 años</span> de experiencia en cancha
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-300">
            Cursos de formación académica en fútbol, material de entrenamiento en todos los
            niveles y planificaciones con inteligencia artificial para fútbol{" "}
            <strong className="font-semibold text-white">infantil, juvenil y profesional</strong>.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#cursos"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-sky-500/30 transition hover:bg-sky-400"
            >
              Ver cursos y precios
              <ArrowRightIcon className="h-5 w-5" />
            </a>
            <a
              href="#planificador-ia"
              className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-bold text-white ring-1 ring-inset ring-white/30 transition hover:bg-white/10"
            >
              Conocé el Planificador IA
            </a>
          </div>

          <ul className="mt-9 flex flex-col gap-3 text-sm font-medium text-slate-300 sm:flex-row sm:flex-wrap sm:gap-x-7">
            {[
              "Material para todos los niveles",
              "Planificaciones con IA",
              fromPrice ? `Desde ${formatARS(fromPrice)}` : "Precios en pesos argentinos",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-sky-500/20 text-sky-300">
                  <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.6} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Portada: foto + referencia de experiencia */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-[460px] lg:justify-self-end">
          <div
            aria-hidden="true"
            className="absolute -inset-5 rounded-[3rem] bg-sky-500/30 blur-3xl"
          />
          <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] shadow-2xl shadow-black/50 ring-1 ring-white/25">
            <Image
              src="/images/profe-alejandro.jpg"
              alt="Profe. Alejandro Ramela, profesor y entrenador de fútbol, con los brazos cruzados en la cancha"
              fill
              priority
              sizes="(min-width: 1024px) 460px, 90vw"
              className="object-cover object-top"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#050f26]/85 via-[#050f26]/30 to-transparent"
            />
            <p className="absolute bottom-5 right-6 font-script text-4xl leading-none text-white drop-shadow">
              Alejandro Ramela
            </p>
          </div>

          <div className="absolute -bottom-7 left-4 flex items-center gap-4 rounded-2xl bg-white px-5 py-4 text-[#071634] shadow-2xl shadow-black/40 sm:-left-8">
            <p className="font-display text-6xl font-extrabold leading-none text-sky-600">+30</p>
            <p className="max-w-[9.5rem] text-sm font-semibold leading-snug">
              años de experiencia formando y dirigiendo jugadores
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StatsStrip() {
  const stats = [
    { value: "+30", label: "años de experiencia en el fútbol argentino" },
    { value: "3", label: "niveles: infantil, juvenil y profesional" },
    { value: "IA", label: "planificaciones de entrenamiento en minutos" },
    { value: "24/7", label: "acceso a tu material, cuando lo necesites" },
  ];

  return (
    <section aria-label="Datos destacados" className="bg-[#0a1f4a] pt-10 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-5 py-10 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.value} className="flex items-center gap-4">
            <p className="font-display text-5xl font-extrabold leading-none text-sky-400 sm:text-6xl">
              {stat.value}
            </p>
            <p className="text-sm leading-snug text-slate-300">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
