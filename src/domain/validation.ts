import {
  AGENCY_ROLES,
  CampaignSchema,
  CaseDefinitionSchema,
  CastSchema,
  ResourceInventorySchema,
  WalkthroughCatalogueSchema,
  type Campaign,
  type CaseDefinition,
  type Cast,
  type Consequence,
  type Resource,
  type ResourceInventory,
  type WalkthroughCatalogue,
} from "./contracts";
import {
  declaredIncidentIds,
  resolveConsequenceId,
  reachableTagSets,
  TooManyCombinationsError,
} from "./consequence-engine";

export interface ValidationIssue {
  code: string;
  path: string;
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; value: T; issues: [] }
  | { ok: false; issues: ValidationIssue[] };

function schemaIssues(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  return error.issues.map((issue) => ({
    code: "schema",
    path: issue.path.join("."),
    message: issue.message,
  }));
}

function duplicatedIds(ids: string[], path: string): ValidationIssue[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates].map((id) => ({
    code: "duplicate-id",
    path,
    message: `El identificador ${id} está repetido`,
  }));
}

function missingReference(
  available: Set<string>,
  id: string,
  path: string,
  kind: string,
): ValidationIssue | undefined {
  if (available.has(id)) return undefined;
  return {
    code: "broken-reference",
    path,
    message: `No existe ${kind} con id ${id}`,
  };
}

/**
 * Consecuencias que el juego presenta como resultado de un diseño o de una revisión.
 *
 * Son las que deben declarar reparto: son las pantallas donde el juego afirma qué le pasa al aula,
 * y por tanto las únicas donde tiene sentido —y riesgo— decir a quién favorece una decisión. La
 * retroalimentación inmediata de una escena de observación no llega a montar nada, y exigirle un
 * reparto obligaría a inventar una clase que todavía no ha ocurrido.
 */
function outcomeConsequenceIds(value: CaseDefinition): Set<string> {
  const ids = new Set<string>();
  for (const scene of value.scenes) {
    if (scene.kind === "consequence") {
      for (const id of scene.consequenceIds) ids.add(id);
      for (const rule of scene.rules ?? []) ids.add(rule.consequenceId);
      if (scene.fallbackConsequenceId) ids.add(scene.fallbackConsequenceId);
    }
    if (scene.kind === "revision") {
      for (const actionId of scene.actionIds) {
        const action = value.actions.find((candidate) => candidate.id === actionId);
        if (action) ids.add(action.consequenceId);
      }
    }
  }
  return ids;
}

/**
 * Salvaguardas de M2 convertidas en comprobaciones. Aquí es donde la ampliación del contrato deja
 * de ser una promesa: si el reparto declarado convierte a alguien en la barrera permanente del
 * caso, o en decorado permanente, el contenido no valida.
 */
