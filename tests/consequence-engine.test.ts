import { describe, expect, it } from "vitest";
import probeData from "../src/content/playable/probe-case.json";
import { findPlayableCase, playableCases } from "../src/content";
import {
  activeTags, declaredIncidentIds, firstMatchingRule, MAX_TAG_COMBINATIONS, reachableTagSets,
  resolveConsequenceId, resolveIncidentId, TooManyCombinationsError,
} from "../src/domain/consequence-engine";
import { validateCaseDefinition } from "../src/domain/validation";
import type { CaseDefinition, Scene } from "../src/domain/contracts";

function probe(): any {
  return structuredClone(probeData);
}

function codesOf(input: unknown): string[] {
  const result = validateCaseDefinition(input);
  return result.ok ? [] : result.issues.map((issue) => issue.code);
}

function sceneOf<K extends Scene["kind"]>(
  caseDefinition: CaseDefinition,
  id: string,
  kind: K,
): Extract<Scene, { kind: K }> {
  const scene = caseDefinition.scenes.find((candidate) => candidate.id === id);
  if (scene?.kind !== kind) throw new Error(`La escena ${id} no es de tipo ${kind}`);
  return scene as Extract<Scene, { kind: K }>;
}

const bench = findPlayableCase("banco-de-mecanicas") as CaseDefinition;
const consequenceScene = sceneOf(bench, "probe-consequence", "consequence");
const incidentScene = sceneOf(bench, "probe-incident", "incident");

describe("el motor de consecuencias es determinista", () => {
  it("da siempre el mismo resultado para las mismas decisiones", () => {
    const tags = new Set(["entry-multimodal", "action-equivalent", "evidence-strong"]);
    const results = Array.from({ length: 20 }, () => resolveConsequenceId(consequenceScene, tags));
    expect(new Set(results).size).toBe(1);
    expect(results[0]).toBe("probe-outcome-shared");
  });

  it("respeta el orden de declaración como prioridad, no la especificidad", () => {
    const rules = [
      { requiredTags: ["a"], forbiddenTags: [], consequenceId: "primera" },
      { requiredTags: ["a", "b"], forbiddenTags: [], consequenceId: "segunda-mas-especifica" },
    ];
    // La segunda regla es más específica y aun así no gana: la prioridad se lee en el archivo.
    expect(firstMatchingRule(rules, new Set(["a", "b"]))?.consequenceId).toBe("primera");
  });

  it("distingue dos reglas con las mismas etiquetas exigidas mediante una excluida", () => {
    const shared = ["entry-multimodal", "action-equivalent", "evidence-strong"];
    expect(resolveConsequenceId(consequenceScene, new Set([...shared, "support-shared"])))
      .toBe("probe-outcome-shared");
    expect(resolveConsequenceId(consequenceScene, new Set([...shared, "support-centralised"])))
      .toBe("probe-outcome-teacher-led");
  });

  it("usa el resultado de reserva cuando ninguna regla se cumple", () => {
    expect(resolveConsequenceId(consequenceScene, new Set())).toBe("probe-outcome-weak");
  });

  it("reúne las etiquetas de todas las decisiones ya tomadas", () => {
    const tags = activeTags(bench, {
      "probe-entry": "probe-entry-signal",
      "probe-support": "probe-support-teacher-only",
    });
    expect([...tags].sort()).toEqual(["entry-multimodal", "support-centralised"]);
  });

  it("no acumula nada: no existe ningún marcador que pueda convertirse en puntuación", () => {
    const serialised = JSON.stringify(probeData);
    expect(serialised).not.toMatch(/"(score|points|puntos|weight|peso|nivel)"/i);
  });
});

