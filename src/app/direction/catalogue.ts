/**
 * Catálogo de direcciones M5.
 *
 * Este archivo es datos puros y no depende del navegador: describe las tres direcciones
 * candidatas y la línea base gris de M4 con los mismos criterios explícitos, para que la
 * comparación pueda leerse en la aplicación y en `docs/direcciones_m5.md` sin duplicarse.
 *
 * No elige ninguna dirección ni produce recursos definitivos.
 */

export type DirectionId = "gris" | "cuaderno" | "laboratorio" | "consola";

export type SoundCueId =
  | "decision"
  | "consequence-coherent-defensible"
  | "consequence-defensible-needs-revision"
  | "consequence-incoherent-with-brief"
  | "incident"
  | "journal";

export interface SoundCue {
  readonly id: SoundCueId;
  /** Gesto sonoro previsto. En M5 se sintetiza en el navegador; no es un recurso definitivo. */
  readonly sketch: string;
  /** Equivalente textual exigido por el contrato de recursos M3, apartado 5. */
  readonly textEquivalent: string;
}

export interface DirectionCriteria {
  readonly legibility: string;
  readonly accessibility: string;
  readonly identity: string;
  readonly productionCost: string;
  readonly pedagogicalFit: string;
  readonly mainRisk: string;
}

export interface Direction {
  readonly id: DirectionId;
  readonly name: string;
  readonly tagline: string;
  readonly visual: string;
  readonly sound: string;
  readonly experience: string;
  readonly motion: string;
  /** Qué se ve realmente en esta maqueta y qué queda solo descrito. */
  readonly implemented: string;
  readonly described: string;
  readonly criteria: DirectionCriteria;
  readonly cues: readonly SoundCue[];
}

export const BASELINE_DIRECTION_ID: DirectionId = "gris";

const BASELINE: Direction = {
  id: "gris",
  name: "Gris M4",
  tagline: "Línea base funcional, sin dirección aplicada",
  visual:
    "Interfaz gris de M4: HTML semántico, controles nativos y una paleta provisional medida. No es una dirección candidata, sino el punto de comparación.",
  sound: "Silencio. El corte gris no emite ninguna señal sonora.",
  experience:
    "Jerarquía funcional pura: encabezado, escena, decisiones y retroalimentación, sin ornamento ni ritmo propio.",
  motion: "Ninguno.",
  implemented: "Todo el corte vertical de M4, tal como quedó aprobado el 13 de agosto de 2026.",
  described: "Nada: es el estado real del proyecto.",
  criteria: {
    legibility:
      "Contraste de 14,8:1 para el texto principal sobre el fondo y 16,9:1 sobre los paneles. Es el techo de legibilidad contra el que se miden las tres direcciones.",
    accessibility:
      "Sin color informativo, sin movimiento y sin sonido, de modo que no genera ninguna obligación de equivalente. Ya comprobada con ratón, teclado, táctil y cinco tamaños objetivo.",
    identity:
      "Ninguna. Es intencionadamente anónima y no distingue este juego de cualquier otro prototipo.",
    productionCost: "Cero recursos adicionales.",
    pedagogicalFit:
      "Suficiente para razonar, insuficiente para sostener la promesa de «ver a quién favorece una decisión» que fija la biblia de juego.",
    mainRisk: "Quedarse aquí por comodidad y publicar un formulario en lugar de un juego.",
  },
  cues: [],
};