function participationIssues(value: CaseDefinition, castIds?: ReadonlySet<string>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const cast = new Set(value.characterIds);

  if (castIds) {
    value.characterIds.forEach((characterId, index) => {
      if (!castIds.has(characterId)) {
        issues.push({
          code: "unknown-character",
          path: `characterIds.${index}`,
          message: `El personaje ${characterId} no existe en el reparto compartido de la campaña`,
        });
      }
    });
  }

  const outcomes = outcomeConsequenceIds(value);
  const declared: Consequence[] = [];

  value.consequences.forEach((consequence, index) => {
    const path = `consequences.${index}.participation`;
    const isOutcome = outcomes.has(consequence.id);

    if (!consequence.participation) {
      if (isOutcome && cast.size > 0 && value.status !== "contract-probe") {
        issues.push({
          code: "missing-participation",
          path,
          message:
            `La consecuencia ${consequence.id} muestra el resultado de un diseño o una revisión y ` +
            "debe declarar quién participa y cómo; deducirlo de un estado cualitativo está prohibido",
        });
      }
      return;
    }

    declared.push(consequence);
    const seen = new Set<string>();
    consequence.participation.roles.forEach((entry, entryIndex) => {
      if (!cast.has(entry.characterId)) {
        issues.push({
          code: "participation-outside-cast",
          path: `${path}.roles.${entryIndex}`,
          message: `${entry.characterId} no forma parte del reparto declarado por este caso`,
        });
      }
      if (seen.has(entry.characterId)) {
        issues.push({
          code: "duplicate-participation",
          path: `${path}.roles.${entryIndex}`,
          message: `${entry.characterId} aparece dos veces en el mismo reparto`,
        });
      }
      seen.add(entry.characterId);
      if (entry.role === "no-route" && !entry.note) {
        issues.push({
          code: "unexplained-exclusion",
          path: `${path}.roles.${entryIndex}`,
          message:
            `Dejar a ${entry.characterId} sin vía de participación exige explicar qué decisión de ` +
            "diseño lo produce; sin la nota, la ausencia parece un rasgo de la persona",
        });
      }
    });

    for (const characterId of cast) {
      if (!seen.has(characterId)) {
        issues.push({
          code: "incomplete-participation",
          path,
          message:
            `El reparto de ${consequence.id} omite a ${characterId}. Una omisión invita a deducir; ` +
            "toda persona del caso necesita un papel declarado en cada resultado",
        });
      }
    }
  });

  if (declared.length === 0) return issues;

  for (const characterId of cast) {
    const roles = declared.flatMap((consequence) =>
      consequence.participation!.roles.filter((entry) => entry.characterId === characterId),
    );
    if (roles.length === 0) continue;
    if (roles.every((entry) => entry.role === "no-route")) {
      issues.push({
        code: "character-as-barrier",
        path: "consequences",
        message:
          `${characterId} queda sin vía de participación en todos los resultados del caso. Una ` +
          "persona no equivale a una barrera: alguna decisión de diseño debe abrirle una vía",
      });
    }
    if (!roles.some((entry) => AGENCY_ROLES.includes(entry.role))) {
      issues.push({
        code: "character-without-agency",
        path: "consequences",
        message:
          `${characterId} no decide ni propone en ningún resultado del caso. El resto del aula no ` +
          "es decorado y ninguna persona puede quedar reducida a ejecutar",
      });
    }
  }

  return issues;
}

/** Coherencia del montador: cada hueco pertenece a una escena de diseño y a una sola. */
function assemblyIssues(value: CaseDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const reviewScenes = value.scenes.filter((scene) => scene.kind === "assembly-review");

  if (!value.assembly) {
    if (reviewScenes.length > 0) {
      issues.push({
        code: "assembly-review-without-assembly",
        path: "assembly",
        message: "Hay una pantalla de montaje, pero el caso no declara ningún montador",
      });
    }
    for (const scene of value.scenes) {
      if (scene.kind === "design" && scene.assemblySlotId) {
        issues.push({
          code: "assembly-slot-without-assembly",
          path: `scenes.${scene.id}.assemblySlotId`,
          message: `La escena ${scene.id} rellena un hueco de un montador que no existe`,
        });
      }
    }
    return issues;
  }

  issues.push(...duplicatedIds(value.assembly.slots.map((slot) => slot.id), "assembly.slots"));

  const designScenes = new Map(
    value.scenes.filter((scene) => scene.kind === "design").map((scene) => [scene.id, scene]),
  );
  value.assembly.slots.forEach((slot, index) => {
    const scene = designScenes.get(slot.sceneId);
    if (!scene) {
      issues.push({
        code: "assembly-slot-without-scene",
        path: `assembly.slots.${index}.sceneId`,
        message: `El hueco ${slot.id} no apunta a ninguna escena de diseño de este caso`,
      });
      return;
    }
    if (scene.kind === "design" && scene.assemblySlotId !== slot.id) {
      issues.push({
        code: "assembly-slot-mismatch",
        path: `assembly.slots.${index}`,
        message: `La escena ${slot.sceneId} no declara rellenar el hueco ${slot.id}`,
      });
    }
  });

  if (reviewScenes.length === 0) {
    issues.push({
      code: "assembly-without-review",
      path: "scenes",
      message:
        "Un montador necesita una pantalla que muestre el montaje antes de probarlo: sin ella, la " +
        "microclase nunca llega a verse entera",
    });
  }

  return issues;
}

/**
 * Análisis exhaustivo del motor determinista.
 *
 * Recorre todas las combinaciones de decisiones que el jugador puede producir y comprueba tres
 * cosas: que siempre hay un resultado, que ninguna regla queda tapada por otra anterior y que
 * ninguna consecuencia declarada resulta inalcanzable. Una regla tapada o una consecuencia muerta
 * son texto pedagógico escrito que nadie verá nunca, y es exactamente el defecto que un contenido
 * en volumen produce sin que nadie lo note.
 */
