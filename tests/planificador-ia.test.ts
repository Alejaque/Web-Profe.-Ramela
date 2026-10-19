import assert from "node:assert/strict";
import { test } from "node:test";

import { armarMesociclo, armarMicrociclo } from "../src/lib/planificador/ciclos";
import {
  extraerJSON,
  firmaDe,
  mezclarMesociclo,
  mezclarMicrociclo,
  mezclarSesion,
  payloadDeMesociclo,
  payloadDeMicrociclo,
  payloadDeSesion,
  promptDe,
  validarMesoIA,
  validarMicroIA,
  validarSesionIA,
} from "../src/lib/planificador/ia";
import { armarSesion } from "../src/lib/planificador/motor";
import type { Parametros, Sesion } from "../src/lib/planificador/tipos";

const TODO = ["balon", "conos", "petos", "arco", "aros", "vallas", "arquero"] as const;

function base(over: Partial<Parametros> = {}): Parametros {
  return {
    nivel: "Juvenil",
    objetivo: "Táctica",
    minutos: 60,
    jugadores: 16,
    largo: 100,
    ancho: 64,
    material: [...TODO],
    semilla: 0,
    ...over,
  };
}

/* ------------------------------------------------------------------------- */
/* extraerJSON                                                                */
/* ------------------------------------------------------------------------- */

test("extraerJSON: objeto limpio", () => {
  const out = extraerJSON('{"a": 1}');
  assert.deepEqual(out, { a: 1 });
});

test("extraerJSON: entre fences de markdown", () => {
  const out = extraerJSON('```json\n{"a": 1}\n```');
  assert.deepEqual(out, { a: 1 });
});

test("extraerJSON: con prosa antes y después", () => {
  const out = extraerJSON('Acá va lo que pediste:\n{"a": 1}\nEspero que sirva.');
  assert.deepEqual(out, { a: 1 });
});

test("extraerJSON: coma final se tolera", () => {
  const out = extraerJSON('{"a": 1,}');
  assert.deepEqual(out, { a: 1 });
});

test("extraerJSON: sin objeto, null", () => {
  assert.equal(extraerJSON("No puedo hacer eso."), null);
  assert.equal(extraerJSON(""), null);
  assert.equal(extraerJSON("{"), null);
});

/* ------------------------------------------------------------------------- */
/* Payloads                                                                   */
/* ------------------------------------------------------------------------- */

test("payloadDeSesion: conserva el orden, los minutos y los ejercicios", () => {
  const p = base();
  const sesion = armarSesion(p);
  const payload = payloadDeSesion(sesion, p);

  assert.equal(payload.tipo, "sesion");
  assert.equal(payload.bloques.length, sesion.bloques.length);
  payload.bloques.forEach((b, i) => {
    assert.equal(b.nombre, sesion.bloques[i].ejercicio.nombre);
    assert.equal(b.min, sesion.bloques[i].min);
  });
  assert.equal(payload.params.nivel, sesion.nivel);
  assert.equal(payload.params.jugadores, sesion.jugadores);
  assert.equal(payload.params.cancha, "100 × 64 m");
});

