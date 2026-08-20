import type {
  AssemblySlot,
  CaseDefinition,
  Consequence,
  Incident,
  JournalEntry,
  JournalField,
  Scene,
} from "../domain/contracts";
import { JournalEntrySchema } from "../domain/contracts";
import { activeTags, resolveConsequenceId, resolveIncidentId } from "../domain/consequence-engine";

export type GrammarKey = "objective" | "principleAction" | "conditionRisk" | "adaptation" | "evidence";

export interface GameSession {
  caseId: string;
  sceneId: string;
  selectedActions: Record<string, string>;
  selectedGrammar: Partial<Record<GrammarKey, string>>;
  feedbackConsequenceId?: string;
  completed: boolean;
}

/**
 * `startSceneId` sostiene los enlaces directos a mitad de un caso: la ruta `#/caso/<slug>/<escena>`
 * y las rutas de prueba de estados difíciles. El progreso orienta y no bloquea, de modo que entrar
 * por el medio es un uso previsto y no una vía de escape.
 */
export function createGameSession(
  caseDefinition: CaseDefinition,
  startSceneId?: string,
): GameSession {
  const exists = caseDefinition.scenes.some((scene) => scene.id === startSceneId);
  return {
    caseId: caseDefinition.id,
    sceneId: exists && startSceneId ? startSceneId : caseDefinition.entrySceneId,
    selectedActions: {},
    selectedGrammar: {},
    completed: false,
  };
}

export function sceneFor(caseDefinition: CaseDefinition, session: GameSession): Scene {
  const scene = caseDefinition.scenes.find((candidate) => candidate.id === session.sceneId);
  if (!scene) throw new Error(`No existe la escena ${session.sceneId}`);
  return scene;
}

export interface AssemblyPiece {
  slot: AssemblySlot;
  actionId?: string;
  label?: string;
}

/**
 * Estado del montador: qué hueco de la microclase ha rellenado cada escena de diseño y cuáles
 * siguen vacíos. Enumera, no ordena ni valora: la lectura pedagógica llega con la prueba.
 */
export function assemblyPieces(
  caseDefinition: CaseDefinition,
  session: GameSession,
): AssemblyPiece[] {
  return (caseDefinition.assembly?.slots ?? []).map((slot) => {
    const actionId = session.selectedActions[slot.sceneId];
    const label = caseDefinition.actions.find((action) => action.id === actionId)?.label;
    return actionId && label ? { slot, actionId, label } : { slot };
  });
}

export function assemblyComplete(caseDefinition: CaseDefinition, session: GameSession): boolean {
  const pieces = assemblyPieces(caseDefinition, session);
  return pieces.length > 0 && pieces.every((piece) => piece.actionId !== undefined);
}

/**
 * Si el caso puede darse por cerrado con las decisiones tomadas hasta ahora.
 *
 * Un enlace directo a la pantalla de reflexión es un uso previsto —el progreso orienta y no
 * bloquea—, pero cerrar ahí sin haber decidido nada guardaría una bitácora sin ningún enfoque
 * recorrido, y esa entrada **no pasa el contrato de progreso**: al guardarla, `ProgressSchema`
 * lanzaba. El criterio es exactamente ése y no una regla aparte que pudiera divergir de él: no se
 * ofrece cerrar cuando lo que se guardaría no validaría.
 */
export function canFinishCase(caseDefinition: CaseDefinition, session: GameSession): boolean {
  if (!caseDefinition.journalTemplate) return false;
  const candidate = buildJournalEntry(
    caseDefinition, session, "1970-01-01T00:00:00.000Z", "00000000-0000-4000-8000-000000000000",
  );
  return JournalEntrySchema.safeParse(candidate).success;
}

/** Incidente que corresponde a las decisiones ya tomadas, resuelto por el motor determinista. */
export function incidentForScene(
  caseDefinition: CaseDefinition,
  scene: Extract<Scene, { kind: "incident" }>,
  session: GameSession,
): Incident {
  const incidentId = resolveIncidentId(scene, activeTags(caseDefinition, session.selectedActions));
  const incident = caseDefinition.incidents.find((candidate) => candidate.id === incidentId);
  if (!incident) throw new Error(`No existe el incidente ${incidentId}`);
  return incident;
}

