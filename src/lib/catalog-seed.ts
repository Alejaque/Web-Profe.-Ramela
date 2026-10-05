/**
 * Catálogo inicial de cursos. Se carga automáticamente en la base de datos
 * la primera vez que la tabla `products` está vacía. Todos los precios están
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
  featured: boolean;
  sortOrder: number;
};

export const SEED_PRODUCTS: SeedProduct[] = [
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
    featured: true,
    sortOrder: 0,
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
    priceArs: 44900,
    compareAtPriceArs: null,
    badge: null,
    featured: false,
    sortOrder: 1,
  },
  {
    slug: "curso-juvenil",
    name: "Formación en Fútbol Juvenil",
    level: "Juvenil",
    audience: "Divisiones formativas de 13 a 19 años",
    summary:
      "Del técnico-táctico a la formación personal: cómo preparar al jugador juvenil para dar el salto a la competencia exigente.",
    features: [
      "Modelo de juego y principios tácticos",
      "Periodización y carga en etapas de crecimiento",
      "Sesiones de entrenamiento paso a paso",
      "Transición hacia el fútbol de primera",
    ],
    includesSlugs: [],
    priceArs: 54900,
    compareAtPriceArs: null,
    badge: null,
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
    priceArs: 89900,
    compareAtPriceArs: null,
    badge: null,
    featured: false,
    sortOrder: 3,
  },
  {
    slug: "biblioteca-entrenamiento",
    name: "Biblioteca de Material de Entrenamiento",
    level: "Todos los niveles",
    audience: "Para entrenadores de cualquier categoría",
    summary:
      "Cientos de ejercicios, sesiones y progresiones ordenadas por nivel, objetivo y categoría para que nunca te quedes sin ideas.",
    features: [
      "Ejercicios filtrados por nivel y objetivo",
      "Sesiones completas descargables",
      "Material para infantil, juvenil y profesional",
      "Acceso desde el celular, tablet o PC",
    ],
    includesSlugs: [],
    priceArs: 29900,
    compareAtPriceArs: null,
    badge: null,
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
