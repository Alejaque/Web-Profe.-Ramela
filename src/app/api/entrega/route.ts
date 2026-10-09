import { NextResponse } from "next/server";
import { SEED_PRODUCTS } from "@/lib/catalog-seed";

export const dynamic = "force-dynamic";

/** MATERIAL_LINKS puede ser un enlace solo (para el curso Infantil) o un JSON {"curso-infantil":"https://..."}. */
function readLinks(): Record<string, string> {
  const raw = (process.env.MATERIAL_LINKS ?? "").trim().replace(/^\uFEFF/, "").replace(/[“”]/g, '"');
  if (!raw) { console.log("entrega: MATERIAL_LINKS está vacía o no existe"); return {}; }
  if (/^https?:\/\//i.test(raw)) return { "curso-infantil": raw };
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    console.log("entrega: MATERIAL_LINKS no es un JSON válido");
    return {};
  }
}

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

  const fromMeta: string[] = typeof payment.metadata?.slugs === "string" ? payment.metadata.slugs.split(",").map((x: string) => x.trim()).filter(Boolean) : [];
  const fromItems: string[] = (payment.additional_info?.items ?? []).map((i: { id: string }) => i.id).filter(Boolean);
  const bought: string[] = fromMeta.length ? fromMeta : fromItems;
  console.log("entrega", { paymentId, status: payment.status, metaSlugs: fromMeta.length, itemSlugs: fromItems.length });
  const slugs = new Set<string>();
  for (const slug of bought) {
    const product = SEED_PRODUCTS.find((p) => p.slug === slug);
    if (!product) continue;
    if (product.includesSlugs.length) product.includesSlugs.forEach((s) => slugs.add(s));
    slugs.add(product.slug);
  }

  const links = readLinks();
  console.log("entrega links", { claves: Object.keys(links) });

  const items = [...slugs]
    .map((slug) => ({ slug, name: SEED_PRODUCTS.find((p) => p.slug === slug)?.name ?? slug, url: links[slug] ?? null }))
    .filter((i) => i.slug !== "pack-completo");

  if (items.length === 0) console.log("entrega: pago aprobado pero sin cursos reconocidos", { paymentId });
  return NextResponse.json({ items });
}