export function consequenceForAction(
  caseDefinition: CaseDefinition,
  actionId: string,
): Consequence {
  const action = caseDefinition.actions.find((candidate) => candidate.id === actionId);
  const consequence = caseDefinition.consequences.find(
    (candidate) => candidate.id === action?.consequenceId,
  );
  if (!action || !consequence) throw new Error(`Acción sin consecuencia: ${actionId}`);
  return consequence;
}

export function consequenceForScene(
  caseDefinition: CaseDefinition,
  scene: Extract<Scene, { kind: "consequence" }>,
  session: GameSession,
): Consequence {
  const consequenceId = resolveConsequenceId(
    scene,
    activeTags(caseDefinition, session.selectedActions),
  );
  const consequence = caseDefinition.consequences.find(
    (candidate) => candidate.id === consequenceId,
  );
  if (!consequence) throw new Error(`No existe la consecuencia ${consequenceId}`);
  return consequence;
}

export function selectAction(
  caseDefinition: CaseDefinition,
  session: GameSession,
  scene: Extract<Scene, { kind: "observation" | "design" | "revision" }>,
  actionId: string,
): GameSession {
  if (!scene.actionIds.includes(actionId)) throw new Error("La acción no pertenece a la escena");
  if (scene.feedbackMode === "deferred") {
    const actionConsequence = consequenceForAction(caseDefinition, actionId);
    return {
      ...session,
      selectedActions: { ...session.selectedActions, [scene.id]: actionId },
      sceneId: scene.nextSceneId ?? actionConsequence.nextSceneId ?? scene.id,
      feedbackConsequenceId: undefined,
    };
  }
  return {
    ...session,
    selectedActions: { ...session.selectedActions, [scene.id]: actionId },
    feedbackConsequenceId: consequenceForAction(caseDefinition, actionId).id,
  };
}

export function continueFromFeedback(
  caseDefinition: CaseDefinition,
  session: GameSession,
): GameSession {
  const consequence = caseDefinition.consequences.find(
    (candidate) => candidate.id === session.feedbackConsequenceId,
  );
  if (!consequence) return session;
  return {
    ...session,
    sceneId: consequence.nextSceneId ?? session.sceneId,
    feedbackConsequenceId: undefined,
  };
}

export function advanceFromInformationalScene(
  caseDefinition: CaseDefinition,
  session: GameSession,
  scene: Extract<Scene, { kind: "consequence" | "incident" | "assembly-review" }>,
): GameSession {
  const nextSceneId =
    scene.kind === "consequence"
      ? consequenceForScene(caseDefinition, scene, session).nextSceneId ?? scene.nextSceneId
      : scene.nextSceneId;
  return { ...session, sceneId: nextSceneId ?? session.sceneId };
}

export function selectGrammar(
  session: GameSession,
  key: GrammarKey,
  optionId: string,
): GameSession {
  return {
    ...session,
    selectedGrammar: { ...session.selectedGrammar, [key]: optionId },
  };
}

function optionLabel(
  caseDefinition: CaseDefinition,
  key: GrammarKey,
  optionId: string | undefined,
): string {
  if (!optionId) return "decisión pendiente";
  const justification = caseDefinition.scenes.find(
    (scene): scene is Extract<Scene, { kind: "justification" }> => scene.kind === "justification",
  );
  const option = justification?.grammarOptions[key].find((candidate) =>
    typeof candidate === "string" ? candidate === optionId : candidate.id === optionId,
  );
  return typeof option === "string" ? option : (option?.label ?? optionId);
}

