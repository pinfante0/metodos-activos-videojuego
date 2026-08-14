import { describe, expect, it } from "vitest";
import { findPlayableCase, playableCases } from "../src/content";
import { findTestState, seedJournalEntries, TEST_STATES } from "../src/app/test-states";
import { createGameSession, sceneFor } from "../src/app/game-session";
import { parseHash } from "../src/app/router";

/*
 * Un estado difícil es el que sólo aparece cuando algo ha ido de una manera concreta y al que
 * llegar jugando cuesta varios minutos: por eso es donde nadie mira y donde se rompe la
 * composición. Estas pruebas comprueban que cada ruta declarada sigue apuntando a algo que existe;
 * `pnpm measure:viewports` comprueba después que además cabe en los cinco tamaños.
 */

describe("catálogo de estados difíciles", () => {
  it("tiene identificadores únicos y todos se resuelven", () => {
    const ids = TEST_STATES.map((state) => state.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(findTestState(id)?.id).toBe(id);
    expect(findTestState("no-existe")).toBeUndefined();
  });

  it("explica en cada estado qué comprueba", () => {
    for (const state of TEST_STATES) {
      expect(state.name.length, state.id).toBeGreaterThan(10);
      expect(state.purpose.length, state.id).toBeGreaterThan(40);
    }
  });

  it("apunta a casos, escenas y acciones que existen", () => {
    for (const state of TEST_STATES) {
      if (state.kind !== "case") continue;
      const item = findPlayableCase(state.caseSlug);
      expect(item, state.id).toBeDefined();
      if (!item) continue;
      if (state.sceneId) {
        expect(item.scenes.some((scene) => scene.id === state.sceneId), state.id).toBe(true);
      }
      for (const [sceneId, actionId] of Object.entries(state.selectedActions ?? {})) {
        const scene = item.scenes.find((candidate) => candidate.id === sceneId);
        expect(scene, `${state.id}/${sceneId}`).toBeDefined();
        expect(item.actions.some((action) => action.id === actionId), `${state.id}/${actionId}`).toBe(true);
      }
    }
  });

  it("construye cada estado de caso sin lanzar y en la escena prevista", () => {
    for (const state of TEST_STATES) {
      if (state.kind !== "case") continue;
      const item = findPlayableCase(state.caseSlug);
      if (!item) continue;
      const session = {
        ...createGameSession(item, state.sceneId),
        selectedActions: { ...(state.selectedActions ?? {}) },
      };
      expect(() => sceneFor(item, session), state.id).not.toThrow();
      if (state.sceneId) expect(session.sceneId, state.id).toBe(state.sceneId);
    }
  });

  it("declara enlaces que el contrato de navegación entiende", () => {
    for (const state of TEST_STATES) {
      if (state.kind !== "hash") continue;
      const route = parseHash(state.hash);
      expect(["case", "not-found"], state.id).toContain(route.name);
    }
    expect(parseHash("#/pruebas")).toEqual({ name: "test-index" });
    expect(parseHash("#/prueba/bitacora-llena")).toEqual({ name: "test-state", id: "bitacora-llena" });
  });

  it("cubre los estados que M5 dejó señalados como frágiles", () => {
    const ids = TEST_STATES.map((state) => state.id);
    expect(ids).toContain("bitacora-llena");
    expect(ids).toContain("justificacion-sin-decisiones");
    expect(ids).toContain("almacenamiento-denegado");
    expect(ids).toContain("reparto-sin-via");
  });
});

describe("la bitácora de prueba se construye con el contenido real", () => {
  const entries = seedJournalEntries();

  it("tiene una entrada por caso jugable", () => {
    expect(entries).toHaveLength(playableCases.length);
    expect(new Set(entries.map((entry) => entry.caseId)).size).toBe(playableCases.length);
  });

  it("no contiene ninguna plantilla sin sustituir", () => {
    for (const entry of entries) {
      expect(JSON.stringify(entry)).not.toContain("{{");
    }
  });

  it("no está escrita a mano: cambia si cambia el contenido", () => {
    for (const entry of entries) {
      const item = playableCases.find((candidate) => candidate.id === entry.caseId);
      expect(item, entry.caseId).toBeDefined();
      expect(entry.combinedApproachIds).toEqual(item?.approachIds);
    }
  });
});

describe("un estado difícil no es un modo de trampa", () => {
  it("ninguna ruta de prueba marca casos como completados ni altera el progreso", () => {
    // Los estados de caso viven en una sesión propia (`prueba:<id>`) y sólo el estado de cierre
    // declara `completed`, que es una pantalla, no una entrada guardada.
    const completing = TEST_STATES.filter((state) => state.kind === "case" && state.completed);
    expect(completing).toHaveLength(1);
    for (const state of TEST_STATES) {
      expect(JSON.stringify(state)).not.toMatch(/completedCaseIds|unlock|desbloque/i);
    }
  });
});
