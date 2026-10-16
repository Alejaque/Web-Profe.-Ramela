import { NextResponse } from "next/server";
import { isAvailable } from "@/lib/availability";
import { resolveCartProducts } from "@/lib/checkout";
import { SEED_PRODUCTS } from "@/lib/catalog-seed";

export async function POST(req: Request) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Pago online no disponible." }, { status: 503 });
  }

  let slugs: string[] = [];
  let orderId = 0;
  try {
    const body = await req.json();
    if (!Array.isArray(body.slugs) || !body.slugs.every((slug: unknown) => typeof slug === "string")) {
      return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
    }
    slugs = body.slugs;
    orderId = Number(body.orderId) || 0;
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  // Los precios se toman del catálogo del servidor, nunca del navegador.
  if (slugs.some((slug) => !isAvailable(slug) || !SEED_PRODUCTS.some((p) => p.slug === slug))) {
    return NextResponse.json({ error: "Hay productos no disponibles en el pedido. Revisá tu carrito." }, { status: 400 });
  }
  const items = resolveCartProducts(slugs, SEED_PRODUCTS).map((p) => ({
    id: p.slug,
    title: p.name,
    quantity: 1,
    unit_price: p.priceArs,
    currency_id: "ARS",
  }));
  if (items.length === 0) {
    return NextResponse.json({ error: "Carrito vacío." }, { status: 400 });
  }

  const origin = new URL(req.url).origin;
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      items,
      external_reference: String(orderId),
      metadata: { slugs: items.map((i) => i.id).join(","), order_id: String(orderId) },
      statement_descriptor: "PROFE RAMELA",
      back_urls: {
        success: `${origin}/?pago=ok`,
        failure: `${origin}/?pago=error`,
        pending: `${origin}/?pago=pendiente`,
      },
      auto_return: "approved",
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.init_point) {
    return NextResponse.json({ error: "No se pudo iniciar el pago." }, { status: 502 });
  }
  return NextResponse.json({ url: data.init_point });
}
