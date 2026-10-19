import { aplicarOfertas, cuantoFalta } from "../src/lib/ofertas";
import { tieneAcceso } from "../src/lib/planificador/acceso";
import assert from "node:assert/strict";
import { test } from "node:test";
import { SEED_PRODUCTS } from "../src/lib/catalog-seed";
import { isAvailable } from "../src/lib/availability";
import { resolveCartProducts, resolveDeliveryProducts } from "../src/lib/checkout";
import { POST } from "../src/app/api/mp/route";
import { GET } from "../src/app/api/entrega/route";

const find = (slug: string) => SEED_PRODUCTS.find((p) => p.slug === slug)!;

/** Una fecha fija, para que los tramos se prueben sin esperar a que lleguen. */
const HOY = new Date("2026-10-19T12:00:00-03:00");

/** El producto tal como se vende en esa fecha: con la oferta ya aplicada. */
const vigente = (slug: string, cuando: Date) =>
  aplicarOfertas(SEED_PRODUCTS, cuando).find((p) => p.slug === slug)!;
const origin = "https://example.com";

// Ninguna prueba llama a Mercado Pago: respuestas controladas y credencial ficticia.
async function withPaymentMock(run: (requests: { url: string; init?: RequestInit }[]) => Promise<void>, response: unknown) {
  const fetch = globalThis.fetch;
  const token = process.env.MP_ACCESS_TOKEN;
  const links = process.env.MATERIAL_LINKS;
  const requests: { url: string; init?: RequestInit }[] = [];
  process.env.MP_ACCESS_TOKEN = "test-token-not-a-real-credential";
  globalThis.fetch = async (input, init) => {
    requests.push({ url: String(input), init });
    return Response.json(response);
  };
  try { await run(requests); }
  finally {
    globalThis.fetch = fetch;
    if (token === undefined) delete process.env.MP_ACCESS_TOKEN; else process.env.MP_ACCESS_TOKEN = token;
    if (links === undefined) delete process.env.MATERIAL_LINKS; else process.env.MATERIAL_LINKS = links;
  }
}

function order(slugs: unknown, rest: Record<string, unknown> = {}) {
  return new Request(`${origin}/api/mp`, { method: "POST", body: JSON.stringify({ slugs, orderId: 123, ...rest }) });
}

test("precios y lista tachada aprobados; el beneficio no sustituye el precio público", () => {
  assert.equal(find("curso-infantil").priceArs, 34900);
  assert.equal(find("curso-infantil").compareAtPriceArs, 44900);
  assert.equal(find("curso-juvenil").priceArs, 39900);
  assert.equal(find("curso-juvenil").compareAtPriceArs, 54900);
  assert.equal(find("curso-juvenil").previousBuyerPriceArs, 34900);
  assert.equal(find("curso-profesional").priceArs, 69900);
  assert.equal(find("curso-profesional").compareAtPriceArs, 89900);
  assert.equal(find("pack-infantil-juvenil").priceArs, 69900);
  assert.deepEqual(find("pack-infantil-juvenil").includesSlugs, ["curso-infantil", "curso-juvenil"]);
  assert.equal(find("curso-infantil").priceArs + find("curso-juvenil").priceArs - find("pack-infantil-juvenil").priceArs, 4900);
  // Pack Completo: sin precio tachado, se compara contra la suma vigente.
  assert.equal(find("pack-completo").priceArs, 169900);
  assert.equal(find("pack-completo").compareAtPriceArs, null);
  assert.deepEqual(find("pack-completo").includesSlugs, [
    "curso-infantil",
    "curso-juvenil",
    "curso-profesional",
    "biblioteca-entrenamiento",
    "planificador-ia",
  ]);
  const vigentePack = vigente("pack-completo", HOY);
  assert.equal(vigentePack.compareAtPriceArs, null);
  const sumaVigente = ["curso-infantil", "curso-juvenil", "curso-profesional", "biblioteca-entrenamiento", "planificador-ia"]
    .map((s) => vigente(s, HOY).priceArs)
    .reduce((a, b) => a + b, 0);
  assert.equal(sumaVigente, 214500);
  assert.equal(sumaVigente - find("pack-completo").priceArs, 44600);
});

test("Infantil, Juvenil, el pack, Profesional, la Biblioteca, el Planificador y el Pack Completo están habilitados", () => {
  assert.deepEqual(SEED_PRODUCTS.filter((p) => isAvailable(p.slug)).map((p) => p.slug).sort(), [
    "biblioteca-entrenamiento",
    "curso-infantil",
    "curso-juvenil",
    "curso-profesional",
    "pack-completo",
    "pack-infantil-juvenil",
    "planificador-ia",
  ]);
  assert.deepEqual(SEED_PRODUCTS.filter((p) => p.featured).map((p) => p.slug), ["pack-completo"]);
  assert.deepEqual(SEED_PRODUCTS.filter((p) => !isAvailable(p.slug)).map((p) => p.slug).sort(), []);
});

