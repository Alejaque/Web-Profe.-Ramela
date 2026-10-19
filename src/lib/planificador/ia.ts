/**
 * Capa de IA del planificador (modo híbrido).
 *
 * El motor (motor.ts) decide: qué ejercicios, cuántos minutos y en qué orden.
 * Eso no se toca nunca: los minutos cierran exactos o se avisa, y no aparece
 * ningún ejercicio que no esté en la biblioteca.
 *
 * La IA (Groq, OpenAI-compatible) redacta: la capa de texto — título, intro,
 * el "por qué" de cada bloque y la consigna reescrita en voz de profe,
 * adaptada al plantel, la cancha y el material que hay a mano. Si la IA no
 * está o falla, se usa el texto ya escrito (consignas.ts) y la página no se
 * cae: lo que la IA agrega es una mejora, nunca un requisito.
 *
 * Este archivo es puro (no toca la red): arma el payload del pedido, el
 * prompt, y valida y mezcla la respuesta. La llamada a Groq vive en
 * src/app/api/planificador-ia/route.ts; la key no llega al navegador.
 */

import type { Microciclo, Mesociclo } from "./ciclos";
import { MATERIALES_ETIQUETA, type Parametros, type Sesion } from "./tipos";

/* ------------------------------------------------------------------------- */
/* Payload: lo que el navegador le manda al servidor                         */
/* ------------------------------------------------------------------------- */

type ParamsIA = {
  nivel: string;
  objetivo: string;
  minutos: number;
  jugadores: number;
  cancha: string;
  material: string;
};

export type PayloadSesion = {
  tipo: "sesion";
  params: ParamsIA;
  titulo: string;
  bloques: { rol: string; nombre: string; categoria: string; min: number; consigna: string }[];
};

export type PayloadMicro = {
  tipo: "microciclo";
  params: ParamsIA & { referencia: number };
  dias: {
    id: string;
    dia: string;
    tipo: string;
    objetivo: string;
    intensidad: string;
    volumen: string;
    minutos: number;
    nota: string;
    esPartido: boolean;
    ejercicios: string;
  }[];
};

export type PayloadMeso = {
  tipo: "mesociclo";
  params: ParamsIA & { referencia: number; semanas: number };
  resumen: string;
  semanas: { numero: number; fase: string; intencion: string; minutos: number }[];
};

export type PayloadIA = PayloadSesion | PayloadMicro | PayloadMeso;

function canchaDe(p: Parametros): string {
  return `${p.largo} × ${p.ancho} m`;
}

function materialDe(p: Parametros): string {
  if (p.material.length === 0) return "nada marcado (se improvisa con lo que haya)";
  return p.material.map((m) => MATERIALES_ETIQUETA[m]).join(", ");
}

export function payloadDeSesion(s: Sesion, p: Parametros): PayloadSesion {
  return {
    tipo: "sesion",
    params: {
      nivel: s.nivel,
      objetivo: s.objetivo,
      minutos: s.minutosReales,
      jugadores: s.jugadores,
      cancha: canchaDe(p),
      material: materialDe(p),
    },
    titulo: s.titulo,
    bloques: s.bloques.map((b) => ({
      rol: b.rol,
      nombre: b.ejercicio.nombre,
      categoria: b.ejercicio.categoria,
      min: b.min,
      consigna: b.consigna,
    })),
  };
}

export function payloadDeMicrociclo(
  m: Microciclo,
  p: Parametros & { referencia?: number },
): PayloadMicro {
  const referencia = p.referencia ?? 75;
  return {
    tipo: "microciclo",
    params: {
      nivel: p.nivel,
      objetivo: p.objetivo,
      minutos: referencia,
      jugadores: p.jugadores,
      cancha: canchaDe(p),
      material: materialDe(p),
      referencia,
    },
    dias: m.dias.map((d) => ({
      id: d.id,
      dia: d.diaSemana,
      tipo: d.tipo,
      objetivo: d.objetivo,
      intensidad: d.intensidad,
      volumen: d.volumen,
      minutos: d.minutos,
      nota: d.nota,
      esPartido: d.esPartido,
      ejercicios: d.sesion
        ? d.sesion.bloques.map((b) => `${b.min}' ${b.ejercicio.nombre}`).join(" / ")
        : "",
    })),
  };
}