test("payloadDeMicrociclo: un ítem por día, con los ejercicios del motor", () => {
  const p = { ...base(), referencia: 75 };
  const micro = armarMicrociclo(p);
  const payload = payloadDeMicrociclo(micro, p);

  assert.equal(payload.dias.length, micro.dias.length);
  const md3 = payload.dias.find((d) => d.id === "MD-3");
  const md3Real = micro.dias.find((d) => d.id === "MD-3");
  assert.ok(md3 && md3Real);
  assert.equal(md3.nota, md3Real.nota);
  assert.match(md3.ejercicios, /\d+'/);
});

test("payloadDeMesociclo: un ítem por semana con la fase", () => {
  const p = { ...base(), referencia: 75 };
  const meso = armarMesociclo({ ...p, semanas: 4 });
  const payload = payloadDeMesociclo(meso, p);

  assert.equal(payload.semanas.length, meso.semanas.length);
  payload.semanas.forEach((s, i) => {
    assert.equal(s.numero, meso.semanas[i].numero);
    assert.equal(s.fase, meso.semanas[i].fase);
  });
});

/* ------------------------------------------------------------------------- */
/* Validación                                                                 */
/* ------------------------------------------------------------------------- */

function sesionDePrueba(): Sesion {
  return armarSesion(base());
}

test("validarSesionIA: respuesta completa válida", () => {
  const s = sesionDePrueba();
  const json = {
    titulo: "Sesión táctica con salida de balón",
    intro: "Con 16 jugadores y campo entero se sostiene la idea en espacios amplios.",
    cierre: "Mirar cómo se abre la última línea al cambiar de banda.",
    bloques: s.bloques.map(() => ({
      porQue: "Porque ese día se entrena la transición ofensiva.",
      consigna: "Armá dos filas y que cada jugador recorra el circuito completo.",
    })),
  };
  const ok = validarSesionIA(json, s.bloques.length);
  assert.ok(ok);
  assert.equal(ok?.titulo, "Sesión táctica con salida de balón");
  assert.equal(ok?.bloques?.length, s.bloques.length);
  assert.ok(ok?.bloques?.[0]?.porQue);
});

test("validarSesionIA: todo vacío, null", () => {
  assert.equal(validarSesionIA({}, 5), null);
  assert.equal(validarSesionIA({ titulo: "x" }, 5), null);
  assert.equal(validarSesionIA("no soy objeto", 5), null);
  assert.equal(validarSesionIA(null, 5), null);
});

test("validarSesionIA: más bloques que la sesión se recortan; textos cortos se descartan", () => {
  const json = {
    bloques: Array.from({ length: 12 }, () => ({ porQue: "ok que tiene suficiente largo para pasar", consigna: "" })),
  };
  const ok = validarSesionIA(json, 4);
  assert.equal(ok?.bloques?.length, 4);
  assert.equal(ok?.bloques?.[0]?.consigna, undefined);
});

test("validarMicroIA: solo los días con id y nota", () => {
  const json = {
    dias: [
      { id: "MD-3", nota: "El día que más se parece al partido sin serlo." },
      { id: "MD-2", nota: "" },
      { nota: "sin id no entra" },
    ],
  };
  const ok = validarMicroIA(json, 7);
  assert.deepEqual(ok?.dias, [
    { id: "MD-3", nota: "El día que más se parece al partido sin serlo." },
    {},
    {},
  ]);
});

test("validarMesoIA: semanas por número", () => {
  const json = {
    resumen: "Un bloque de cuatro semanas con descarga final.",
    semanas: [
      { numero: 1, intencion: "Se construye la base con volumen alto." },
      { numero: 99, intencion: "Semana inexistente." },
    ],
  };
  const ok = validarMesoIA(json, 4);
  assert.equal(ok?.semanas?.length, 2);
});

/* ------------------------------------------------------------------------- */
/* Mezcla: la IA cambia texto, nunca estructura                               */
/* ------------------------------------------------------------------------- */

test("mezclarSesion: reemplaza el texto y no toca un minuto", () => {
  const p = base();
  const s = armarSesion(p);
  const ia = {
    titulo: "Título nuevo de prueba",
    intro: "Intro escrita por la IA para este pedido.",
    cierre: "Nota de cierre de prueba.",
    bloques: s.bloques.map((_, i) => ({
      porQue: `PorQué ${i} de prueba`,
      consigna: i % 2 === 0 ? `Consigna IA número ${i}` : "",
    })),
  };

  const mezclado = mezclarSesion(s, validarSesionIA(ia, s.bloques.length));

  // La estructura es la del motor, intacta.
  assert.equal(mezclado.minutosReales, s.minutosReales);
  assert.equal(mezclado.bloques.length, s.bloques.length);
  mezclado.bloques.forEach((b, i) => {
    assert.equal(b.ejercicio.id, s.bloques[i].ejercicio.id);
    assert.equal(b.min, s.bloques[i].min);
    assert.equal(b.rol, s.bloques[i].rol);
  });
  // Los minutos siguen cerrando exactos.
  assert.equal(mezclado.bloques.reduce((t, b) => t + b.min, 0), mezclado.minutosReales);

  // El texto se reemplazó donde la IA trajo y se quedó el original donde no.
  assert.equal(mezclado.titulo, "Título nuevo de prueba");
  assert.equal(mezclado.intro, "Intro escrita por la IA para este pedido.");
  assert.equal(mezclado.cierre, "Nota de cierre de prueba.");
  assert.equal(mezclado.bloques[0].consigna, "Consigna IA número 0");
  assert.equal(mezclado.bloques[0].porQue, "PorQué 0 de prueba");
  assert.equal(mezclado.bloques[1].consigna, s.bloques[1].consigna);
});

test("mezclarSesion: sin IA devuelve la sesión original", () => {
  const s = armarSesion(base());
  assert.equal(mezclarSesion(s, null), s);
});

test("mezclarMicrociclo: cambia solo la nota de los días respondidos", () => {
  const micro = armarMicrociclo(base());
  const ia = {
    dias: [
      { id: "MD-3", nota: "Nota IA del MD-3, específica para este plantel." },
    ],
  };
  const mezclado = mezclarMicrociclo(micro, validarMicroIA(ia, micro.dias.length));

  assert.equal(mezclado.minutosTotales, micro.minutosTotales);
  const md3 = mezclado.dias.find((d) => d.id === "MD-3");
  const md5 = mezclado.dias.find((d) => d.id === "MD-5");
  const md5Original = micro.dias.find((d) => d.id === "MD-5");
  assert.equal(md3?.nota, "Nota IA del MD-3, específica para este plantel.");
  assert.equal(md5?.nota, md5Original?.nota);
});

test("mezclarMesociclo: resumen e intenciones por semana", () => {
  const meso = armarMesociclo({ ...base(), referencia: 75, semanas: 4 });
  const ia = {
    resumen: "Resumen IA del bloque, adaptado a este plantel.",
    semanas: [{ numero: 2, intencion: "Segunda semana: se sostiene el volumen." }],
  };
  const mezclado = mezclarMesociclo(meso, validarMesoIA(ia, meso.semanas.length));

  assert.equal(mezclado.resumen, "Resumen IA del bloque, adaptado a este plantel.");
  assert.equal(mezclado.semanas[1].intencion, "Segunda semana: se sostiene el volumen.");
  assert.equal(mezclado.semanas[0].intencion, meso.semanas[0].intencion);
  mezclado.semanas.forEach((s, i) => {
    assert.equal(s.microciclo.minutosTotales, meso.semanas[i].microciclo.minutosTotales);
  });
});

/* ------------------------------------------------------------------------- */
/* Prompt y firma                                                             */
/* ------------------------------------------------------------------------- */

test("promptDe: incluye el ejercicio real y la misma cantidad de bloques a devolver", () => {
  const s = armarSesion(base());
  const { system, user } = promptDe(payloadDeSesion(s, base()));

  assert.match(system, /rioplatense/i);
  assert.match(system, /no se tocan/i);
  const pedido = JSON.parse(user);
  assert.equal(pedido.sesion.bloques.length, s.bloques.length);
  assert.equal(pedido.devolver.bloques.length, s.bloques.length);
  // El motor decide: el prompt muestra los minutos tal cual.
  assert.equal(pedido.sesion.bloques[0].minutos, s.bloques[0].min);
});

test("promptDe: microciclo conserva los ids de los días", () => {
  const micro = armarMicrociclo(base());
  const { user } = promptDe(payloadDeMicrociclo(micro, { ...base(), referencia: 75 }));
  const pedido = JSON.parse(user);
  const ids = pedido.devolver.dias.map((d: { id: string }) => d.id);
  assert.deepEqual(ids, micro.dias.map((d) => d.id));
});

test("firmaDe: estable para el mismo payload y distinta al cambiar un parámetro", () => {
  const a = payloadDeSesion(armarSesion(base()), base());
  const b = payloadDeSesion(armarSesion(base({ jugadores: 20 })), base({ jugadores: 20 }));

  assert.equal(firmaDe(a), firmaDe({ ...a, params: { ...a.params } }));
  assert.notEqual(firmaDe(a), firmaDe(b));
});

/* ------------------------------------------------------------------------- */
/* Recorrido completo simulado: payload → "Groq" → validación → mezcla        */
/* ------------------------------------------------------------------------- */

test("recorrido completo: la sesión que se muestra sigue cerrando los minutos", () => {
  const p = base({ minutos: 75 });
  const s = armarSesion(p);

  // Simula la respuesta de Groq tal como llegaría por la red: con fence.
  const crudo =
    "```json\n" +
    JSON.stringify({
      titulo: "Sesión táctica de 75 minutos para grupo juvenil",
      intro: "Con 16 jugadores en campo entero se trabaja la salida de balón desde el fondo.",
      bloques: s.bloques.map((_, i) => ({
        porQue: "Porque ese es el objetivo que mandó el entrenador para este día.",
        consigna: `Consigna reescrita por la IA para el bloque ${i + 1}, específica para el plantel.`,
      })),
      cierre: "Después de la sesión, revisar con video cómo se ordena el bloque medio.",
    }) +
    "\n```";

  const json = extraerJSON(crudo);
  const ia = validarSesionIA(json, s.bloques.length);
  assert.ok(ia, "la respuesta simulada debe validar");

  const mezclado = mezclarSesion(s, ia);
  assert.equal(mezclado.minutosPedidos, 75);
  assert.equal(mezclado.minutosReales, 75);
  assert.equal(mezclado.bloques.reduce((t, b) => t + b.min, 0), 75);
  assert.ok(mezclado.bloques.every((b) => b.consigna.includes("IA")));
  assert.ok(mezclado.intro);
});
