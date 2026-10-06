"use client";

import { useEffect, useState } from "react";

const NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5493644670461").replace(/\D/g, "");

type Info = { estado: string; pedido: string; pagoId: string };

export function PagoBanner() {
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const estado = q.get("pago");
    if (estado) {
      setInfo({
        estado,
        pedido: q.get("external_reference") ?? "",
        pagoId: q.get("payment_id") ?? "",
      });
    }
  }, []);

  function close() {
    setInfo(null);
    window.history.replaceState(null, "", window.location.pathname);
  }

  if (!info) return null;

  const ok = info.estado === "ok";
  const pendiente = info.estado === "pendiente";

  const titulo = ok
    ? "¡Pago recibido!"
    : pendiente
      ? "Tu pago está pendiente"
      : "No se pudo completar el pago";
  const detalle = ok
    ? "Enviá tu comprobante por WhatsApp para que el Profe te habilite el acceso."
    : pendiente
      ? "Cuando Mercado Pago lo acredite te avisamos. Podés escribirnos por WhatsApp para confirmarlo."
      : "No se hizo ningún cobro. Podés intentar de nuevo o pagar por transferencia.";

  const texto = [
    ok ? "Hola Profe! Ya pagué mi pedido con Mercado Pago." : "Hola Profe! Tuve un problema con mi pago.",
    info.pedido ? `Pedido: #${info.pedido}` : "",
    info.pagoId ? `N° de operación: ${info.pagoId}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
      <button
        type="button"
        onClick={close}
        aria-label="Cerrar"
        className="absolute right-3 top-3 text-xl leading-none text-slate-400 hover:text-slate-700"
      >
        ×
      </button>
      <h3 className={`font-display text-2xl font-bold uppercase leading-none ${ok ? "text-emerald-600" : "text-slate-950"}`}>
        {titulo}
      </h3>
      <p className="mt-2 text-sm text-slate-600">{detalle}</p>
      <a
        href={`https://wa.me/${NUMBER}?text=${encodeURIComponent(texto)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#25D366] px-6 py-3.5 text-base font-bold text-white transition hover:brightness-95"
      >
        Enviar por WhatsApp
      </a>
    </div>
  );
}
