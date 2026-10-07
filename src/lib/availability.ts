/**
 * Cursos que ya se pueden comprar. Los demás se muestran como "Próximamente".
 * Para habilitar un curso nuevo, agregá su slug acá.
 */
export const AVAILABLE_SLUGS = new Set<string>(["curso-infantil"]);

export function isAvailable(slug: string): boolean {
  return AVAILABLE_SLUGS.has(slug);
}
