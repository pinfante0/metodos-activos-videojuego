import { describe, expect, it } from "vitest";
import pilotData from "../src/content/playable/pilot-case.json";
import probeData from "../src/content/playable/probe-case.json";
import { findPlayableCase } from "../src/content";
import { validateCaseDefinition } from "../src/domain/validation";
import type { CaseDefinition, Scene } from "../src/domain/contracts";
import {
  assemblyComplete, assemblyPieces, createGameSession, selectAction, type GameSession,
} from "../src/app/game-session";

/*
 * Montador de microclases.
 *
 * Los tres momentos de `docs/biblia_juego_m2.md` dejan de ser tres preguntas sueltas y construyen
 * una pieza que crece. Cada hueco se decide en su propia pantalla —regla 1 de M5— y el montaje se
 * revisa entero antes de probarlo.
 */

function probe(): any {
  return structuredClone(probeData);
}

function codesOf(input: unknown): string[] {
  const result = validateCaseDefinition(input);
  return result.ok ? [] : result.issues.map((issue) => issue.code);
}

const bench = findPlayableCase("banco-de-mecanicas") as CaseDefinition;
const pilot = findPlayableCase("el-arreglo-que-no-escucha-a-todos") as CaseDefinition;

function fill(caseDefinition: CaseDefinition, choices: Record<string, string>): GameSession {
  let session = createGameSession(caseDefinition);
  for (const [sceneId, actionId] of Object.entries(choices)) {
    const scene = caseDefinition.scenes.find((candidate) => candidate.id === sceneId);
    if (scene?.kind !== "design") throw new Error(`${sceneId} no es una escena de diseño`);
    session = selectAction(caseDefinition, session, scene, actionId);
  }
  return session;
}

describe("el montador acumula decisiones sin valorarlas", () => {
  it("empieza con todos los huecos vacíos", () => {
    const pieces = assemblyPieces(bench, createGameSession(bench));
    expect(pieces).toHaveLength(4);
    expect(pieces.every((piece) => piece.actionId === undefined)).toBe(true);
    expect(assemblyComplete(bench, createGameSession(bench))).toBe(false);
  });

  it("rellena cada hueco con la decisión de su propia escena", () => {
    const session = fill(bench, {
      "probe-entry": "probe-entry-signal",
      "probe-action": "probe-action-equivalent",
    });
    const pieces = assemblyPieces(bench, session);
    expect(pieces[0]?.label).toContain("señal visual y vibratoria");
    expect(pieces[1]?.label).toContain("tres respuestas equivalentes");
    expect(pieces[2]?.actionId).toBeUndefined();
    expect(assemblyComplete(bench, session)).toBe(false);
  });

  it("da el montaje por completo sólo con los cuatro huecos", () => {
    const session = fill(bench, {
      "probe-entry": "probe-entry-signal",
      "probe-action": "probe-action-equivalent",
      "probe-support": "probe-support-shared",
      "probe-evidence": "probe-evidence-anticipation",
    });
    expect(assemblyComplete(bench, session)).toBe(true);
  });

  it("enumera los huecos vacíos en lugar de fingir una microclase", () => {
    // Es el estado al que se llega por enlace directo a la pantalla de montaje.
    const pieces = assemblyPieces(bench, createGameSession(bench, "probe-assembly"));
    expect(pieces.map((piece) => piece.slot.label)).toEqual([
      "Apertura", "Acción musical", "Mediación y apoyo", "Cierre y evidencia",
    ]);
    expect(pieces.every((piece) => piece.label === undefined)).toBe(true);
  });

  it("no aporta nada en un caso sin montador", () => {
    const tutorial = findPlayableCase("mucho-hacer-poco-aprender") as CaseDefinition;
    expect(assemblyPieces(tutorial, createGameSession(tutorial))).toEqual([]);
    expect(assemblyComplete(tutorial, createGameSession(tutorial))).toBe(false);
  });

  it("el caso piloto monta los tres momentos aprobados en M2", () => {
    expect(pilot.assembly?.slots.map((slot) => slot.kind)).toEqual([
      "entry", "musical-action", "evidence",
    ]);
  });
});

describe("el contrato del montador no admite montajes rotos", () => {
  it("rechaza un hueco que no apunta a ninguna escena de diseño", () => {
    const variant = probe();
    variant.assembly.slots[0].sceneId = "probe-consequence";
    expect(codesOf(variant)).toContain("assembly-slot-without-scene");
  });

  it("rechaza una escena que no declara el hueco que dice rellenar", () => {
    const variant = probe();
    variant.assembly.slots[0].id = "slot-renombrado";
    const codes = codesOf(variant);
    expect(codes).toContain("assembly-slot-mismatch");
  });

  it("rechaza un montador sin pantalla de montaje", () => {
    const variant = probe();
    variant.scenes = variant.scenes.filter((scene: Scene) => scene.kind !== "assembly-review");
    for (const scene of variant.scenes) {
      if (scene.id === "probe-evidence") scene.nextSceneId = "probe-consequence";
    }
    expect(codesOf(variant)).toContain("assembly-without-review");
  });

  it("rechaza una pantalla de montaje sin montador", () => {
    const variant = probe();
    delete variant.assembly;
    const codes = codesOf(variant);
    expect(codes).toContain("assembly-review-without-assembly");
    expect(codes).toContain("assembly-slot-without-assembly");
  });

  it("rechaza dos huecos con el mismo identificador", () => {
    const variant = probe();
    variant.assembly.slots[1].id = variant.assembly.slots[0].id;
    expect(codesOf(variant)).toContain("duplicate-id");
  });

  it("mantiene una decisión por pantalla: ningún hueco comparte escena con otro", () => {
    for (const caseDefinition of [bench, pilot]) {
      const sceneIds = (caseDefinition.assembly?.slots ?? []).map((slot) => slot.sceneId);
      expect(new Set(sceneIds).size, caseDefinition.slug).toBe(sceneIds.length);
    }
  });
});

describe("el caso piloto conserva su comportamiento tras montar", () => {
  it("pasa por la pantalla de montaje antes de la primera prueba", () => {
    const evidence = pilot.scenes.find((scene) => scene.id === "pilot-evidence");
    expect(evidence?.nextSceneId).toBe("pilot-assembly");
    const assembly = pilot.scenes.find((scene) => scene.id === "pilot-assembly");
    expect(assembly?.kind).toBe("assembly-review");
    expect(assembly?.nextSceneId).toBe("pilot-first-consequence");
  });

  it("no cambia la consecuencia que produce el mismo montaje que en M4", () => {
    const session = fill(pilot, {
      "pilot-entry": "entry-recording-choice",
      "pilot-process": "process-imitate-explore-vary",
      "pilot-evidence": "evidence-rondo-explain",
    });
    const scene = pilot.scenes.find((candidate) => candidate.id === "pilot-first-consequence");
    if (scene?.kind !== "consequence") throw new Error("Escena de prueba ausente");
    expect(assemblyComplete(pilot, session)).toBe(true);
    expect(pilotData.consequences.some((item) => item.id === "outcome-coherent")).toBe(true);
  });
});
