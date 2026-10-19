"use client";

/**
 * Conecta el planificador con la capa de IA (src/app/api/planificador-ia).
 *
 * El patrón es de mejora progresiva: el motor arma la sesión al instante y se
 * muestra ya; cuando la IA devuelve la capa de texto (2 a 6 segundos) se
 * reemplaza en su lugar. Si la IA no está, falla o tarda de más, la pantalla
 * se queda con el texto del motor: nunca hay botón pendiente, nunca se
 * bloquea nada y nunca se promete lo que no llegó.
 */

import { useEffect, useRef, useState } from "react";

import { firmaDe, type PayloadIA, type RespuestaIA } from "./ia";

/** Si la IA no contesta en 30 segundos, se deja el texto del motor. */
const TOPE_MS = 30_000;

export function useTextoIA(payload: PayloadIA | null) {
  const [iaDisponible, setIaDisponible] = useState<boolean | null>(null);
  const [cargando, setCargando] = useState(false);
  const [datos, setDatos] = useState<{ firma: string; r: RespuestaIA } | null>(null);
  /** Cuántas peticiones se despacharon: las respuestas de las viejas se descartan. */
  const despacho = useRef(0);

  // ¿Hay key en el servidor? Si no, el planificador anda solo con el motor.
  useEffect(() => {
    let vivo = true;
    fetch("/api/planificador-ia", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (vivo) setIaDisponible(Boolean(d?.ia));
      })
      .catch(() => {
        if (vivo) setIaDisponible(false);
      });
    return () => {
      vivo = false;
    };
  }, []);

  // Cambió el pedido (o se cambió de modo): se corta lo que andaba en camino
  // y se pide el texto nuevo.
  useEffect(() => {
    if (!payload || iaDisponible !== true) return;
    const id = ++despacho.current;
    const ctrl = new AbortController();
    const tope = setTimeout(() => ctrl.abort(), TOPE_MS);

    // Es intencional: marca "en camino" en cuanto se despacha el pedido.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(true);
    fetch("/api/planificador-ia", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((r) => {
        if (despacho.current !== id) return;
        setDatos({ firma: firmaDe(payload), r: r as RespuestaIA });
        setCargando(false);
      })
      .catch(() => {
        if (despacho.current !== id) return;
        // Sin drama: el texto del motor ya está en pantalla.
        setCargando(false);
      });

    return () => {
      clearTimeout(tope);
      ctrl.abort();
    };
  }, [payload, iaDisponible]);

  const firma = payload ? firmaDe(payload) : "";
  return {
    /** null = todavía no se sabe; false = la IA no está disponible. */
    iaDisponible,
    cargando,
    /** La respuesta sirve solo si corresponde al pedido actual. */
    texto: datos && datos.firma === firma ? datos.r : null,
  };
}
