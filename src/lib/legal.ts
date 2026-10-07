/** Datos legales y de contacto que usan las páginas de términos y arrepentimiento. Editá solo este archivo. */
export const LEGAL = {
  nombre: "Sergio Alejandro Ramela",
  marca: "Profe. Alejandro Ramela",
  /** Completá con tu CUIT cuando estés inscripto. Si queda vacío, no se muestra. */
  cuit: "",
  domicilio: "Presidencia Roque Sáenz Peña, Chaco, Argentina",
  sitio: "ramelafutbol.vercel.app",
  whatsappVisible: "3644 670461",
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5493644670461").replace(/\D/g, ""),
  actualizado: "7 de octubre de 2026",
  plazoArrepentimiento: "10 días corridos",
  plazoRespuesta: "24 horas hábiles",
  plazoReintegro: "10 días hábiles",
  plazoEntregaTransferencia: "24 horas hábiles",
};
