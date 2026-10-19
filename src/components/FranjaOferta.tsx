import Link from "next/link";

import { ContadorOferta } from "@/components/ContadorOferta";
import { formatARS } from "@/lib/format";
import { cuantoFalta } from "@/lib/ofertas";
import type { Product } from "@/lib/types";

/** A dónde va cada producto cuando alguien toca la franja. */
const DESTINO: Record<string, { href: string; corto: string }> = {
  "biblioteca-entrenamiento": { href: "/biblioteca", corto: "Biblioteca" },
  "planificador-ia": { href: "/planificador", corto: "Planificador" },
};

/**
 * Franja fina arriba de todo, mientras haya una oferta con fecha.
 *
 * Si ningún producto tiene oferta vigente, no se muestra nada: una franja que
 * anuncia un descuento que ya no existe es peor que no tener franja.
 */
export function FranjaOferta({ productos }: { productos: Product[] }) {
  const oferta = productos.find((p) => p.ofertaTermina);
  if (!oferta?.ofertaTermina) return null;

  const destino = DESTINO[oferta.slug];
  if (!destino) return null;

  return (
    <div
      data-testid="franja-oferta"
      className="bg-gradient-to-r from-sky-600 to-sky-500 text-white"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 py-2 text-center text-sm lg:px-8">
        <span className="font-bold uppercase tracking-wide">
          {oferta.ofertaExcusa ?? "Oferta"}
        </span>
        <span className="text-sky-100">
          {destino.corto} a {formatARS(oferta.priceArs)}
          {oferta.compareAtPriceArs ? (
            <span className="ml-1 text-sky-200/70 line-through">
              {formatARS(oferta.compareAtPriceArs)}
            </span>
          ) : null}
        </span>
        <span aria-hidden="true" className="hidden text-sky-300 sm:inline">
          ·
        </span>
        <ContadorOferta
          termina={oferta.ofertaTermina}
          inicial={cuantoFalta(oferta.ofertaTermina)}
          className="font-semibold"
        />
        <Link
          href={destino.href}
          className="font-bold underline underline-offset-4 transition hover:text-sky-100"
        >
          Ver
        </Link>
      </div>
    </div>
  );
}
