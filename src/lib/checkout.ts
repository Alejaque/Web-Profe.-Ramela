import { isAvailable } from "./availability";
import type { Product } from "./types";

/** Mismo criterio en vitrina/carrito y servidor: únicos, comprables y sin doble cobro por un pack. */
export function resolveCartProducts(slugs: readonly string[], products: readonly Product[]): Product[] {
  const requested = new Set(slugs);
  const selected = products.filter((p) => requested.has(p.slug) && isAvailable(p.slug));
  const covered = new Set(selected.flatMap((p) => p.includesSlugs));
  return selected.filter((p) => !covered.has(p.slug));
}

/** Los packs entregan los cursos incluidos, no un enlace vacío del contenedor. */
export function resolveDeliveryProducts(slugs: readonly string[], products: readonly Product[]): Product[] {
  const wanted = new Set(slugs);
  for (const slug of slugs) {
    const product = products.find((p) => p.slug === slug);
    product?.includesSlugs.forEach((included) => wanted.add(included));
  }
  return products.filter((p) => wanted.has(p.slug) && p.includesSlugs.length === 0);
}
