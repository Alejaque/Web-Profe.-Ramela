import type { Metadata } from "next";
import MuestraContent from "@/components/MuestraContent";
import { findMuestra } from "@/lib/muestras";

/** El Infantil conserva la dirección histórica /muestra-gratis. */
const muestra = findMuestra("infantil")!;

export const metadata: Metadata = {
  title: muestra.metaTitle,
  description: muestra.metaDesc,
};

export default function MuestraGratisPage() {
  return <MuestraContent muestra={muestra} />;
}
