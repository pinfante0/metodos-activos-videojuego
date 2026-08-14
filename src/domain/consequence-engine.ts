import type {
  CaseDefinition,
  ConsequenceRule,
  IncidentRule,
  Scene,
} from "./contracts";

/**
 * Motor determinista de consecuencias e incidentes.
 *
 * En M4 esta lógica vivía dentro de `game-session.ts` y sólo servía a la pantalla de prueba del
 * caso piloto. M6 la extrae porque ahora tiene tres consumidores —el juego, el validador de
 * contenido y las pruebas— y porque el sistema debe poder demostrarse, no sólo ejecutarse.
 *
 * **Determinista** significa aquí tres cosas exigibles:
 *
 * 1. La misma combinación de decisiones produce siempre el mismo resultado, sin azar, sin reloj y
 *    sin depender del orden en que se recorra ninguna estructura.
 * 2. La prioridad es el orden de declaración en el archivo de contenido. No es la regla «más
 *    específica» ni la que más etiquetas comparta: eso obligaría a razonar sobre un desempate
 *    implícito para saber qué verá el alumnado.
 * 3. Siempre hay resultado. Si ninguna regla se cumple, se usa el de reserva declarado; un caso sin
 *    reserva no supera la validación.
 *
 * Lo que el motor **no** hace: no suma, no puntúa y no ordena resultados de mejor a peor. Los tres
 * estados cualitativos son los de M2 y viven en el contenido, no aquí. La regla 7 de
 * `docs/decision_producto_m5.md` no tiene dónde romperse porque no hay ningún acumulador.
 */

export interface TagRule {
  readonly requiredTags: readonly string[];
  readonly forbiddenTags: readonly string[];
}

/** Etiquetas activas: la unión de las que aportan todas las acciones ya elegidas. */
export function activeTags(
  caseDefinition: CaseDefinition,
  selectedActions: Readonly<Record<string, string>>,
): Set<string> {
  const tags = new Set<string>();
  for (const actionId of Object.values(selectedActions)) {
    const action = caseDefinition.actions.find((candidate) => candidate.id === actionId);
    for (const tag of action?.tags ?? []) tags.add(tag);
  }
  return tags;
}

/**
 * Primera regla cumplida en orden de declaración. Una regla se cumple cuando están todas sus
 * etiquetas exigidas y ninguna de las excluidas.
 */
export function firstMatchingRule<T extends TagRule>(
  rules: readonly T[] | undefined,
  tags: ReadonlySet<string>,
): T | undefined {
  return rules?.find(
    (rule) =>
      rule.requiredTags.every((tag) => tags.has(tag)) &&
      !rule.forbiddenTags.some((tag) => tags.has(tag)),
  );
}

export function resolveConsequenceId(
  scene: Extract<Scene, { kind: "consequence" }>,
  tags: ReadonlySet<string>,
): string {
  const match = firstMatchingRule<ConsequenceRule>(scene.rules, tags);
  const resolved = match?.consequenceId ?? scene.fallbackConsequenceId ?? scene.consequenceIds[0];
  if (!resolved) throw new Error(`La escena ${scene.id} no resuelve ninguna consecuencia`);
  return resolved;
}

export function resolveIncidentId(
  scene: Extract<Scene, { kind: "incident" }>,
  tags: ReadonlySet<string>,
): string {
  const match = firstMatchingRule<IncidentRule>(scene.rules, tags);
  const resolved =
    match?.incidentId ?? scene.fallbackIncidentId ?? scene.incidentId ?? scene.incidentIds?.[0];
  if (!resolved) throw new Error(`La escena ${scene.id} no resuelve ningún incidente`);
  return resolved;
}

/** Todos los incidentes que una escena puede llegar a mostrar, declarados de cualquier forma. */
export function declaredIncidentIds(scene: Extract<Scene, { kind: "incident" }>): string[] {
  const ids = [
    ...(scene.incidentIds ?? []),
    ...(scene.rules?.map((rule) => rule.incidentId) ?? []),
    ...(scene.fallbackIncidentId ? [scene.fallbackIncidentId] : []),
    ...(scene.incidentId ? [scene.incidentId] : []),
  ];
  return [...new Set(ids)];
}

/** Escenas en las que el jugador elige y que, por tanto, pueden aportar etiquetas. */
export function choiceScenes(caseDefinition: CaseDefinition) {
  return caseDefinition.scenes.filter(
    (scene): scene is Extract<Scene, { kind: "observation" | "design" | "revision" }> =>
      scene.kind === "observation" || scene.kind === "design" || scene.kind === "revision",
  );
}

/**
 * Límite de la exploración exhaustiva. Un caso del tamaño previsto en `docs/mapa_campana_m2.md`
 * produce decenas de estados; si alguna vez se superara este número, el análisis avisa en
 * lugar de tardar indefinidamente o de dar por inalcanzable algo que sí lo es.
 */
export const MAX_REACHABLE_STATES = 20_000;

