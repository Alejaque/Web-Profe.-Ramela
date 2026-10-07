import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";
import { RegretForm } from "@/components/RegretForm";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Botón de arrepentimiento | Profe. Alejandro Ramela" };

export default function ArrepentimientoPage() {
  return (
    <LegalShell
      title="Botón de arrepentimiento"
      intro={`Si te arrepentiste de tu compra, podés cancelarla dentro de ${LEGAL.plazoArrepentimiento}, sin dar motivos y sin costo. Completá el formulario y recibís un código de solicitud.`}
    >
      <RegretForm />
      <p className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-500">
        Respondemos dentro de las {LEGAL.plazoRespuesta}. Más información en los{" "}
        <a href="/terminos" className="font-semibold text-sky-700 underline">términos y condiciones</a>.
      </p>
    </LegalShell>
  );
}
