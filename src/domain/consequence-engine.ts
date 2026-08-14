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
 * produce decenas de combinaciones; si alguna vez se superara este número, el análisis avisa en
 * lugar de tardar indefinidamente o de dar por inalcanzable algo que sí lo es.
 */
export const MAX_TAG_COMBINATIONS = 20_000;

export class TooManyCombinationsError extends Error {
  constructor(readonly total: number) {
    super(
      `El caso admite ${total} combinaciones de decisiones, por encima del límite de ${MAX_TAG_COMBINATIONS}. ` +
        "Divida el caso o reduzca las escenas de elección antes de confiar en el análisis de alcance.",
    );
    this.name = "TooManyCombinationsError";
  }
}

/**
 * Todas las combinaciones de etiquetas que el jugador puede llegar a producir.
 *
 * Es deliberadamente exhaustivo y no aleatorio: un muestreo dejaría pasar exactamente el caso raro
 * que interesa encontrar, que es la combinación sin resultado previsto. Cada escena de elección
 * aporta también la posibilidad de no haber pasado todavía por ella, porque un enlace directo a
 * mitad del caso deja huecos reales.
 */
export function reachableTagSets(caseDefinition: CaseDefinition): Set<string>[] {
  const perScene = choiceScenes(caseDefinition).map((scene) => {
    const options: (readonly string[])[] = [[]];
    for (const actionId of scene.actionIds) {
      const action = caseDefinition.actions.find((candidate) => candidate.id === actionId);
      if (action) options.push(action.tags);
    }
    return options;
  });

  const total = perScene.reduce((product, options) => product * options.length, 1);
  if (total > MAX_TAG_COMBINATIONS) throw new TooManyCombinationsError(total);

  let combinations: string[][] = [[]];
  for (const options of perScene) {
    const next: string[][] = [];
    for (const partial of combinations) {
      for (const option of options) next.push([...partial, ...option]);
    }
    combinations = next;
  }
  return combinations.map((tags) => new Set(tags));
}
