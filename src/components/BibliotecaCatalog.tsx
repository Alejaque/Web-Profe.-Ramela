"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  EJERCICIOS,
  NIVELES,
  OBJETIVOS,
  type Ejercicio,
  type Ficha,
  type Nivel,
  type Objetivo,
} from "@/lib/biblioteca";
import { useCart } from "@/components/CartProvider";
import { isAvailable } from "@/lib/availability";
import { CloseIcon, LockIcon } from "@/components/icons";

const SLUG = "biblioteca-entrenamiento";

/** Un color por objetivo, para reconocer la ficha de un vistazo. */
const OBJETIVO_COLOR: Record<Objetivo, string> = {
  "Técnica": "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  "Táctica": "bg-violet-500/15 text-violet-300 ring-violet-400/30",
  "Físico": "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  "Cognitivo": "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  "Transición": "bg-rose-500/15 text-rose-300 ring-rose-400/30",
};

const NIVEL_COLOR: Record<Nivel, string> = {
  "Infantil": "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  "Juvenil": "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  "Profesional": "bg-indigo-500/15 text-indigo-300 ring-indigo-400/30",
};

function Pildora({
  activa,
  onClick,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
        activa
          ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
          : "bg-white/5 text-slate-300 ring-1 ring-inset ring-white/15 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

export function BibliotecaCatalog() {
  const [nivel, setNivel] = useState<Nivel | "todos">("todos");
  const [objetivo, setObjetivo] = useState<Objetivo | "todos">("todos");
  const [categoria, setCategoria] = useState("todas");
  const [buscar, setBuscar] = useState("");
  const [soloAbiertas, setSoloAbiertas] = useState(false);

  const [fichas, setFichas] = useState<Record<string, Ficha> | null>(null);
  const [abierta, setAbierta] = useState<Ejercicio | null>(null);
  const [cargando, setCargando] = useState(false);
  const dialogo = useRef<HTMLDivElement | null>(null);
  const { add, inCart, openCart } = useCart();
  const enCarrito = inCart(SLUG);
  const sePuedeComprar = isAvailable(SLUG);

  const categorias = useMemo(() => {
    const set = new Set(EJERCICIOS.map((e) => e.categoria));
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, []);

  const filtrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return EJERCICIOS.filter((e) => {
      if (nivel !== "todos" && e.nivel !== nivel) return false;
      if (objetivo !== "todos" && e.objetivo !== objetivo) return false;
      if (categoria !== "todas" && e.categoria !== categoria) return false;
      if (soloAbiertas && !e.abierta) return false;
      if (!q) return true;
      return (
        e.nombre.toLowerCase().includes(q) ||
        e.categoria.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.objetivo.toLowerCase().includes(q)
      );
    });
  }, [nivel, objetivo, categoria, buscar, soloAbiertas]);

  // Cerrar con Escape y devolver el foco al cerrar.
  useEffect(() => {
    if (!abierta) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setAbierta(null);
    };
    document.addEventListener("keydown", onKey);
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogo.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previo;
    };
  }, [abierta]);

  async function abrir(ej: Ejercicio) {
    setAbierta(ej);
    if (fichas || cargando) return;
    setCargando(true);
    try {
      const modulo = await import("@/lib/biblioteca-fichas");
      setFichas(modulo.FICHAS);
    } finally {
      setCargando(false);
    }
  }

  function limpiar() {
    setNivel("todos");
    setObjetivo("todos");
    setCategoria("todas");
    setBuscar("");
    setSoloAbiertas(false);
  }

  const ficha = abierta && fichas ? fichas[abierta.id] : null;
  const hayFiltros =
    nivel !== "todos" || objetivo !== "todos" || categoria !== "todas" ||
    buscar.trim() !== "" || soloAbiertas;

  return (
    <>
      {/* ---------------------------------------------------------- filtros */}
      <div className="rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/10 sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="buscar" className="sr-only">
              Buscar ejercicio
            </label>
            <input
              id="buscar"
              type="search"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Buscar por nombre, categoría o código (ej: INF-07)"
              className="w-full rounded-xl bg-[#050f26] px-4 py-3 text-sm text-white ring-1 ring-inset ring-white/15 placeholder:text-slate-500 focus:outline-2 focus:outline-offset-2 focus:outline-sky-400"
            />
            <label htmlFor="categoria" className="sr-only">
              Categoría
            </label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="rounded-xl bg-[#050f26] px-4 py-3 text-sm text-white ring-1 ring-inset ring-white/15 focus:outline-2 focus:outline-offset-2 focus:outline-sky-400 sm:min-w-56"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              Nivel
            </span>
            <Pildora activa={nivel === "todos"} onClick={() => setNivel("todos")}>
              Todos
            </Pildora>
            {NIVELES.map((n) => (
              <Pildora key={n} activa={nivel === n} onClick={() => setNivel(n)}>
                {n}
              </Pildora>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              Objetivo
            </span>
            <Pildora activa={objetivo === "todos"} onClick={() => setObjetivo("todos")}>
              Todos
            </Pildora>
            {OBJETIVOS.map((o) => (
              <Pildora key={o} activa={objetivo === o} onClick={() => setObjetivo(o)}>
                {o}
              </Pildora>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={soloAbiertas}
                onChange={(e) => setSoloAbiertas(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-[#050f26] accent-sky-500"
              />
              Mostrar solo las fichas de muestra
            </label>
            <div className="flex items-center gap-3">
              <p aria-live="polite" className="text-sm text-slate-400">
                <strong className="font-display text-xl text-white">{filtrados.length}</strong>
                {" de "}
                {EJERCICIOS.length} ejercicios
              </p>
              {hayFiltros ? (
                <button
                  type="button"
                  onClick={limpiar}
                  className="text-sm font-semibold text-sky-400 underline-offset-4 hover:underline"
                >
                  Limpiar
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- grilla */}
      {filtrados.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-white/5 p-8 text-center text-slate-300 ring-1 ring-white/10">
          No hay ejercicios con esos filtros. Probá con otra combinación.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((e) => (
            <li key={e.id}>
              <article className="flex h-full flex-col rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 transition hover:bg-white/[0.07]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold tracking-wider text-sky-400">
                    {e.id}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${NIVEL_COLOR[e.nivel]}`}>
                    {e.nivel}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-xl font-bold leading-tight text-white">
                  {e.nombre}
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${OBJETIVO_COLOR[e.objetivo]}`}>
                    {e.objetivo}
                  </span>
                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 ring-1 ring-inset ring-white/10">
                    {e.categoria}
                  </span>
                </div>

                <dl className="mt-4 space-y-1 text-sm text-slate-400">
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-slate-500">Jugadores</dt>
                    <dd>{e.jugadores}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-slate-500">Espacio</dt>
                    <dd>{e.espacio}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-slate-500">Duración</dt>
                    <dd>{e.duracion}</dd>
                  </div>
                </dl>

                <div className="mt-5 flex-1" />

                {e.abierta ? (
                  <button
                    type="button"
                    onClick={() => abrir(e)}
                    className="w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                  >
                    Ver ficha completa
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => add(SLUG)}
                    disabled={!sePuedeComprar}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 ring-1 ring-inset ring-white/15 transition enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:text-slate-500"
                  >
                    <LockIcon className="h-4 w-4" />
                    {sePuedeComprar ? "Se abre con la biblioteca" : "Próximamente"}
                  </button>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}

      {/* ------------------------------------------------------------ ficha */}
      {abierta ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#030a18]/90 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setAbierta(null)}
        >
          <div
            ref={dialogo}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ficha-titulo"
            tabIndex={-1}
            onClick={(ev) => ev.stopPropagation()}
            className="my-auto w-full max-w-3xl rounded-3xl bg-[#071634] p-5 ring-1 ring-white/15 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-bold tracking-wider text-sky-400">
                  {abierta.id} · {abierta.nivel}
                </p>
                <h2 id="ficha-titulo" className="mt-2 font-display text-3xl font-extrabold uppercase leading-tight text-white">
                  {abierta.nombre}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {abierta.objetivo} · {abierta.categoria} · {abierta.duracion} · {abierta.jugadores}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAbierta(null)}
                aria-label="Cerrar ficha"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/20"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {!ficha || cargando ? (
              <p className="mt-8 rounded-2xl bg-white/5 p-8 text-center text-slate-400">
                Cargando el diagrama…
              </p>
            ) : (
              <div className="mt-6">
                <div className="overflow-hidden rounded-2xl ring-1 ring-white/15">
                  {/* El SVG lo genera nuestro propio script de diagramas. */}
                  <div
                    className="[&>svg]:block [&>svg]:w-full"
                    dangerouslySetInnerHTML={{ __html: ficha.svg }}
                  />
                </div>
                {ficha.animada ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Diagrama animado: el movimiento se repite en bucle.
                  </p>
                ) : null}

                <h3 className="mt-7 font-display text-lg font-bold uppercase text-sky-400">
                  Cómo se hace
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-200">
                  {ficha.desarrollo}
                </p>

                <h3 className="mt-6 font-display text-lg font-bold uppercase text-sky-400">
                  Variantes
                </h3>
                <ul className="mt-2 space-y-2">
                  {ficha.variantes.map((v, i) => (
                    <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-slate-200">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-300">
                        {i + 1}
                      </span>
                      {v}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-2xl bg-amber-500/10 p-4 ring-1 ring-amber-400/20">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-300">
                    Error común
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-amber-50/90">
                    {ficha.errores}
                  </p>
                </div>

                <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => (enCarrito ? openCart() : add(SLUG))}
                    disabled={!sePuedeComprar}
                    className="flex-1 rounded-xl bg-sky-500 px-6 py-3.5 text-[15px] font-bold text-white transition enabled:hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                  >
                    {!sePuedeComprar
                      ? "Próximamente"
                      : enCarrito
                        ? "Ver mi carrito"
                        : "Quiero las 120 fichas"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbierta(null)}
                    className="rounded-xl px-6 py-3.5 text-[15px] font-semibold text-slate-300 ring-1 ring-inset ring-white/15 transition hover:bg-white/10"
                  >
                    Seguir mirando
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
