import { WhatsappIcon } from "@/components/icons";

const NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5493644670461").replace(/\D/g, "");
const TEXT = encodeURIComponent("Hola Profe! Quiero hacerte una consulta sobre los cursos.");

export function WhatsappFloat() {
  return (
    <a
      href={`https://wa.me/${NUMBER}?text=${TEXT}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="fixed bottom-5 left-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300/50"
    >
      <WhatsappIcon className="h-7 w-7" />
    </a>
  );
}
