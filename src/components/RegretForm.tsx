"use client";

import { useState, type ChangeEvent } from "react";
import { LEGAL } from "@/lib/legal";

const empty = { nombre: "", whatsapp: "", pedido: "", producto: "Formación en Fútbol Infantil", fecha: "", medio: "Mercado Pago", motivo: "" };
const field = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200";

export function RegretForm() {
  const [f, setF] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string; url: string } | null>(null);
  const set = (k: keyof typeof empty) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  function submit() {
    if (f.nombre.trim().length < 2) return setError("Ingresá tu nombre y apellido.");
    if (f.whatsapp.replace(/\D/g, "").length < 8) return setError("Ingresá un número de WhatsApp válido.");
    setError(null);
    const code = "ARR-" + Date.now().toString(36).toUpperCase().slice(-6);
    const text = [
      `SOLICITUD DE ARREPENTIMIENTO · Código ${code}`,
      `Nombre: ${f.nombre.trim()}`, `WhatsApp: ${f.whatsapp.trim()}`,
      `Producto: ${f.producto}`, `Medio de pago: ${f.medio}`,
      f.pedido.trim() ? `N° de pedido: ${f.pedido.trim()}` : "", f.fecha ? `Fecha de compra: ${f.fecha}` : "",
      f.motivo.trim() ? `Comentario: ${f.motivo.trim()}` : "",
    ].filter(Boolean).join("\n");
    setDone({ code, url: `https://wa.me/${LEGAL.whatsapp}?text=${encodeURIComponent(text)}` });
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-emerald-50 p-6 ring-1 ring-emerald-200">
        <h2 className="font-display text-3xl font-extrabold uppercase text-emerald-800">Solicitud lista para enviar</h2>
        <p className="mt-3">Tu código de solicitud es:</p>
        <p className="mt-1 font-display text-4xl font-extrabold tracking-wider text-[#071634]">{done.code}</p>
        <p className="mt-4 font-semibold text-slate-800">
          Tu pedido de baja queda registrado cuando lo enviás por WhatsApp. Tocá el botón para enviarlo.
        </p>
        <a href={done.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#25D366] px-6 py-3.5 text-base font-bold text-white transition hover:brightness-95 sm:w-auto">
          Enviar solicitud por WhatsApp
        </a>
        <p className="mt-4 text-sm text-slate-600">Guardá el código. Te respondemos dentro de las {LEGAL.plazoRespuesta}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-slate-800">Nombre y apellido
        <input className={field} value={f.nombre} onChange={set("nombre")} autoComplete="name" /></label>
      <label className="block text-sm font-semibold text-slate-800">WhatsApp
        <input className={field} value={f.whatsapp} onChange={set("whatsapp")} inputMode="tel" placeholder="Ej: 3644 123456" /></label>
      <label className="block text-sm font-semibold text-slate-800">Producto comprado
        <select className={field} value={f.producto} onChange={set("producto")}>
          <option>Formación en Fútbol Infantil</option><option>Otro</option></select></label>
      <label className="block text-sm font-semibold text-slate-800">Medio de pago
        <select className={field} value={f.medio} onChange={set("medio")}>
          <option>Mercado Pago</option><option>Transferencia</option></select></label>
      <label className="block text-sm font-semibold text-slate-800">N° de pedido (si lo tenés)
        <input className={field} value={f.pedido} onChange={set("pedido")} placeholder="Ej: 251306" /></label>
      <label className="block text-sm font-semibold text-slate-800">Fecha de compra
        <input type="date" className={field} value={f.fecha} onChange={set("fecha")} /></label>
      <label className="block text-sm font-semibold text-slate-800">Comentario (opcional)
        <textarea className={field} rows={3} value={f.motivo} onChange={set("motivo")} /></label>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button type="button" onClick={submit} className="w-full rounded-xl bg-sky-500 px-6 py-3.5 text-base font-bold text-white transition hover:bg-sky-400">
        Solicitar la baja de mi compra
      </button>
    </div>
  );
}