function consequenceEngineIssues(value: CaseDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const knownTags = new Set(value.actions.flatMap((action) => action.tags));
  const consequenceIds = new Set(value.consequences.map((consequence) => consequence.id));
  const incidentIds = new Set(value.incidents.map((incident) => incident.id));

  const checkTags = (tags: readonly string[], path: string) => {
    tags.forEach((tag, index) => {
      if (!knownTags.has(tag)) {
        issues.push({
          code: "unknown-tag",
          path: `${path}.${index}`,
          message: `Ninguna acción de este caso aporta la etiqueta ${tag}: la regla no puede cumplirse`,
        });
      }
    });
  };

  value.scenes.forEach((scene, sceneIndex) => {
    if (scene.kind === "incident") {
      const declared = declaredIncidentIds(scene);
      if (declared.length === 0) {
        issues.push({
          code: "incident-scene-without-incident",
          path: `scenes.${sceneIndex}`,
          message: `La escena ${scene.id} no declara ningún incidente`,
        });
      }
      declared.forEach((id) => {
        const issue = missingReference(incidentIds, id, `scenes.${sceneIndex}`, "un incidente");
        if (issue) issues.push(issue);
      });
      if (scene.rules?.length && !scene.fallbackIncidentId && !scene.incidentId) {
        issues.push({
          code: "missing-incident-fallback",
          path: `scenes.${sceneIndex}.fallbackIncidentId`,
          message:
            "Una escena de incidente con reglas necesita un incidente de reserva: si ninguna regla " +
            "se cumple, el recorrido se quedaría sin tensión que revisar",
        });
      }
      scene.rules?.forEach((rule, ruleIndex) => {
        checkTags(rule.requiredTags, `scenes.${sceneIndex}.rules.${ruleIndex}.requiredTags`);
        checkTags(rule.forbiddenTags, `scenes.${sceneIndex}.rules.${ruleIndex}.forbiddenTags`);
      });
    }

    if (scene.kind !== "consequence") return;

    scene.rules?.forEach((rule, ruleIndex) => {
      checkTags(rule.requiredTags, `scenes.${sceneIndex}.rules.${ruleIndex}.requiredTags`);
      checkTags(rule.forbiddenTags, `scenes.${sceneIndex}.rules.${ruleIndex}.forbiddenTags`);
      if (!consequenceIds.has(rule.consequenceId)) return;
      if (!scene.consequenceIds.includes(rule.consequenceId)) {
        issues.push({
          code: "rule-outside-declared-consequences",
          path: `scenes.${sceneIndex}.rules.${ruleIndex}.consequenceId`,
          message:
            `La regla produce ${rule.consequenceId}, que la escena no declara entre sus resultados ` +
            "posibles. La lista declarada debe seguir siendo el índice fiable de lo que puede pasar",
        });
      }
    });

    if (scene.rules?.length && !scene.fallbackConsequenceId) {
      issues.push({
        code: "missing-consequence-fallback",
        path: `scenes.${sceneIndex}.fallbackConsequenceId`,
        message:
          "Una escena de prueba con reglas necesita un resultado de reserva declarado: el motor no " +
          "puede quedarse eligiendo el primero de la lista por accidente",
      });
    }
  });

  let tagSets: Set<string>[];
  try {
    tagSets = reachableTagSets(value);
  } catch (error) {
    if (error instanceof TooManyCombinationsError) {
      issues.push({ code: "too-many-combinations", path: "scenes", message: error.message });
      return issues;
    }
    throw error;
  }

  for (const scene of value.scenes) {
    if (scene.kind !== "consequence") continue;
    const produced = new Set<string>();
    const usedRules = new Set<number>();
    for (const tags of tagSets) {
      produced.add(resolveConsequenceId(scene, tags));
      const ruleIndex = (scene.rules ?? []).findIndex(
        (rule) =>
          rule.requiredTags.every((tag) => tags.has(tag)) &&
          !rule.forbiddenTags.some((tag) => tags.has(tag)),
      );
      if (ruleIndex >= 0) usedRules.add(ruleIndex);
    }
    (scene.rules ?? []).forEach((rule, index) => {
      if (usedRules.has(index)) return;
      issues.push({
        code: "shadowed-rule",
        path: `scenes.${scene.id}.rules.${index}`,
        message:
          `Ninguna combinación de decisiones activa esta regla hacia ${rule.consequenceId}: otra ` +
          "regla anterior la tapa siempre, o sus etiquetas no pueden coincidir",
      });
    });
    for (const consequenceId of scene.consequenceIds) {
      if (produced.has(consequenceId)) continue;
      issues.push({
        code: "unreachable-consequence",
        path: `scenes.${scene.id}.consequenceIds`,
        message:
          `Ninguna combinación de decisiones produce ${consequenceId}. Es retroalimentación escrita ` +
          "que nadie llegaría a leer",
      });
    }
  }

  return issues;
}