test("carrito único, sin doble cobro de cursos incluidos ni productos futuros", () => {
  const result = resolveCartProducts(["curso-infantil", "pack-infantil-juvenil", "curso-juvenil", "pack-infantil-juvenil", "pack-completo"], SEED_PRODUCTS);
  assert.deepEqual(result.map((p) => p.slug), ["pack-completo"]);
  assert.equal(result.reduce((sum, p) => sum + p.priceArs, 0), 169900);
});

test("el Pack Completo absorbe al Pack Infantil+Juvenil y no duplica cobro", () => {
  const vigentes = aplicarOfertas(SEED_PRODUCTS, HOY);
  const soloCompleto = resolveCartProducts(["pack-completo"], vigentes);
  assert.deepEqual(soloCompleto.map((p) => p.slug), ["pack-completo"]);
  const ambos = resolveCartProducts(["pack-infantil-juvenil", "pack-completo"], vigentes);
  assert.deepEqual(ambos.map((p) => p.slug), ["pack-completo"]);
  assert.equal(ambos.reduce((sum, p) => sum + p.priceArs, 0), 169900);
  const todos = resolveCartProducts(
    ["curso-infantil", "curso-juvenil", "curso-profesional", "biblioteca-entrenamiento", "planificador-ia", "pack-completo"],
    vigentes,
  );
  assert.deepEqual(todos.map((p) => p.slug), ["pack-completo"]);
});

test("el Profesional se cobra una sola vez y convive con el pack", () => {
  const result = resolveCartProducts(["pack-infantil-juvenil", "curso-profesional", "curso-profesional"], SEED_PRODUCTS);
  assert.deepEqual(result.map((p) => p.slug), ["pack-infantil-juvenil", "curso-profesional"]);
  assert.equal(result.reduce((sum, p) => sum + p.priceArs, 0), 69900 + 69900);
});

test("Mercado Pago usa los precios de servidor e ignora el precio manipulado del navegador", async () => {
  await withPaymentMock(async (requests) => {
    const response = await POST(order(["curso-juvenil"], { total: 1, priceArs: 34900, previousBuyer: true }));
    assert.equal(response.status, 200);
    const sent = JSON.parse(String(requests[0].init?.body));
    assert.equal(sent.items[0].unit_price, 39900);
    assert.equal(sent.items[0].currency_id, "ARS");
    assert.equal(sent.metadata.slugs, "curso-juvenil");
    assert.equal(sent.back_urls.success, `${origin}/?pago=ok`);
  }, { init_point: "https://example.com/payment" });
});

test("checkout del pack cobra una sola línea y cada curso individual su oferta", async () => {
  await withPaymentMock(async (requests) => {
    for (const [slugs, expected] of [
      [["pack-infantil-juvenil", "curso-infantil", "curso-juvenil"], 69900],
      [["curso-infantil"], 34900],
    ] as const) {
      assert.equal((await POST(order(slugs))).status, 200);
      const sent = JSON.parse(String(requests.at(-1)?.init?.body));
      assert.equal(sent.items.length, 1);
      assert.equal(sent.items[0].unit_price, expected);
      assert.equal(sent.items[0].quantity, 1);
    }
  }, { init_point: "https://example.com/payment" });
});

test("API rechaza carrito vacío, desconocidos, cursos futuros o estructura inválida", async () => {
  await withPaymentMock(async (requests) => {
    for (const slugs of [[], ["curso-infantil", "inventado"], ["curso-juvenil-compradores"], [1], null]) {
      assert.equal((await POST(order(slugs))).status, 400);
    }
    assert.equal(requests.length, 0);
  }, {});
});

test("el Profesional se vende al precio de lanzamiento que fija el servidor", async () => {
  await withPaymentMock(async (requests) => {
    const response = await POST(order(["curso-profesional"], { total: 1, priceArs: 100 }));
    assert.equal(response.status, 200);
    const sent = JSON.parse(String(requests.at(-1)?.init?.body));
    assert.equal(sent.items.length, 1);
    assert.equal(sent.items[0].unit_price, 69900);
    assert.equal(sent.items[0].currency_id, "ARS");
    assert.equal(sent.metadata.slugs, "curso-profesional");
  }, { init_point: "https://example.com/payment" });
});

/** Misma regla que la ruta de entrega: el planificador se entrega con el código puesto. */
function entregaPlanificador(): string {
  return `/planificador?acceso=${encodeURIComponent("ramela-planificador")}`;
}

