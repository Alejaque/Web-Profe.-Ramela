'use client';

import dynamic from 'next/dynamic';

const LaboratorioTacticoRamela = dynamic(
  () => import('@/components/laboratorio-tactico/LaboratorioTacticoRamela'),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: 40, color: '#9fb4cf', fontFamily: 'system-ui, sans-serif' }}>
        Cargando Laboratorio Táctico…
      </div>
    )
  }
);

export default function LaboratorioClient() {
  return <LaboratorioTacticoRamela />;
}