export function validateCaseDefinition(
  input: unknown,
  resourceIds: ReadonlySet<string> = new Set(),
  castIds?: ReadonlySet<string>,
): ValidationResult<CaseDefinition> {
  const parsed = CaseDefinitionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, issues: schemaIssues(parsed.error) };

  const value = parsed.data;
  const issues: ValidationIssue[] = [];
  const sceneIds = new Set(value.scenes.map((scene) => scene.id));
  const actionIds = new Set(value.actions.map((action) => action.id));
  const consequenceIds = new Set(value.consequences.map((consequence) => consequence.id));

  issues.push(
    ...duplicatedIds(value.scenes.map((scene) => scene.id), "scenes"),
    ...duplicatedIds(value.actions.map((action) => action.id), "actions"),
    ...duplicatedIds(value.incidents.map((incident) => incident.id), "incidents"),
    ...duplicatedIds(value.consequences.map((consequence) => consequence.id), "consequences"),
  );

  const entryIssue = missingReference(sceneIds, value.entrySceneId, "entrySceneId", "una escena");
  if (entryIssue) issues.push(entryIssue);

  value.actions.forEach((action, index) => {
    const issue = missingReference(
      consequenceIds,
      action.consequenceId,
      `actions.${index}.consequenceId`,
      "una consecuencia",
    );
    if (issue) issues.push(issue);
  });

  value.incidents.forEach((incident, incidentIndex) => {
    incident.revisionActionIds.forEach((actionId, actionIndex) => {
      const issue = missingReference(
        actionIds,
        actionId,
        `incidents.${incidentIndex}.revisionActionIds.${actionIndex}`,
        "una acción",
      );
      if (issue) issues.push(issue);
    });
  });

  value.consequences.forEach((consequence, index) => {
    if (consequence.nextSceneId === null) return;
    const issue = missingReference(
      sceneIds,
      consequence.nextSceneId,
      `consequences.${index}.nextSceneId`,
      "una escena",
    );
    if (issue) issues.push(issue);
  });

  value.scenes.forEach((scene, sceneIndex) => {
    if (scene.nextSceneId) {
      const issue = missingReference(
        sceneIds,
        scene.nextSceneId,
        `scenes.${sceneIndex}.nextSceneId`,
        "una escena",
      );
      if (issue) issues.push(issue);
    }

    scene.resourceIds.forEach((resourceId, resourceIndex) => {
      if (resourceIds.size === 0) return;
      const issue = missingReference(
        new Set(resourceIds),
        resourceId,
        `scenes.${sceneIndex}.resourceIds.${resourceIndex}`,
        "un recurso",
      );
      if (issue) issues.push(issue);
    });

    if (scene.kind === "observation" || scene.kind === "design" || scene.kind === "revision") {
      scene.actionIds.forEach((actionId, actionIndex) => {
        const issue = missingReference(
          actionIds,
          actionId,
          `scenes.${sceneIndex}.actionIds.${actionIndex}`,
          "una acción",
        );
        if (issue) issues.push(issue);
      });
    }
    if (scene.kind === "consequence") {
      scene.consequenceIds.forEach((consequenceId, consequenceIndex) => {
        const issue = missingReference(
          consequenceIds,
          consequenceId,
          `scenes.${sceneIndex}.consequenceIds.${consequenceIndex}`,
          "una consecuencia",
        );
        if (issue) issues.push(issue);
      });
      scene.rules?.forEach((rule, ruleIndex) => {
        const issue = missingReference(
          consequenceIds,
          rule.consequenceId,
          `scenes.${sceneIndex}.rules.${ruleIndex}.consequenceId`,
          "una consecuencia",
        );
        if (issue) issues.push(issue);
      });
      if (scene.fallbackConsequenceId) {
        const issue = missingReference(
          consequenceIds,
          scene.fallbackConsequenceId,
          `scenes.${sceneIndex}.fallbackConsequenceId`,
          "una consecuencia",
        );
        if (issue) issues.push(issue);
      }
    }
  });

  if (!value.lenses.includes("inclusion-accessibility")) {
    issues.push({
      code: "missing-pedagogical-lens",
      path: "lenses",
      message: "Todo caso debe incorporar inclusión y accesibilidad en el diseño central",
    });
  }
  if (!value.lenses.includes("evidence-context")) {
    issues.push({
      code: "missing-pedagogical-lens",
      path: "lenses",
      message: "Todo caso debe hacer explícitas la evidencia y su dependencia del contexto",
    });
  }

  if (value.pedagogy.allowMultipleDefensible) {
    const defensibleCount = value.consequences.filter(
      (consequence) => consequence.rating !== "incoherent-with-brief",
    ).length;
    if (defensibleCount < 2) {
      issues.push({
        code: "missing-defensible-alternative",
        path: "consequences",
        message: "El caso declara alternativas defendibles, pero ofrece menos de dos",
      });
    }
  }

  const requiredJournalFields = [
    "objective",
    "first-decision",
    "maintained-decision",
    "revised-decision",
    "trigger",
    "condition-risk",
    "adaptation",
    "observable-evidence",
    "defensible-alternative",
    "final-grammar",
  ];
  const actualJournalFields = new Set<string>(value.journalFields);
  for (const field of requiredJournalFields) {
    if (!actualJournalFields.has(field)) {
      issues.push({
        code: "incomplete-journal-contract",
        path: "journalFields",
        message: `Falta el campo obligatorio ${field}`,
      });
    }
  }

  if (value.status !== "contract-probe" && !value.journalTemplate) {
    issues.push({
      code: "missing-journal-template",
      path: "journalTemplate",
      message: "Un recorrido jugable necesita textos de bitácora derivados del contenido",
    });
  }

  if (value.journalTemplate) {
    const grammarKeys = new Set([
      "objective",
      "principleAction",
      "conditionRisk",
      "adaptation",
      "evidence",
    ]);
    const choiceSceneIds = new Set(
      value.scenes
        .filter(
          (scene) =>
            scene.kind === "observation" ||
            scene.kind === "design" ||
            scene.kind === "revision",
        )
        .map((scene) => scene.id),
    );
    for (const [field, template] of Object.entries(value.journalTemplate)) {
      for (const match of template.matchAll(/\{\{(action|grammar):([a-zA-Z0-9-]+)\}\}/g)) {
        const [, kind, id] = match;
        if (!kind || !id) continue;
        const valid = kind === "action" ? choiceSceneIds.has(id) : grammarKeys.has(id);
        if (!valid) {
          issues.push({
            code: "broken-template-reference",
            path: `journalTemplate.${field}`,
            message: `La plantilla referencia ${kind}:${id}, que no existe en este caso`,
          });
        }
      }
    }
  }

  issues.push(
    ...assemblyIssues(value),
    ...consequenceEngineIssues(value),
    ...participationIssues(value, castIds),
  );

  return issues.length === 0 ? { ok: true, value, issues: [] } : { ok: false, issues };
}