test("el Planificador se vende a 39900 y se entrega como enlace con acceso", async () => {
  const planificador = vigente("planificador-ia", HOY);
  assert.equal(planificador.priceArs, 39900);
  assert.equal(planificador.compareAtPriceArs, 49900);
  // El seed guarda el precio de lista: la oferta es una capa con vencimiento.
  assert.equal(find("planificador-ia").priceArs, 49900);
  assert.deepEqual(find("planificador-ia").includesSlugs, []);
  const carrito = resolveCartProducts(["planificador-ia", "curso-infantil"], aplicarOfertas(SEED_PRODUCTS, HOY));
  assert.deepEqual(carrito.map((p) => p.slug), ["curso-infantil", "planificador-ia"]);
  assert.equal(carrito.reduce((sum, p) => sum + p.priceArs, 0), 34900 + 39900);
  // La entrega no es un archivo: es la herramienta con las descargas ya habilitadas.
  const url = entregaPlanificador();
  assert.match(url, /^\/planificador\?acceso=/);
  assert.equal(tieneAcceso(new URL("https://x" + url).searchParams.get("acceso") ?? undefined), true);
  assert.equal(tieneAcceso("cualquier-cosa"), false);
});

test("la Biblioteca se vende a 29900 y se entrega como cualquier otro curso", async () => {
  const biblioteca = vigente("biblioteca-entrenamiento", HOY);
  assert.equal(biblioteca.priceArs, 29900);
  assert.equal(biblioteca.compareAtPriceArs, 39900);
  assert.equal(biblioteca.badge, "Oferta lanzamiento");
  // El seed guarda el precio de lista: la oferta es una capa con vencimiento.
  assert.equal(find("biblioteca-entrenamiento").priceArs, 39900);
  assert.equal(biblioteca.priceArs < find("curso-infantil").priceArs, true);
  assert.deepEqual(find("biblioteca-entrenamiento").includesSlugs, []);
  const carrito = resolveCartProducts(["biblioteca-entrenamiento", "curso-infantil"], aplicarOfertas(SEED_PRODUCTS, HOY));
  assert.deepEqual(carrito.map((p) => p.slug), ["curso-infantil", "biblioteca-entrenamiento"]);
  assert.equal(carrito.reduce((sum, p) => sum + p.priceArs, 0), 34900 + 29900);
  await withPaymentMock(async (requests) => {
    const response = await POST(order(["biblioteca-entrenamiento"], { total: 1, priceArs: 1 }));
    assert.equal(response.status, 200);
    const sent = JSON.parse(String(requests.at(-1)?.init?.body));
    assert.equal(sent.items.length, 1);
    assert.equal(sent.items[0].unit_price, 29900);
    assert.equal(sent.metadata.slugs, "biblioteca-entrenamiento");
  }, { init_point: "https://example.com/payment" });
  assert.deepEqual(resolveDeliveryProducts(["biblioteca-entrenamiento"], SEED_PRODUCTS).map((p) => p.slug), ["biblioteca-entrenamiento"]);
});

test("entrega del pack devuelve exactamente los dos cursos, sin contenedor", async () => {
  const result = resolveDeliveryProducts(["pack-infantil-juvenil", "curso-infantil"], SEED_PRODUCTS);
  assert.deepEqual(result.map((p) => p.slug), ["curso-infantil", "curso-juvenil"]);
  await withPaymentMock(async () => {
    process.env.MATERIAL_LINKS = JSON.stringify({ "curso-infantil": "https://example.com/infantil", "curso-juvenil": "https://example.com/juvenil" });
    const response = await GET(new Request(`${origin}/api/entrega?payment_id=123456789`));
    assert.equal(response.status, 200);
    const { items } = await response.json();
    assert.deepEqual(items.map((p: { slug: string }) => p.slug), ["curso-infantil", "curso-juvenil"]);
    assert.ok(items.every((p: { url: string }) => p.url.startsWith("https://example.com/")));
  }, { status: "approved", metadata: { slugs: "pack-infantil-juvenil" } });
});

test("entrega respeta la configuración infantil antigua y habilitación manual juvenil", async () => {
  await withPaymentMock(async () => {
    process.env.MATERIAL_LINKS = "https://example.com/infantil";
    const response = await GET(new Request(`${origin}/api/entrega?payment_id=123456789`));
    const { items } = await response.json();
    assert.equal(items.length, 2);
    assert.equal(items[0].url, "https://example.com/infantil");
    assert.equal(items[1].slug, "curso-juvenil");
    assert.equal(items[1].url, null);
  }, { status: "approved", metadata: { slugs: "pack-infantil-juvenil" } });
});

