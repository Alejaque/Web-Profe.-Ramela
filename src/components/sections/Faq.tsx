import { ArrowRightIcon } from "@/components/icons";

const faqs = [
  {
    q: "¿Cómo accedo al material después de comprar?",
    a: "Si pagás con Mercado Pago, al volver a la página ves los botones de acceso a tu material en el momento. Si pagás por transferencia, enviás el pedido por WhatsApp con el comprobante y el Profe te habilita el acceso, normalmente dentro de las 24 horas hábiles.",
  },
  {
    q: "¿En qué moneda están los precios y cómo puedo pagar?",
    a: "Todos los valores están expresados en pesos argentinos (ARS). Podés pagar con Mercado Pago (tarjeta, dinero en cuenta u otros medios) o por transferencia. Los dos medios te aparecen al confirmar tu pedido.",
  },
  {
    q: "¿Puedo comprar sólo un curso o conviene el pack?",
    a: "Por ahora está disponible el curso de Fútbol Infantil. Los demás cursos, la Biblioteca, el Planificador IA y el Pack Completo llegan próximamente.",
  },
  {
    q: "¿Sirve si recién empiezo como entrenador?",
    a: "Sí. Los cursos avanzan por etapas y están pensados tanto para quienes inician en la formación de jugadores como para cuerpos técnicos con experiencia que buscan actualizarse.",
  },
  {
    q: "¿Necesito conocimientos de tecnología para usar el Planificador IA?",
    a: "No. Elegís la categoría, el objetivo, la duración y la cantidad de jugadores, y la herramienta te arma la planificación para que la ajustes a tu manera.",
  },
];

export function Faq() {
  return (
    <section id="preguntas" className="bg-slate-50 py-20 text-[#071634] lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
            Preguntas frecuentes
          </p>
          <h2 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-6xl">
            Antes de empezar
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            Resolvemos las dudas más comunes sobre los cursos, el acceso y el pago.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-lg font-bold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-100 text-xl font-bold leading-none text-sky-700 transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="px-6 pb-6 leading-relaxed text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-sky-500 via-sky-600 to-blue-800 py-20 text-white">
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-white/10 blur-2xl"
      />
      <div className="mx-auto flex max-w-5xl flex-col items-center px-5 text-center">
        <h2 className="font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-7xl">
          Llevá tu formación al siguiente nivel
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-sky-50/90">
          Sumate a los entrenadores que ya se forman con la experiencia de más de 30 años en el
          fútbol argentino.
        </p>
        <a
          href="#cursos"
          className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-9 py-4 text-base font-bold text-[#071634] shadow-xl shadow-black/20 transition hover:bg-sky-50"
        >
          Quiero empezar ahora
          <ArrowRightIcon className="h-5 w-5" />
        </a>
      </div>
    </section>
  );
}
