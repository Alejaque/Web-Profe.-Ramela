/**
 * Código que habilita las descargas.
 *
 * Se guarda del lado del servidor y la página sólo le pasa al navegador un
 * booleano, así el código nunca llega al bundle. Se entrega junto con los
 * enlaces de descarga cuando el pago se aprueba.
 *
 * No es un sistema de cuentas: es la llave de la puerta. Para este tamaño de
 * producto alcanza, y no le pide al entrenador que se cree un usuario y se
 * acuerde la contraseña para bajar un PDF.
 */
export const CODIGO_ACCESO =
  process.env.PLANIFICADOR_CODIGO ?? "ramela-planificador";

export function tieneAcceso(codigo: string | string[] | undefined): boolean {
  if (!codigo) return false;
  const valor = Array.isArray(codigo) ? codigo[0] : codigo;
  return valor.trim().toLowerCase() === CODIGO_ACCESO.toLowerCase();
}