export class TooManyReachableStatesError extends Error {
  constructor(readonly total: number) {
    super(
      `El caso admite más de ${total - 1} estados alcanzables, por encima del límite de ${MAX_REACHABLE_STATES}. ` +
        "Divida el caso o reduzca las escenas de elección antes de confiar en el análisis de alcance.",
    );
    this.name = "TooManyReachableStatesError";
  }
}

interface ReachableState {
  readonly sceneId: string;
  readonly selectedActions: Readonly<Record<string, string>>;
}

function stateKey(state: ReachableState): string {
  const selections = Object.entries(state.selectedActions)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([sceneId, actionId]) => `${sceneId}=${actionId}`)
    .join("|");
  return `${state.sceneId}|${selections}`;
}

function tagKey(tags: ReadonlySet<string>): string {
  return [...tags].sort().join("|");
}

/**
 * Transiciones de `game-session.ts` expresadas sin estado de interfaz. La selección se conserva
 * por escena —y se sustituye si un bucle vuelve a ella— para que las etiquetas puedan desaparecer
 * igual que en una sesión real.
 */
function nextReachableStates(
  caseDefinition: CaseDefinition,
  state: ReachableState,
): ReachableState[] {
  const scene = caseDefinition.scenes.find((candidate) => candidate.id === state.sceneId);
  if (!scene || scene.kind === "reflection") return [];

  if (scene.kind === "observation" || scene.kind === "design" || scene.kind === "revision") {
    return scene.actionIds.flatMap((actionId) => {
      const action = caseDefinition.actions.find((candidate) => candidate.id === actionId);
      const consequence = caseDefinition.consequences.find(
        (candidate) => candidate.id === action?.consequenceId,
      );
      if (!action || !consequence) return [];
      const selectedActions = { ...state.selectedActions, [scene.id]: action.id };
      const sceneId = scene.feedbackMode === "deferred"
        ? scene.nextSceneId ?? consequence.nextSceneId ?? scene.id
        : consequence.nextSceneId ?? scene.id;
      return [{ sceneId, selectedActions }];
    });
  }

  if (scene.kind === "consequence") {
    const consequenceId = resolveConsequenceId(
      scene,
      activeTags(caseDefinition, state.selectedActions),
    );
    const consequence = caseDefinition.consequences.find(
      (candidate) => candidate.id === consequenceId,
    );
    return [{
      sceneId: consequence?.nextSceneId ?? scene.nextSceneId ?? scene.id,
      selectedActions: state.selectedActions,
    }];
  }

  if (
    scene.kind === "assembly-review" &&
    caseDefinition.assembly &&
    !caseDefinition.assembly.slots.every((slot) => state.selectedActions[slot.sceneId])
  ) {
    return [];
  }

  return [{
    sceneId: scene.nextSceneId ?? scene.id,
    selectedActions: state.selectedActions,
  }];
}

/**
 * Combinaciones de etiquetas que pueden existir al llegar a cada escena por un recorrido real.
 *
 * Se inicia una exploración desde cada escena porque `#/caso/<slug>/<escena>` permite enlaces
 * directos sin decisiones previas. A partir de ahí sólo se siguen las transiciones que ejecuta la
 * sesión: así nunca se mezclan elecciones de ramas mutuamente excluyentes.
 */
export function reachableTagSetsByScene(
  caseDefinition: CaseDefinition,
): ReadonlyMap<string, Set<string>[]> {
  const queue: ReachableState[] = caseDefinition.scenes.map((scene) => ({
    sceneId: scene.id,
    selectedActions: {},
  }));
  const seen = new Set<string>();
  const tagsByScene = new Map<string, Map<string, Set<string>>>();

  for (let index = 0; index < queue.length; index += 1) {
    const state = queue[index];
    if (!state) continue;
    const key = stateKey(state);
    if (seen.has(key)) continue;
    seen.add(key);
    if (seen.size > MAX_REACHABLE_STATES) throw new TooManyReachableStatesError(seen.size);

    const tags = activeTags(caseDefinition, state.selectedActions);
    const sceneTags = tagsByScene.get(state.sceneId) ?? new Map<string, Set<string>>();
    sceneTags.set(tagKey(tags), tags);
    tagsByScene.set(state.sceneId, sceneTags);

    for (const next of nextReachableStates(caseDefinition, state)) {
      if (!seen.has(stateKey(next))) queue.push(next);
    }
  }

  return new Map(
    [...tagsByScene].map(([sceneId, tagSets]) => [sceneId, [...tagSets.values()]]),
  );
}

/** Todas las combinaciones distintas producidas en algún punto de un recorrido válido. */
export function reachableTagSets(caseDefinition: CaseDefinition): Set<string>[] {
  const unique = new Map<string, Set<string>>();
  for (const tagSets of reachableTagSetsByScene(caseDefinition).values()) {
    for (const tags of tagSets) unique.set(tagKey(tags), tags);
  }
  return [...unique.values()];
}