export function payloadDeMesociclo(
  m: Mesociclo,
  p: Parametros & { referencia?: number },
): PayloadMeso {
  const referencia = p.referencia ?? 75;
  return {
    tipo: "mesociclo",
    params: {
      nivel: p.nivel,
      objetivo: p.objetivo,
      minutos: referencia,
      jugadores: p.jugadores,
      cancha: canchaDe(p),
      material: materialDe(p),
      referencia,
      semanas: m.semanas.length,
    },
    resumen: m.resumen,
    semanas: m.semanas.map((s) => ({
      numero: s.numero,
      fase: s.fase,
      intencion: s.intencion,
      minutos: s.microciclo.minutosTotales,
    })),
  };
}

/* ------------------------------------------------------------------------- */
/* Respuestas: lo que la IA tiene que devolver (y cómo se valida)            */
/* ------------------------------------------------------------------------- */

export type BloqueIA = { porQue?: string; consigna?: string };

export type RespuestaSesion = {
  titulo?: string;
  intro?: string;
  cierre?: string;
  bloques?: BloqueIA[];
};

export type RespuestaMicro = { dias?: { id?: string; nota?: string }[] };
export type RespuestaMeso = { resumen?: string; semanas?: { numero?: number; intencion?: string }[] };

export type RespuestaIA = RespuestaSesion | RespuestaMicro | RespuestaMeso;

/** Texto aceptable: cadena, con whitespace normalizado, entre 8 y `max` caracteres. */
function textoLimpio(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim().replace(/\s+/g, " ");
  if (t.length < 8 || t.length > max) return undefined;
  return t;
}

/**
 * Devuelve la respuesta o null. Todo lo que no cumpla la forma esperada se
 * descarta campo por campo: una respuesta media rotta no puede llegar a la
 * pantalla, y a lo sumo se pierde el título o un porQué, no la sesión.
 */
export function validarSesionIA(json: unknown, nBloques: number): RespuestaSesion | null {
  if (typeof json !== "object" || json === null || Array.isArray(json)) return null;
  const o = json as Record<string, unknown>;
  const out: RespuestaSesion = {};
  const titulo = textoLimpio(o.titulo, 90);
  if (titulo) out.titulo = titulo;
  const intro = textoLimpio(o.intro, 420);
  if (intro) out.intro = intro;
  const cierre = textoLimpio(o.cierre, 420);
  if (cierre) out.cierre = cierre;
  if (Array.isArray(o.bloques)) {
    out.bloques = o.bloques.slice(0, nBloques).map((b): BloqueIA => {
      if (typeof b !== "object" || b === null) return {};
      const bb = b as Record<string, unknown>;
      const porQue = textoLimpio(bb.porQue, 240);
      const consigna = textoLimpio(bb.consigna, 640);
      return { ...(porQue ? { porQue } : {}), ...(consigna ? { consigna } : {}) };
    });
  }
  const tiene = out.titulo || out.intro || out.cierre || out.bloques?.some((b) => b.porQue || b.consigna);
  return tiene ? out : null;
}

export function validarMicroIA(json: unknown, nDias: number): RespuestaMicro | null {
  if (typeof json !== "object" || json === null || Array.isArray(json)) return null;
  const o = json as Record<string, unknown>;
  if (!Array.isArray(o.dias)) return null;
  const dias = o.dias.slice(0, nDias).map((d) => {
    if (typeof d !== "object" || d === null) return {};
    const dd = d as Record<string, unknown>;
    const id = typeof dd.id === "string" ? dd.id : undefined;
    const nota = textoLimpio(dd.nota, 420);
    return id && nota ? { id, nota } : {};
  });
  return dias.length ? { dias } : null;
}

