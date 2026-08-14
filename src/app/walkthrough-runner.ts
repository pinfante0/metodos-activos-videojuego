import type { CaseDefinition, JournalEntry, Walkthrough } from "../domain/contracts";
import {
  advanceFromInformationalScene,
  buildJournalEntry,
  consequenceForScene,
  continueFromFeedback,
  createGameSession,
  grammarComplete,
  incidentForScene,
  sceneFor,
  selectAction,
  selectGrammar,
  type GameSession,
  type GrammarKey,
} from "./game-session";

/**
 * Ejecuta un recorrido declarado sobre la sesión pura, sin navegador ni DOM.
 *
 * Es el hermano rápido del arnés de `scripts/measure-viewports.mjs`, y sigue exactamente sus
 * mismas reglas de avance para que lo que aquí pasa no pueda divergir de lo que allí ocurre. La
 * diferencia es lo que cada uno demuestra: aquí, que la lógica del caso lleva a donde el contenido
 * dice; allí, que la pantalla que la muestra cabe y se puede manejar.
 *
 * Bloquearse es un fallo con diagnóstico, nunca una salida silenciosa. Ese fue el tercer defecto
 * que encontró la automatización de M5: un recorrido que giraba en vacío hasta agotar los pasos y
 * terminaba pareciendo correcto.
 */

const GRAMMAR_KEYS: readonly GrammarKey[] = [
  "objective",
  "principleAction",
  "conditionRisk",
  "adaptation",
  "evidence",
];

export interface WalkthroughTrace {
  /** Escenas visitadas, en orden. */
  scenes: string[];
  consequenceIds: string[];
  incidentIds: string[];
  completed: boolean;
  steps: number;
  journal?: JournalEntry;
  /** Motivo por el que el recorrido no pudo continuar. Su presencia es siempre un fallo. */
  blocked?: string;
}

const MAX_STEPS = 60;

export function runWalkthrough(
  caseDefinition: CaseDefinition,
  walk: Walkthrough,
  maxSteps = MAX_STEPS,
): WalkthroughTrace {
  let session: GameSession = createGameSession(caseDefinition, walk.startSceneId);
  const trace: WalkthroughTrace = {
    scenes: [],
    consequenceIds: [],
    incidentIds: [],
    completed: false,
    steps: 0,
  };
  const spent = new Set<string>();

  while (trace.steps < maxSteps) {
    trace.steps += 1;

    if (session.feedbackConsequenceId) {
      trace.consequenceIds.push(session.feedbackConsequenceId);
      session = continueFromFeedback(caseDefinition, session);
      continue;
    }

    const scene = sceneFor(caseDefinition, session);
    trace.scenes.push(scene.id);

    if (scene.kind === "consequence") {
      trace.consequenceIds.push(consequenceForScene(caseDefinition, scene, session).id);
      session = advanceFromInformationalScene(caseDefinition, session, scene);
      continue;
    }

    if (scene.kind === "incident") {
      trace.incidentIds.push(incidentForScene(caseDefinition, scene, session).id);
      session = advanceFromInformationalScene(caseDefinition, session, scene);
      continue;
    }

    if (scene.kind === "assembly-review") {
      session = advanceFromInformationalScene(caseDefinition, session, scene);
      continue;
    }

    if (scene.kind === "justification") {
      const pending = GRAMMAR_KEYS.find((key) => !session.selectedGrammar[key]);
      if (pending) {
        const declared = walk.grammar?.[pending];
        const options = scene.grammarOptions[pending];
        const first = options[0];
        const optionId =
          declared ?? (typeof first === "string" ? first : first?.id);
        if (!optionId) {
          trace.blocked = `La escena ${scene.id} no ofrece ninguna pieza para «${pending}»`;
          return trace;
        }
        session = selectGrammar(session, pending, optionId);
        continue;
      }
      if (!grammarComplete(session)) {
        trace.blocked = `La justificación de ${scene.id} sigue incompleta tras elegir las cinco piezas`;
        return trace;
      }
      session = { ...session, sceneId: scene.nextSceneId ?? session.sceneId };
      continue;
    }

    if (scene.kind === "reflection") {
      trace.journal = buildJournalEntry(
        caseDefinition,
        session,
        "2026-08-14T00:00:00.000Z",
        "00000000-0000-4000-8000-000000000000",
      );
      trace.completed = true;
      return trace;
    }

    const actionId = walk.actions.find(
      (candidate) => !spent.has(candidate) && scene.actionIds.includes(candidate),
    );
    if (!actionId) {
      trace.blocked =
        `En la escena ${scene.id} ninguna acción prevista sigue disponible. ` +
        `Ofrece ${scene.actionIds.join(", ")}; el recorrido declara ${walk.actions.join(", ") || "ninguna"}`;
      return trace;
    }
    spent.add(actionId);
    session = selectAction(caseDefinition, session, scene, actionId);
  }

  trace.blocked = `El recorrido agotó ${maxSteps} pasos sin llegar a la pantalla de cierre`;
  return trace;
}
