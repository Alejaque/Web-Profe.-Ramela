import {
  LockIcon,
  RefreshIcon,
  WhatsappIcon,
} from "@/components/icons";
import { LEGAL } from "@/lib/legal";

type TrustTone = "dark" | "light";

type TrustProps = {
  tone?: TrustTone;
  className?: string;
};

const toneStyles = {
  dark: {
    text: "text-sky-100",
    icon: "text-sky-400",
    link: "text-white",
  },
  light: {
    text: "text-slate-600",
    icon: "text-emerald-600",
    link: "text-slate-900",
  },
} satisfies Record<TrustTone, { text: string; icon: string; link: string }>;

export function whatsappUrl(texto = "Hola Profe! Tengo una consulta antes de comprar.") {
  return `https://wa.me/${LEGAL.whatsapp}?text=${encodeURIComponent(texto)}`;
}

export function TrustStrip({ tone = "dark", className = "" }: TrustProps) {
  const styles = toneStyles[tone];

  return (
    <ul className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-xs ${styles.text} ${className}`}>
      <li className="inline-flex items-start gap-2">
        <RefreshIcon className={`mt-0.5 h-4 w-4 shrink-0 ${styles.icon}`} />
        <span>
          Garantía de devolución: {LEGAL.plazoArrepentimiento} para arrepentirte, sin costo
        </span>
      </li>
      <li className="inline-flex items-center gap-2">
        <LockIcon className={`h-4 w-4 shrink-0 ${styles.icon}`} />
        <span>Pago seguro con Mercado Pago o transferencia</span>
      </li>
      <li>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 underline underline-offset-2 ${styles.link}`}
        >
          <WhatsappIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
          WhatsApp {LEGAL.whatsappVisible}
        </a>
      </li>
    </ul>
  );
}

export function TrustMini({ tone, className = "" }: { tone: TrustTone; className?: string }) {
  const styles = toneStyles[tone];

  return (
    <ul
      className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] ${styles.text} ${className}`}
    >
      <li>{LEGAL.plazoArrepentimiento} de garantía: devolución del 100%</li>
      <li>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline underline-offset-2 ${styles.link}`}
        >
          WhatsApp {LEGAL.whatsappVisible}
        </a>
      </li>
    </ul>
  );
}
