"use client";

import { useEffect, useState } from "react";

const NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5493644670461").replace(/\D/g, "");

type Info = { estado: string; pedido: string; pagoId: string };
type Material = { slug: string; name: string; url: string | null };

export function PagoBanner() {
  const [info, setInfo] = useState<Info | null>(null);
  const [material, setMaterial] = useState<Material[] | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const estado = q.get("pago");
    if (estado) {
      const pagoId = q.get("payment_id") ?? q.get("collection_id") ?? "";
      setInfo({ estado, pedido: q.get("external_reference") ?? "", pagoId });
      if (estado === "ok" && pagoId) {
        fetch(`/api/entrega?payment_id=${encodeURIComponent(pagoId)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => { if (d?.items?.length) setMaterial(d.items); else setFallo(true); })
          .catch(() => setFallo(true));
      } else if (estado === "ok") {
        setFallo(true);
      }
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
    ? "Ya podés acceder a tu material. Guardá los enlaces y, si necesitás ayuda, escribinos por WhatsApp."
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
      {ok && fallo ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          No pudimos mostrar tu material automáticamente. No te preocupes: tu pago está registrado. Escribinos por WhatsApp con el comprobante y te lo enviamos enseguida.
        </p>
      ) : null}
      {ok && material && material.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tu material</p>
          {material.map((m) =>
            m.url ? (
              <a
                key={m.slug}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-sky-400"
              >
                Abrir: {m.name}
              </a>
            ) : (
              <p key={m.slug} className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm text-slate-600">
                {m.name}: te lo enviamos por WhatsApp.
              </p>
            ),
          )}
        </div>
      ) : null}
      <a
        href={`https://wa.me/${NUMBER}?text=${encodeURIComponent(texto)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center rounded-xl bg-[#25D366] px-6 py-3.5 text-base font-bold text-white transition hover:brightness-95"
      >
        Enviar por WhatsApp
      </a>
    </div>
  );
}
