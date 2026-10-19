import assert from "node:assert/strict";
import { test } from "node:test";

import { EJERCICIOS, type Material } from "../src/lib/biblioteca";
import { armarMesociclo, armarMicrociclo } from "../src/lib/planificador/ciclos";
import { armarSesion, duracionesPosibles } from "../src/lib/planificador/motor";
import { CANCHAS, DURACIONES, type Parametros } from "../src/lib/planificador/tipos";

const TODO: Material[] = ["balon", "conos", "petos", "arco", "aros", "vallas", "arquero"];
const NIVELES = ["Infantil", "Juvenil", "Profesional"] as const;
const OBJETIVOS = ["Técnica", "Táctica", "Físico", "Cognitivo", "Transición"] as const;
const PLANTILLAS_JUGADORES = [8, 12, 16, 20, 24];

type Extra = { referencia?: number; semanas?: number };

function base(over: Partial<Parametros> & Extra = {}): Parametros & Extra {
  return {
    nivel: "Juvenil",
    objetivo: "Táctica",
    minutos: 60,
    jugadores: 16,
    largo: 100,
    ancho: 64,
    material: TODO,
    semilla: 0,
    ...over,
  };
}

type Caso = { p: Parametros; contexto: string };

/** Todos los pedidos que se pueden armar desde la UI. */
function todosLosCasos(): Caso[] {
  const out: Caso[] = [];
  for (const nivel of NIVELES) {
    for (const objetivo of OBJETIVOS) {
      for (const minutos of DURACIONES) {
        for (const cancha of CANCHAS) {
          for (const jugadores of PLANTILLAS_JUGADORES) {
            out.push({
              p: base({ nivel, objetivo, minutos, jugadores, largo: cancha.largo, ancho: cancha.ancho }),
              contexto: `${nivel}/${objetivo}/${minutos}'/${cancha.id}/${jugadores}j`,
            });
          }
        }
      }
    }
  }
  return out;
}

/**
 * La regla de oro del motor: o cierra exacto, o lo dice.
 *
 * Un planificador que devuelve 67 minutos cuando pediste 75 es peor que uno
 * que te avisa. Por eso este test no admite ni una excepción.
 */
test("los minutos cierran exactos en las 900 combinaciones", () => {
  const fallas: string[] = [];
  let total = 0;
  for (const { p, contexto } of todosLosCasos()) {
    total += 1;
    const s = armarSesion(p);
    if (!s.exacta) fallas.push(`${contexto} -> ${s.minutosReales}' en vez de ${s.minutosPedidos}'`);
  }
  assert.equal(total, 3 * 5 * 4 * 3 * 5);
  assert.deepEqual(fallas, [], `combinaciones que no cerraron:\n${fallas.join("\n")}`);
});

/**
 * Si no avisa, cumplió todo. Si aflojó algo, tiene que decirlo.
 *
 * Es la otra mitad del contrato: nadie quiere que le cuelen un ejercicio de 20
 * jugadores en un plantel de 12 sin que se lo mencionen.
 */
test("sin aviso se cumplen todos los filtros; con aviso, se explica cuál se aflojó", () => {
  const silenciosos: string[] = [];
  const mudos: string[] = [];
  for (const { p, contexto } of todosLosCasos()) {
    const s = armarSesion(p);
    const rompeMaterial = s.bloques.some((b) => !b.ejercicio.mats.every((m) => p.material.includes(m)));
    const rompeEspacio = s.bloques.some((b) => {
      const e = b.ejercicio;
      return !((e.largo <= p.largo && e.ancho <= p.ancho) || (e.ancho <= p.largo && e.largo <= p.ancho));
    });
    const rompeJugadores = s.bloques.some(
      (b) => !(b.ejercicio.jugMin <= p.jugadores && p.jugadores <= b.ejercicio.jugMax),
    );
    const rompio = rompeMaterial || rompeEspacio || rompeJugadores;

    if (rompio && s.avisos.length === 0) {
      mudos.push(
        `${contexto} -> rompió ${rompeMaterial ? "material " : ""}${rompeEspacio ? "espacio " : ""}${
          rompeJugadores ? "jugadores" : ""
        } sin avisar`,
      );
    }
    if (!rompio) silenciosos.push(contexto);
  }
  assert.deepEqual(mudos, [], `aflojó un filtro sin decirlo:\n${mudos.join("\n")}`);
  // Tiene que haber una mayoría sana de casos que no necesitan concesiones.
  assert.ok(
    silenciosos.length > 900 * 0.5,
    `sólo ${silenciosos.length} de 900 se armaron sin concesiones`,
  );
});

