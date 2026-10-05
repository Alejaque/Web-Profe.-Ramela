import { SEED_PRODUCTS } from "@/lib/catalog-seed";
import type { Product } from "@/lib/types";

/** Devuelve los cursos del catálogo, ordenados para la vitrina. */
export async function getActiveProducts(): Promise<Product[]> {
  return [...SEED_PRODUCTS]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ sortOrder: _sortOrder, ...product }) => product);
}
