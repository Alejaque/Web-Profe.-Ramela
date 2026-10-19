"use client";

import { useMemo, useState } from "react";

import { NIVELES, OBJETIVOS, type Material, type Nivel, type Objetivo } from "@/lib/biblioteca";
import { armarMesociclo, armarMicrociclo, type FaseATR } from "@/lib/planificador/ciclos";
import { armarSesion, duracionesPosibles } from "@/lib/planificador/motor";
import {
  CANCHAS,
  MATERIALES_ETIQUETA,
  ROLES,
  type Parametros,
} from "@/lib/planificador/tipos";
import {
  descargar,
  escribirXlsx,
  hojasDeMesociclo,
  hojasDeMicrociclo,
  hojasDeSesion,
  nombreSeguro,
  pdfDeMesociclo,
  pdfDeMicrociclo,
  pdfDeSesion,
} from "@/lib/planificador/exportar";
import {
  mezclarMesociclo,
  mezclarMicrociclo,
  mezclarSesion,
  payloadDeMesociclo,
  payloadDeMicrociclo,
  payloadDeSesion,
  type PayloadIA,
  type RespuestaMeso,
  type RespuestaMicro,
  type RespuestaSesion,
} from "@/lib/planificador/ia";
import { useTextoIA } from "@/lib/planificador/useTextoIA";
import { DownloadIcon, RefreshIcon, SparkIcon } from "@/components/icons";

type Modo = "sesion" | "microciclo" | "mesociclo";

const TODOS_LOS_MATERIALES: Material[] = [
  "balon",
  "conos",
  "petos",
  "arco",
  "aros",
  "vallas",
  "arquero",
];

const FASE_COLOR: Record<FaseATR, string> = {
  Acumulación: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  Transformación: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  Realización: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
};

const INTENSIDAD_COLOR: Record<string, string> = {
  baja: "text-slate-400",
  media: "text-sky-300",
  alta: "text-amber-300",
  máxima: "text-rose-300",
};

function Pildora({
  activa,
  onClick,
  children,
  titulo,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
  titulo?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={titulo}
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

function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-slate-400">
      {children}
    </span>
  );
}

