import type { Product } from "@/lib/types";

/**
 * Ofertas con fecha de cierre.
 *
 * Un descuento sin fecha no genera urgencia: es, simplemente, el precio. Por
 * eso cada oferta se define como una lista de tramos con un vencimiento, y
 * cuando el último vence, el producto vuelve a su precio de lista sin que haya
 * que acordarse de cambiar nada.
 *
 * Los tramos están pensados para el calendario del fútbol de acá:
 *
 * - Hasta el 30 de noviembre cierran las temporadas de infantil y juvenil, se
 *   define quién sigue el año que viene y se empieza a armar la pretemporada.
 *   Coincide además con Black Friday, así que la razón del descuento ya está
 *   instalada y no hay que inventarla.
 * - Hasta el 18 de diciembre se paga el aguinaldo (el SAC vence ese día), así
 *   que hay plata circulando justo antes de la pretemporada.
 *
 * Las fechas se escriben con el offset de Argentina (UTC-3, sin horario de
 * verano) para que el cierre caiga a la medianoche de acá y no de otro lado.
 */

export type Tramo = {
  precio: number;
  /** ISO con offset. Al vencer, el producto pasa al tramo siguiente. */
  termina: string;
  badge: string;
  /** Una frase corta que dice por qué hay descuento ahora. */
  excusa: string;
};

type Oferta = {
  /** Precio de lista: el que queda cuando se terminan todos los tramos. */
  lista: number;
  tramos: Tramo[];
};

export const OFERTAS: Record<string, Oferta> = {
  "biblioteca-entrenamiento": {
    lista: 39900,
    tramos: [
      {
        precio: 29900,
        termina: "2026-11-30T23:59:59-03:00",
        badge: "Oferta lanzamiento",
        excusa: "Cierre de temporada",
      },
      {
        precio: 32900,
        termina: "2026-12-18T23:59:59-03:00",
        badge: "Hasta el 18/12",
        excusa: "Antes de la pretemporada",
      },
    ],
  },
  "planificador-ia": {
    lista: 49900,
    tramos: [
      {
        precio: 39900,
        termina: "2026-11-30T23:59:59-03:00",
        badge: "Nuevo",
        excusa: "Lanzamiento",
      },
      {
        precio: 39900,
        termina: "2026-12-18T23:59:59-03:00",
        badge: "Hasta el 18/12",
        excusa: "Antes de la pretemporada",
      },
    ],
  },
};

export type TramoVigente = Tramo & { slug: string; lista: number };

/** El tramo que rige en este momento, o null si la oferta ya terminó. */
export function tramoVigente(slug: string, ahora: Date = new Date()): TramoVigente | null {
  const oferta = OFERTAS[slug];
  if (!oferta) return null;
  const tramo = oferta.tramos.find((t) => new Date(t.termina).getTime() > ahora.getTime());
  return tramo ? { ...tramo, slug, lista: oferta.lista } : null;
}

/**
 * Devuelve los productos con el precio que corresponde hoy.
 *
 * Se aplica en la vitrina y en el checkout, con la misma función: si se
 * aplicara en un lado solo, la página mostraría un precio y Mercado Pago
 * cobraría otro.
 */
export function aplicarOfertas(productos: Product[], ahora: Date = new Date()): Product[] {
  return productos.map((p) => {
    const oferta = OFERTAS[p.slug];
    if (!oferta) return p;

    const tramo = tramoVigente(p.slug, ahora);
    if (!tramo) {
      // Se terminaron los tramos: vuelve al precio de lista y deja de prometer
      // un descuento que ya no existe.
      return { ...p, priceArs: oferta.lista, compareAtPriceArs: null, badge: null };
    }
    return {
      ...p,
      priceArs: tramo.precio,
      compareAtPriceArs: tramo.lista,
      badge: tramo.badge,
      ofertaTermina: tramo.termina,
      ofertaExcusa: tramo.excusa,
    };
  });
}

/** Cuánto falta, en palabras. Se usa para el contador de la página. */
export function cuantoFalta(termina: string, ahora: Date = new Date()): string {
  const ms = new Date(termina).getTime() - ahora.getTime();
  if (ms <= 0) return "La oferta terminó";

  const minutos = Math.floor(ms / 60000);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (dias > 1) return `Faltan ${dias} días`;
  if (dias === 1) return "Falta 1 día";
  if (horas >= 1) return `Termina en ${horas} h`;
  return `Termina en ${Math.max(1, minutos)} min`;
}
