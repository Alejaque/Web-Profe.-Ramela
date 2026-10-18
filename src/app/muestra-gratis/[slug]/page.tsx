import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MuestraContent from "@/components/MuestraContent";
import { MUESTRAS, findMuestra } from "@/lib/muestras";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return MUESTRAS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const muestra = findMuestra(slug);
  if (!muestra) return { title: "Muestra gratis | Profe. Alejandro Ramela" };
  return { title: muestra.metaTitle, description: muestra.metaDesc };
}

export default async function MuestraSlugPage({ params }: Props) {
  const { slug } = await params;
  const muestra = findMuestra(slug);
  if (!muestra) notFound();
  return <MuestraContent muestra={muestra} />;
}
