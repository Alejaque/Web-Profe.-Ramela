"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useCart } from "@/components/CartProvider";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CartIcon,
  CheckIcon,
  CloseIcon,
  TrashIcon,
  WhatsappIcon,
} from "@/components/icons";
import { formatARS } from "@/lib/format";

type View = "cart" | "checkout" | "done";

type OrderResult = {
  orderId: number;
  total: number;
  items: { slug: string; name: string; priceArs: number }[];
  whatsappUrl: string | null;
};

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15";

export function CartDrawer() {
  const { lines, total, isOpen, closeCart, remove, clear, toast, dismissToast, openCart } =
    useCart();

  const [view, setView] = useState<View>("cart");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeView: View = view === "checkout" && lines.length === 0 ? "cart" : view;

  function handleClose() {
    closeCart();
    if (view === "done") {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => {
        setView("cart");
        setResult(null);
      }, 400);
    }
  }

  // Bloqueo de scroll, cierre con Escape y foco al abrir.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, view]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || lines.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const name = form.name.trim();
      const phone = form.phone.trim();
      if (name.length < 2) {
        setError("Ingresá tu nombre.");
        return;
      }
      if (phone.replace(/\D/g, "").length < 8) {
        setError("Ingresá un número de WhatsApp o teléfono válido.");
        return;
      }
      const orderId = Math.floor(Date.now() / 1000) % 1000000;
      const items = lines.map((l) => ({ slug: l.slug, name: l.name, priceArs: l.priceArs }));
      const orderTotal = items.reduce((sum, item) => sum + item.priceArs, 0);
      const text = [
        `Hola Profe! Quiero hacer este pedido (#${orderId}):`,
        ...items.map((item) => `• ${item.name} - ${formatARS(item.priceArs)}`),
        `Total: ${formatARS(orderTotal)}`,
        "",
        `Nombre: ${name}`,
        `WhatsApp: ${phone}`,
        form.email.trim() ? `Email: ${form.email.trim()}` : "",
        form.notes.trim() ? `Notas: ${form.notes.trim()}` : "",
      ]
        .filter((line) => line !== "")
        .join("\n");
      const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5493644670461").replace(/\D/g, "");

      setResult({
        orderId,
        total: orderTotal,
        items,
        whatsappUrl: `https://wa.me/${number}?text=${encodeURIComponent(text)}`,
      });
      clear();
      setView("done");
    } finally {
      setSubmitting(false);
    }
  }

  function goToCourses() {
    handleClose();
    setTimeout(() => {
      document.getElementById("cursos")?.scrollIntoView({ behavior: "smooth" });
    }, 120);
  }

  const title =
    activeView === "cart"
      ? "Tu carrito"
      : activeView === "checkout"
        ? "Finalizar compra"
        : "Pedido recibido";

  return (
    <>
      {/* Aviso al agregar un curso */}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 transition duration-300 ${
          toast && !isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {toast && !isOpen ? (
          <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-slate-950 py-3 pl-4 pr-3 text-sm text-white shadow-2xl ring-1 ring-white/10">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
              <CheckIcon className="h-4 w-4" />
            </span>
            <span className="leading-snug">{toast}</span>
            <button
              type="button"
              onClick={() => {
                dismissToast();
                openCart();
              }}
              className="shrink-0 rounded-lg bg-sky-500 px-3 py-1.5 font-semibold text-white transition hover:bg-sky-400"
            >
              Ver carrito
            </button>
          </div>
        ) : null}
      </div>

      {/* Fondo oscuro */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        inert={!isOpen}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-slate-50 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between gap-3 bg-[#071634] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            {activeView === "checkout" ? (
              <button
                type="button"
                onClick={() => setView("cart")}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                aria-label="Volver al carrito"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-500/20 text-sky-300">
                {activeView === "done" ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <CartIcon className="h-5 w-5" />
                )}
              </span>
            )}
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            aria-label="Cerrar carrito"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        {/* VISTA: CARRITO */}
        {activeView === "cart" ? (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-slate-200 text-slate-500">
                    <CartIcon className="h-9 w-9" />
                  </span>
                  <p className="mt-5 font-display text-2xl font-bold uppercase text-slate-900">
                    Tu carrito está vacío
                  </p>
                  <p className="mt-2 max-w-xs text-sm text-slate-600">
                    Sumá un curso, la biblioteca de entrenamiento o el Planificador IA para
                    empezar.
                  </p>
                  <button
                    type="button"
                    onClick={goToCourses}
                    className="mt-6 rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400"
                  >
                    Ver cursos
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {lines.map((line) => (
                    <li
                      key={line.slug}
                      className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-600">
                          {line.level}
                        </p>
                        <p className="mt-1 font-semibold leading-snug text-slate-900">
                          {line.name}
                        </p>
                        {line.includesSlugs.length > 0 ? (
                          <p className="mt-1 text-xs text-emerald-700">
                            Incluye {line.includesSlugs.length} productos
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{formatARS(line.priceArs)}</p>
                          {line.compareAtPriceArs ? (
                            <p className="text-xs text-slate-400 line-through">
                              {formatARS(line.compareAtPriceArs)}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(line.slug)}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-red-600"
                          aria-label={`Quitar ${line.name}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                          Quitar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 ? (
              <footer className="border-t border-slate-200 bg-white px-5 py-5">
                <div className="flex items-end justify-between">
                  <span className="text-sm font-medium text-slate-600">Total</span>
                  <span className="font-display text-4xl font-bold leading-none text-slate-950">
                    {formatARS(total)}
                  </span>
                </div>
                <p className="mt-1 text-right text-xs text-slate-500">
                  Precios en pesos argentinos (ARS)
                </p>
                <button
                  type="button"
                  onClick={() => setView("checkout")}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-400"
                >
                  Continuar con la compra
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={clear}
                  className="mt-3 w-full text-center text-sm font-medium text-slate-500 transition hover:text-red-600"
                >
                  Vaciar carrito
                </button>
              </footer>
            ) : null}
          </>
        ) : null}

        {/* VISTA: DATOS DEL COMPRADOR */}
        {activeView === "checkout" ? (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Resumen
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {lines.map((line) => (
                    <li key={line.slug} className="flex justify-between gap-4">
                      <span className="text-slate-700">{line.name}</span>
                      <span className="shrink-0 font-semibold text-slate-900">
                        {formatARS(line.priceArs)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-slate-200 pt-3">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-bold text-slate-950">{formatARS(total)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-800">
                    Nombre y apellido
                  </span>
                  <input
                    required
                    minLength={2}
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Ej: Martín Gómez"
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-800">Email</span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="tu@email.com"
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-800">
                    WhatsApp
                  </span>
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    placeholder="Ej: 351 123 4567"
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-800">
                    Comentarios <span className="font-normal text-slate-500">(opcional)</span>
                  </span>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={form.notes}
                    onChange={(event) => setForm({ ...form, notes: event.target.value })}
                    placeholder="Contanos qué categoría entrenás o qué necesitás."
                    className={`${fieldClass} resize-none`}
                  />
                </label>
              </div>

              <p className="rounded-xl bg-sky-50 p-3 text-xs leading-relaxed text-sky-900 ring-1 ring-sky-100">
                Al confirmar, registramos tu pedido y nos comunicamos con vos por WhatsApp o
                email para coordinar el medio de pago y habilitarte el acceso.
              </p>

              {error ? (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
                >
                  {error}
                </p>
              ) : null}
            </div>

            <footer className="border-t border-slate-200 bg-white px-5 py-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Enviando pedido…" : `Confirmar pedido · ${formatARS(total)}`}
              </button>
            </footer>
          </form>
        ) : null}

        {/* VISTA: PEDIDO CONFIRMADO */}
        {activeView === "done" && result ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-5 py-8">
              <div className="flex flex-col items-center text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  <CheckIcon className="h-10 w-10" />
                </span>
                <h3 className="mt-5 font-display text-4xl font-bold uppercase leading-none text-slate-950">
                  ¡Gracias por tu pedido!
                </h3>
                <p className="mt-3 text-sm text-slate-600">
                  Tu pedido <strong className="text-slate-900">#{result.orderId}</strong> quedó
                  registrado. Te escribimos muy pronto para coordinar el pago y darte acceso a
                  tu formación.
                </p>
              </div>

              <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <ul className="space-y-2 text-sm">
                  {result.items.map((item) => (
                    <li key={item.slug} className="flex justify-between gap-4">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="shrink-0 font-semibold text-slate-900">
                        {formatARS(item.priceArs)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-slate-200 pt-3">
                  <span className="font-semibold text-slate-900">Total a pagar</span>
                  <span className="font-bold text-slate-950">{formatARS(result.total)}</span>
                </div>
              </div>

              {result.whatsappUrl ? (
                <a
                  href={result.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
                >
                  <WhatsappIcon className="h-5 w-5" />
                  Enviar pedido por WhatsApp
                </a>
              ) : null}
            </div>
            <footer className="border-t border-slate-200 bg-white px-5 py-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-xl bg-slate-900 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Seguir explorando
              </button>
            </footer>
          </div>
        ) : null}
      </aside>
    </>
  );
}
