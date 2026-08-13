import {
  CaseDefinitionSchema,
  ResourceInventorySchema,
  type CaseDefinition,
  type Resource,
  type ResourceInventory,
} from "./contracts";

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

export function validateCaseDefinition(
  input: unknown,
  resourceIds: ReadonlySet<string> = new Set(),
): ValidationResult<CaseDefinition> {
  const parsed = CaseDefinitionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, issues: schemaIssues(parsed.error) };

  const value = parsed.data;
  const issues: ValidationIssue[] = [];
  const sceneIds = new Set(value.scenes.map((scene) => scene.id));
  const actionIds = new Set(value.actions.map((action) => action.id));
  const incidentIds = new Set(value.incidents.map((incident) => incident.id));
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
    }
    if (scene.kind === "incident") {
      const issue = missingReference(
        incidentIds,
        scene.incidentId,
        `scenes.${sceneIndex}.incidentId`,
        "un incidente",
      );
      if (issue) issues.push(issue);
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
