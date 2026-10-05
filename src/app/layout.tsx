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
  title: "Profe. Alejandro Ramela | Cursos de formación en fútbol con IA",
  description:
    "Cursos de formación académica en fútbol, material de entrenamiento en todos los niveles y planificaciones con inteligencia artificial para fútbol infantil, juvenil y profesional. Más de 30 años de experiencia.",
  openGraph: {
    title: "Profe. Alejandro Ramela | Cursos de formación en fútbol con IA",
    description:
      "Formación académica, material de entrenamiento y planificaciones con IA para fútbol infantil, juvenil y profesional.",
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
