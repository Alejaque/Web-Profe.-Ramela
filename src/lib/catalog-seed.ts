/**
 * Catálogo compartido por la vitrina y el checkout del servidor. Los precios están
 * expresados en pesos argentinos (ARS).
 */
export type SeedProduct = {
  slug: string;
  name: string;
  level: string;
  audience: string;
  summary: string;
  features: string[];
  includesSlugs: string[];
  priceArs: number;
  compareAtPriceArs: number | null;
  badge: string | null;
  previousBuyerPriceArs?: number;
  featured: boolean;
  sortOrder: number;
};

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "pack-infantil-juvenil",
    name: "Pack Infantil + Juvenil",
    level: "Dos cursos completos",
    audience: "Infantil 6–12 años · Juvenil 13–19 años",
    summary:
      "Acompañá al jugador desde sus primeros aprendizajes hasta el salto competitivo. Los dos cursos completos en un solo pedido.",
    features: [
      "Las 4 guías del curso Infantil y las 4 del Juvenil",
      "30 juegos infantiles y 30 sesiones juveniles con diagramas",
      "Planillas Excel de planificación y seguimiento",
      "Formación personal, gestión del grupo y familias",
    ],
    includesSlugs: ["curso-infantil", "curso-juvenil"],
    priceArs: 69900,
    compareAtPriceArs: null,
    badge: "Oferta lanzamiento",
    featured: true,
    sortOrder: 0,
  },

  {
    slug: "pack-completo",
    name: "Pack Completo Profe. Alejandro Ramela",
    level: "Todos los niveles",
    audience: "Infantil · Juvenil · Profesional",
    summary:
      "Toda la formación en un solo lugar: los tres cursos, la biblioteca de entrenamiento y el Planificador con IA, los dos de acceso permanente.",
    features: [
      "Curso de Fútbol Infantil, Juvenil y Profesional",
      "Biblioteca completa de material de entrenamiento",
      "Planificador de entrenamientos con IA, acceso permanente",
      "Actualizaciones de contenido incluidas",
      "El mejor precio por nivel",
    ],
    includesSlugs: [
      "curso-infantil",
      "curso-juvenil",
      "curso-profesional",
      "biblioteca-entrenamiento",
      "planificador-ia",
    ],
    priceArs: 169900,
    compareAtPriceArs: 259500,
    badge: "Más elegido",
    featured: false,
    sortOrder: 10,
  },
  {
    slug: "curso-infantil",
    name: "Formación en Fútbol Infantil",
    level: "Infantil",
    audience: "Escuelitas y divisiones de 6 a 12 años",
    summary:
      "Aprendé a enseñar, motivar y desarrollar a los más chicos con juego, progresiones técnicas y planificación adaptada a cada edad.",
    features: [
      "Metodología de enseñanza por etapas",
      "Juegos y ejercicios técnicos para cada edad",
      "Planificaciones anuales y semanales listas",
      "Gestión de grupos y relación con las familias",
    ],
    includesSlugs: [],
    priceArs: 34900,
    compareAtPriceArs: 44900,
    badge: "Oferta lanzamiento",
    featured: false,
    sortOrder: 1,
  },
  {
    slug: "curso-juvenil",
    name: "Formación en Fútbol Juvenil",
    level: "Juvenil",
    audience: "Divisiones formativas de 13 a 19 años",
    summary:
      "Modelo de juego, periodización y formación personal para preparar al jugador antes del salto competitivo.",
    features: [
      "Modelo de juego y principios tácticos",
      "Periodización y carga en etapas de crecimiento",
      "Sesiones de entrenamiento paso a paso",
      "Formación personal y transición hacia mayores",
      "4 guías, 30 sesiones con diagramas, Excel y checklist",
    ],
    includesSlugs: [],
    priceArs: 39900,
    compareAtPriceArs: 54900,
    badge: "Oferta lanzamiento",
    previousBuyerPriceArs: 34900,
    featured: false,
    sortOrder: 2,
  },
  {
    slug: "curso-profesional",
    name: "Formación en Fútbol Profesional",
    level: "Profesional",
    audience: "Cuerpos técnicos de primera división y ascenso",
    summary:
      "Conducción de planteles, análisis del juego, microciclos de competencia y toma de decisiones con la experiencia de 30 años en cancha.",
    features: [
      "Microciclos y planificación de competencia",
      "Análisis del rival y del propio juego",
      "Conducción de grupo y vestuario",
      "Preparación de partidos y variantes tácticas",
    ],
    includesSlugs: [],
    priceArs: 69900,
    compareAtPriceArs: 89900,
    badge: "Oferta lanzamiento",
    featured: false,
    sortOrder: 3,
  },
  {
    slug: "biblioteca-entrenamiento",
    name: "Biblioteca de Material de Entrenamiento",
    level: "Todos los niveles",
    audience: "Para entrenadores de cualquier categoría",
    summary:
      "120 ejercicios con diagrama, desarrollo y variantes, filtrables por nivel y objetivo. Incluye el PDF y una planilla de Excel para armar tus sesiones.",
    features: [
      "120 ejercicios filtrados por nivel y objetivo",
      "PDF con las 120 fichas y planilla de Excel",
      "Material para infantil, juvenil y profesional",
      "Acceso desde el celular, tablet o PC",
    ],
    includesSlugs: [],
    // Precio de lista. La oferta vigente lo rebaja: ver src/lib/ofertas.ts.
    priceArs: 39900,
    compareAtPriceArs: null,
    badge: null,
    featured: false,
    sortOrder: 4,
  },
  {
    slug: "planificador-ia",
    name: "Planificador de Entrenamientos con IA",
    level: "Planificación con IA",
    audience: "Infantil · Juvenil · Profesional · Probá gratis desde la web",
    summary:
      "Armá sesiones, microciclos MD-5 a MD+1 y mesociclos ATR para infantil, juvenil y profesional con los 120 ejercicios de la biblioteca. El motor cierra los minutos exactos, la IA redacta las consignas para tu grupo y bajás todo en PDF y Excel.",
    features: [
      "Infantil, Juvenil y Profesional: sesiones, microciclos MD-5 → MD+1 y mesociclos ATR",
      "El motor elige los ejercicios y la IA redacta las consignas a medida",
      "Los minutos cierran exactos: si pedís 75', son 75'",
      "Respeta tu cancha, tus jugadores y tu material",
      "PDF para imprimir y Excel para editar · pago único, sin vencimiento",
    ],
    includesSlugs: [],
    // Precio de lista. La oferta vigente lo rebaja: ver src/lib/ofertas.ts.
    priceArs: 49900,
    compareAtPriceArs: null,
    badge: null,
    featured: false,
    sortOrder: 5,
  },
];
