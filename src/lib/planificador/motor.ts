import { EJERCICIOS, type Ejercicio } from "@/lib/biblioteca";
import type { Bloque, Parametros, Rol, Sesion } from "./tipos";

/**
 * Compone sesiones reales con los 120 ejercicios de la biblioteca.
 *
 * Tres reglas de diseño:
 *
 * 1. Los minutos cierran exactos, o se dice que no cerraron. Nunca se reparte
 *    "más o menos".
 * 2. Nunca falla. Si el pedido es imposible (pocos jugadores, cancha chica,
 *    sin arcos), afloja restricciones de a una y avisa qué aflojó.
 * 3. Los rangos se derivan de los datos, no se fijan. En Profesional casi no
 *    hay tareas cortas, así que definir "vuelta a la calma = hasta 12 minutos"
 *    dejaría un solo candidato, compartido con la activación.
 */

/** Duración tope para que una tarea cuente como corta. */
const TOPE_CORTO = 15;
/** Cuántas tareas cortas queremos tener disponibles antes de conformarnos. */
const MIN_CORTAS = 10;

/** Hash estable: misma semilla y mismo ejercicio dan siempre el mismo orden. */
function hash01(clave: string): number {
  let h = 2166136261;
  for (let i = 0; i < clave.length; i += 1) {
    h ^= clave.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/**
 * Hasta cuántos minutos se considera "corta" una tarea para este conjunto.
 *
 * Se busca el primer escalón que junta MIN_CORTAS ejercicios y se lo recorta a
 * TOPE_CORTO: una vuelta a la calma de 20 minutos no es una vuelta a la calma.
 */
function umbralCorto(pool: Ejercicio[]): number {
  const mins = [...new Set(pool.map((e) => e.min))].sort((a, b) => a - b);
  if (mins.length === 0) return TOPE_CORTO;
  let acum = 0;
  let elegido = mins[0];
  for (const m of mins) {
    acum += pool.filter((e) => e.min === m).length;
    elegido = m;
    if (acum >= MIN_CORTAS) break;
  }
  return Math.min(elegido, TOPE_CORTO);
}

type Rangos = Record<Rol, [number, number]>;

function rangos(pool: Ejercicio[]): Rangos {
  const corto = umbralCorto(pool);
  const maximo = Math.max(...pool.map((e) => e.min));
  // La parte principal arranca donde terminan las tareas cortas: si no, puede
  // quedar un "plato fuerte" de 12' después de una entrada en calor de 15'.
  return {
    activacion: [8, corto],
    principal: [corto, maximo],
    vuelta: [8, corto],
  };
}

/** Duración ideal por rol, sólo para ordenar candidatos. */
const IDEAL: Record<Rol, number> = {
  activacion: 10,
  principal: 18,
  vuelta: 10,
};

/** Objetivos que se llevan bien con el pedido, para no descartarlos de plano. */
const AFINES: Record<string, string[]> = {
  Técnica: ["Táctica", "Cognitivo"],
  Táctica: ["Transición", "Cognitivo"],
  Físico: ["Transición"],
  Cognitivo: ["Táctica", "Técnica"],
  Transición: ["Táctica", "Físico"],
};

/**
 * Cantidad de bloques "natural" para una duración: más o menos una tarea cada
 * 15 minutos, nunca menos de cuatro porque una sesión de dos tareas no es una
 * sesión. Se usa para ordenar, no para fijar.
 */
function bloquesNaturales(minutos: number): number {
  return Math.max(4, Math.round(minutos / 15));
}

/**
 * Repartos posibles, ordenados por cercanía al natural.
 *
 * No se puede fijar la cantidad de bloques por duración: los ejercicios de
 * Infantil son cortos, así que 90' necesita siete bloques para llegar, mientras
 * que con los de Profesional alcanza con cuatro.
 */
function plantillasPara(minutos: number): Rol[][] {
  const natural = bloquesNaturales(minutos);
  const out: { n: number; roles: Rol[] }[] = [];
  for (let n = 3; n <= 8; n += 1) {
    out.push({
      n,
      roles: ["activacion", ...Array<"principal">(n - 2).fill("principal"), "vuelta"],
    });
  }
  out.sort((a, b) => Math.abs(a.n - natural) - Math.abs(b.n - natural) || a.n - b.n);
  return out.map((o) => o.roles);
}

/** ¿El espacio del ejercicio entra en la cancha? Se puede rotar. */
function entra(ej: Ejercicio, largo: number, ancho: number): boolean {
  return (
    (ej.largo <= largo && ej.ancho <= ancho) || (ej.ancho <= largo && ej.largo <= ancho)
  );
}

function alcanzaMaterial(ej: Ejercicio, disponible: readonly string[]): boolean {
  return ej.mats.every((m) => disponible.includes(m));
}

type Relajacion = {
  nombre: string;
  usaMaterial: boolean;
  usaEspacio: boolean;
  usaJugadores: boolean;
};

/**
 * Orden de concesiones: de lo más accesorio a lo más estructural. Primero el
 * material (se puede improvisar), después el espacio, y los jugadores al final.
 */
const RELAJACIONES: Relajacion[] = [
  { nombre: "", usaMaterial: true, usaEspacio: true, usaJugadores: true },
  { nombre: "sin filtro de material", usaMaterial: false, usaEspacio: true, usaJugadores: true },
  { nombre: "sin filtro de espacio", usaMaterial: false, usaEspacio: false, usaJugadores: true },
  {
    nombre: "sin filtro de jugadores",
    usaMaterial: false,
    usaEspacio: false,
    usaJugadores: false,
  },
];

function filtrar(p: Parametros, r: Relajacion): Ejercicio[] {
  return EJERCICIOS.filter((ej) => {
    if (ej.nivel !== p.nivel) return false;
    if (r.usaJugadores && !(ej.jugMin <= p.jugadores && p.jugadores <= ej.jugMax)) return false;
    if (r.usaEspacio && !entra(ej, p.largo, p.ancho)) return false;
    if (r.usaMaterial && !alcanzaMaterial(ej, p.material)) return false;
    return true;
  });
}

function puntaje(ej: Ejercicio, rol: Rol, p: Parametros, semilla: number): number {
  let s = 0;
  if (rol === "principal") {
    if (ej.objetivo === p.objetivo) s += 100;
    else if (AFINES[p.objetivo]?.includes(ej.objetivo)) s += 25;
  }
  if (rol === "activacion") {
    if (ej.objetivo === "Físico") s += 40;
    else if (ej.objetivo === "Técnica") s += 20;
  }
  if (rol === "vuelta") {
    if (ej.objetivo === "Físico" || ej.objetivo === "Técnica") s += 20;
  }
  s -= Math.abs(ej.min - IDEAL[rol]) * 2;
  if (p.evitar?.includes(ej.id)) s -= 500;
  s += hash01(`${ej.id}:${semilla}`) * 6;
  return s;
}

const TOPE_VISITAS = 25000;
const TOPE_SOLUCIONES = 300;

type Solucion = { elegidos: Ejercicio[]; roles: Rol[]; n: number; puntos: number };

/**
 * Compara soluciones entre repartos. El puntaje ya premia que la parte
 * principal sea del objetivo pedido (+100 por bloque), y se descuenta el
 * desvío de la cantidad natural de bloques para no preferir siempre la sesión
 * más larga.
 */
function calidad(sol: Solucion, minutos: number): number {
  return sol.puntos - Math.abs(sol.n - bloquesNaturales(minutos)) * 8;
}

/**
 * Busca combinaciones que sumen exacto. Poda con el mínimo y el máximo
 * alcanzable desde cada posición, así no explora ramas sin salida.
 */
function buscarExacta(
  roles: Rol[],
  pool: Ejercicio[],
  p: Parametros,
  semilla: number,
  rangosRol: Rangos,
): Solucion | null {
  const n = roles.length;

  const cands: Ejercicio[][] = roles.map((rol) =>
    pool
      .filter((ej) => ej.min >= rangosRol[rol][0] && ej.min <= rangosRol[rol][1])
      .sort((a, b) => puntaje(b, rol, p, semilla) - puntaje(a, rol, p, semilla)),
  );
  if (cands.some((c) => c.length === 0)) return null;

  const minDesde = new Array<number>(n + 1).fill(0);
  const maxDesde = new Array<number>(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i -= 1) {
    minDesde[i] = minDesde[i + 1] + Math.min(...cands[i].map((e) => e.min));
    maxDesde[i] = maxDesde[i + 1] + Math.max(...cands[i].map((e) => e.min));
  }
  if (minDesde[0] > p.minutos || maxDesde[0] < p.minutos) return null;

  let visitas = 0;
  let halladas = 0;
  // Se guarda en un objeto: TypeScript no sigue las asignaciones que ocurren
  // dentro del closure y si no estrecha el tipo a null y se pierde el acceso.
  const mejor: { val: { elegidos: Ejercicio[]; puntaje: number } | null } = { val: null };
  const usados = new Set<string>();
  const elegidos: Ejercicio[] = [];

  const dfs = (i: number, suma: number, puntos: number) => {
    if (visitas > TOPE_VISITAS || halladas >= TOPE_SOLUCIONES) return;
    visitas += 1;

    if (i === n) {
      if (suma === p.minutos) {
        halladas += 1;
        if (!mejor.val || puntos > mejor.val.puntaje)
          mejor.val = { elegidos: [...elegidos], puntaje: puntos };
      }
      return;
    }
    if (suma + minDesde[i] > p.minutos) return;
    if (suma + maxDesde[i] < p.minutos) return;

    for (const ej of cands[i]) {
      if (usados.has(ej.id)) continue;
      usados.add(ej.id);
      elegidos.push(ej);
      dfs(i + 1, suma + ej.min, puntos + puntaje(ej, roles[i], p, semilla));
      elegidos.pop();
      usados.delete(ej.id);
    }
  };

  dfs(0, 0, 0);
  return mejor.val ? { elegidos: mejor.val.elegidos, roles, n, puntos: mejor.val.puntaje } : null;
}

/**
 * Mejor esfuerzo para cuando nada cierra exacto. Se prefiere la sesión que
 * menos se desvía de lo pedido y, en empate, la de menos bloques: nadie quiere
 * siete tareas cuando pidió 45 minutos.
 */
function buscarAproximada(
  roles: Rol[],
  pool: Ejercicio[],
  p: Parametros,
  semilla: number,
  rangosRol: Rangos,
): Solucion | null {
  const usados = new Set<string>();
  const elegidos: Ejercicio[] = [];
  let puntos = 0;
  for (const rol of roles) {
    const candidato = pool
      .filter(
        (ej) => !usados.has(ej.id) && ej.min >= rangosRol[rol][0] && ej.min <= rangosRol[rol][1],
      )
      .sort((a, b) => puntaje(b, rol, p, semilla) - puntaje(a, rol, p, semilla))[0];
    if (!candidato) return null;
    usados.add(candidato.id);
    elegidos.push(candidato);
    puntos += puntaje(candidato, rol, p, semilla);
  }
  return { elegidos, roles, n: roles.length, puntos };
}

/** Texto breve por rol. Capa 1: escrito una vez, no generado en el momento. */
function consigna(ej: Ejercicio, rol: Rol): string {
  if (rol === "activacion") {
    return `Entrada en calor con ${ej.categoria.toLowerCase()}. Que la pelota se mueva desde el primer minuto y todos toquen.`;
  }
  if (rol === "vuelta") {
    return `Bajamos la intensidad con ${ej.categoria.toLowerCase()}. Cerrá con dos preguntas al grupo: qué salió bien y qué hay que repetir.`;
  }
  return `El plato fuerte: ${ej.categoria.toLowerCase()}. Acá está el trabajo del día, no lo apures.`;
}

export function armarSesion(p: Parametros): Sesion {
  const semilla = p.semilla ?? 0;
  const plantillas = plantillasPara(p.minutos);

  for (const r of RELAJACIONES) {
    const pool = filtrar(p, r);
    if (pool.length < 4) continue;
    const rangosRol = rangos(pool);

    let mejor: Solucion | null = null;
    for (const roles of plantillas) {
      const sol = buscarExacta(roles, pool, p, semilla, rangosRol);
      if (sol && (!mejor || calidad(sol, p.minutos) > calidad(mejor, p.minutos))) mejor = sol;
    }
    if (mejor) return construir(mejor, p, r, true);
  }

  // Nada cerró exacto: la mejor aproximación con el pool más amplio.
  const amplio = filtrar(p, RELAJACIONES[RELAJACIONES.length - 1]);
  const rangosAmplio = rangos(amplio);
  let mejor: Solucion | null = null;
  for (const roles of plantillas) {
    const sol = buscarAproximada(roles, amplio, p, semilla, rangosAmplio);
    if (!sol) continue;
    const total = sol.elegidos.reduce((t, e) => t + e.min, 0);
    const totalMejor = mejor?.elegidos.reduce((t, e) => t + e.min, 0) ?? Infinity;
    if (
      !mejor ||
      Math.abs(total - p.minutos) < Math.abs(totalMejor - p.minutos) ||
      (Math.abs(total - p.minutos) === Math.abs(totalMejor - p.minutos) && sol.n < mejor.n)
    ) {
      mejor = sol;
    }
  }
  if (mejor) {
    return construir(mejor, p, RELAJACIONES[RELAJACIONES.length - 1], false);
  }

  return {
    titulo: "Sin resultados",
    nivel: p.nivel,
    objetivo: p.objetivo,
    minutosPedidos: p.minutos,
    minutosReales: 0,
    jugadores: p.jugadores,
    bloques: [],
    avisos: ["No hay ejercicios que encajen. Probá con otro nivel o más jugadores."],
    exacta: false,
  };
}

function construir(sol: Solucion, p: Parametros, r: Relajacion, exacta: boolean): Sesion {
  const bloques: Bloque[] = sol.roles.map((rol, i) => {
    const ej = sol.elegidos[i];
    return { rol, ejercicio: ej, min: ej.min, consigna: consigna(ej, rol) };
  });

  const total = bloques.reduce((s, b) => s + b.min, 0);
  const avisos: string[] = [];

  if (r.nombre) {
    avisos.push(`Se armó ${r.nombre}: no había suficientes ejercicios que cumplieran todo junto.`);
  }
  if (!exacta) {
    avisos.push(
      `No se pudo cerrar en ${p.minutos} minutos exactos con este filtro: la sesión quedó en ${total}.`,
    );
  }

  const principales = bloques.filter((b) => b.rol === "principal");
  if (
    principales.length > 0 &&
    !principales.some((b) => b.ejercicio.objetivo === p.objetivo)
  ) {
    avisos.push(
      `No quedaban ejercicios de ${p.objetivo} para esta combinación: la parte principal usa uno afín.`,
    );
  }

  const principal = principales[0];
  return {
    titulo: principal ? principal.ejercicio.categoria : "Sesión",
    nivel: p.nivel,
    objetivo: p.objetivo,
    minutosPedidos: p.minutos,
    minutosReales: total,
    jugadores: p.jugadores,
    bloques,
    avisos,
    exacta,
  };
}

/**
 * Qué duraciones se pueden armar de verdad para un nivel.
 *
 * Con ejercicios de 12 a 25 minutos, una sesión de Profesional de 45' es
 * imposible por cómo se reparten las duraciones. Mejor no ofrecerla que
 * devolver algo que no cierra.
 */
const cacheDuraciones = new Map<string, number[]>();

export function duracionesPosibles(nivel: Parametros["nivel"]): number[] {
  const cache = cacheDuraciones.get(nivel);
  if (cache) return cache;

  const base: Parametros = {
    nivel,
    objetivo: "Técnica",
    minutos: 60,
    jugadores: 16,
    largo: 100,
    ancho: 64,
    material: ["balon", "conos", "petos", "arco", "aros", "vallas", "arquero"],
    semilla: 0,
  };
  const posibles = [45, 60, 75, 90].filter((minutos) => armarSesion({ ...base, minutos }).exacta);
  cacheDuraciones.set(nivel, posibles);
  return posibles;
}
