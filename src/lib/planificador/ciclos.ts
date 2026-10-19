import { armarSesion } from "./motor";
import type { Objetivo } from "@/lib/biblioteca";
import type { Parametros, Sesion } from "./tipos";

/**
 * Microciclo MD-5 → MD+1 y mesociclo ATR.
 *
 * La bibliografía que ordena esto es Buchheit (2024, "11 Evidence-Informed and
 * Inferred Principles of Microcycle Periodization in Elite Football"), y se
 * resume en dos ideas:
 *
 * - MD-3 es el día de mayor intensidad: espacios grandes, juego de once contra
 *   once. Es el día que más se parece al partido sin ser el partido.
 * - MD-2 es el día de velocidad por encima del 95 %, con el volumen recortado.
 *   Exponer a los jugadores a esa velocidad protege contra la lesión muscular;
 *   hacerlo con volumen alto es lo contrario.
 *
 * Y el mesociclo ATR: Acumulación (volumen, capacidades genéricas),
 * Transformación (sube la intensidad específica), Realización (competencia).
 * De 2 a 6 semanas, con 14 a 28 días como ventana óptima.
 */

export type Intensidad = "baja" | "media" | "alta" | "máxima";
export type Volumen = "bajo" | "medio" | "alto";

export type DiaMicro = {
  /** "MD-3". El orden del array es el orden de la semana. */
  id: string;
  /** Día de la semana asumiendo que el partido cae el domingo. */
  diaSemana: string;
  tipo: string;
  /** Objetivo que manda ese día. MD no entrena: es el partido. */
  objetivo: Objetivo;
  minutos: number;
  intensidad: Intensidad;
  volumen: Volumen;
  /** La razón metodológica, tal cual se la muestra al entrenador. */
  nota: string;
  esPartido: boolean;
};

/**
 * La semana tipo, con el partido el domingo.
 *
 * Las duraciones no son caprichosas: MD-2 es la sesión más corta de la semana
 * porque es la de velocidad, y MD-1 es corta porque es activación. El volumen
 * lo marca la duración, no al revés.
 */
export const DIAS_MICRO: Omit<DiaMicro, "minutos">[] = [
  {
    id: "MD+1",
    diaSemana: "Lunes",
    tipo: "Recuperación",
    // Técnica suelta y no fuerza: la recuperación activa es rondo y posesión
    // ligera, no un trabajo de gimnasio. Con "Físico" aparecían ejercicios de
    // fuerza en el día que menos carga tiene que tener.
    objetivo: "Técnica",
    intensidad: "baja",
    volumen: "bajo",
    nota: "Lo que jugó el partido baja la carga; lo que no jugó hace trabajo compensatorio. No es día de exigir.",
    esPartido: false,
  },
  {
    id: "MD-5",
    diaSemana: "Martes",
    tipo: "Carga",
    objetivo: "Físico",
    intensidad: "media",
    volumen: "alto",
    nota: "Acá se pone el volumen de la semana. Es el día para insistir en lo que más cuesta.",
    esPartido: false,
  },
  {
    id: "MD-4",
    diaSemana: "Miércoles",
    tipo: "Carga",
    objetivo: "Táctica",
    intensidad: "media",
    volumen: "alto",
    nota: "Segundo día de carga. El contenido se vuelve más específico pero el volumen se sostiene.",
    esPartido: false,
  },
  {
    id: "MD-3",
    diaSemana: "Jueves",
    tipo: "Impacto",
    objetivo: "Transición",
    intensidad: "alta",
    volumen: "medio",
    nota: "El día más intenso de la semana. Espacios grandes y juego de once contra once: es lo más parecido al partido sin serlo.",
    esPartido: false,
  },
  {
    id: "MD-2",
    diaSemana: "Viernes",
    tipo: "Velocidad",
    objetivo: "Físico",
    intensidad: "alta",
    volumen: "bajo",
    nota: "Velocidad por encima del 95 % con el volumen recortado. Exponerse a esa velocidad protege; hacerlo con volumen, lesiona.",
    esPartido: false,
  },
  {
    id: "MD-1",
    diaSemana: "Sábado",
    tipo: "Activación",
    // Se repasa la idea del partido. No es día de estrenar contenido, así que
    // va sobre lo táctico ya trabajado y no sobre lo cognitivo.
    objetivo: "Táctica",
    intensidad: "baja",
    volumen: "bajo",
    nota: "Se activa y se repasa la idea del partido. Nada nuevo y nada que deje cansancio para mañana.",
    esPartido: false,
  },
  {
    id: "MD",
    diaSemana: "Domingo",
    tipo: "Partido",
    objetivo: "Táctica",
    intensidad: "máxima",
    volumen: "alto",
    nota: "La referencia del 100 % de carga. Todo lo demás se mide contra este día.",
    esPartido: true,
  },
];

/**
 * Qué tamaño de espacio pide cada día.
 *
 * MD-3 es el día más intenso y va en espacios grandes: es lo más parecido al
 * partido. MD-2 también necesita espacio, porque la velocidad no se corre en
 * un cuadrado de veinte metros. El resto va en espacios chicos, donde la carga
 * se controla mejor.
 */
function sesgoDelDia(id: string): "grande" | "chico" {
  return id === "MD-3" || id === "MD-2" ? "grande" : "chico";
}

/** Minutos por día según la duración de referencia de la semana. */
function minutosDelDia(id: string, referencia: number): number {
  const escala: Record<string, number> = {
    "MD+1": 0.6,
    "MD-5": 1.0,
    "MD-4": 1.0,
    "MD-3": 0.9,
    "MD-2": 0.6,
    "MD-1": 0.5,
    MD: 0,
  };
  const crudo = Math.round((referencia * (escala[id] ?? 1)) / 5) * 5;
  // Ni menos de 30 ni más de 90: fuera de eso no es una sesión de fútbol.
  return Math.min(90, Math.max(30, crudo));
}

