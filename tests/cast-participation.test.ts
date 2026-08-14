import { describe, expect, it } from "vitest";
import castData from "../src/content/campaign/cast.json";
import pilotData from "../src/content/playable/pilot-case.json";
import probeData from "../src/content/playable/probe-case.json";
import { cast, playableCases } from "../src/content";
import { AGENCY_ROLES, type CaseDefinition, type Consequence } from "../src/domain/contracts";
import { validateCaseDefinition, validateCast } from "../src/domain/validation";

/*
 * La ampliación del contrato decidida en M6. M5 dejó anotado que «ver a quién favorece una
 * decisión» no podía cumplirse porque el contenido no lo declaraba en ninguna parte, y que
 * ampliarlo era la condición previa para que existan personajes.
 *
 * Estas pruebas comprueban dos cosas distintas: que el contenido real declara el reparto, y que las
 * tres salvaguardas de M2 son estructuralmente inviolables. La segunda importa más: sin ella, un
 * lote de contenido escrito en volumen puede convertir a una persona en la barrera permanente del
 * caso sin que nadie lo advierta leyendo caso por caso.
 */

const castIds = new Set(cast.characters.map((character) => character.id));

function pilot(): any {
  return structuredClone(pilotData);
}

function consequence(variant: any, id: string): any {
  return variant.consequences.find((item: Consequence) => item.id === id);
}

function codesOf(input: unknown): string[] {
  const result = validateCaseDefinition(input, new Set(), castIds);
  return result.ok ? [] : result.issues.map((issue) => issue.code);
}

/** Consecuencias que el juego presenta como resultado de un diseño o de una revisión. */
function outcomes(caseDefinition: CaseDefinition): Consequence[] {
  const ids = new Set<string>();
  for (const scene of caseDefinition.scenes) {
    if (scene.kind === "consequence") for (const id of scene.consequenceIds) ids.add(id);
    if (scene.kind === "revision") {
      for (const actionId of scene.actionIds) {
        const action = caseDefinition.actions.find((candidate) => candidate.id === actionId);
        if (action) ids.add(action.consequenceId);
      }
    }
  }
  return caseDefinition.consequences.filter((item) => ids.has(item.id));
}

describe("reparto compartido de la campaña", () => {
  it("valida y describe rasgo funcional, condición y salvaguarda de cada persona", () => {
    const result = validateCast(castData);
    expect(result.ok, JSON.stringify(result.ok ? [] : result.issues)).toBe(true);
    expect(cast.characters).toHaveLength(6);
    for (const character of cast.characters) {
      expect(character.contributes.length, character.id).toBeGreaterThan(20);
      expect(character.conditions.length, character.id).toBeGreaterThan(20);
      expect(character.safeguard.length, character.id).toBeGreaterThan(20);
    }
  });

  it("no admite ningún campo numérico por persona: no hay dónde puntuar a nadie", () => {
    const serialised = JSON.stringify(castData);
    expect(serialised).not.toMatch(/"(score|nivel|level|puntos|points|rating)"/i);
    const withScore = structuredClone(castData) as any;
    withScore.characters[0].score = 7;
    expect(validateCast(withScore).ok).toBe(false);
  });
});

describe("el contenido declara participación donde el juego muestra un resultado", () => {
  it.each(playableCases.filter((item) => item.characterIds.length > 0).map((item) => [item.slug, item] as const))(
    "%s declara el reparto completo en cada resultado",
    (_slug, caseDefinition) => {
      const declared = outcomes(caseDefinition);
      expect(declared.length).toBeGreaterThan(0);
      for (const item of declared) {
        expect(item.participation, item.id).toBeDefined();
        expect(item.participation?.roles.map((entry) => entry.characterId).sort())
          .toEqual([...caseDefinition.characterIds].sort());
      }
    },
  );

  it("declara al menos un resultado en el que alguien queda sin vía, y siempre explicado", () => {
    const excluded = playableCases
      .flatMap((item) => item.consequences)
      .flatMap((item) => item.participation?.roles ?? [])
      .filter((entry) => entry.role === "no-route");
    expect(excluded.length).toBeGreaterThan(0);
    for (const entry of excluded) {
      // La nota debe señalar la decisión de diseño. Sin ella, la ausencia parece un rasgo personal.
      expect(entry.note, entry.characterId).toBeTruthy();
    }
  });

  it("da agencia musical a todas las personas de cada caso en algún resultado", () => {
    for (const caseDefinition of playableCases) {
      for (const characterId of caseDefinition.characterIds) {
        const roles = outcomes(caseDefinition)
          .flatMap((item) => item.participation?.roles ?? [])
          .filter((entry) => entry.characterId === characterId);
        expect(roles.some((entry) => AGENCY_ROLES.includes(entry.role)), `${caseDefinition.slug}/${characterId}`)
          .toBe(true);
      }
    }
  });
});

describe("las tres salvaguardas de M2 son estructuralmente inviolables", () => {
  it("rechaza un caso con reparto que no declara participación en un resultado", () => {
    const variant = pilot();
    delete consequence(variant, "outcome-coherent").participation;
    expect(codesOf(variant)).toContain("missing-participation");
  });

  it("rechaza omitir a una persona del reparto en un resultado", () => {
    const variant = pilot();
    const target = consequence(variant, "outcome-coherent");
    target.participation.roles = target.participation.roles.filter(
      (entry: { characterId: string }) => entry.characterId !== "julia",
    );
    expect(codesOf(variant)).toContain("incomplete-participation");
  });

  it("rechaza convertir a una persona en la barrera permanente del caso", () => {
    const variant = pilot();
    for (const item of variant.consequences) {
      for (const entry of item.participation?.roles ?? []) {
        if (entry.characterId === "ines") {
          entry.role = "no-route";
          entry.note = "Nota que no arregla nada: la exclusión sigue siendo permanente.";
        }
      }
    }
    const codes = codesOf(variant);
    expect(codes).toContain("character-as-barrier");
    expect(codes).toContain("character-without-agency");
  });

  it("rechaza dejar a alguien reducido a ejecutar en todo el caso", () => {
    const variant = pilot();
    for (const item of variant.consequences) {
      for (const entry of item.participation?.roles ?? []) {
        if (entry.characterId === "mara") entry.role = "performs";
      }
    }
    expect(codesOf(variant)).toContain("character-without-agency");
  });

  it("exige explicar qué decisión de diseño deja a alguien sin vía", () => {
    const variant = structuredClone(probeData) as any;
    const target = consequence(variant, "probe-outcome-inaccessible");
    delete target.participation.roles.find((entry: { characterId: string }) => entry.characterId === "ines").note;
    expect(codesOf(variant)).toContain("unexplained-exclusion");
  });

  it("rechaza un personaje que no existe en el reparto compartido", () => {
    const variant = pilot();
    variant.characterIds.push("personaje-inventado");
    expect(codesOf(variant)).toContain("unknown-character");
  });

  it("rechaza declarar en un reparto a alguien ajeno al caso", () => {
    const variant = pilot();
    consequence(variant, "outcome-coherent").participation.roles.push({
      characterId: "un-personaje-de-otro-caso",
      role: "decides",
    });
    expect(codesOf(variant)).toContain("participation-outside-cast");
  });
});
