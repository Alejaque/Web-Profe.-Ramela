import { zipSync, strToU8 } from "fflate";
import { jsPDF } from "jspdf";

import type { Material } from "@/lib/biblioteca";
import { MATERIALES_ETIQUETA, ROLES, type Sesion } from "./tipos";
import type { Mesociclo, Microciclo } from "./ciclos";

/**
 * Salida a PDF y a Excel.
 *
 * Los dos se generan en el navegador: no hay servidor de por medio, así que no
 * hay costo por descarga ni espera. El Excel se escribe a mano (un xlsx es un
 * zip con unos pocos xml) para no arrastrar una librería entera por un archivo
 * de texto.
 */

export type Hoja = { nombre: string; filas: (string | number)[][] };

/* ------------------------------------------------------------------------- */
/* Excel                                                                     */
/* ------------------------------------------------------------------------- */

function nombreDeColumna(n: number): string {
  let s = "";
  let i = n;
  while (i >= 0) {
    s = String.fromCharCode(65 + (i % 26)) + s;
    i = Math.floor(i / 26) - 1;
  }
  return s;
}

/** Los nombres de hoja no admiten estos caracteres ni pasan de 31. */
function limpiarNombreHoja(n: string, usados: Set<string>): string {
  let base = n.replace(/[[\]:*?/\\]/g, "-").slice(0, 31) || "Hoja";
  let final = base;
  let k = 2;
  while (usados.has(final)) final = `${base.slice(0, 28)}(${k++})`;
  usados.add(final);
  return final;
}