test("pago pendiente o identificación inválida no revela enlaces de entrega", async () => {
  await withPaymentMock(async (requests) => {
    assert.equal((await GET(new Request(`${origin}/api/entrega?payment_id=123456789`))).status, 402);
    assert.equal((await GET(new Request(`${origin}/api/entrega?payment_id=bad`))).status, 400);
    assert.equal(requests.length, 1);
  }, { status: "pending", metadata: { slugs: "pack-infantil-juvenil" } });
});


/* ------------------------------------------------------------------------- */
/* Ofertas con fecha de cierre                                               */
/* ------------------------------------------------------------------------- */

const T1 = new Date("2026-10-19T12:00:00-03:00");
const T1_BORDE = new Date("2026-11-30T22:00:00-03:00");
const T2 = new Date("2026-12-01T10:00:00-03:00");
const T2_BORDE = new Date("2026-12-18T22:00:00-03:00");
const DESPUES = new Date("2026-12-20T10:00:00-03:00");

test("la Biblioteca pasa por los dos tramos y vuelve a su precio de lista", () => {
  const en = (cuando: Date) => vigente("biblioteca-entrenamiento", cuando);

  // Tramo 1: cierre de temporada, hasta el 30 de noviembre.
  assert.equal(en(T1).priceArs, 29900);
  assert.equal(en(T1).compareAtPriceArs, 39900);
  assert.equal(en(T1_BORDE).priceArs, 29900, "el 30/11 a la noche todavía rige el tramo 1");

  // Tramo 2: con el aguinaldo, hasta el 18 de diciembre. Sube, pero sigue debajo de lista.
  assert.equal(en(T2).priceArs, 32900);
  assert.equal(en(T2).compareAtPriceArs, 39900);
  assert.equal(en(T2_BORDE).priceArs, 32900, "el 18/12 a la noche todavía rige el tramo 2");

  // Vencido: vuelve a lista y deja de prometer un descuento que ya no existe.
  assert.equal(en(DESPUES).priceArs, 39900);
  assert.equal(en(DESPUES).compareAtPriceArs, null);
  assert.equal(en(DESPUES).badge, null);
  assert.equal(en(DESPUES).ofertaTermina, undefined);
});

test("el Planificador mantiene los 39900 hasta el 18 de diciembre y después va a lista", () => {
  const en = (cuando: Date) => vigente("planificador-ia", cuando);
  assert.equal(en(T1).priceArs, 39900);
  assert.equal(en(T2).priceArs, 39900);
  assert.equal(en(DESPUES).priceArs, 49900);
  assert.equal(en(DESPUES).compareAtPriceArs, null);
});

test("cada tramo dice cuándo termina, para poder mostrarlo en la página", () => {
  const t1 = vigente("biblioteca-entrenamiento", T1);
  assert.ok(t1.ofertaTermina, "el tramo 1 no trae fecha de cierre");
  assert.equal(t1.ofertaExcusa, "Cierre de temporada");

  const t2 = vigente("biblioteca-entrenamiento", T2);
  assert.ok(t2.ofertaTermina, "el tramo 2 no trae fecha de cierre");
  assert.equal(t2.ofertaExcusa, "Antes de la pretemporada");
});

test("el checkout cobra lo mismo que muestra la vitrina", async () => {
  await withPaymentMock(async (requests) => {
    const response = await POST(order(["biblioteca-entrenamiento"], { total: 1, priceArs: 1 }));
    assert.equal(response.status, 200);
    const enviado = JSON.parse(String(requests.at(-1)?.init?.body));
    const cobrado = enviado.items[0].unit_price;

    // La vitrina y Mercado Pago tienen que leer el precio del mismo lugar. Si
    // esto se rompe, la página muestra un número y se cobra otro.
    const enVitrina = vigente("biblioteca-entrenamiento", new Date()).priceArs;
    assert.equal(cobrado, enVitrina);
  }, { init_point: "https://example.com/payment" });
});

test("el contador dice cuánto falta, en palabras", () => {
  const termina = "2026-11-30T23:59:59-03:00";
  assert.equal(cuantoFalta(termina, new Date("2026-11-20T12:00:00-03:00")), "Faltan 10 días");
  assert.equal(cuantoFalta(termina, new Date("2026-11-29T12:00:00-03:00")), "Falta 1 día");
  assert.equal(cuantoFalta(termina, new Date("2026-11-30T14:00:00-03:00")), "Termina en 9 h");
  assert.equal(cuantoFalta(termina, new Date("2026-11-30T23:30:00-03:00")), "Termina en 29 min");
  assert.equal(cuantoFalta(termina, new Date("2026-12-01T00:00:00-03:00")), "La oferta terminó");
});