test("la sesión respeta el nivel pedido y no repite ejercicios", () => {
  for (const nivel of NIVELES) {
    for (const minutos of DURACIONES) {
      const s = armarSesion(base({ nivel, minutos }));
      assert.ok(s.bloques.length >= 3, `${nivel}/${minutos}: muy pocos bloques`);
      for (const b of s.bloques) assert.equal(b.ejercicio.nivel, nivel);
      const ids = s.bloques.map((b) => b.ejercicio.id);
      assert.equal(new Set(ids).size, ids.length, `${nivel}/${minutos}: repite ${ids.join(",")}`);
    }
  }
});

test("empieza activando y termina bajando", () => {
  for (const minutos of DURACIONES) {
    const s = armarSesion(base({ minutos }));
    assert.equal(s.bloques[0].rol, "activacion");
    assert.equal(s.bloques[s.bloques.length - 1].rol, "vuelta");
  }
});

/**
 * El objetivo tiene que mandar en la parte principal. Cuando la biblioteca no
 * da (en Profesional, Táctica y Transición arrancan en 20'), está bien caer en
 * un afín, pero hay que decirlo.
 */
test("la parte principal apunta al objetivo pedido, o avisa", () => {
  const sinAviso: string[] = [];
  let aciertos = 0;
  let intentos = 0;
  for (const nivel of NIVELES) {
    for (const objetivo of OBJETIVOS) {
      for (const minutos of DURACIONES) {
        const s = armarSesionSegura(base({ nivel, objetivo, minutos }));
        const principales = s.bloques.filter((b) => b.rol === "principal");
        intentos += 1;
        const acerto = principales.some((b) => b.ejercicio.objetivo === objetivo);
        if (acerto) aciertos += 1;
        else if (!s.avisos.some((a) => a.includes(objetivo))) sinAviso.push(`${nivel}/${objetivo}/${minutos}'`);
      }
    }
  }
  assert.deepEqual(sinAviso, [], `usó un objetivo afín sin avisar:\n${sinAviso.join("\n")}`);
  assert.ok(aciertos / intentos > 0.85, `sólo ${aciertos}/${intentos} dieron el objetivo pedido`);
});

/** Un caso imposible no puede tirar: el motor afloja y avisa. */
function armarSesionSegura(p: Parametros) {
  const s = armarSesion(p);
  assert.ok(s.exacta, `${p.nivel}/${p.objetivo}/${p.minutos}' no cerró exacto`);
  return s;
}

test("respeta el espacio disponible", () => {
  for (const cancha of CANCHAS) {
    const s = armarSesion(base({ largo: cancha.largo, ancho: cancha.ancho, minutos: 60 }));
    for (const b of s.bloques) {
      const ej = b.ejercicio;
      const cabe =
        (ej.largo <= cancha.largo && ej.ancho <= cancha.ancho) ||
        (ej.ancho <= cancha.largo && ej.largo <= cancha.ancho);
      assert.ok(cabe || s.avisos.length > 0, `${ej.id} (${ej.largo}×${ej.ancho}) no entra en ${cancha.etiqueta}`);
    }
  }
});

test("no pide material que el entrenador no tiene, salvo que avise", () => {
  const pobres: Material[] = ["balon", "conos"];
  const s = armarSesion(base({ material: pobres }));
  for (const b of s.bloques) {
    for (const m of b.ejercicio.mats) {
      assert.ok(
        pobres.includes(m) || s.avisos.length > 0,
        `${b.ejercicio.id} pide ${m}, que no está disponible, y no avisó`,
      );
    }
  }
});

test("la cantidad de jugadores cae dentro del rango del ejercicio, salvo que avise", () => {
  for (const jugadores of PLANTILLAS_JUGADORES) {
    const s = armarSesion(base({ jugadores }));
    for (const b of s.bloques) {
      const ej = b.ejercicio;
      assert.ok(
        (ej.jugMin <= jugadores && jugadores <= ej.jugMax) || s.avisos.length > 0,
        `${ej.id} es para ${ej.jugMin}-${ej.jugMax}, no para ${jugadores}, y no avisó`,
      );
    }
  }
});

/**
 * "Otra opción" tiene que dar otra cosa. Se pide con `evitar`: se penaliza lo
 * que ya se vio, así la alternativa es distinta y de calidad parecida.
 */
