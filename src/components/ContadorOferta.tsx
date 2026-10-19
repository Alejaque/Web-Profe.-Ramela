"use client";

import { useEffect, useState } from "react";

import { cuantoFalta } from "@/lib/ofertas";

/**
 * Cuenta regresiva.
 *
 * El texto inicial lo calcula el servidor, así la primera pintada ya trae el
 * número correcto y no aparece un "Faltan 0 días" antes de que corra el
 * JavaScript. Después se actualiza solo.
 */
export function ContadorOferta({
  termina,
  inicial,
  className,
}: {
  termina: string;
  inicial: string;
  className?: string;
}) {
  const [texto, setTexto] = useState(inicial);

  useEffect(() => {
    const actualizar = () => setTexto(cuantoFalta(termina));
    actualizar();
    // Cada minuto alcanza: la cuenta se muestra en días hasta el último día.
    const id = setInterval(actualizar, 60000);
    return () => clearInterval(id);
  }, [termina]);

  // El valor cambia apenas hidrata: sin esto React se queja por la diferencia.
  return (
    <span className={className} suppressHydrationWarning>
      {texto}
    </span>
  );
}
