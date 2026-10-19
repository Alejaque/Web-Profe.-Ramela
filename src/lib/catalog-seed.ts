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
      "Toda la formación en un solo lugar: los tres cursos, la biblioteca de entrenamiento y el Planificador con IA durante 12 meses.",
    features: [
      "Curso de Fútbol Infantil, Juvenil y Profesional",
      "Biblioteca completa de material de entrenamiento",
      "Planificador IA de entrenamientos por 12 meses",
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
    priceArs: 29900,
    compareAtPriceArs: 39900,
    badge: "Oferta lanzamiento",
    featured: false,
    sortOrder: 4,
  },
  {
    slug: "planificador-ia",
    name: "Planificador IA de Entrenamientos",
    level: "Inteligencia artificial",
    audience: "Infantil · Juvenil · Profesional",
    summary:
      "Generá planificaciones de entrenamiento en minutos con inteligencia artificial, basadas en la metodología del Profe Alejandro.",
    features: [
      "Planificaciones por categoría, nivel y objetivo",
      "Sesiones, microciclos y mesociclos",
      "Adaptable a tu cancha, tiempo y cantidad de jugadores",
      "Acceso por 12 meses",
    ],
    includesSlugs: [],
    priceArs: 39900,
    compareAtPriceArs: null,
    badge: "IA",
    featured: false,
    sortOrder: 5,
  },
];
