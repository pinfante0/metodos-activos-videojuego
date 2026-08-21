import { findPlayableCase, playableCases, walkthroughs } from "../content";
import type { JournalEntry } from "../domain/contracts";
import { runWalkthrough } from "./walkthrough-runner";

/**
 * Rutas de prueba de los estados difíciles.
 *
 * Un estado difícil es el que sólo aparece cuando algo ha ido de una manera concreta: una bitácora
 * cargada de entradas largas, un enlace docente a mitad de un caso, un montaje sin rellenar, un
 * reparto en el que alguien se queda sin vía, un navegador que no deja guardar nada o un contenido
 * que no valida. Son exactamente los estados donde se rompe la composición y donde nadie mira,
 * porque llegar a ellos jugando cuesta varios minutos y hay que acertar el camino.
 *
 * A partir de M6 se llega a cada uno con un enlace. `#/pruebas` los enumera y
 * `scripts/measure-viewports.mjs` los recorre midiendo lo mismo que en el resto del juego, de modo
 * que la regla 6 de `docs/decision_producto_m5.md` se comprueba también aquí.
 *
 * No son un modo de trampa: no desbloquean nada, no alteran el progreso guardado —la bitácora de
 * prueba vive sólo en memoria— y no hay ninguna puntuación que saltarse.
 */
export type TestState =
  | { id: string; name: string; purpose: string; kind: "hash"; hash: string }
  | {
      id: string;
      name: string;
      purpose: string;
      kind: "case";
      caseSlug: string;
      sceneId?: string;
      /** Decisiones ya tomadas, por identificador de escena. */
      selectedActions?: Record<string, string>;
      completed?: boolean;
    }
  | { id: string; name: string; purpose: string; kind: "journal"; seed: "empty" | "full" }
  | { id: string; name: string; purpose: string; kind: "storage-denied" }
  | { id: string; name: string; purpose: string; kind: "invalid-content" };

