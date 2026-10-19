export type Product = {
  slug: string;
  name: string;
  level: string;
  audience: string;
  summary: string;
  features: string[];
  includesSlugs: string[];
  priceArs: number;
  compareAtPriceArs: number | null;
  badge: string | null;
  previousBuyerPriceArs?: number;
  featured: boolean;
  /** Vencimiento de la oferta vigente (ISO). Si no hay oferta, no viene. */
  ofertaTermina?: string;
  /** Por qué hay descuento ahora: "Cierre de temporada", por ejemplo. */
  ofertaExcusa?: string;
};