export function validateCast(input: unknown): ValidationResult<Cast> {
  const parsed = CastSchema.safeParse(input);
  if (!parsed.success) return { ok: false, issues: schemaIssues(parsed.error) };
  const value = parsed.data;
  const issues = duplicatedIds(value.characters.map((character) => character.id), "characters");
  return issues.length === 0 ? { ok: true, value, issues: [] } : { ok: false, issues };
}

/**
 * Coherencia de la campaña. Lo que se comprueba es que el mapa no mienta: que una unidad anunciada
 * como jugable tenga contenido, que una unidad pendiente no finja tenerlo, que la secuencia no
 * salte números y que los tiempos declarados sigan dentro del intervalo aprobado en el plan
 * maestro. Nada de esto bloquea el acceso a una unidad: el progreso orienta y no bloquea.
 */
export function validateCampaign(
  input: unknown,
  caseSlugs: ReadonlySet<string> = new Set(),
): ValidationResult<Campaign> {
  const parsed = CampaignSchema.safeParse(input);
  if (!parsed.success) return { ok: false, issues: schemaIssues(parsed.error) };

  const value = parsed.data;
  const issues = duplicatedIds(value.units.map((unit) => unit.id), "units");
  const unitIds = new Set(value.units.map((unit) => unit.id));

  [...value.units]
    .sort((left, right) => left.order - right.order)
    .forEach((unit, index) => {
      if (unit.order !== index + 1) {
        issues.push({
          code: "non-consecutive-order",
          path: `units.${unit.id}.order`,
          message: `La secuencia recomendada salta del puesto ${index + 1} al ${unit.order}`,
        });
      }
    });

  value.units.forEach((unit) => {
    const path = `units.${unit.id}`;
    if (unit.status === "playable" && !unit.caseSlug) {
      issues.push({
        code: "playable-without-case",
        path,
        message: `${unit.id} se anuncia jugable, pero no señala ningún caso`,
      });
    }
    if (unit.status === "planned" && unit.caseSlug) {
      issues.push({
        code: "planned-with-case",
        path,
        message: `${unit.id} se anuncia pendiente y a la vez señala el caso ${unit.caseSlug}`,
      });
    }
    if (unit.caseSlug && caseSlugs.size > 0 && !caseSlugs.has(unit.caseSlug)) {
      issues.push({
        code: "broken-reference",
        path: `${path}.caseSlug`,
        message: `No existe ningún caso jugable con el identificador ${unit.caseSlug}`,
      });
    }
  });

  const total = value.units.reduce((sum, unit) => sum + unit.minutes, 0);
  if (total < value.homeMinutes.min || total > value.homeMinutes.max) {
    issues.push({
      code: "duration-outside-range",
      path: "units",
      message:
        `La campaña suma ${total} minutos y su intervalo declarado es ${value.homeMinutes.min}-` +
        `${value.homeMinutes.max}. No se rellenan unidades para alcanzar una duración nominal`,
    });
  }

  value.classRoute.segments.forEach((segment, index) => {
    if (segment.unitId && !unitIds.has(segment.unitId)) {
      issues.push({
        code: "broken-reference",
        path: `classRoute.segments.${index}.unitId`,
        message: `El tramo ${segment.id} procede de una unidad inexistente: ${segment.unitId}`,
      });
    }
    if (segment.minMinutes > segment.maxMinutes) {
      issues.push({
        code: "inverted-range",
        path: `classRoute.segments.${index}`,
        message: `El tramo ${segment.id} declara un mínimo mayor que su máximo`,
      });
    }
  });

  const routeMin = value.classRoute.segments.reduce((sum, segment) => sum + segment.minMinutes, 0);
  const routeMax = value.classRoute.segments.reduce((sum, segment) => sum + segment.maxMinutes, 0);
  if (routeMin !== value.classRoute.minMinutes || routeMax !== value.classRoute.maxMinutes) {
    issues.push({
      code: "class-route-mismatch",
      path: "classRoute",
      message:
        `Los tramos suman ${routeMin}-${routeMax} minutos y la ruta declara ` +
        `${value.classRoute.minMinutes}-${value.classRoute.maxMinutes}`,
    });
  }

  return issues.length === 0 ? { ok: true, value, issues: [] } : { ok: false, issues };
}