function escapar(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function xmlDeHoja(hoja: Hoja): string {
  const ancho = hoja.filas.reduce((m, f) => Math.max(m, f.length), 1);
  const cols = Array.from({ length: ancho }, (_, i) => {
    const largo = hoja.filas.reduce((m, f) => Math.max(m, String(f[i] ?? "").length), 8);
    return `<col min="${i + 1}" max="${i + 1}" width="${Math.min(60, Math.max(10, largo + 2))}" customWidth="1"/>`;
  }).join("");

  const filas = hoja.filas
    .map((fila, y) => {
      const celdas = fila
        .map((valor, x) => {
          if (valor === "" || valor === null || valor === undefined) return "";
          const ref = `${nombreDeColumna(x)}${y + 1}`;
          if (typeof valor === "number") return `<c r="${ref}"><v>${valor}</v></c>`;
          // La primera fila va en negrita: es el encabezado.
          const estilo = y === 0 ? ' s="1"' : "";
          return `<c r="${ref}"${estilo} t="inlineStr"><is><t xml:space="preserve">${escapar(String(valor))}</t></is></c>`;
        })
        .join("");
      return `<row r="${y + 1}">${celdas}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${cols}</cols><sheetData>${filas}</sheetData></worksheet>`;
}

/** Escribe un .xlsx. Devuelve los bytes listos para descargar. */
export function escribirXlsx(hojas: Hoja[]): Uint8Array {
  const usados = new Set<string>();
  const nombres = hojas.map((h) => limpiarNombreHoja(h.nombre, usados));

  const tipos = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${nombres.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}
</Types>`;

  const raiz = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const libro = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>
${nombres.map((n, i) => `<sheet name="${escapar(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}
</sheets></workbook>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${nombres.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}
<Relationship Id="rId${nombres.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const estilos = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="1"><fill><patternFill patternType="none"/></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  const archivos: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(tipos),
    "_rels/.rels": strToU8(raiz),
    "xl/workbook.xml": strToU8(libro),
    "xl/_rels/workbook.xml.rels": strToU8(rels),
    "xl/styles.xml": strToU8(estilos),
  };
  hojas.forEach((h, i) => {
    archivos[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(xmlDeHoja(h));
  });

  return zipSync(archivos, { level: 6 });
}

/** Dispara la descarga de un archivo en el navegador. */
export function descargar(bytes: Uint8Array, nombre: string, tipo: string) {
  // Se copia a un ArrayBuffer propio: un Uint8Array con offset rompe Blob.
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const url = URL.createObjectURL(new Blob([buffer], { type: tipo }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function nombreSeguro(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

/* ------------------------------------------------------------------------- */
/* Contenido                                                                 */
/* ------------------------------------------------------------------------- */

function materiales(ej: { mats: Material[] }): string {
  return ej.mats.map((m) => MATERIALES_ETIQUETA[m]).join(", ");
}

function etiquetaRol(rol: string): string {
  return ROLES.find((r) => r.rol === rol)?.etiqueta ?? rol;
}

export function hojasDeSesion(s: Sesion): Hoja[] {
  return [
    {
      nombre: "Sesión",
      filas: [
        ["Sesión", s.titulo],
        ["Nivel", s.nivel],
        ["Objetivo", s.objetivo],
        ["Duración", `${s.minutosReales} minutos`],
        ["Jugadores", s.jugadores],
        ...(s.intro ? [["Introducción", s.intro]] : []),
        [],
        ["Bloque", "Ejercicio", "Categoría", "Minutos", "Espacio", "Jugadores", "Material", "Consigna"],
        ...s.bloques.map((b) => [
          etiquetaRol(b.rol),
          b.ejercicio.nombre,
          b.ejercicio.categoria,
          b.min,
          b.ejercicio.espacio,
          b.ejercicio.jugadores,
          materiales(b.ejercicio),
          b.consigna,
        ]),
        [],
        ...(s.avisos.length ? [["Avisos"], ...s.avisos.map((a) => [a])] : []),
      ],
    },
  ];
}

export function hojasDeMicrociclo(micro: Microciclo): Hoja[] {
  const resumen: Hoja = {
    nombre: "Microciclo",
    filas: [
      ["Día", "Tipo", "Objetivo", "Minutos", "Intensidad", "Volumen", "Nota"],
      ...micro.dias.map((d) => [
        `${d.id} · ${d.diaSemana}`,
        d.tipo,
        d.esPartido ? "Partido" : d.objetivo,
        d.esPartido ? 0 : d.minutos,
        d.intensidad,
        d.volumen,
        d.nota,
      ]),
      [],
      ["Total entrenado", `${micro.minutosTotales} minutos`],
    ],
  };
  const porDia: Hoja[] = micro.dias
    .filter((d) => d.sesion)
    .map((d) => ({
      nombre: d.id,
      filas: [
        [d.id, `${d.diaSemana} · ${d.tipo} · ${d.minutos}'`],
        [],
        ["Bloque", "Ejercicio", "Categoría", "Minutos", "Espacio", "Material", "Consigna"],
        ...d.sesion!.bloques.map((b) => [
          etiquetaRol(b.rol),
          b.ejercicio.nombre,
          b.ejercicio.categoria,
          b.min,
          b.ejercicio.espacio,
          materiales(b.ejercicio),
          b.consigna,
        ]),
      ],
    }));
  return [resumen, ...porDia];
}

export function hojasDeMesociclo(meso: Mesociclo): Hoja[] {
  return [
    {
      nombre: "Mesociclo",
      filas: [
        ["Semana", "Fase", "Minutos entrenados", "Intención"],
        ...meso.semanas.map((s) => [
          s.numero,
          s.fase,
          s.microciclo.minutosTotales,
          s.intencion,
        ]),
        [],
        ["Resumen", meso.resumen],
      ],
    },
    ...meso.semanas.map((s) => ({
      nombre: `Semana ${s.numero}`,
      filas: [
        [`Semana ${s.numero} · ${s.fase}`, `${s.microciclo.minutosTotales} minutos`],
        [],
        ["Día", "Tipo", "Objetivo", "Minutos", "Intensidad", "Volumen", "Ejercicios"],
        ...s.microciclo.dias.map((d) => [
          `${d.id} · ${d.diaSemana}`,
          d.tipo,
          d.esPartido ? "Partido" : d.objetivo,
          d.esPartido ? 0 : d.minutos,
          d.intensidad,
          d.volumen,
          d.esPartido
            ? "—"
            : d.sesion!.bloques
                .map((b) => `${b.min}' ${b.ejercicio.nombre}`)
                .join(" / "),
        ]),
      ],
    })),
  ];
}

/* ------------------------------------------------------------------------- */
/* PDF                                                                       */
/* ------------------------------------------------------------------------- */

const MARGEN = 18;
const ANCHO = 210;

function nuevoPdf(titulo: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text(titulo, MARGEN, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text("Profe. Alejandro Ramela · Planificador", MARGEN, 29);
  doc.setTextColor(0, 0, 0);
  return doc;
}

type Punto = { y: number; pagina: number };

function escribir(
  doc: jsPDF,
  texto: string,
  x: number,
  y: number,
  opciones: { maxWidth?: number; negrita?: boolean; cursiva?: boolean; size?: number; gris?: boolean } = {},
): number {
  doc.setFont("helvetica", opciones.negrita ? "bold" : opciones.cursiva ? "italic" : "normal");
  doc.setFontSize(opciones.size ?? 10);
  doc.setTextColor(opciones.gris ? 120 : 0, opciones.gris ? 120 : 0, opciones.gris ? 120 : 0);
  const lineas = doc.splitTextToSize(texto, opciones.maxWidth ?? ANCHO - MARGEN * 2);
  doc.text(lineas, x, y);
  return y + lineas.length * (opciones.size ?? 10) * 0.42;
}

function pie(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${i} de ${total}`, ANCHO - MARGEN, 290, { align: "right" });
    doc.text("Profe. Alejandro Ramela", MARGEN, 290);
    doc.setTextColor(0, 0, 0);
  }
}

export function pdfDeSesion(s: Sesion): jsPDF {
  const doc = nuevoPdf(s.titulo);
  let y = 38;

  y = escribir(
    doc,
    `${s.nivel} · ${s.objetivo} · ${s.minutosReales} minutos · ${s.jugadores} jugadores`,
    MARGEN,
    y,
    { gris: true },
  );
  y += 2;

  // La intro la escribe la IA para el pedido concreto; si no llegó, no hay nada.
  if (s.intro) {
    y = escribir(doc, s.intro, MARGEN, y, { size: 9.5, cursiva: true, maxWidth: ANCHO - MARGEN * 2 });
    y += 3;
  }

  for (const b of s.bloques) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(240, 245, 252);
    doc.roundedRect(MARGEN, y - 4, ANCHO - MARGEN * 2, 26, 2, 2, "F");
    y = escribir(doc, etiquetaRol(b.rol).toUpperCase(), MARGEN + 3, y + 2, {
      size: 8,
      negrita: true,
      gris: true,
    });
    y = escribir(doc, `${b.min}' · ${b.ejercicio.nombre}`, MARGEN + 3, y, { negrita: true, size: 12 });
    y = escribir(doc, `${b.ejercicio.categoria} · ${b.ejercicio.espacio} · ${materiales(b.ejercicio)}`, MARGEN + 3, y, {
      size: 9,
      gris: true,
    });
    y = escribir(doc, b.consigna, MARGEN + 3, y + 1, { size: 9.5, maxWidth: ANCHO - MARGEN * 2 - 6 });
    y += 10;
  }

  if (s.avisos.length) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    y = escribir(doc, "Avisos", MARGEN, y, { negrita: true });
    for (const a of s.avisos) y = escribir(doc, `· ${a}`, MARGEN + 3, y + 1, { size: 9, gris: true });
  }

  pie(doc);
  return doc;
}

export function pdfDeMicrociclo(micro: Microciclo): jsPDF {
  const doc = nuevoPdf("Microciclo MD-5 a MD+1");
  let y = 38;
  y = escribir(doc, `${micro.minutosTotales} minutos de entrenamiento en la semana`, MARGEN, y, {
    gris: true,
  });
  y += 6;

  for (const d of micro.dias) {
    if (y > 200) {
      doc.addPage();
      y = 20;
    }
    y = escribir(doc, `${d.id} · ${d.diaSemana} · ${d.tipo}`, MARGEN, y, { negrita: true, size: 12 });
    y = escribir(
      doc,
      d.esPartido
        ? "Partido. Es la referencia del 100 % de carga."
        : `${d.minutos}' · ${d.objetivo} · intensidad ${d.intensidad} · volumen ${d.volumen}`,
      MARGEN,
      y + 1,
      { size: 9, gris: true },
    );
    y = escribir(doc, d.nota, MARGEN, y + 1, { size: 9.5, maxWidth: ANCHO - MARGEN * 2 });

    if (d.sesion) {
      for (const b of d.sesion.bloques) {
        if (y > 265) {
          doc.addPage();
          y = 20;
        }
        y = escribir(doc, `  ${b.min}' · ${b.ejercicio.nombre}`, MARGEN + 3, y + 1, { size: 9.5 });
        y = escribir(doc, `     ${b.ejercicio.categoria} · ${materiales(b.ejercicio)}`, MARGEN + 3, y, {
          size: 8.5,
          gris: true,
        });
      }
    }
    y += 6;
  }

  pie(doc);
  return doc;
}

export function pdfDeMesociclo(meso: Mesociclo): jsPDF {
  const doc = nuevoPdf("Mesociclo ATR");
  let y = 38;
  y = escribir(doc, meso.resumen, MARGEN, y, { gris: true, maxWidth: ANCHO - MARGEN * 2 });
  y += 6;

  for (const s of meso.semanas) {
    if (y > 200) {
      doc.addPage();
      y = 20;
    }
    y = escribir(doc, `Semana ${s.numero} · ${s.fase}`, MARGEN, y, { negrita: true, size: 13 });
    y = escribir(doc, s.intencion, MARGEN, y + 1, { size: 9.5, maxWidth: ANCHO - MARGEN * 2 });
    y = escribir(doc, `${s.microciclo.minutosTotales} minutos en la semana`, MARGEN, y + 1, {
      size: 9,
      gris: true,
    });
    y += 2;

    for (const d of s.microciclo.dias) {
      if (y > 268) {
        doc.addPage();
        y = 20;
      }
      const detalle = d.esPartido
        ? "Partido"
        : `${d.minutos}' · ${d.objetivo} · intensidad ${d.intensidad} · volumen ${d.volumen}`;
      y = escribir(doc, `${d.id} ${d.diaSemana} · ${d.tipo} · ${detalle}`, MARGEN + 3, y + 1, {
        size: 9,
      });
    }
    y += 6;
  }

  pie(doc);
  return doc;
}
