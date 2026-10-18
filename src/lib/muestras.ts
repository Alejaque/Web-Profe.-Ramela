/**
 * Las tres muestras gratis. Para agregar o editar una, cambiá solo este archivo.
 * Los archivos viven en public/: el PDF y la imagen de portada de cada curso.
 */
export type Muestra = {
  slug: string;
  curso: string;
  /** Ruta pública del enlace. El Infantil conserva /muestra-gratis por los enlaces ya difundidos. */
  href: string;
  eyebrow: string;
  /** Dos partes: la segunda se pinta en celeste. */
  titulo: [string, string];
  bajada: string;
  items: string[];
  pdf: string;
  portada: string;
  cursoDesc: string;
  waTexto: string;
  metaTitle: string;
  metaDesc: string;
};

export const MUESTRAS: Muestra[] = [
  {
    slug: "infantil",
    curso: "Fútbol Infantil",
    href: "/muestra-gratis",
    eyebrow: "Muestra gratis · Fútbol Infantil",
    titulo: ["3 fichas para entrenar mejor ", "desde hoy"],
    bajada:
      "Una ficha para cada etapa (6-7, 8-9 y 10-12 años), con diagrama de cancha, consignas y versiones más fácil y más difícil. Listas para usar en tu próximo entrenamiento.",
    items: [
      "3 juegos reales del curso, con su diagrama",
      "Cómo organizar, jugar y corregir cada uno",
      "PDF para imprimir o ver en el celular",
    ],
    pdf: "/muestra-gratis.pdf",
    portada: "/images/muestra-portada.jpg",
    cursoDesc:
      "4 guías y una planilla de Excel: metodología, 30 juegos con diagramas, planificación anual y gestión de familias.",
    waTexto:
      "Hola Profe! Descargué la muestra gratis y quiero consultar por el curso de fútbol infantil.",
    metaTitle: "Muestra gratis: 3 fichas de fútbol infantil | Profe. Alejandro Ramela",
    metaDesc: "Descargá gratis 3 fichas con diagramas de cancha, una para cada etapa de 6 a 12 años.",
  },
  {
    slug: "juvenil",
    curso: "Fútbol Juvenil",
    href: "/muestra-gratis/juvenil",
    eyebrow: "Muestra gratis · Fútbol Juvenil",
    titulo: ["3 sesiones para entrenar mejor ", "desde hoy"],
    bajada:
      "Una sesión para cada problema real de la categoría: salir desde el fondo cuando te presionan, progresar entre líneas y recuperar la pelota apenas la perdés. Con diagrama de cancha, tiempos y consignas.",
    items: [
      "Salida de tres con presión — 40×30 en dos zonas, 20 minutos",
      "Juego de posición en tres zonas — 60×40, 9 contra 9",
      "Cinco segundos para recuperar — 45×30, transición",
      "Cada una con organización, desarrollo, variantes y errores comunes",
      "PDF de 6 páginas, para imprimir o ver en el celular",
    ],
    pdf: "/muestra-juvenil.pdf",
    portada: "/images/muestra-juvenil-portada.jpg",
    cursoDesc:
      "4 guías, 30 sesiones con diagramas y una planilla de Excel: modelo de juego, periodización, formación personal y transición a mayores.",
    waTexto:
      "Hola Profe! Descargué la muestra gratis y quiero consultar por el curso de fútbol juvenil.",
    metaTitle: "Muestra gratis: 3 sesiones de fútbol juvenil | Profe. Alejandro Ramela",
    metaDesc:
      "Descargá gratis 3 sesiones completas del curso de Fútbol Juvenil, con diagrama de cancha, consignas y variantes.",
  },
  {
    slug: "profesional",
    curso: "Fútbol Profesional",
    href: "/muestra-gratis/profesional",
    eyebrow: "Muestra gratis · Fútbol Profesional",
    titulo: ["3 herramientas para preparar mejor ", "tu próximo partido"],
    bajada:
      "Las tres planillas que se usan todas las semanas en un cuerpo técnico: cómo leer al rival en una página, cómo armar la semana cuando jugás cada tres días y cómo tener la respuesta lista antes de necesitarla.",
    items: [
      "Ficha de rival en una página, con escala de confianza",
      "Microciclo cada 3 días y control de carga RPE, con ejemplo resuelto",
      "Matriz de variantes tácticas: disparador, respuesta, responsable y señal de éxito",
      "Todo tomado textualmente de las guías del curso",
      "PDF de 6 páginas, para imprimir o ver en el celular",
    ],
    pdf: "/muestra-profesional.pdf",
    portada: "/images/muestra-profesional-portada.jpg",
    cursoDesc:
      "4 guías y el planificador en Excel: microciclos, análisis del rival, preparación de partidos y conducción de grupo.",
    waTexto:
      "Hola Profe! Descargué la muestra gratis y quiero consultar por el curso de fútbol profesional.",
    metaTitle: "Muestra gratis: 3 herramientas de fútbol profesional | Profe. Alejandro Ramela",
    metaDesc:
      "Descargá gratis la ficha de rival, el microciclo cada 3 días y la matriz de variantes tácticas del curso de Fútbol Profesional.",
  },
];

export function findMuestra(slug: string): Muestra | undefined {
  return MUESTRAS.find((m) => m.slug === slug);
}