test("pedir otra opción da una sesión distinta, siempre cerrando los minutos", () => {
  for (const nivel of NIVELES) {
    for (const minutos of DURACIONES) {
      const p = base({ nivel, minutos });
      let evitar: string[] = [];
      const vistas: string[] = [];
      for (let i = 0; i < 4; i += 1) {
        const s = armarSesion({ ...p, evitar });
        assert.equal(s.minutosReales, minutos, `${nivel}/${minutos}: la opción ${i} no cerró`);
        const firma = s.bloques.map((b) => b.ejercicio.id).join(",");
        vistas.push(firma);
        evitar = [...evitar, ...s.bloques.map((b) => b.ejercicio.id)];
      }
      assert.equal(
        new Set(vistas).size,
        4,
        `${nivel}/${minutos}: "otra opción" repitió sesión -> ${vistas.join(" | ")}`,
      );
    }
  }
});

test("el mismo pedido da siempre la misma sesión", () => {
  const a = armarSesion(base({ semilla: 3 }));
  const b = armarSesion(base({ semilla: 3 }));
  assert.equal(
    a.bloques.map((x) => x.ejercicio.id).join(","),
    b.bloques.map((x) => x.ejercicio.id).join(","),
  );
});

test("un pedido imposible avisa en vez de devolver cualquier cosa", () => {
  const s = armarSesion(base({ jugadores: 2, largo: 8, ancho: 6, material: [] }));
  assert.ok(s.bloques.length > 0, "no devolvió nada");
  assert.equal(s.minutosReales, s.bloques.reduce((t, b) => t + b.min, 0));
  assert.ok(s.avisos.length > 0 || s.exacta);
});

test("cada bloque trae la consigna de su ejercicio, no una plantilla repetida", () => {
  for (const nivel of NIVELES) {
    const s = armarSesion(base({ nivel }));
    const vistas = new Set<string>();
    for (const b of s.bloques) {
      assert.ok(b.consigna.length > 40, `${b.ejercicio.id} sin consigna útil`);
      // La consigna viene del desarrollo de la ficha: dos bloques distintos no
      // pueden decir lo mismo. Si se repite, volvió la plantilla genérica.
      vistas.add(b.consigna);
    }
    assert.equal(vistas.size, s.bloques.length, `${nivel}: hay consignas repetidas`);
  }
});

test("las 120 consignas existen y no son el nombre del ejercicio", async () => {
  const { CONSIGNAS } = await import("../src/lib/planificador/consignas");
  for (const e of EJERCICIOS) {
    const texto = CONSIGNAS[e.id];
    assert.ok(texto && texto.length > 40, `${e.id} sin consigna generada`);
    assert.notEqual(texto.trim(), e.nombre.trim(), `${e.id}: la consigna es sólo el nombre`);
  }
  assert.equal(Object.keys(CONSIGNAS).length, 120);
});

/**
 * Las duraciones que se ofrecen en la UI tienen que ser las que de verdad se
 * pueden armar. Si se ofrecen 90' para Infantil y el motor no llega, la
 * pantalla queda rota.
 */
test("todas las duraciones que se ofrecen cierran, para los tres niveles", () => {
  for (const nivel of NIVELES) {
    const ofrecidas = duracionesPosibles(nivel);
    assert.ok(ofrecidas.length >= 3, `${nivel}: sólo se pueden armar ${ofrecidas.join(",")}`);
    for (const minutos of ofrecidas) {
      for (const objetivo of OBJETIVOS) {
        const s = armarSesion(base({ nivel, objetivo, minutos }));
        assert.ok(s.exacta, `${nivel}/${objetivo}/${minutos}' se ofrece pero no cierra`);
      }
    }
  }
});

test("los datos derivados están completos en los 120 ejercicios", () => {
  for (const e of EJERCICIOS) {
    assert.ok(e.jugMin > 0 && e.jugMax >= e.jugMin, `${e.id}: rango de jugadores inválido`);
    assert.ok(e.largo > 0 && e.ancho > 0, `${e.id}: sin medidas de espacio`);
    assert.ok(e.mats.length > 0, `${e.id}: sin material`);
    assert.ok(e.min > 0, `${e.id}: sin duración`);
  }
  assert.equal(EJERCICIOS.length, 120);
});

/* ------------------------------------------------------------------------- */
/* Microciclo MD-5 → MD+1 y mesociclo ATR                                    */
/* ------------------------------------------------------------------------- */

