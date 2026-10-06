import { NextResponse } from "next/server";
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
    slugs = Array.isArray(body.slugs) ? body.slugs.map(String) : [];
    orderId = Number(body.orderId) || 0;
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  // Los precios se toman del catálogo del servidor, nunca del navegador.
  const items = SEED_PRODUCTS.filter((p) => slugs.includes(p.slug)).map((p) => ({
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
