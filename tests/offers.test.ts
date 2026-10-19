import assert from "node:assert/strict";
import { test } from "node:test";
import { SEED_PRODUCTS } from "../src/lib/catalog-seed";
import { isAvailable } from "../src/lib/availability";
import { resolveCartProducts, resolveDeliveryProducts } from "../src/lib/checkout";
import { POST } from "../src/app/api/mp/route";
import { GET } from "../src/app/api/entrega/route";

const find = (slug: string) => SEED_PRODUCTS.find((p) => p.slug === slug)!;
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
});

test("Infantil, Juvenil, el pack de dos, Profesional y la Biblioteca están habilitados", () => {
  assert.deepEqual(SEED_PRODUCTS.filter((p) => isAvailable(p.slug)).map((p) => p.slug).sort(), ["biblioteca-entrenamiento", "curso-infantil", "curso-juvenil", "curso-profesional", "pack-infantil-juvenil"]);
  assert.deepEqual(SEED_PRODUCTS.filter((p) => p.featured).map((p) => p.slug), ["pack-infantil-juvenil"]);
  // El pack completo y el planificador siguen siendo anuncios, no productos cobrables.
  assert.deepEqual(SEED_PRODUCTS.filter((p) => !isAvailable(p.slug)).map((p) => p.slug).sort(), ["pack-completo", "planificador-ia"]);
});

test("carrito único, sin doble cobro de cursos incluidos ni productos futuros", () => {
  const result = resolveCartProducts(["curso-infantil", "pack-infantil-juvenil", "curso-juvenil", "pack-infantil-juvenil", "pack-completo"], SEED_PRODUCTS);
  assert.deepEqual(result.map((p) => p.slug), ["pack-infantil-juvenil"]);
  assert.equal(result.reduce((sum, p) => sum + p.priceArs, 0), 69900);
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
    for (const slugs of [[], ["pack-completo"], ["planificador-ia"], ["curso-infantil", "inventado"], ["curso-juvenil-compradores"], [1], null]) {
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

test("la Biblioteca se vende a 29900 y se entrega como cualquier otro curso", async () => {
  assert.equal(find("biblioteca-entrenamiento").priceArs, 29900);
  assert.equal(find("biblioteca-entrenamiento").compareAtPriceArs, 39900);
  assert.equal(find("biblioteca-entrenamiento").badge, "Oferta lanzamiento");
  assert.equal(find("biblioteca-entrenamiento").priceArs < find("curso-infantil").priceArs, true);
  assert.deepEqual(find("biblioteca-entrenamiento").includesSlugs, []);
  const carrito = resolveCartProducts(["biblioteca-entrenamiento", "curso-infantil"], SEED_PRODUCTS);
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