/** Los recorridos declarados sólo pueden nombrar casos y acciones que existan. */
export function validateWalkthroughCatalogue(
  input: unknown,
  cases: readonly CaseDefinition[],
): ValidationResult<WalkthroughCatalogue> {
  const parsed = WalkthroughCatalogueSchema.safeParse(input);
  if (!parsed.success) return { ok: false, issues: schemaIssues(parsed.error) };

  const value = parsed.data;
  const issues = duplicatedIds(value.walkthroughs.map((walk) => walk.id), "walkthroughs");

  value.walkthroughs.forEach((walk, index) => {
    const target = cases.find((candidate) => candidate.slug === walk.caseSlug);
    if (!target) {
      issues.push({
        code: "broken-reference",
        path: `walkthroughs.${index}.caseSlug`,
        message: `El recorrido ${walk.id} apunta al caso inexistente ${walk.caseSlug}`,
      });
      return;
    }
    const actionIds = new Set(target.actions.map((action) => action.id));
    walk.actions.forEach((actionId, actionIndex) => {
      const issue = missingReference(
        actionIds,
        actionId,
        `walkthroughs.${index}.actions.${actionIndex}`,
        "una acción",
      );
      if (issue) issues.push(issue);
    });
    const consequenceIds = new Set(target.consequences.map((consequence) => consequence.id));
    walk.expect.consequenceIds.forEach((consequenceId, expectIndex) => {
      const issue = missingReference(
        consequenceIds,
        consequenceId,
        `walkthroughs.${index}.expect.consequenceIds.${expectIndex}`,
        "una consecuencia",
      );
      if (issue) issues.push(issue);
    });
    const incidentIds = new Set(target.incidents.map((incident) => incident.id));
    walk.expect.incidentIds.forEach((incidentId, expectIndex) => {
      const issue = missingReference(
        incidentIds,
        incidentId,
        `walkthroughs.${index}.expect.incidentIds.${expectIndex}`,
        "un incidente",
      );
      if (issue) issues.push(issue);
    });
    if (walk.startSceneId && !target.scenes.some((scene) => scene.id === walk.startSceneId)) {
      issues.push({
        code: "broken-reference",
        path: `walkthroughs.${index}.startSceneId`,
        message: `El recorrido ${walk.id} arranca en una escena inexistente: ${walk.startSceneId}`,
      });
    }
  });

  return issues.length === 0 ? { ok: true, value, issues: [] } : { ok: false, issues };
}

