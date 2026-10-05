const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

/** Formatea un valor en pesos argentinos. Ej: $ 44.900 */
export function formatARS(value: number): string {
  return arsFormatter.format(value);
}