export function PlanificadorApp({ acceso }: { acceso: boolean }) {
  const [modo, setModo] = useState<Modo>("sesion");
  const [nivel, setNivel] = useState<Nivel>("Juvenil");
  const [objetivo, setObjetivo] = useState<Objetivo>("Táctica");
  const [jugadores, setJugadores] = useState(16);
  const [cancha, setCancha] = useState<string>("entera");
  const [material, setMaterial] = useState<Material[]>(TODOS_LOS_MATERIALES);
  const [minutos, setMinutos] = useState(60);
  const [referencia, setReferencia] = useState(75);
  const [semanas, setSemanas] = useState(4);
  /** Ids ya vistos, para que "otra opción" no repita lo mismo. */
  const [evitar, setEvitar] = useState<string[]>([]);

  const medidas = CANCHAS.find((c) => c.id === cancha) ?? CANCHAS[2];

  // Sólo se ofrecen las duraciones que el motor puede cerrar exactas.
  const duraciones = useMemo(() => duracionesPosibles(nivel), [nivel]);
  const minutosEfectivos = duraciones.includes(minutos) ? minutos : duraciones[0];

  const params: Parametros = useMemo(
    () => ({
      nivel,
      objetivo,
      minutos: minutosEfectivos,
      jugadores,
      largo: medidas.largo,
      ancho: medidas.ancho,
      material,
      evitar,
    }),
    [nivel, objetivo, minutosEfectivos, jugadores, medidas, material, evitar],
  );

  const sesion = useMemo(() => armarSesion(params), [params]);
  const micro = useMemo(
    () => (modo === "sesion" ? null : armarMicrociclo({ ...params, referencia })),
    [modo, params, referencia],
  );
  const meso = useMemo(
    () => (modo === "mesociclo" ? armarMesociclo({ ...params, semanas, referencia }) : null),
    [modo, params, semanas, referencia],
  );

  /**
   * Capa de IA: el motor pone la estructura (ejercicios, minutos, orden) y
   * Groq redacta el texto para el pedido concreto. Si la IA no está o falla,
   * `texto` es null y todo se muestra con el texto del motor: la página nunca
   * se bloquea por eso.
   */
  const payload = useMemo<PayloadIA | null>(() => {
    if (modo === "sesion") return sesion.bloques.length ? payloadDeSesion(sesion, params) : null;
    if (modo === "microciclo" && micro) return payloadDeMicrociclo(micro, { ...params, referencia });
    if (modo === "mesociclo" && meso) return payloadDeMesociclo(meso, { ...params, referencia });
    return null;
  }, [modo, sesion, micro, meso, params, referencia]);

  const { iaDisponible, cargando, texto } = useTextoIA(payload);

  // Si el texto llegó para ESTE pedido, se mezcla; si no, se queda el del motor.
  const sesionIA = modo === "sesion" && texto ? mezclarSesion(sesion, texto as RespuestaSesion) : sesion;
  const microIA = modo === "microciclo" && micro && texto
    ? mezclarMicrociclo(micro, texto as RespuestaMicro)
    : micro;
  const mesoIA = modo === "mesociclo" && meso && texto
    ? mezclarMesociclo(meso, texto as RespuestaMeso)
    : meso;

  function alternarMaterial(m: Material) {
    setEvitar([]);
    setMaterial((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  function otraOpcion() {
    setEvitar((prev) => [...prev, ...sesion.bloques.map((b) => b.ejercicio.id)]);
  }

  function reiniciar() {
    setEvitar([]);
  }

  const sufijo = nombreSeguro(`${nivel}-${objetivo}`);

  function exportarPdf() {
    // Se exporta el objeto ya mezclado: si llegó el texto de la IA, va en el
    // PDF; si no, va el del motor. Los minutos son los mismos en los dos.
    if (modo === "sesion") {
      pdfDeSesion(sesionIA).save(`sesion-${sufijo}-${minutosEfectivos}min.pdf`);
    } else if (modo === "microciclo" && microIA) {
      pdfDeMicrociclo(microIA).save(`microciclo-${sufijo}.pdf`);
    } else if (modo === "mesociclo" && mesoIA) {
      pdfDeMesociclo(mesoIA).save(`mesociclo-${sufijo}-${semanas}semanas.pdf`);
    }
  }

  function exportarExcel() {
    const hojas =
      modo === "sesion"
        ? hojasDeSesion(sesionIA)
        : modo === "microciclo" && microIA
          ? hojasDeMicrociclo(microIA)
          : mesoIA
            ? hojasDeMesociclo(mesoIA)
            : [];
    const nombre =
      modo === "sesion"
        ? `sesion-${sufijo}-${minutosEfectivos}min.xlsx`
        : modo === "microciclo"
          ? `microciclo-${sufijo}.xlsx`
          : `mesociclo-${sufijo}-${semanas}semanas.xlsx`;
    descargar(
      escribirXlsx(hojas),
      nombre,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8">
      {/* Solapas */}
      <div className="flex flex-wrap gap-2 rounded-2xl bg-white/5 p-2 ring-1 ring-inset ring-white/10">
        {(
          [
            ["sesion", "Sesión", "Una práctica, armada y cerrada al minuto"],
            ["microciclo", "Microciclo", "La semana MD-5 → MD+1, con el partido el domingo"],
            ["mesociclo", "Mesociclo", "De 2 a 6 semanas: acumulación, transformación y realización"],
          ] as [Modo, string, string][]
        ).map(([id, label, ayuda]) => (
          <button
            key={id}
            type="button"
            onClick={() => setModo(id)}
            aria-pressed={modo === id}
            title={ayuda}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
              modo === id
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            {label}
            <span className="mt-0.5 hidden text-xs font-normal opacity-80 sm:block">{ayuda}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_1fr]">
        {/* Pedido */}
        <form className="h-fit space-y-6 rounded-2xl bg-white/5 p-6 ring-1 ring-inset ring-white/10 lg:sticky lg:top-24">
          <div>
            <Etiqueta>Nivel</Etiqueta>
            <div className="mt-2 flex flex-wrap gap-2">
              {NIVELES.map((n) => (
                <Pildora key={n} activa={nivel === n} onClick={() => { setNivel(n); setEvitar([]); }}>
                  {n}
                </Pildora>
              ))}
            </div>
          </div>

          {modo === "sesion" ? (
            <div>
              <Etiqueta>Objetivo</Etiqueta>
              <div className="mt-2 flex flex-wrap gap-2">
                {OBJETIVOS.map((o) => (
                  <Pildora key={o} activa={objetivo === o} onClick={() => { setObjetivo(o); setEvitar([]); }}>
                    {o}
                  </Pildora>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <Etiqueta>{modo === "sesion" ? "Duración" : "Duración de referencia"}</Etiqueta>
            <div className="mt-2 flex flex-wrap gap-2">
              {(modo === "sesion" ? duraciones : [45, 60, 75, 90]).map((d) => (
                <Pildora
                  key={d}
                  activa={(modo === "sesion" ? minutosEfectivos : referencia) === d}
                  onClick={() => {
                    if (modo === "sesion") setMinutos(d);
                    setReferencia(d);
                    setEvitar([]);
                  }}
                >
                  {`${d}'`}
                </Pildora>
              ))}
            </div>
            {modo !== "sesion" ? (
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Es la duración del día más largo. El resto de la semana se escala hacia abajo.
              </p>
            ) : null}
          </div>

          {modo === "mesociclo" ? (
            <div>
              <Etiqueta>Semanas</Etiqueta>
              <div className="mt-2 flex flex-wrap gap-2">
                {[2, 3, 4, 5, 6].map((s) => (
                  <Pildora key={s} activa={semanas === s} onClick={() => setSemanas(s)}>
                    {s}
                  </Pildora>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <Etiqueta>Jugadores</Etiqueta>
            <input
              type="range"
              min={4}
              max={26}
              step={1}
              value={jugadores}
              onChange={(e) => {
                setJugadores(Number(e.target.value));
                setEvitar([]);
              }}
              className="mt-3 w-full accent-sky-500"
              aria-label="Cantidad de jugadores"
            />
            <p className="mt-1 text-sm font-semibold text-sky-300">{jugadores} jugadores</p>
          </div>

          <div>
            <Etiqueta>Espacio disponible</Etiqueta>
            <div className="mt-2 flex flex-wrap gap-2">
              {CANCHAS.map((c) => (
                <Pildora
                  key={c.id}
                  activa={cancha === c.id}
                  onClick={() => { setCancha(c.id); setEvitar([]); }}
                  titulo={`${c.largo} × ${c.ancho} metros`}
                >
                  {c.etiqueta}
                </Pildora>
              ))}
            </div>
          </div>

          <div>
            <Etiqueta>Material</Etiqueta>
            <div className="mt-2 flex flex-wrap gap-2">
              {TODOS_LOS_MATERIALES.map((m) => (
                <Pildora key={m} activa={material.includes(m)} onClick={() => alternarMaterial(m)}>
                  {MATERIALES_ETIQUETA[m]}
                </Pildora>
              ))}
            </div>
            {material.length === 0 ? (
              <p className="mt-2 text-xs text-amber-300">
                Sin material marcado no se puede armar nada: se usará todo y se avisará.
              </p>
            ) : null}
          </div>

          {evitar.length > 0 ? (
            <button
              type="button"
              onClick={reiniciar}
              className="text-xs font-semibold text-sky-300 underline underline-offset-4 hover:text-sky-200"
            >
              Volver a la primera opción ({Math.floor(evitar.length / 4) + (evitar.length % 4 ? 1 : 0)} variantes vistas)
            </button>
          ) : null}
        </form>

        {/* Resultado */}
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/5 px-5 py-4 ring-1 ring-inset ring-white/10">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-300">
                {modo === "sesion"
                  ? `${sesionIA.bloques.length} bloques · ${sesionIA.minutosReales} minutos`
                  : modo === "microciclo" && microIA
                    ? `7 días · ${microIA.minutosTotales} minutos de entrenamiento`
                    : mesoIA
                      ? `${mesoIA.semanas.length} semanas · ${mesoIA.semanas.reduce((t, s) => t + s.microciclo.minutosTotales, 0)} minutos`
                      : ""}
              </p>
              {iaDisponible && (cargando || texto) ? (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
                    texto
                      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                      : "animate-pulse bg-sky-500/15 text-sky-300 ring-sky-400/30"
                  }`}
                >
                  <SparkIcon className="h-3.5 w-3.5" />
                  {cargando ? "La IA está redactando el texto…" : "Texto generado por IA"}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {modo === "sesion" ? (
                <button
                  type="button"
                  onClick={otraOpcion}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  <RefreshIcon className="h-4 w-4" />
                  Otra opción
                </button>
              ) : null}
              {acceso ? (
                <>
                  <button
                    type="button"
                    onClick={exportarPdf}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={exportarExcel}
                    className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-400"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    Excel
                  </button>
                </>
              ) : (
                <a
                  href="#planificador-ia"
                  className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-400"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Bajar en PDF y Excel
                </a>
              )}
            </div>
          </div>

          {sesionIA.avisos.length > 0 && modo === "sesion" ? (
            <div className="rounded-2xl bg-amber-500/10 p-5 ring-1 ring-inset ring-amber-400/30">
              <p className="text-sm font-bold text-amber-200">Concesiones para poder armarla</p>
              <ul className="mt-2 space-y-1">
                {sesion.avisos.map((a) => (
                  <li key={a} className="text-sm leading-relaxed text-amber-100/90">
                    · {a}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {modo === "sesion" ? (
            <div className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10">
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
                  {sesionIA.nivel} · {sesionIA.objetivo} · {`${sesionIA.minutosReales}'`}
                </p>
                <h3 className="mt-1 font-display text-3xl font-bold uppercase">{sesionIA.titulo}</h3>
                {sesionIA.intro ? (
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">{sesionIA.intro}</p>
                ) : null}
              </div>
              <ol className="divide-y divide-white/10">
                {sesionIA.bloques.map((b) => (
                  <li key={`${b.ejercicio.id}-${b.rol}`} className="px-6 py-5">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-display text-3xl font-bold text-sky-300">{`${b.min}'`}</span>
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        {ROLES.find((r) => r.rol === b.rol)?.etiqueta}
                      </span>
                      <h4 className="text-lg font-bold text-white">{b.ejercicio.nombre}</h4>
                      <span className="text-sm text-slate-400">{b.ejercicio.categoria}</span>
                    </div>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">{b.consigna}</p>
                    {b.porQue ? (
                      <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-sky-300/80">
                        Por qué va acá: {b.porQue}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-slate-500">
                      {b.ejercicio.espacio} · {b.ejercicio.jugadores} jugadores ·{" "}
                      {b.ejercicio.mats.map((m) => MATERIALES_ETIQUETA[m]).join(", ")}
                    </p>
                  </li>
                ))}
              </ol>
              {sesionIA.cierre ? (
                <div className="border-t border-white/10 bg-sky-500/5 px-6 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
                    Nota del profe
                  </p>
                  <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-300">
                    {sesionIA.cierre}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {modo === "microciclo" && microIA ? (
            <div className="space-y-3">
              {microIA.dias.map((d) => (
                <div
                  key={d.id}
                  className={`rounded-2xl p-5 ring-1 ring-inset ${
                    d.esPartido
                      ? "bg-rose-500/10 ring-rose-400/30"
                      : "bg-white/5 ring-white/10"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-2xl font-bold text-sky-300">{d.id}</span>
                    <span className="text-sm font-bold text-white">{d.diaSemana}</span>
                    <span className="text-sm font-bold uppercase tracking-wide text-slate-300">
                      {d.tipo}
                    </span>
                    {!d.esPartido ? (
                      <span className="text-sm text-slate-400">
                        {`${d.minutos}'`} · intensidad{" "}
                        <span className={INTENSIDAD_COLOR[d.intensidad]}>{d.intensidad}</span> ·
                        volumen {d.volumen}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">{d.nota}</p>
                  {d.sesion ? (
                    <ul className="mt-3 space-y-1.5">
                      {d.sesion.bloques.map((b) => (
                        <li key={`${d.id}-${b.ejercicio.id}`} className="flex gap-3 text-sm">
                          <span className="w-9 shrink-0 font-bold text-sky-300">{`${b.min}'`}</span>
                          <span className="text-slate-200">{b.ejercicio.nombre}</span>
                          <span className="text-slate-500">{b.ejercicio.categoria}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {modo === "mesociclo" && mesoIA ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-inset ring-white/10">
                <p className="text-sm leading-relaxed text-slate-300">{mesoIA.resumen}</p>
              </div>
              {mesoIA.semanas.map((s) => (
                <div key={s.numero} className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10">
                  <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-4">
                    <h3 className="font-display text-2xl font-bold uppercase">Semana {s.numero}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-inset ${FASE_COLOR[s.fase]}`}
                    >
                      {s.fase}
                    </span>
                    <span className="ml-auto text-sm text-slate-400">
                      {`${s.microciclo.minutosTotales}'`} en la semana
                    </span>
                  </div>
                  <p className="px-5 pt-4 text-sm leading-relaxed text-slate-400">{s.intencion}</p>
                  <ul className="divide-y divide-white/5 px-5 pb-3">
                    {s.microciclo.dias.map((d) => (
                      <li key={d.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 text-sm">
                        <span className="w-11 shrink-0 font-bold text-sky-300">{d.id}</span>
                        <span className="font-semibold text-slate-200">{d.tipo}</span>
                        <span className="text-slate-400">
                          {d.esPartido
                            ? "Partido"
                            : `${d.minutos}' · ${d.objetivo} · intensidad ${d.intensidad} · volumen ${d.volumen}`}
                        </span>
                        {d.sesion ? (
                          <span className="w-full text-xs text-slate-500">
                            {d.sesion.bloques.map((b) => `${b.min}' ${b.ejercicio.nombre}`).join("  ·  ")}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