/**
 * Redondea una duración a una de las que el motor sabe cerrar exactas.
 *
 * Si se le pasa 65', el motor no lo puede armar: mejor acercarlo a 60' o 75'
 * y que la suma cierre que prometer algo que no se cumple.
 */
function redondearAOfrecida(nivel: Parametros["nivel"], minutos: number): number {
  const ofrecidas = [45, 60, 75, 90];
  return ofrecidas.reduce((mejor, actual) =>
    Math.abs(actual - minutos) < Math.abs(mejor - minutos) ? actual : mejor,
  );
}

export type Microciclo = {
  dias: (DiaMicro & { sesion: Sesion | null })[];
  /** Minutos totales de entrenamiento, sin contar el partido. */
  minutosTotales: number;
};

/**
 * Arma la semana completa. Cada día de entrenamiento sale del mismo motor que
 * las sesiones sueltas: los minutos cierran exactos o se avisa.
 */
export function armarMicrociclo(p: Parametros & { referencia?: number }): Microciclo {
  const referencia = p.referencia ?? 75;
  // Lo que ya se usó en la semana, para que los días no sean todos iguales.
  const vistos: string[] = [];
  const dias = DIAS_MICRO.map((d) => {
    const minutos = minutosDelDia(d.id, referencia);
    if (d.esPartido) return { ...d, minutos: 0, sesion: null };
    const duracion = redondearAOfrecida(p.nivel, minutos);
    const sesion = armarSesion({
      ...p,
      objetivo: d.objetivo,
      minutos: duracion,
      sesgoEspacio: sesgoDelDia(d.id),
      yaVistos: vistos,
    });
    for (const b of sesion.bloques) vistos.push(b.ejercicio.id);
    return { ...d, minutos: duracion, sesion };
  });

  return {
    dias,
    minutosTotales: dias.reduce((t, d) => t + (d.sesion?.minutosReales ?? 0), 0),
  };
}

/* ------------------------------------------------------------------------- */
/* Mesociclo ATR                                                             */
/* ------------------------------------------------------------------------- */

export type FaseATR = "Acumulación" | "Transformación" | "Realización";

export type SemanaATR = {
  numero: number;
  fase: FaseATR;
  /** Cómo se reparte la carga esa semana, en palabras. */
  intencion: string;
  /** Multiplicador de duración respecto de la referencia. */
  escala: number;
  microciclo: Microciclo;
};

export type Mesociclo = {
  semanas: SemanaATR[];
  fasePorSemana: FaseATR[];
  /** Lectura de conjunto: para qué sirve este bloque. */
  resumen: string;
};

/**
 * Reparto de fases para un mesociclo de N semanas.
 *
 * La regla clásica es descargar una de cada cuatro: tres semanas que cargan y
 * una que afloja. Con 4 semanas la última es de Realización; con más, las
 * últimas dos.
 */
export function fasesPara(semanas: number): FaseATR[] {
  if (semanas <= 2) return ["Acumulación", "Realización"];
  if (semanas === 3) return ["Acumulación", "Transformación", "Realización"];
  if (semanas === 4) return ["Acumulación", "Acumulación", "Transformación", "Realización"];
  if (semanas === 5)
    return ["Acumulación", "Acumulación", "Transformación", "Transformación", "Realización"];
  return [
    "Acumulación",
    "Acumulación",
    "Acumulación",
    "Transformación",
    "Transformación",
    "Realización",
  ];
}

const INTENCION: Record<FaseATR, string> = {
  Acumulación:
    "Se construye la base. Volumen alto, intensidad contenida y capacidades generales: acá se gana el estado físico que se usa después.",
  Transformación:
    "Baja el volumen y sube la intensidad específica. Lo que se entrenó suelto empieza a parecerse al partido.",
  Realización:
    "Semana de competencia. Se afloja la carga para llegar fresco y se sostiene sólo lo que ya está aprendido.",
};

/** Cuánto se estira o se recorta cada semana respecto de la referencia. */
const ESCALA: Record<FaseATR, number> = {
  Acumulación: 1.0,
  Transformación: 0.9,
  Realización: 0.75,
};

/**
 * Arma el mesociclo completo. Cada semana es un microciclo MD-5 → MD+1 con la
 * duración ajustada a su fase.
 */
export function armarMesociclo(
  p: Parametros & { semanas?: number; referencia?: number },
): Mesociclo {
  const semanas = Math.min(6, Math.max(2, p.semanas ?? 4));
  const referencia = p.referencia ?? 75;
  const fasePorSemana = fasesPara(semanas);

  const out: SemanaATR[] = fasePorSemana.map((fase, i) => ({
    numero: i + 1,
    fase,
    intencion: INTENCION[fase],
    escala: ESCALA[fase],
    microciclo: armarMicrociclo({
      ...p,
      referencia: Math.round((referencia * ESCALA[fase]) / 5) * 5,
    }),
  }));

  return {
    semanas: out,
    fasePorSemana,
    resumen:
      `${semanas} semanas: ${fasePorSemana.filter((f) => f === "Acumulación").length} de acumulación, ` +
      `${fasePorSemana.filter((f) => f === "Transformación").length} de transformación y ` +
      `${fasePorSemana.filter((f) => f === "Realización").length} de realización. ` +
      `El volumen más alto va en las primeras semanas y la intensidad específica en las últimas.`,
  };
}