function resourceAccessibilityIssues(resource: Resource, index: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const path = `resources.${index}`;
  const soundKinds = new Set(["audio", "music", "effect", "voice", "video"]);

  if (resource.status !== "planned" && !resource.file) {
    issues.push({
      code: "missing-resource-file",
      path: `${path}.file`,
      message: "Un recurso prototipo o final debe señalar su archivo",
    });
  }
  if (resource.kind === "image" && !resource.decorative && !resource.alternatives.altText) {
    issues.push({
      code: "missing-alt-text",
      path: `${path}.alternatives.altText`,
      message: "Una imagen informativa necesita texto alternativo",
    });
  }
  if (
    soundKinds.has(resource.kind) &&
    !resource.alternatives.textEquivalent &&
    !resource.alternatives.visualEquivalent
  ) {
    issues.push({
      code: "missing-sound-alternative",
      path: `${path}.alternatives`,
      message: "Toda información sonora necesita una alternativa textual o visual",
    });
  }
  if (resource.containsSpeech && !resource.alternatives.transcript) {
    issues.push({
      code: "missing-transcript",
      path: `${path}.alternatives.transcript`,
      message: "El habla necesita transcripción",
    });
  }
  if (resource.kind === "video" && resource.containsSpeech && !resource.alternatives.captionsFile) {
    issues.push({
      code: "missing-captions",
      path: `${path}.alternatives.captionsFile`,
      message: "Un vídeo con habla necesita subtítulos",
    });
  }
  if (resource.kind === "animation" && !resource.alternatives.reducedMotionFallback) {
    issues.push({
      code: "missing-reduced-motion-fallback",
      path: `${path}.alternatives.reducedMotionFallback`,
      message: "Toda animación necesita alternativa con movimiento reducido",
    });
  }
  if (resource.source.origin === "licensed" && !resource.source.sourceUrl) {
    issues.push({
      code: "missing-source-url",
      path: `${path}.source.sourceUrl`,
      message: "Un recurso licenciado necesita una URL de procedencia",
    });
  }
  return issues;
}

export function validateResourceInventory(input: unknown): ValidationResult<ResourceInventory> {
  const parsed = ResourceInventorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, issues: schemaIssues(parsed.error) };

  const value = parsed.data;
  const issues = [
    ...duplicatedIds(value.resources.map((resource) => resource.id), "resources"),
    ...value.resources.flatMap(resourceAccessibilityIssues),
  ];
  return issues.length === 0 ? { ok: true, value, issues: [] } : { ok: false, issues };
}
