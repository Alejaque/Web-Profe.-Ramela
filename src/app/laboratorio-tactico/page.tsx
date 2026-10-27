import type { Metadata } from 'next';
import LaboratorioClient from './LaboratorioClient';
import '@/components/laboratorio-tactico/laboratorio-tactico.css';

export const metadata: Metadata = {
  title: 'Laboratorio Táctico | Profe. Alejandro Ramela',
  description:
    'VideoLab Pro, pizarras tácticas 2D/3D animadas, microciclos e informes para entrenadores de fútbol infantil, juvenil y primera división. Prueba gratis 10 días.'
};

export default function LaboratorioTacticoPage() {
  return <LaboratorioClient />;
}
