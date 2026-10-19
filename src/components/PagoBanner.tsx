"use client";

import { useEffect, useState } from "react";
import { whatsappUrl } from "@/components/TrustStrip";

type Info = { estado: string; pedido: string; pagoId: string };
type Material = { slug: string; name: string; url: string | null };

export function PagoBanner() {
  const [info, setInfo] = useState<Info | null>(null);
  const [material, setMaterial] = useState<Material[] | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function checkReturn() {
      // Sincronización con la URL externa de retorno, sin actualizar un componente desmontado.
      await Promise.resolve();
      if (controller.signal.aborted) return;
      const q = new URLSearchParams(window.location.search);
      const estado = q.get("pago");
      if (!estado) return;
      const pagoId = q.get("payment_id") ?? q.get("collection_id") ?? "";
      setInfo({ estado, pedido: q.get("external_reference") ?? "", pagoId });
      if (estado !== "ok") return;
      if (!pagoId) { setFallo(true); return; }
      try {
        const response = await fetch(`/api/entrega?payment_id=${encodeURIComponent(pagoId)}`, { signal: controller.signal });
        const data = response.ok ? await response.json() : null;
        if (controller.signal.aborted) return;
        if (data?.items?.length) setMaterial(data.items);
        else setFallo(true);
      } catch {
        if (!controller.signal.aborted) setFallo(true);
      }
    }
    void checkReturn();
    return () => controller.abort();
  }, []);

  function close() {
    setInfo(null);
    window.history.replaceState(null, "", window.location.pathname);
  }

  if (!info) return null;

  const ok = info.estado === "ok";
  const pendiente = info.estado === "pendiente";

  const verified = ok && !!material?.length;
  const titulo = verified
    ? "¡Pago confirmado!"
    : ok
      ? fallo ? "Revisemos tu pago" : "Verificando tu pago…"
      : pendiente ? "Tu pago está pendiente" : "No se pudo completar el pago";
  const detalle = verified
    ? "Abrí los enlaces disponibles. Si un material requiere habilitación, enviá el comprobante por WhatsApp: te damos acceso normalmente dentro de las 24 horas hábiles."
    : ok
      ? "Estamos consultando el estado de tu operación. No vuelvas a pagar sin revisar el estado en Mercado Pago."
      : pendiente
        ? "Consultá el estado de la operación en Mercado Pago. Podés escribirnos por WhatsApp para confirmarlo."
        : "Revisá el estado en Mercado Pago antes de intentar de nuevo o pagar por transferencia.";

  const texto = [
    verified ? "Hola Profe! Mi pago fue confirmado por Mercado Pago." : "Hola Profe! Tuve un problema con mi pago.",
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
          No pudimos confirmar el pago o mostrar tu material automáticamente. Escribinos por WhatsApp con el comprobante para verificarlo y habilitar el acceso.
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
        href={whatsappUrl(texto)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center rounded-xl bg-[#25D366] px-6 py-3.5 text-base font-bold text-white transition hover:brightness-95"
      >
        Enviar por WhatsApp
      </a>
    </div>
  );
}
