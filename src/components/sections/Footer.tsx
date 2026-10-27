import { blanco } from "@/components/IdentidadOficial";
import Link from "next/link";
import { RefreshIcon, WhatsappIcon } from "@/components/icons";
import { whatsappUrl } from "@/components/TrustStrip";
import { LEGAL } from "@/lib/legal";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#030a1a] py-12 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <img src={blanco} alt="Escudo RamelaFútbol" className="mb-4 h-20 w-20 object-contain" />
          <p className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            Profe. <span className="text-sky-400">Alejandro Ramela</span>
          </p>
          <p className="mt-1 text-sm">
            Profesor y entrenador de fútbol · Más de 30 años de experiencia
          </p>
          <p className="mt-3 flex items-start gap-2 text-sm">
            <RefreshIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
            <span>
              Garantía de devolución: {LEGAL.plazoArrepentimiento} para arrepentirte, sin costo
            </span>
          </p>
        </div>

        <nav aria-label="Pie de página" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a href="#niveles" className="transition hover:text-white">Niveles</a>
          <a href="#cursos" className="transition hover:text-white">Cursos</a>
          <Link href="/planificador" className="transition hover:text-white">Planificador con IA</Link>
          <a href="#profe" className="transition hover:text-white">El Profe</a>
          <a href="#preguntas" className="transition hover:text-white">Preguntas</a>
          <Link href="/muestra-gratis" className="transition hover:text-white">Muestra Infantil</Link>
          <Link href="/muestra-gratis/juvenil" className="transition hover:text-white">Muestra Juvenil</Link>
          <Link href="/muestra-gratis/profesional" className="transition hover:text-white">Muestra Profesional</Link>
          <a href="/terminos" className="transition hover:text-white">Términos y condiciones</a>
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap gap-3">
          <a
            href="/arrepentimiento"
            className="inline-flex items-center rounded-xl border border-sky-400/50 px-5 py-2.5 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/10"
          >
            Botón de arrepentimiento
          </a>
          <a
            href={whatsappUrl("Hola Profe! Tengo una duda antes de comprar.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            <WhatsappIcon className="h-4 w-4" />
            WhatsApp {LEGAL.whatsappVisible}
          </a>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 px-5 pt-6 text-xs lg:px-8">
        © {year} Profe. Alejandro Ramela. Todos los derechos reservados. Los precios están
        expresados en pesos argentinos (ARS).
      </div>
    </footer>
  );
}
