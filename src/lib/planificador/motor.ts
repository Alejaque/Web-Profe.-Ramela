import { EJERCICIOS, type Ejercicio } from "@/lib/biblioteca";
import { CONSIGNAS } from "./consignas";
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

/** Superficie mediana del conjunto: el punto de comparación del sesgo. */
function areaMedianaDe(pool: Ejercicio[]): number {
  if (pool.length === 0) return 0;
  const areas = pool.map((e) => e.largo * e.ancho).sort((a, b) => a - b);
  return areas[Math.floor(areas.length / 2)];
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

function puntaje(
  ej: Ejercicio,
  rol: Rol,
  p: Parametros,
  semilla: number,
  areaMediana: number,
): number {
  let s = 0;
  if (p.sesgoEspacio && areaMediana > 0) {
    const area = ej.largo * ej.ancho;
    // Hasta 60 puntos: inclina la elección sin tapar el objetivo pedido.
    const desvio = (area - areaMediana) / areaMediana;
    s += Math.max(-1, Math.min(1, desvio)) * 60 * (p.sesgoEspacio === "grande" ? 1 : -1);
  }
  if (rol === "principal") {
    if (ej.objetivo === p.objetivo) s += 100;
    else if (AFINES[p.objetivo]?.includes(ej.objetivo)) s += 25;
  }
  if (rol === "activacion") {
    // Preferencia leve: si pesa mucho, el mismo ejercicio de fuerza termina
    // abriendo todas las sesiones de la semana, hasta la del día de descarga.
    if (ej.objetivo === "Físico") s += 12;
    else if (ej.objetivo === "Técnica") s += 8;
  }
  if (rol === "vuelta") {
    if (ej.objetivo === "Físico" || ej.objetivo === "Técnica") s += 20;
  }
  s -= Math.abs(ej.min - IDEAL[rol]) * 2;
  if (p.evitar?.includes(ej.id)) s -= 500;
  // Nunca por encima del premio por acertar el objetivo (+100): la variedad
  // está bien, pero no al precio de dejar de entrenar lo que se pidió.
  if (p.yaVistos?.includes(ej.id)) s -= 90;
  s += hash01(`${ej.id}:${semilla}`) * 6;
  return s;
}

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
 * Busca la mejor combinación que suma exacto.
 *
 * Se resuelve en dos pasos y no con una búsqueda en profundidad, porque la
 * búsqueda tiene un problema serio: es a lo ancho antes de llegar al fondo, así
 * que con un tope de nodos se queda sin presupuesto explorando la primera rama
 * y nunca llega a una hoja. Cuando eso pasa devuelve "no hay solución" para un
 * pedido que sí la tiene.
 *
 * Paso 1, programación dinámica sobre (bloque, minutos): encuentra la tupla de
 * duraciones que suma exacto con el mejor puntaje posible. El estado es chico
 * (hasta 8 bloques × 90 minutos) y da el óptimo global, no el primero que
 * aparece.
 *
 * Paso 2, reparto: con las duraciones ya fijas, elegir qué ejercicio va en cada
 * bloque es un problema de asignación sin repeticiones, chico y con backtracking.
 */
function buscarExacta(
  roles: Rol[],
  pool: Ejercicio[],
  p: Parametros,
  semilla: number,
  rangosRol: Rangos,
): Solucion | null {
  const n = roles.length;
  const areaMediana = areaMedianaDe(pool);
  const objetivoT = p.minutos;

  // Candidatos por bloque, agrupados por duración y ordenados por calidad.
  const porDuracion: Map<number, Ejercicio[]>[] = roles.map((rol) => {
    const mapa = new Map<number, Ejercicio[]>();
    pool
      .filter((ej) => ej.min >= rangosRol[rol][0] && ej.min <= rangosRol[rol][1])
      .sort(
        (a, b) =>
          puntaje(b, rol, p, semilla, areaMediana) - puntaje(a, rol, p, semilla, areaMediana),
      )
      .forEach((ej) => {
        const lista = mapa.get(ej.min) ?? [];
        lista.push(ej);
        mapa.set(ej.min, lista);
      });
    return mapa;
  });
  if (porDuracion.some((m) => m.size === 0)) return null;

  // Cuántos ejercicios hay de cada duración en todo el conjunto. Sirve para
  // descartar tuplas imposibles: si en Infantil hay un solo ejercicio de 8',
  // ninguna sesión puede usarlo en dos bloques.
  const stock = new Map<number, number>();
  for (const ej of pool) stock.set(ej.min, (stock.get(ej.min) ?? 0) + 1);

  // Duraciones vetadas por bloque. Se van llenando cuando una tupla resulta
  // imposible de repartir, para que el próximo intento elija otra.
  const vetado: Set<number>[] = roles.map(() => new Set<number>());

  for (let intento = 0; intento < 30; intento += 1) {
    // Paso 1: mejor puntaje usando los bloques i..n-1 para sumar s.
    const mejor: (number | null)[][] = Array.from({ length: n + 1 }, () =>
      new Array<number | null>(objetivoT + 1).fill(null),
    );
    const elegida: (number | null)[][] = Array.from({ length: n + 1 }, () =>
      new Array<number | null>(objetivoT + 1).fill(null),
    );
    mejor[n][0] = 0;

    for (let i = n - 1; i >= 0; i -= 1) {
      for (let s = 0; s <= objetivoT; s += 1) {
        for (const [dur, ejercicios] of porDuracion[i]) {
          if (dur > s || vetado[i].has(dur)) continue;
          const previo = mejor[i + 1][s - dur];
          if (previo === null) continue;
          const total = previo + puntaje(ejercicios[0], roles[i], p, semilla, areaMediana);
          if (mejor[i][s] === null || total > (mejor[i][s] as number)) {
            mejor[i][s] = total;
            elegida[i][s] = dur;
          }
        }
      }
    }
    if (mejor[0][objetivoT] === null) return null;

    // Reconstruye la tupla de duraciones.
    const durs: number[] = [];
    let s = objetivoT;
    for (let i = 0; i < n; i += 1) {
      const d = elegida[i][s];
      if (d === null) return null;
      durs.push(d);
      s -= d;
    }

    // ¿Alcanza el stock? Si una duración se pide más veces de lo que hay,
    // la tupla no se puede repartir y hay que probar otra.
    const pedido = new Map<number, number>();
    for (const d of durs) pedido.set(d, (pedido.get(d) ?? 0) + 1);
    let agotada: number | null = null;
    for (const [d, cuantos] of pedido) {
      if ((stock.get(d) ?? 0) < cuantos) agotada = d;
    }
    if (agotada !== null) {
      // Se la veta en el último bloque que la pedía: es el más fácil de cambiar.
      for (let i = n - 1; i >= 0; i -= 1) {
        if (durs[i] === agotada) {
          vetado[i].add(agotada);
          break;
        }
      }
      continue;
    }

    // Paso 2: reparte ejercicios concretos sin repetir ninguno.
    let mejorReparto: { elegidos: Ejercicio[]; puntos: number } | null = null;
    const usados = new Set<string>();
    const elegidos: Ejercicio[] = [];
    let nodos = 0;
    let masProfundo = -1;
    let atasco = -1;

    const asignar = (i: number, puntos: number) => {
      if (nodos > 20000 || mejorReparto !== null) return;
      nodos += 1;
      if (i === n) {
        // Con las duraciones fijas, cualquier reparto completo suma exacto.
        mejorReparto = { elegidos: [...elegidos], puntos };
        return;
      }
      if (i > masProfundo) masProfundo = i;
      let probe = false;
      for (const ej of porDuracion[i].get(durs[i]) ?? []) {
        if (usados.has(ej.id)) continue;
        probe = true;
        usados.add(ej.id);
        elegidos.push(ej);
        asignar(i + 1, puntos + puntaje(ej, roles[i], p, semilla, areaMediana));
        elegidos.pop();
        usados.delete(ej.id);
        if (mejorReparto !== null) return;
      }
      if (!probe && i >= masProfundo) atasco = i;
    };
    asignar(0, 0);

    if (mejorReparto) {
      const exito = mejorReparto as { elegidos: Ejercicio[]; puntos: number };
      return { elegidos: exito.elegidos, roles, n, puntos: exito.puntos };
    }
    // No se pudo repartir: se veta la duración del bloque que se quedó sin
    // opciones y se vuelve a armar la tupla.
    if (atasco >= 0) vetado[atasco].add(durs[atasco]);
    else return null;
  }
  return null;
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
  const areaMediana = areaMedianaDe(pool);
  const usados = new Set<string>();
  const elegidos: Ejercicio[] = [];
  let puntos = 0;
  for (const rol of roles) {
    const candidato = pool
      .filter(
        (ej) => !usados.has(ej.id) && ej.min >= rangosRol[rol][0] && ej.min <= rangosRol[rol][1],
      )
      .sort(
        (a, b) => puntaje(b, rol, p, semilla, areaMediana) - puntaje(a, rol, p, semilla, areaMediana),
      )[0];
    if (!candidato) return null;
    usados.add(candidato.id);
    elegidos.push(candidato);
    puntos += puntaje(candidato, rol, p, semilla, areaMediana);
  }
  return { elegidos, roles, n: roles.length, puntos };
}

/**
 * La consigna de cada bloque.
 *
 * El cuerpo es el desarrollo de la ficha de ese ejercicio: está escrito para
 * esa tarea concreta, no es una plantilla que se repite. El rol sólo le pone
 * una frase de marco arriba, que es lo único que cambia según el momento.
 */
function consigna(ej: Ejercicio, rol: Rol): string {
  const cuerpo = CONSIGNAS[ej.id] ?? `${ej.categoria}.`;
  if (rol === "activacion") {
    return `Para entrar en calor. ${cuerpo} Que la pelota se mueva desde el primer minuto y todos toquen.`;
  }
  if (rol === "vuelta") {
    return `Para bajar. ${cuerpo} Cerrá con dos preguntas al grupo: qué salió bien y qué hay que repetir.`;
  }
  return cuerpo;
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
