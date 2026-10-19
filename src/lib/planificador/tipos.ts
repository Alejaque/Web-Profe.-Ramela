import type { Ejercicio, Material, Nivel, Objetivo } from "@/lib/biblioteca";

/** Los tres momentos de una sesión. El orden es el de la cancha, no el del array. */
export type Rol = "activacion" | "principal" | "vuelta";

export const ROLES: { rol: Rol; etiqueta: string }[] = [
  { rol: "activacion", etiqueta: "Activación" },
  { rol: "principal", etiqueta: "Parte principal" },
  { rol: "vuelta", etiqueta: "Vuelta a la calma" },
];

export type Parametros = {
  nivel: Nivel;
  objetivo: Objetivo;
  /** Duración total pedida. Una de DURACIONES. */
  minutos: number;
  jugadores: number;
  /** Cancha disponible, en metros. */
  largo: number;
  ancho: number;
  /** Lo que el entrenador tiene a mano. Un ejercicio sirve si sus mats están acá. */
  material: Material[];
  /** Cambia la sesión sin cambiar los parámetros: mismo pedido, otra variante. */
  semilla?: number;
  /**
   * Ids de ejercicios a no repetir. Es la forma de pedir "otra opción": se
   * penalizan fuerte, así aparecen alternativas equivalentes sin guardar
   * estado en ningún lado.
   */
  evitar?: string[];
  /**
   * Hacia dónde empujar el tamaño de los espacios. Lo usa el microciclo: MD-3
   * es el día de mayor intensidad y va en espacios grandes, mientras que MD+1
   * y MD-1 van en espacios chicos.
   */
  sesgoEspacio?: "grande" | "chico";
  /**
   * Ejercicios ya usados en los días anteriores del ciclo. La penalidad es
   * suave: alcanza para que la semana no repita siempre lo mismo, pero no
   * impide usar uno si es el único que cierra los minutos.
   */
  yaVistos?: string[];
};

export type Bloque = {
  rol: Rol;
  ejercicio: Ejercicio;
  min: number;
  /** Texto de la capa 1: escrito una vez y guardado, no generado en el momento. */
  consigna: string;
  /**
   * Texto de la capa 2: por qué este bloque va acá, escrito por la IA para
   * este pedido concreto. Opcional: si la IA no está, no hay porQué y no
   * pasa nada.
   */
  porQue?: string;
};

export type Sesion = {
  titulo: string;
  nivel: Nivel;
  objetivo: Objetivo;
  minutosPedidos: number;
  minutosReales: number;
  jugadores: number;
  bloques: Bloque[];
  /**
   * Qué se aflojó para poder armar la sesión. Si el pedido era imposible con
   * lo que hay, conviene decirlo en vez de devolver cualquier cosa.
   */
  avisos: string[];
  /** False si no cerraron los minutos exactos: la UI lo muestra y no lo esconde. */
  exacta: boolean;
  /** Texto de la capa 2: intro para el profe, escrita por la IA (si llegó). */
  intro?: string;
  /** Texto de la capa 2: nota de cierre, escrita por la IA (si llegó). */
  cierre?: string;
};

/** Duraciones que el motor sabe armar. */
export const DURACIONES = [45, 60, 75, 90] as const;

/** Canchas típicas, para no obligar a nadie a medir la suya. */
export const CANCHAS = [
  { id: "chica", etiqueta: "Espacio chico", largo: 30, ancho: 20 },
  { id: "media", etiqueta: "Media cancha", largo: 52, ancho: 34 },
  { id: "entera", etiqueta: "Campo entero", largo: 100, ancho: 64 },
] as const;

export const MATERIALES_ETIQUETA: Record<Material, string> = {
  balon: "Pelotas",
  conos: "Conos",
  petos: "Petos",
  arco: "Arcos",
  aros: "Aros",
  vallas: "Vallas",
  arquero: "Arquero",
};
