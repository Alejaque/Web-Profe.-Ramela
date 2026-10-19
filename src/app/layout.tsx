import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import { FranjaOferta } from "@/components/FranjaOferta";
import { getActiveProducts } from "@/lib/catalog";
import "./globals.css";

// Mismas familias, alojadas localmente: el build no depende de Google Fonts.
const inter = localFont({
  src: "./fonts/Inter[opsz,wght].ttf", weight: "100 900", variable: "--font-inter", display: "swap",
});
const barlow = localFont({
  src: [
    { path: "./fonts/BarlowCondensed-Medium.ttf", weight: "500" },
    { path: "./fonts/BarlowCondensed-SemiBold.ttf", weight: "600" },
    { path: "./fonts/BarlowCondensed-Bold.ttf", weight: "700" },
    { path: "./fonts/BarlowCondensed-ExtraBold.ttf", weight: "800" },
  ],
  variable: "--font-barlow", display: "swap",
});
const script = localFont({
  src: "./fonts/GreatVibes-Regular.ttf", weight: "400", variable: "--font-great-vibes", display: "swap",
});

export const metadata: Metadata = {
  title: "Profe. Alejandro Ramela | Cursos de formación en fútbol",
  description:
    "Cursos de Fútbol Infantil, Juvenil y Profesional, Biblioteca de 120 ejercicios y Planificador de entrenamientos con IA. Guías, diagramas, sesiones y planillas.",
  openGraph: {
    title: "Profe. Alejandro Ramela | Cursos de formación en fútbol",
    description:
      "Formación en Fútbol Infantil, Juvenil y Profesional, Biblioteca de 120 ejercicios y Planificador con IA. Elegí un curso, una herramienta o el pack.",
    locale: "es_AR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050f26",
};

/**
 * La franja de oferta se resuelve en el servidor, y las páginas son estáticas:
 * sin esto, la fecha quedaría congelada en el valor que tenía el build y la
 * oferta nunca vencería sola. Con una hora alcanza: el contador de días lo
 * mueve el navegador, y el cambio de tramo lo recoge la revalidación.
 */
export const revalidate = 3600;

export default async function RootLayout({ children }: { children: ReactNode }) {
  // La franja se resuelve una sola vez para todo el sitio: si ninguna oferta
  // está vigente, el componente no dibuja nada.
  const productos = await getActiveProducts();

  return (
    <html lang="es-AR" className={`${inter.variable} ${barlow.variable} ${script.variable}`}>
      <body className="bg-[#050f26] font-sans text-slate-900 antialiased">
        <FranjaOferta productos={productos} />
        {children}
      </body>
    </html>
  );
}
