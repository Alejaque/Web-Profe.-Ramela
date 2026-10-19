import { SEED_PRODUCTS } from "@/lib/catalog-seed";
import { aplicarOfertas } from "@/lib/ofertas";
import type { Product } from "@/lib/types";

/**
 * Devuelve los cursos del catálogo, ordenados para la vitrina y con el precio
 * que rige hoy. `ahora` se puede pasar para poder probar los vencimientos sin
 * esperar a que lleguen.
 */
export async function getActiveProducts(ahora: Date = new Date()): Promise<Product[]> {
  const ordenados = [...SEED_PRODUCTS]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ sortOrder: _sortOrder, ...product }) => product);
  return aplicarOfertas(ordenados, ahora);
}