const CUADERNO: Direction = {
  id: "cuaderno",
  name: "Cuaderno de campo",
  tagline: "Observar, anotar y corregir sobre papel",
  visual:
    "Papel cálido y tinta oscura. Una sola tinta de corrección roja para la marca docente y tres tintas de estado para la retroalimentación. Serifa para los títulos y tipografía de sistema para los controles. Sin ilustración de personajes: viñetas de línea y marcas de anotación.",
  sound:
    "Lenguaje acústico y escaso, cercano al sonido real de un aula: marca de lápiz al registrar una decisión, dos notas de madera para la consecuencia —el intervalo cambia con el estado— y un golpe grave y breve para el incidente. Sin música de fondo.",
  experience:
    "Lectura primero. Una decisión por pantalla y la retroalimentación pegada espacialmente a la decisión que la produce, como una anotación al margen. Ritmo tranquilo, pensado para una pareja que discute en voz alta antes de pulsar.",
  motion:
    "Sólo desvanecidos breves. Ninguna animación transporta información, de modo que el modo de movimiento reducido no pierde nada.",
  implemented:
    "Paleta, tipografía, marcas de margen, casilla de decisión cuadrada y las seis señales sonoras con su equivalente textual.",
  described:
    "Viñetas de línea de los personajes, marcas de corrección dibujadas a mano y encabezados manuscritos de cada caso.",
  criteria: {
    legibility:
      "Texto principal entre 13,8:1 y 15,2:1 sobre papel cálido. Al ser el texto el elemento central, la escena admite más palabras sin desbordar; el riesgo es un bloque uniforme con poca jerarquía entre escena, decisión y consecuencia.",
    accessibility:
      "La más barata de hacer accesible: sin color informativo, sin movimiento informativo y con equivalentes textuales triviales porque el sonido es marginal. Hay que vigilar que la textura de papel no reduzca el contraste efectivo ni añada ruido visual.",
    identity:
      "Coherente con «Detective de aula» y con la observación de escenas, pero poco distintiva como videojuego: puede confundirse con una ficha, un formulario o un cuestionario.",
    productionCost:
      "La más baja. Tipografías del sistema, marcas SVG de línea y cuatro efectos cortos. No exige repertorio de personajes, variantes de estado ni iluminación.",
    pedagogicalFit:
      "Refuerza la capa 1 —observar, reconocer, reparar— y la escritura de la gramática de decisión. Aporta menos a «ver a quién favorece una decisión», que es el motor de la capa 2.",
    mainRisk:
      "Que alumnado de 18 o 19 años lo lea como tarea escrita y baje la implicación, y que la consecuencia pierda fuerza por no mostrarse nunca.",
  },
  cues: [
    {
      id: "decision",
      sketch: "Marca breve de lápiz sobre papel.",
      textEquivalent: "Decisión registrada.",
    },
    {
      id: "consequence-coherent-defensible",
      sketch: "Dos notas de madera ascendentes, quinta justa.",
      textEquivalent: "Consecuencia coherente y defendible.",
    },
    {
      id: "consequence-defensible-needs-revision",
      sketch: "Dos notas de madera muy próximas, sin cerrar.",
      textEquivalent: "Consecuencia defendible con revisión necesaria.",
    },
    {
      id: "consequence-incoherent-with-brief",
      sketch: "Una sola nota de madera grave y seca.",
      textEquivalent: "Consecuencia incoherente con el encargo.",
    },
    {
      id: "incident",
      sketch: "Golpe grave y breve sobre la mesa.",
      textEquivalent: "Cambia una condición del aula.",
    },
    {
      id: "journal",
      sketch: "Dos marcas de lápiz seguidas.",
      textEquivalent: "Entrada guardada en la bitácora.",
    },
  ],
};

