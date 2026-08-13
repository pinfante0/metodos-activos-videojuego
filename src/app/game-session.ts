import type {
  CaseDefinition,
  Consequence,
  JournalEntry,
  JournalField,
  Scene,
} from "../domain/contracts";

export type GrammarKey = "objective" | "principleAction" | "conditionRisk" | "adaptation" | "evidence";

export interface GameSession {
  caseId: string;
  sceneId: string;
  selectedActions: Record<string, string>;
  selectedGrammar: Partial<Record<GrammarKey, string>>;
  feedbackConsequenceId?: string;
  completed: boolean;
}

export function createGameSession(caseDefinition: CaseDefinition): GameSession {
  return {
    caseId: caseDefinition.id,
    sceneId: caseDefinition.entrySceneId,
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
  const selectedTags = new Set(
    Object.values(session.selectedActions).flatMap((actionId) =>
      caseDefinition.actions.find((action) => action.id === actionId)?.tags ?? [],
    ),
  );
  const match = scene.rules?.find((rule) =>
    rule.requiredTags.every((tag) => selectedTags.has(tag)),
  );
  const consequenceId =
    match?.consequenceId ?? scene.fallbackConsequenceId ?? scene.consequenceIds[0];
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
  scene: Extract<Scene, { kind: "consequence" | "incident" }>,
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
    combinedApproachIds: caseDefinition.approachIds,
  };
  for (const [field, template] of Object.entries(caseDefinition.journalTemplate)) {
    const property = JOURNAL_PROPERTY[field as JournalField];
    if (property && property !== "combinedApproachIds") {
      (entry[property] as string) = fillTemplate(template, caseDefinition, session);
    }
  }
  return entry;
}
