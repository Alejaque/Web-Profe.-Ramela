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
  featured: boolean;
};
