import parte1 from './parte1';
import parte2 from './parte2';

export function GET() {
  return new Response(Buffer.from(parte1 + parte2, 'base64'), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Manual_Laboratorio_Tactico_Ramela.pdf"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