const LABORATORIO: Direction = {
  id: "laboratorio",
  name: "Aula-laboratorio escénica",
  tagline: "La clase reacciona a la vista antes de leerse",
  visual:
    "Escenario oscuro con una banda de luz cálida sobre el aula. Figuras planas y geométricas con silueta clara, sin rasgos faciales detallados. Código de color por puerta de entrada —cuerpo, voz, oído, instrumento, entorno y repertorio— y consola de decisión sobre fondo oscuro.",
  sound:
    "Pequeño conjunto: percusión corporal, sílaba vocal y láminas. La consecuencia se cifra en un motivo de tres notas cuyo modo cambia con el estado. El incidente entra con un tambor grave acompañado de un cambio de luz.",
  experience:
    "Dos zonas estables: el aula que responde arriba y la consola de decisión abajo. La consecuencia se ve en la escena antes de leerse en el texto, que es la promesa central de la biblia de juego.",
  motion:
    "Entradas con desplazamiento corto y cambio de luz. El modo de movimiento reducido sustituye cada animación por un estado fijo etiquetado, no por la ausencia de información.",
  implemented:
    "Paleta oscura, banda de escenario iluminada tras el encabezado, acento ámbar, entrada animada de la retroalimentación y las seis señales sonoras con su equivalente textual.",
  described:
    "Las figuras del aula y sus variantes de estado, el código de color por puerta de entrada, la iluminación que marca a quién afecta una decisión y la reacción escénica del incidente. Ninguna de estas piezas existe todavía: exigen datos y arte que pertenecen a M6 y M8.",
  criteria: {
    legibility:
      "Texto claro sobre fondo oscuro a 14,2:1 y acento ámbar a 9,2:1. Exige control estricto del texto largo: sobre fondo oscuro los párrafos extensos cansan antes, y las pantallas de acción tienen menos margen antes de desbordar en 360 × 640.",
    accessibility:
      "La que más trabajo exige. Cada reacción visual del aula necesita equivalente textual, cada animación necesita un estado fijo alternativo y el código de color por puerta de entrada necesita una segunda señal no cromática. Es además la única que representa cuerpos, con las salvaguardas del reparto funcional de M2.",
    identity:
      "La más distintiva y la más cercana a la dirección inicial del plan maestro. Da al proyecto una identidad propia frente a Intervalia y Armario, y hace creíble que sea la culminación de la asignatura.",
    productionCost:
      "La más alta con diferencia: seis personajes con variantes de estado, fondos, iluminación, animación y un conjunto sonoro real con licencias. Compromete el calendario de M8 y el presupuesto de carga de la aplicación.",
    pedagogicalFit:
      "La que mejor sostiene la consecuencia como experiencia: se percibe quién participa, quién decide y qué barrera aparece antes de leerlo. También la que más riesgo tiene de decorar en lugar de informar.",
    mainRisk:
      "Fijar la representación de discapacidad, origen o rol en una imagen estable, y que la animación sustituya al razonamiento en vez de prepararlo.",
  },
  cues: [
    {
      id: "decision",
      sketch: "Palmada corporal breve con una lámina aguda.",
      textEquivalent: "Decisión registrada.",
    },
    {
      id: "consequence-coherent-defensible",
      sketch: "Motivo de tres notas de lámina en modo mayor.",
      textEquivalent: "Consecuencia coherente y defendible.",
    },
    {
      id: "consequence-defensible-needs-revision",
      sketch: "El mismo motivo con tercera menor.",
      textEquivalent: "Consecuencia defendible con revisión necesaria.",
    },
    {
      id: "consequence-incoherent-with-brief",
      sketch: "Dos notas muy próximas que no resuelven.",
      textEquivalent: "Consecuencia incoherente con el encargo.",
    },
    {
      id: "incident",
      sketch: "Tambor grave con descenso de luz.",
      textEquivalent: "Cambia una condición del aula.",
    },
    {
      id: "journal",
      sketch: "Campanilla aguda de dos notas.",
      textEquivalent: "Entrada guardada en la bitácora.",
    },
  ],
};