test("el microciclo cierra exacto en los siete días y en los tres niveles", () => {
  let sesiones = 0;
  for (const nivel of NIVELES) {
    for (const jugadores of [8, 12, 16, 20, 24]) {
      for (const referencia of [45, 60, 75, 90]) {
        const micro = armarMicrociclo(base({ nivel, jugadores, referencia }));
        assert.equal(micro.dias.length, 7, `${nivel}: la semana no tiene siete días`);
        for (const d of micro.dias) {
          if (d.esPartido) {
            assert.equal(d.sesion, null, `${d.id} es partido y armó sesión`);
            continue;
          }
          assert.ok(d.sesion, `${nivel}/${jugadores}j/${d.id}: sin sesión`);
          sesiones += 1;
          assert.ok(
            d.sesion!.exacta,
            `${nivel}/${jugadores}j/ref${referencia} ${d.id}: ${d.sesion!.minutosReales}' en vez de ${d.sesion!.minutosPedidos}'`,
          );
          assert.equal(d.sesion!.minutosReales, d.minutos);
        }
      }
    }
  }
  assert.equal(sesiones, 3 * 5 * 4 * 6, "faltaron sesiones por revisar");
});

test("el microciclo respeta la lógica de la semana: MD-3 en espacios grandes y sin partido entrenando", () => {
  for (const nivel of NIVELES) {
    const micro = armarMicrociclo(base({ nivel, referencia: 75 }));
    const area = (id: string) => {
      const d = micro.dias.find((x) => x.id === id)!;
      const bloques = d.sesion!.bloques;
      return bloques.reduce((t, b) => t + b.ejercicio.largo * b.ejercicio.ancho, 0) / bloques.length;
    };
    // MD-3 es el día de mayor intensidad: va en espacios grandes.
    assert.ok(
      area("MD-3") > area("MD+1"),
      `${nivel}: MD-3 (${Math.round(area("MD-3"))}m²) debería usar más espacio que MD+1 (${Math.round(area("MD+1"))}m²)`,
    );
    // MD-2 es el día de velocidad: también necesita espacio.
    assert.ok(
      area("MD-2") > area("MD-1"),
      `${nivel}: MD-2 (${Math.round(area("MD-2"))}m²) debería usar más espacio que MD-1 (${Math.round(area("MD-1"))}m²)`,
    );
    // El día del partido no entrena.
    const md = micro.dias.find((d) => d.id === "MD")!;
    assert.equal(md.esPartido, true);
    assert.equal(md.sesion, null);
    // MD-1 activa: es la sesión más corta o empatada con MD-2.
    const md1 = micro.dias.find((d) => d.id === "MD-1")!.minutos;
    const md5 = micro.dias.find((d) => d.id === "MD-5")!.minutos;
    assert.ok(md1 <= md5, `${nivel}: MD-1 (${md1}') debería ser más corto que MD-5 (${md5}')`);
  }
});

test("el mesociclo ATR arma de 2 a 6 semanas, todas exactas, y descarga al final", () => {
  let sesiones = 0;
  for (const nivel of NIVELES) {
    for (const semanas of [2, 3, 4, 5, 6]) {
      const meso = armarMesociclo(base({ nivel, semanas, referencia: 75 }));
      assert.equal(meso.semanas.length, semanas, `${nivel}: pidió ${semanas} semanas y dio ${meso.semanas.length}`);
      // La última semana siempre es de realización: se llega fresco al final.
      assert.equal(meso.semanas[meso.semanas.length - 1].fase, "Realización");
      // La primera siempre acumula.
      assert.equal(meso.semanas[0].fase, "Acumulación");
      for (const s of meso.semanas) {
        for (const d of s.microciclo.dias) {
          if (!d.sesion) continue;
          sesiones += 1;
          assert.ok(
            d.sesion.exacta,
            `${nivel}/${semanas}s/sem${s.numero}/${d.id}: ${d.sesion.minutosReales}' en vez de ${d.sesion.minutosPedidos}'`,
          );
        }
      }
    }
  }
  // 3 niveles × (2+3+4+5+6) semanas × 6 días de entrenamiento, sin contar el partido.
  assert.equal(sesiones, 3 * 20 * 6);
});

test("el mesociclo baja la carga hacia la competencia", () => {
  const meso = armarMesociclo(base({ nivel: "Juvenil", semanas: 4, referencia: 75 }));
  const minutosPorSemana = meso.semanas.map(
    (s) => s.microciclo.minutosTotales,
  );
  // La semana de realización entrena menos que la de acumulación.
  assert.ok(
    minutosPorSemana[3] < minutosPorSemana[0],
    `la última semana (${minutosPorSemana[3]}') debería cargar menos que la primera (${minutosPorSemana[0]}')`,
  );
  assert.ok(meso.resumen.includes("4 semanas"), "el resumen no describe el bloque");
});
