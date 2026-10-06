import { NextResponse } from "next/server";
import { SEED_PRODUCTS } from "@/lib/catalog-seed";

export const dynamic = "force-dynamic";

// MATERIAL_LINKS (variable de entorno en Vercel): {"curso-infantil":"https://drive...", ...}
export async function GET(req: Request) {
  const token = process.env.MP_ACCESS_TOKEN;
  const paymentId = new URL(req.url).searchParams.get("payment_id") ?? "";
  if (!token || !/^\d{5,20}$/.test(paymentId)) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  // Se confirma el pago directamente con Mercado Pago, no con lo que diga el navegador.
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ error: "Pago no encontrado." }, { status: 404 });
  const payment = await res.json();
  if (payment.status !== "approved") {
    return NextResponse.json({ error: "El pago todavía no está aprobado." }, { status: 402 });
  }

  const bought: string[] = (payment.additional_info?.items ?? []).map((i: { id: string }) => i.id);
  const slugs = new Set<string>();
  for (const slug of bought) {
    const product = SEED_PRODUCTS.find((p) => p.slug === slug);
    if (!product) continue;
    if (product.includesSlugs.length) product.includesSlugs.forEach((s) => slugs.add(s));
    slugs.add(product.slug);
  }

  let links: Record<string, string> = {};
  try {
    links = JSON.parse(process.env.MATERIAL_LINKS ?? "{}");
  } catch {
    links = {};
  }

  const items = [...slugs]
    .map((slug) => ({ slug, name: SEED_PRODUCTS.find((p) => p.slug === slug)?.name ?? slug, url: links[slug] ?? null }))
    .filter((i) => i.slug !== "pack-completo");

  return NextResponse.json({ items });
}