const CONSOLA: Direction = {
  id: "consola",
  name: "Consola de decisiones",
  tagline: "La gramática de la decisión, siempre a la vista",
  visual:
    "Editorial claro de contraste muy alto, con retícula visible. Etiquetas monoespaciadas para objetivo, principio, condición, adaptación y evidencia. Las consecuencias se representan como diagrama de los cuatro observables, generado desde los datos y no dibujado.",
  sound:
    "Sonificación abstracta y muy breve. El estado de la consecuencia se cifra como intervalo —quinta justa, cuarta o segunda menor— y el incidente como pulso grave repetido. Nada es música: son señales de interfaz.",
  experience:
    "Densa y comparativa. La frase de gramática se construye a la vista y las decisiones anteriores permanecen consultables, de modo que comparar dos alternativas defendibles es la operación más barata de la pantalla. Pensada para la ruta presencial de 20 a 30 minutos por parejas.",
  motion:
    "Casi nula. El cambio de estado se marca con un realce de un solo golpe, sin desplazamiento.",
  implemented:
    "Paleta clara de alto contraste, tipografía monoespaciada en etiquetas, riel bajo el encabezado, casilla de decisión rectangular y las seis señales sonoras con su equivalente textual.",
  described:
    "El diagrama de cuatro observables, el riel permanente con las cinco preguntas estables y el historial lateral de decisiones anteriores.",
  criteria: {
    legibility:
      "El mayor contraste de las tres, entre 16,7:1 y 19:1, y la mejor jerarquía para comparar dos opciones. La densidad es su riesgo: en 360 × 640 la retícula de etiquetas puede obligar a desplazamiento en pantallas que deben permanecer sin él.",
    accessibility:
      "Muy favorable: estructura tabular, sin movimiento informativo y con un sonido íntegramente sustituible por texto. El monoespaciado y la densidad pueden penalizar a quien lee con más esfuerzo, de modo que necesitaría un modo de espaciado ampliado.",
    identity:
      "Sobria y profesional; identidad de herramienta, no de juego. Puede leerse como un simulador serio de decisiones docentes o como una aplicación de trabajo, según el acabado.",
    productionCost:
      "Baja o media. Casi todo es tipografía, retícula y diagramas SVG generados desde los datos ya validados; el sonido es procedural y no requiere licencias. No hay repertorio de personajes que mantener.",
    pedagogicalFit:
      "La que mejor sirve a la capa 2 y a la ruta presencial: comparar alternativas defendibles, ver construirse la gramática y revisar tras el incidente. Aporta poco a la ficción de aula y a la lectura de escena de la capa 1.",
    mainRisk:
      "Que un juego sobre experiencia musical se sienta clínico y sin música, y que la densidad excluya a quien necesita más aire para leer.",
  },
  cues: [
    {
      id: "decision",
      sketch: "Pulso corto y agudo de interfaz.",
      textEquivalent: "Decisión registrada.",
    },
    {
      id: "consequence-coherent-defensible",
      sketch: "Díada estable de quinta justa.",
      textEquivalent: "Consecuencia coherente y defendible.",
    },
    {
      id: "consequence-defensible-needs-revision",
      sketch: "Díada de cuarta, sin cerrar.",
      textEquivalent: "Consecuencia defendible con revisión necesaria.",
    },
    {
      id: "consequence-incoherent-with-brief",
      sketch: "Díada de segunda menor con batido audible.",
      textEquivalent: "Consecuencia incoherente con el encargo.",
    },
    {
      id: "incident",
      sketch: "Dos pulsos graves repetidos.",
      textEquivalent: "Cambia una condición del aula.",
    },
    {
      id: "journal",
      sketch: "Pulso agudo doble descendente.",
      textEquivalent: "Entrada guardada en la bitácora.",
    },
  ],
};

/** Línea base y tres candidatas. El orden es el de presentación, no una preferencia. */
export const DIRECTIONS: readonly Direction[] = [BASELINE, CUADERNO, LABORATORIO, CONSOLA];

/** Las tres direcciones que M5 debe comparar, sin la línea base. */
export const CANDIDATE_DIRECTIONS: readonly Direction[] = DIRECTIONS.filter(
  (direction) => direction.id !== BASELINE_DIRECTION_ID,
);

export function isDirectionId(value: unknown): value is DirectionId {
  return DIRECTIONS.some((direction) => direction.id === value);
}

/** Cualquier valor desconocido, ausente o corrupto vuelve al gris de M4. */
export function resolveDirectionId(value: unknown): DirectionId {
  return isDirectionId(value) ? value : BASELINE_DIRECTION_ID;
}

export function findDirection(id: DirectionId): Direction {
  const direction = DIRECTIONS.find((candidate) => candidate.id === id);
  if (!direction) throw new Error(`Dirección desconocida: ${id}`);
  return direction;
}

/** Etiquetas de los cinco criterios acordados para comparar. */
export const CRITERIA_LABELS: ReadonlyArray<readonly [keyof DirectionCriteria, string]> = [
  ["legibility", "Legibilidad"],
  ["accessibility", "Accesibilidad"],
  ["identity", "Identidad"],
  ["productionCost", "Coste de producción"],
  ["pedagogicalFit", "Adecuación pedagógica"],
  ["mainRisk", "Riesgo principal"],
];
