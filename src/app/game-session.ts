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

export const GRAMMAR_KEYS: readonly GrammarKey[] = [
  "objective",
  "principleAction",
  "conditionRisk",
  "adaptation",
  "evidence",
];

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

/**
 * Piezas que la partida permite elegir en un hueco de la justificación.
 *
 * Se filtran por las etiquetas que las decisiones han puesto en juego. Un hueco libre ofrece todas
 * sus piezas; uno ligado a una rama se queda vacío si aún falta alguna decisión, y la pantalla
 * orienta hacia el lugar donde se toma en vez de inventar una defensa.
 */
export type GrammarOption = string | { id: string; label: string; requiredTags?: string[] };

function justificationScene(caseDefinition: CaseDefinition) {
  return caseDefinition.scenes.find(
    (scene): scene is Extract<Scene, { kind: "justification" }> => scene.kind === "justification",
  );
}

/** Un hueco está ligado a ramas en cuanto alguna de sus piezas declara etiquetas. */
function isBranchBound(options: readonly GrammarOption[]): boolean {
  return options.some((option) => typeof option !== "string" && (option.requiredTags?.length ?? 0) > 0);
}

export function grammarChoices(
  caseDefinition: CaseDefinition,
  session: GameSession,
  key: GrammarKey,
): GrammarOption[] {
  const options = justificationScene(caseDefinition)?.grammarOptions[key] ?? [];

  /*
   * Un hueco que no usa `requiredTags` ofrece siempre todas sus piezas. Es lo que necesita una
   * elección genuinamente libre —la evidencia del caso 4— y lo que conserva intacto el
   * comportamiento del tutorial 0, los casos 2, 3 y 6 y el banco de mecánicas, que no lo usan.
   */
  if (!isBranchBound(options)) return [...options];

  /*
   * Y un hueco ligado a ramas ofrece **sólo** las de la rama presente. Si no hay ninguna decisión
   * que case, se queda vacío, **sin reserva**: devolverlas todas sería justo el defecto que
   * `requiredTags` existe para impedir, con el agravante de que ocurriría precisamente cuando no
   * hay recorrido del que hablar —el enlace directo a la justificación—, que es cuando una defensa
   * inventada es más fácil de construir y menos verdadera. De un hueco vacío se encarga
   * `pendingGrammarDecisions`, que dice qué decisión falta y dónde se toma; la pantalla orienta en
   * lugar de rellenarlo.
   *
   * Una pieza puede exigir varias etiquetas, y las exige **todas**: basta que falte una para que no
   * se ofrezca.
   */
  const tags = activeTags(caseDefinition, session.selectedActions);
  return options.filter((option) => {
    if (typeof option === "string" || !option.requiredTags?.length) return true;
    return option.requiredTags.every((tag) => tags.has(tag));
  });
}

/** Un hueco vacío y la escena donde se toma la decisión que lo llenaría. */
export interface PendingGrammarDecision {
  key: GrammarKey;
  /** Primera escena del caso en la que puede elegirse algo que abra este hueco. */
  sceneId: string;
  sceneTitle: string;
}

/**
 * Qué decisiones faltan para poder defender, y dónde se toman.
 *
 * Todo se deriva del contenido: las etiquetas que **le faltan** al hueco, las acciones que las
 * aportan y las escenas a las que esas acciones pertenecen, en el orden en que el caso las declara.
 * No hay ninguna escena escrita a mano, de modo que un caso futuro que ate su gramática obtiene la
 * orientación sin tocar el intérprete.
 *
 * La palabra importante es «faltan». Una pieza puede exigir más de una etiqueta, y entonces mirar
 * las que exige —en lugar de las que aún no están— manda de vuelta a una pantalla ya resuelta: si
 * una pieza pide `a` y `b` y la partida ya tiene `a`, orientar hacia `a` deja a quien juega dando
 * vueltas en la decisión que ya tomó, mientras la que abre el hueco de verdad es `b`. Por eso se
 * descuentan primero las etiquetas activas y sólo se busca dónde se consiguen las restantes.
 */
export function pendingGrammarDecisions(
  caseDefinition: CaseDefinition,
  session: GameSession,
): PendingGrammarDecision[] {
  const scene = justificationScene(caseDefinition);
  if (!scene) return [];
  const active = activeTags(caseDefinition, session.selectedActions);
  const pending: PendingGrammarDecision[] = [];

  for (const key of GRAMMAR_KEYS) {
    const options = scene.grammarOptions[key] ?? [];
    if (!isBranchBound(options)) continue;
    if (grammarChoices(caseDefinition, session, key).length > 0) continue;

    /* Sólo lo que aún no está: una etiqueta ya conseguida no vuelve a pedirse. */
    const missing = new Set(
      options.flatMap((option) =>
        typeof option === "string"
          ? []
          : (option.requiredTags ?? []).filter((tag) => !active.has(tag)),
      ),
    );
    const opens = new Set(
      caseDefinition.actions
        .filter((action) => action.tags.some((tag) => missing.has(tag)))
        .map((action) => action.id),
    );
    const origin = caseDefinition.scenes.find(
      (candidate) =>
        (candidate.kind === "observation" || candidate.kind === "design" || candidate.kind === "revision") &&
        candidate.actionIds.some((actionId) => opens.has(actionId)),
    );
    if (origin) pending.push({ key, sceneId: origin.id, sceneTitle: origin.title });
  }

  return pending;
}

/**
 * Elegir una pieza que la partida no ofrece no hace nada.
 *
 * No lanza: la pantalla ya sólo pinta las disponibles, de modo que llegar aquí con otra significa
 * un envío manipulado o un recorrido que declara una pieza de otra rama. En los dos casos lo
 * correcto es que la justificación no cambie, y que quien lo intente lo note porque la frase sigue
 * incompleta.
 */
export function selectGrammar(
  caseDefinition: CaseDefinition,
  session: GameSession,
  key: GrammarKey,
  optionId: string,
): GameSession {
  const allowed = grammarChoices(caseDefinition, session, key).some((option) =>
    typeof option === "string" ? option === optionId : option.id === optionId,
  );
  if (!allowed) return session;
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