export const TEST_STATES: readonly TestState[] = [
  {
    id: "bitacora-llena",
    name: "Bitácora con una entrada por caso",
    purpose:
      "La página de referencia más larga del juego, con el texto real que producen los recorridos declarados. Es donde primero se rompe la composición.",
    kind: "journal",
    seed: "full",
  },
  {
    id: "bitacora-vacia",
    name: "Bitácora sin ninguna entrada",
    purpose: "El estado inicial, con los dos botones deshabilitados y el aviso en lugar de la lista.",
    kind: "journal",
    seed: "empty",
  },
  {
    id: "almacenamiento-denegado",
    name: "Navegador que no permite guardar",
    purpose:
      "El progreso pasa a memoria temporal. Hay que comprobar que se degrada de forma comprensible y que se dice, en lugar de fallar en silencio.",
    kind: "storage-denied",
  },
  {
    id: "montaje-sin-rellenar",
    name: "Montaje sin ninguna decisión",
    purpose:
      "El montador con los cuatro huecos vacíos, al que se llega por enlace directo. Debe enumerar lo que falta sin fingir que hay una microclase.",
    kind: "case",
    caseSlug: "banco-de-mecanicas",
    sceneId: "probe-assembly",
  },
  {
    id: "montaje-completo",
    name: "Montaje con los cuatro huecos",
    purpose: "El montaje más largo posible: cuatro decisiones con sus etiquetas enteras.",
    kind: "case",
    caseSlug: "banco-de-mecanicas",
    sceneId: "probe-assembly",
    selectedActions: {
      "probe-entry": "probe-entry-signal",
      "probe-action": "probe-action-equivalent",
      "probe-support": "probe-support-shared",
      "probe-evidence": "probe-evidence-anticipation",
    },
  },
  {
    id: "reparto-sin-via",
    name: "Un resultado que deja a alguien sin vía",
    purpose:
      "El reparto declarado con un papel «sin vía» y su nota. Es la comprobación de que la exclusión se atribuye al diseño y nunca a la persona.",
    kind: "case",
    caseSlug: "banco-de-mecanicas",
    sceneId: "probe-consequence",
    selectedActions: {
      "probe-entry": "probe-entry-audio-only",
      "probe-action": "probe-action-equivalent",
      "probe-support": "probe-support-teacher-only",
      "probe-evidence": "probe-evidence-anticipation",
    },
  },
  {
    id: "incidente-por-acceso",
    name: "Incidente elegido por regla",
    purpose:
      "Dos incidentes declarados y una regla que decide cuál aparece. Con la apertura solo sonora debe salir el de acceso sensorial, nunca el de reserva.",
    kind: "case",
    caseSlug: "banco-de-mecanicas",
    sceneId: "probe-incident",
    selectedActions: { "probe-entry": "probe-entry-audio-only" },
  },
  {
    id: "justificacion-sin-decisiones",
    name: "Justificación entrando por el medio",
    purpose:
      "Enlace docente directo a la justificación del caso 6 sin haber decidido nada antes. La bitácora debe declarar los huecos en lugar de inventarlos.",
    kind: "case",
    caseSlug: "el-arreglo-que-no-escucha-a-todos",
    sceneId: "pilot-justification",
  },
  {
    id: "reflexion-sin-montaje",
    name: "Reflexión abierta sin haber montado nada",
    purpose:
      "Enlace docente directo a la bitácora del caso 3 sin ninguna decisión previa. No hay nada que registrar: la pantalla no puede ofrecer un cierre que el contrato de progreso rechazaría, así que debe decir qué falta y llevar al momento que lo resuelve.",
    kind: "case",
    caseSlug: "del-modelo-a-una-forma-propia",
    sceneId: "c3-reflection",
  },
  {
    id: "defensa-sin-decisiones",
    name: "Defensa abierta sin ninguna decisión",
    purpose:
      "Enlace docente directo a la justificación del caso 4, cuya gramática está ligada a la rama recorrida. Sin decisiones no hay rama, así que los huecos ligados se quedan vacíos en lugar de ofrecer piezas de todas las ramas: la pantalla debe decir qué falta y llevar a donde se decide.",
    kind: "case",
    caseSlug: "un-entorno-que-no-todos-tienen",
    sceneId: "c4-justification",
  },
  {
    id: "cierre-de-caso",
    name: "Pantalla de cierre de un caso",
    purpose: "El final del recorrido, con el enlace a la unidad siguiente y la repetición.",
    kind: "case",
    caseSlug: "el-arreglo-que-no-escucha-a-todos",
    completed: true,
  },
  {
    id: "caso-inexistente",
    name: "Enlace a un caso que no existe",
    purpose:
      "Una unidad pendiente compartida por error, o una errata en el enlace. Debe explicarse sin culpar a quien lo abrió y ofrecer una salida.",
    kind: "hash",
    hash: "#/caso/una-unidad-que-no-existe",
  },
  {
    id: "escena-inexistente",
    name: "Enlace a una escena que no existe",
    purpose:
      "El caso sí existe, la escena no. Debe abrirse el caso por su principio en lugar de quedarse en blanco.",
    kind: "hash",
    hash: "#/caso/banco-de-mecanicas/una-escena-que-no-existe",
  },
  {
    id: "ruta-inexistente",
    name: "Ruta fuera del contrato",
    purpose: "Cualquier fragmento que no pertenezca al contrato de navegación.",
    kind: "hash",
    hash: "#/una-ruta-que-no-existe",
  },
  {
    id: "contenido-invalido",
    name: "Informe de un contenido inválido",
    purpose:
      "El validador ejecutado sobre el caso deliberadamente roto de las fixtures. Comprueba que los mensajes señalan el contrato incumplido y son legibles por quien escribe contenido.",
    kind: "invalid-content",
  },
];

export function findTestState(id: string): TestState | undefined {
  return TEST_STATES.find((state) => state.id === id);
}

/**
 * Bitácora de ejemplo construida ejecutando los recorridos declarados, uno por caso. Nada aquí
 * está escrito a mano: si el contenido cambia, la bitácora de prueba cambia con él y deja de
 * medirse un texto que ya no existe.
 */
export function seedJournalEntries(): JournalEntry[] {
  const entries: JournalEntry[] = [];
  for (const caseDefinition of playableCases) {
    const walk = walkthroughs.find(
      (candidate) => candidate.caseSlug === caseDefinition.slug && !candidate.startSceneId,
    );
    if (!walk) continue;
    const target = findPlayableCase(walk.caseSlug);
    if (!target) continue;
    const trace = runWalkthrough(target, walk);
    if (trace.journal) entries.push(trace.journal);
  }
  return entries;
}