export function grammarSentence(
  caseDefinition: CaseDefinition,
  session: GameSession,
): string {
  return `Para ${optionLabel(caseDefinition, "objective", session.selectedGrammar.objective)}, uso ${optionLabel(caseDefinition, "principleAction", session.selectedGrammar.principleAction)} porque ${optionLabel(caseDefinition, "conditionRisk", session.selectedGrammar.conditionRisk)}; incorporo ${optionLabel(caseDefinition, "adaptation", session.selectedGrammar.adaptation)} y comprobaré ${optionLabel(caseDefinition, "evidence", session.selectedGrammar.evidence)}.`;
}

export function grammarComplete(session: GameSession): boolean {
  return (["objective", "principleAction", "conditionRisk", "adaptation", "evidence"] as const).every(
    (key) => Boolean(session.selectedGrammar[key]),
  );
}

function actionLabel(caseDefinition: CaseDefinition, session: GameSession, sceneId: string): string {
  const actionId = session.selectedActions[sceneId];
  return caseDefinition.actions.find((action) => action.id === actionId)?.label ?? "Sin selección";
}

function fillTemplate(
  template: string,
  caseDefinition: CaseDefinition,
  session: GameSession,
): string {
  return template.replace(/\{\{(action|grammar):([a-zA-Z0-9-]+)\}\}/g, (_match, kind, id) => {
    if (kind === "action") return actionLabel(caseDefinition, session, id);
    return optionLabel(caseDefinition, id as GrammarKey, session.selectedGrammar[id as GrammarKey]);
  });
}

const JOURNAL_PROPERTY: Record<JournalField, keyof JournalEntry> = {
  objective: "objective",
  "first-decision": "firstDecision",
  "maintained-decision": "maintainedDecision",
  "revised-decision": "revisedDecision",
  trigger: "trigger",
  "condition-risk": "conditionRisk",
  adaptation: "adaptation",
  "observable-evidence": "observableEvidence",
  "defensible-alternative": "defensibleAlternative",
  "final-grammar": "finalGrammar",
};

/**
 * Enfoques que la bitácora registra como «principios combinados».
 *
 * Hasta aquí eran los declarados por el caso entero. El caso 3 declara un proceso y dos lentes, y
 * sólo una lente llega a elegirse: anotar las tres afirmaría una combinación que el recorrido no
 * hizo. Cuando alguna acción del caso declara su tradición mandan las acciones elegidas, en el
 * orden que fija el caso para que la bitácora sea reproducible; cuando ninguna la declara se
 * conserva el comportamiento anterior sin tocar nada.
 */
function combinedApproaches(
  caseDefinition: CaseDefinition,
  session: GameSession,
): CaseDefinition["approachIds"] {
  if (!caseDefinition.actions.some((action) => action.approachIds?.length)) {
    return caseDefinition.approachIds;
  }
  const chosen = new Set(
    Object.values(session.selectedActions).flatMap(
      (actionId) =>
        caseDefinition.actions.find((candidate) => candidate.id === actionId)?.approachIds ?? [],
    ),
  );
  return caseDefinition.approachIds.filter((approachId) => chosen.has(approachId));
}

export function buildJournalEntry(
  caseDefinition: CaseDefinition,
  session: GameSession,
  now: string,
  attemptId: string,
): JournalEntry {
  if (!caseDefinition.journalTemplate) throw new Error("El caso no define plantilla de bitácora");
  const entry: JournalEntry = {
    caseId: caseDefinition.id,
    attemptId,
    completedAt: now,
    objective: "",
    firstDecision: "",
    maintainedDecision: "",
    revisedDecision: "",
    trigger: "",
    conditionRisk: "",
    adaptation: "",
    observableEvidence: "",
    defensibleAlternative: "",
    finalGrammar: "",
    combinedApproachIds: combinedApproaches(caseDefinition, session),
  };
  for (const [field, template] of Object.entries(caseDefinition.journalTemplate)) {
    const property = JOURNAL_PROPERTY[field as JournalField];
    if (property && property !== "combinedApproachIds") {
      (entry[property] as string) = fillTemplate(template, caseDefinition, session);
    }
  }
  return entry;
}
