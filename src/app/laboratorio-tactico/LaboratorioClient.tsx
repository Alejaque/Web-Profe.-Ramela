'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

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
  useEffect(() => {
    // Download the approved PDF instead of generating the old TXT manual.
    const labels = new Map([
      ['Descargar manual (TXT)', 'Descargar manual (PDF)'],
      ['Descargar este manual (TXT)', 'Descargar este manual (PDF)'],
    ]);
    const updateLabels = () => {
      document.querySelectorAll('button').forEach((button) => {
        const label = labels.get(button.textContent?.trim() ?? '');
        if (!label) return;
        button.dataset.manualPdf = 'true';
        button.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes('(TXT)')) {
            node.textContent = ` ${label}`;
          }
        });
      });
    };
    const download = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest('button[data-manual-pdf]') : null;
      if (!target) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const link = document.createElement('a');
      link.href = '/manuales/Manual_Laboratorio_Tactico_Ramela.pdf';
      link.download = 'Manual_Laboratorio_Tactico_Ramela.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
    };
    const observer = new MutationObserver(updateLabels);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', download, true);
    updateLabels();
    return () => {
      observer.disconnect();
      document.removeEventListener('click', download, true);
    };
  }, []);
  return <LaboratorioTacticoRamela />;
}
