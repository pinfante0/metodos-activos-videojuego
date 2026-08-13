import { describe, expect, it } from "vitest";
import validCase from "../src/content/fixtures/case.valid.json";
import invalidCase from "../src/content/fixtures/case.invalid.json";
import validResources from "../src/content/fixtures/resources.valid.json";
import invalidResources from "../src/content/fixtures/resources.invalid.json";
import { validateCaseDefinition, validateResourceInventory } from "../src/domain/validation";

describe("contratos de contenido", () => {
  it("acepta la sonda válida y resuelve todas sus referencias", () => {
    const inventory = validateResourceInventory(validResources);
    expect(inventory.ok).toBe(true);
    if (!inventory.ok) return;

    const result = validateCaseDefinition(
      validCase,
      new Set(inventory.value.resources.map((resource) => resource.id)),
    );
    expect(result).toMatchObject({ ok: true });
  });

  it("rechaza datos que intentan introducir una puntuación universal", () => {
    const result = validateCaseDefinition(invalidCase);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.some((issue) => issue.code === "schema")).toBe(true);
  });

  it("rechaza una referencia rota aunque el esquema estructural sea correcto", () => {
    const broken = structuredClone(validCase);
    broken.entrySceneId = "scene-that-does-not-exist";
    const result = validateCaseDefinition(broken);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "broken-reference", path: "entrySceneId" }),
    );
  });

  it("rechaza recursos sonoros sin alternativa, transcripción ni procedencia", () => {
    const result = validateResourceInventory(invalidResources);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "missing-sound-alternative",
        "missing-transcript",
        "missing-source-url",
      ]),
    );
  });
});