describe("el motor elige el incidente por la misma vía", () => {
  it("aplica la regla cuando la etiqueta está presente", () => {
    expect(resolveIncidentId(incidentScene, new Set(["entry-audio-only"]))).toBe("probe-incident-access");
  });

  it("cae en el incidente de reserva cuando no se cumple ninguna regla", () => {
    expect(resolveIncidentId(incidentScene, new Set(["entry-multimodal"]))).toBe("probe-incident-time");
  });

  it("enumera todos los incidentes que una escena puede llegar a mostrar", () => {
    expect(declaredIncidentIds(incidentScene).sort()).toEqual([
      "probe-incident-access",
      "probe-incident-time",
    ]);
  });

  it("exige un incidente de reserva a toda escena con reglas", () => {
    const variant = probe();
    delete variant.scenes.find((scene: Scene) => scene.id === "probe-incident").fallbackIncidentId;
    expect(codesOf(variant)).toContain("missing-incident-fallback");
  });
});

describe("el validador recorre todas las combinaciones posibles", () => {
  it("enumera de forma exhaustiva y no por muestreo", () => {
    // Seis escenas de elección. Cada una aporta sus acciones y la posibilidad de no haber pasado
    // todavía por ella, porque un enlace directo a mitad del caso deja huecos reales.
    const sets = reachableTagSets(bench);
    expect(sets.length).toBe(3 * 3 * 3 * 3 * 3 * 4);
    expect(sets.length).toBeLessThan(MAX_TAG_COMBINATIONS);
  });

  it("detecta una regla que otra anterior tapa siempre", () => {
    const variant = probe();
    const scene = variant.scenes.find((item: Scene) => item.id === "probe-consequence");
    // Idéntica a la primera regla pero después: no puede activarse nunca.
    scene.rules.splice(1, 0, {
      requiredTags: ["entry-multimodal", "action-equivalent", "evidence-strong"],
      forbiddenTags: ["support-centralised"],
      consequenceId: "probe-outcome-weak",
    });
    expect(codesOf(variant)).toContain("shadowed-rule");
  });

  it("detecta una consecuencia declarada que ninguna combinación produce", () => {
    const variant = probe();
    const scene = variant.scenes.find((item: Scene) => item.id === "probe-consequence");
    scene.rules = scene.rules.filter((rule: { consequenceId: string }) => rule.consequenceId !== "probe-outcome-teacher-led");
    expect(codesOf(variant)).toContain("unreachable-consequence");
  });

  it("detecta una etiqueta que ninguna acción aporta", () => {
    const variant = probe();
    variant.scenes.find((item: Scene) => item.id === "probe-consequence").rules[0].requiredTags.push("etiqueta-fantasma");
    expect(codesOf(variant)).toContain("unknown-tag");
  });

  it("detecta una regla que produce un resultado no declarado por la escena", () => {
    const variant = probe();
    const scene = variant.scenes.find((item: Scene) => item.id === "probe-consequence");
    scene.consequenceIds = scene.consequenceIds.filter((id: string) => id !== "probe-outcome-teacher-led");
    expect(codesOf(variant)).toContain("rule-outside-declared-consequences");
  });

  it("exige un resultado de reserva a toda escena de prueba con reglas", () => {
    const variant = probe();
    delete variant.scenes.find((item: Scene) => item.id === "probe-consequence").fallbackConsequenceId;
    expect(codesOf(variant)).toContain("missing-consequence-fallback");
  });

  it("avisa en lugar de tardar indefinidamente si un caso creciera sin medida", () => {
    const variant = probe();
    const scene = variant.scenes.find((item: Scene) => item.id === "probe-entry");
    // Doce escenas de elección con tres opciones cada una superan el límite del análisis.
    for (let index = 0; index < 12; index += 1) {
      variant.scenes.push({ ...structuredClone(scene), id: `probe-relleno-${index}` });
    }
    expect(() => reachableTagSets(variant)).toThrow(TooManyCombinationsError);
    expect(codesOf(variant)).toContain("too-many-combinations");
  });
});

describe("todo el contenido publicado pasa el análisis del motor", () => {
  it.each(playableCases.map((item) => [item.slug, item] as const))(
    "%s no tiene reglas tapadas ni consecuencias inalcanzables",
    (_slug, caseDefinition) => {
      const result = validateCaseDefinition(caseDefinition);
      expect(result.ok, JSON.stringify(result.ok ? [] : result.issues)).toBe(true);
    },
  );
});