export function validarMesoIA(json: unknown, nSemanas: number): RespuestaMeso | null {
  if (typeof json !== "object" || json === null || Array.isArray(json)) return null;
  const o = json as Record<string, unknown>;
  const out: RespuestaMeso = {};
  const resumen = textoLimpio(o.resumen, 560);
  if (resumen) out.resumen = resumen;
  if (Array.isArray(o.semanas)) {
    out.semanas = o.semanas.slice(0, nSemanas).map((s) => {
      if (typeof s !== "object" || s === null) return {};
      const ss = s as Record<string, unknown>;
      const numero = typeof ss.numero === "number" ? ss.numero : undefined;
      const intencion = textoLimpio(ss.intencion, 420);
      return numero && intencion ? { numero, intencion } : {};
    });
  }
  return out.resumen || out.semanas?.length ? out : null;
}

/**
 * Extracción tolerante de JSON: la IA puede devolver el objeto solo, entre
 * fences de markdown, o con algo de prosa antes o después. Si no hay objeto
 * parseable, null (y la pantalla se queda con el texto del motor).
 */
export function extraerJSON(crudo: string): unknown | null {
  if (!crudo) return null;
  let t = crudo.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const ini = t.indexOf("{");
  const fin = t.lastIndexOf("}");
  if (ini === -1 || fin <= ini) return null;
  t = t.slice(ini, fin + 1);
  try {
    return JSON.parse(t);
  } catch {
    // Último recurso: algunas respuestas traen coma final antes de } o ].
    try {
      return JSON.parse(t.replace(/,\s*([}\]])/g, "$1"));
    } catch {
      return null;
    }
  }
}

/* ------------------------------------------------------------------------- */
/* Mezcla: la IA reemplaza texto, nunca estructura                           */
/* ------------------------------------------------------------------------- */

/**
 * Reemplaza SOLO la capa de texto. Los ejercicios, los minutos y el orden
 * salen intactos del motor; si la IA no trajo un campo, se queda el original.
 */
export function mezclarSesion(s: Sesion, ia: RespuestaSesion | null): Sesion {
  if (!ia) return s;
  return {
    ...s,
    titulo: ia.titulo ?? s.titulo,
    intro: ia.intro,
    cierre: ia.cierre,
    bloques: s.bloques.map((b, i) => {
      const e = ia.bloques?.[i];
      if (!e) return b;
      return {
        ...b,
        ...(e.porQue ? { porQue: e.porQue } : {}),
        ...(e.consigna ? { consigna: e.consigna } : {}),
      };
    }),
  };
}

export function mezclarMicrociclo(m: Microciclo, ia: RespuestaMicro | null): Microciclo {
  if (!ia?.dias?.length) return m;
  const porId = new Map(
    ia.dias.filter((d) => d.id).map((d) => [d.id as string, d.nota as string]),
  );
  return {
    ...m,
    dias: m.dias.map((d) => (porId.has(d.id) ? { ...d, nota: porId.get(d.id) as string } : d)),
  };
}

export function mezclarMesociclo(m: Mesociclo, ia: RespuestaMeso | null): Mesociclo {
  if (!ia) return m;
  const porNumero = new Map(
    (ia.semanas ?? [])
      .filter((s) => typeof s.numero === "number")
      .map((s) => [s.numero as number, s.intencion as string]),
  );
  return {
    ...m,
    resumen: ia.resumen ?? m.resumen,
    semanas: m.semanas.map((s) =>
      porNumero.has(s.numero) ? { ...s, intencion: porNumero.get(s.numero) as string } : s,
    ),
  };
}

/* ------------------------------------------------------------------------- */
/* Prompt                                                                    */
/* ------------------------------------------------------------------------- */

