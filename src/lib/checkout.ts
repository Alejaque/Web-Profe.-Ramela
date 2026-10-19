import { isAvailable } from "./availability";
import type { Product } from "./types";

/** Mismo criterio en vitrina/carrito y servidor: únicos, comprables y sin doble cobro por un pack. */
export function resolveCartProducts(slugs: readonly string[], products: readonly Product[]): Product[] {
  const requested = new Set(slugs);
  const selected = products.filter((p) => requested.has(p.slug) && isAvailable(p.slug));

  // Ordenar por tamaño del pack (más grande primero) para que el pack completo
  // absorba al pack chico cuando están juntos. Si no, el filtro por `covered`
  // no vería que `pack-infantil-juvenil` está incluido en `pack-completo`
  // porque este último no lista el slug del pack chico sino sus cursos.
  const sorted = [...selected].sort(
    (a, b) => b.includesSlugs.length - a.includesSlugs.length || products.indexOf(a) - products.indexOf(b),
  );

  const keep: Product[] = [];
  const covered = new Set<string>();

  for (const candidate of sorted) {
    if (covered.has(candidate.slug)) continue;

    if (candidate.includesSlugs.length > 0) {
      const allCovered = candidate.includesSlugs.every((s) => covered.has(s));
      if (allCovered && keep.length > 0) continue;
    }

    keep.push(candidate);
    candidate.includesSlugs.forEach((s) => covered.add(s));
  }

  const keepSlugs = new Set(keep.map((p) => p.slug));
  return products.filter((p) => keepSlugs.has(p.slug));
}

/** Los packs entregan los cursos incluidos, no un enlace vacío del contenedor. */
export function resolveDeliveryProducts(slugs: readonly string[], products: readonly Product[]): Product[] {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const wanted = new Set(slugs);
  const queue = [...slugs];
  while (queue.length > 0) {
    const slug = queue.shift()!;
    const product = bySlug.get(slug);
    if (!product) continue;
    for (const included of product.includesSlugs) {
      if (!wanted.has(included)) {
        wanted.add(included);
        queue.push(included);
      }
    }
  }
  return products.filter((p) => wanted.has(p.slug) && p.includesSlugs.length === 0);
}
