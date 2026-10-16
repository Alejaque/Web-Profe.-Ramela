import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
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
    "Cursos de Fútbol Infantil y Juvenil en oferta de lanzamiento. Guías, diagramas, sesiones y planillas de planificación. Pack de los dos cursos disponible.",
  openGraph: {
    title: "Profe. Alejandro Ramela | Cursos de formación en fútbol",
    description:
      "Formación en Fútbol Infantil y Juvenil: metodología, modelo de juego, sesiones con diagramas y planificación. Elegí un curso o el pack de los dos.",
    locale: "es_AR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050f26",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-AR" className={`${inter.variable} ${barlow.variable} ${script.variable}`}>
      <body className="bg-[#050f26] font-sans text-slate-900 antialiased">{children}</body>
    </html>
  );
}