const TONO = `Sos el asistente de redacción del planificador de entrenamientos de fútbol del Profe Ramela, un entrenador de primer nivel. Un motor determinista ya armó la práctica: los ejercicios, los minutos y el orden están cerrados y no se tocan. Tu único trabajo es redactar la capa de texto, para que el entrenador la lleve a la cancha tal cual.

Reglas no negociables:
- Español rioplatense, en voz de profe: directo, concreto, sin vueltas y sin lenguaje de marketing.
- Nunca inventes ejercicios nuevos; no cambies nombres, minutos ni el orden de los bloques.
- No menciones material que no esté en la lista de material disponible.
- La consigna reescrita va en segunda persona, como hablándole al ayudante: "Armá...", "Cuando la recuperen...", "Cada vez que...".
- El "por qué" es UNA oración: la razón metodológica de ese bloque ese día, no una enciclopedia.
- Responde SOLO con el objeto JSON pedido, sin markdown, sin comentarios, sin asteriscos.`;

export function promptDe(payload: PayloadIA): { system: string; user: string } {
  if (payload.tipo === "sesion") {
    const user = JSON.stringify(
      {
        pedido: payload.params,
        sesion: {
          tituloActual: payload.titulo,
          bloques: payload.bloques.map((b, i) => ({
            orden: i + 1,
            rol: b.rol,
            minutos: b.min,
            ejercicio: b.nombre,
            categoria: b.categoria,
            consignaBase: b.consigna,
          })),
        },
        devolver: {
          titulo: "un título que capture el foco de la sesión (menos de 70 caracteres, sin emojis)",
          intro: "2 o 3 oraciones: por qué la sesión se arma así para ESTE plantel, nivel, cancha y objetivo",
          bloques: payload.bloques.map(() => ({
            porQue: "una oración: por qué este bloque va acá",
            consigna: "la consigna reescrita en voz de profe, 2 a 4 oraciones, específica para este plantel: cuántos, a qué distancia, qué pasa cuando se roba la pelota",
          })),
          cierre: "1 o 2 oraciones: la nota para dejar al plantel (qué mirar, qué ajustar después)",
        },
      },
      null,
      1,
    );
    return { system: TONO, user };
  }

  if (payload.tipo === "microciclo") {
    const user = JSON.stringify(
      {
        pedido: payload.params,
        semana: payload.dias.map((d, i) => ({
          orden: i + 1,
          id: d.id,
          dia: d.dia,
          tipo: d.tipo,
          objetivo: d.objetivo,
          minutos: d.minutos,
          intensidad: d.intensidad,
          volumen: d.volumen,
          esPartido: d.esPartido,
          ejercicios: d.ejercicios,
          notaBase: d.nota,
        })),
        devolver: {
          dias: payload.dias.map((d) => ({
            id: d.id,
            nota: "2 o 3 oraciones reescritas en voz de profe, manteniendo la razón metodológica y adaptadas a este plantel (nivel, jugadores, duración de referencia)",
          })),
        },
      },
      null,
      1,
    );
    return { system: TONO, user };
  }

  const user = JSON.stringify(
    {
      pedido: payload.params,
      mesociclo: {
        resumenActual: payload.resumen,
        semanas: payload.semanas,
      },
      devolver: {
        resumen: "3 o 4 oraciones: la lectura de todo el bloque para este plantel (nivel, jugadores, duración de referencia)",
        semanas: payload.semanas.map((s) => ({
          numero: s.numero,
          intencion: "2 oraciones en voz de profe, específicas para este plantel",
        })),
      },
    },
    null,
    1,
  );
  return { system: TONO, user };
}

/** Tope de salida por tipo: la capa de texto no debería pasar de esto. */
export function maxTokensDe(payload: PayloadIA): number {
  if (payload.tipo === "sesion") return 2000;
  if (payload.tipo === "microciclo") return 1100;
  return 900;
}

/**
 * Huella estable del payload (FNV-1a, iguala al hash del motor): el hook la
 * usa para saber si el texto que llegó al servidor corresponde a lo que hay
 * en pantalla, y descartar respuestas viejas si el usuario cambió los
 * parámetros en el medio.
 */
export function firmaDe(payload: PayloadIA): string {
  const s = JSON.stringify(payload);
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
