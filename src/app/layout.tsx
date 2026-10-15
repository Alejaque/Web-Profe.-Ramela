import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Great_Vibes, Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

const script = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Profe. Alejandro Ramela | Cursos de formación en fútbol",
  description:
    "Curso de Formación en Fútbol Infantil: 4 guías y una planilla con metodología, 30 juegos con diagramas, planificación anual y gestión de familias. Más de 30 años de experiencia.",
  openGraph: {
    title: "Profe. Alejandro Ramela | Cursos de formación en fútbol",
    description:
      "Curso de Formación en Fútbol Infantil: metodología, 30 juegos con diagramas, planificación anual y gestión de familias.",
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
