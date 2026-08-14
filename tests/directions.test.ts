import { describe, expect, it } from "vitest";
import {
  BASELINE_DIRECTION_ID,
  CANDIDATE_DIRECTIONS,
  DIRECTIONS,
  CRITERIA_LABELS,
  findDirection,
  resolveDirectionId,
  type SoundCueId,
} from "../src/app/direction/catalogue";
import {
  createDirectionPreview,
  DIRECTION_PREVIEW_KEY,
} from "../src/app/direction/direction-preview";
import { MemoryStorage, PROGRESS_STORAGE_KEY } from "../src/infrastructure/progress-repository";
import { hrefFor, parseHash } from "../src/app/router";
import { consequenceExtras } from "../src/app/direction/consequence-extras";
import { findPlayableCase } from "../src/content/playable";
import { createGameSession, type GameSession } from "../src/app/game-session";
import type { CaseDefinition, Consequence } from "../src/domain/contracts";

const EXPECTED_CUES: readonly SoundCueId[] = [
  "decision",
  "consequence-coherent-defensible",
  "consequence-defensible-needs-revision",
  "consequence-incoherent-with-brief",
  "incident",
  "journal",
];

describe("catálogo de direcciones M5", () => {
  it("compara exactamente tres direcciones sobre la línea base gris", () => {
    expect(CANDIDATE_DIRECTIONS).toHaveLength(3);
    expect(DIRECTIONS).toHaveLength(4);
    expect(findDirection(BASELINE_DIRECTION_ID).cues).toHaveLength(0);
  });

  it("describe cada dirección con los cinco criterios acordados y su riesgo", () => {
    for (const direction of DIRECTIONS) {
      for (const [key, label] of CRITERIA_LABELS) {
        expect(direction.criteria[key], `${direction.id} · ${label}`).not.toBe("");
      }
      expect(direction.implemented).not.toBe("");
      expect(direction.described).not.toBe("");
    }
  });

  it("obliga a un equivalente textual para toda señal sonora", () => {
    for (const direction of CANDIDATE_DIRECTIONS) {
      expect(direction.cues.map((cue) => cue.id)).toEqual([...EXPECTED_CUES]);
      for (const cue of direction.cues) {
        expect(cue.textEquivalent.length, `${direction.id} · ${cue.id}`).toBeGreaterThan(0);
        expect(cue.sketch.length, `${direction.id} · ${cue.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("cubre los tres estados cualitativos de consecuencia, sin cuarto estado", () => {
    for (const direction of CANDIDATE_DIRECTIONS) {
      const ratings = direction.cues.filter((cue) => cue.id.startsWith("consequence-"));
      expect(ratings).toHaveLength(3);
    }
  });
});

describe("reversibilidad de la dirección en prueba", () => {
  it("vuelve al gris de M4 ante cualquier valor desconocido", () => {
    const rejected: unknown[] = [null, undefined, "", "otra", 7, { id: "consola" }, ["consola"]];
    for (const value of rejected) {
      expect(resolveDirectionId(value)).toBe("gris");
    }
  });

  it("arranca en gris cuando no hay preferencia guardada", () => {
    expect(createDirectionPreview(new MemoryStorage()).get()).toBe("gris");
    expect(createDirectionPreview(undefined).get()).toBe("gris");
  });

  it("guarda la dirección aparte del progreso versionado", () => {
    const storage = new MemoryStorage();
    const preview = createDirectionPreview(storage);
    preview.set("laboratorio");
    expect(preview.get()).toBe("laboratorio");
    expect(storage.getItem(DIRECTION_PREVIEW_KEY)).toBe("laboratorio");
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
    expect(DIRECTION_PREVIEW_KEY).not.toBe(PROGRESS_STORAGE_KEY);
  });

  it("recupera la dirección al volver a entrar y admite regresar al gris", () => {
    const storage = new MemoryStorage();
    createDirectionPreview(storage).set("cuaderno");
    const again = createDirectionPreview(storage);
    expect(again.get()).toBe("cuaderno");
    again.set("gris");
    expect(createDirectionPreview(storage).get()).toBe("gris");
  });

  it("descarta una preferencia corrupta sin romper el corte", () => {
    const storage = new MemoryStorage();
    storage.setItem(DIRECTION_PREVIEW_KEY, "dirección-inventada");
    expect(createDirectionPreview(storage).get()).toBe("gris");
  });
});

describe("característica experiencial sobre la consecuencia representativa", () => {
  const pilot = findPlayableCase("el-arreglo-que-no-escucha-a-todos") as CaseDefinition;
  const consequence = pilot.consequences.find(
    (item) => item.id === "outcome-coherent",
  ) as Consequence;
  const session: GameSession = {
    ...createGameSession(pilot),
    sceneId: "pilot-first-consequence",
    selectedActions: {
      "pilot-entry": "entry-recording-choice",
      "pilot-process": "process-imitate-explore-vary",
      "pilot-evidence": "evidence-rondo-explain",
    },
  };

  it("no añade nada a la línea base gris", () => {
    expect(consequenceExtras("gris", pilot, consequence, session)).toEqual({ before: "", after: "" });
  });

  it("D1 anota al margen el objetivo del encargo y marca la viñeta como decorativa", () => {
    const { before, after } = consequenceExtras("cuaderno", pilot, consequence, session);
    expect(before).toBe("");
    expect(after).toContain(pilot.learningObjective);
    expect(after).toContain('aria-hidden="true"');
  });

  it("D3 muestra los cuatro observables y el historial de decisiones ya tomadas", () => {
    const { after } = consequenceExtras("consola", pilot, consequence, session);
    for (const value of Object.values(consequence.observables)) {
      expect(after).toContain(value);
    }
    expect(after).toContain("dir-history");
    for (const actionId of Object.values(session.selectedActions)) {
      const label = pilot.actions.find((action) => action.id === actionId)?.label ?? "";
      expect(after).toContain(label);
    }
  });

  it("ninguna dirección introduce puntuación ni recuento de personas", () => {
    for (const direction of ["cuaderno", "laboratorio", "consola"] as const) {
      const { before, after } = consequenceExtras(direction, pilot, consequence, session);
      const html = `${before}${after}`;
      expect(html).not.toMatch(/globalScore|puntuación|puntos|\b\d+\s*\/\s*\d+\b/i);
    }
  });

  it("sólo usa datos que ya existen en el caso, sin inventar contenido pedagógico", () => {
    const { before, after } = consequenceExtras("consola", pilot, consequence, session);
    const html = `${before}${after}`;
    expect(html).not.toContain("Óscar");
    expect(html).not.toContain("Mara");
  });
});

/*
 * Salvaguarda de M2: una consecuencia declara posibilidades plausibles, nunca un diagnóstico ni
 * un recuento de personas. La banda de D2 llegó a dibujar una figura por personaje y a decidir
 * cuántas «decidían» desde el estado cualitativo, es decir, inventaba una distribución que el
 * contenido no declara. Estas pruebas no buscan palabras: comprueban estructuralmente que el
 * marcado de la banda es invariante y que sólo publica los dos observables permitidos.
 */
describe("D2 no puede representar un reparto de personas", () => {
  const everyCase = [
    findPlayableCase("mucho-hacer-poco-aprender") as CaseDefinition,
    findPlayableCase("el-arreglo-que-no-escucha-a-todos") as CaseDefinition,
  ];

  const escapeHtml = (value: string): string =>
    value.replace(/[&<>'"]/g, (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);

  /** Deja el marcado sin lo único que el contenido puede aportar, para comparar el resto. */
  const skeleton = (html: string): string =>
    html
      .replace(/<p><strong>Agencia:<\/strong>[\s\S]*?<\/p>/, "«AGENCIA»")
      .replace(/<p><strong>Barrera:<\/strong>[\s\S]*?<\/p>/, "«BARRERA»")
      .replace(/data-rating="[a-z-]+"/g, 'data-rating="«ESTADO»"');

  const everyConsequence = everyCase.flatMap((caseDefinition) =>
    caseDefinition.consequences.map((consequence) => ({ caseDefinition, consequence })),
  );

  it("cubre todas las consecuencias del tutorial y del caso piloto", () => {
    expect(everyConsequence.length).toBeGreaterThan(15);
  });

  it("produce exactamente el mismo marcado de banda para todas ellas", () => {
    const shapes = new Set<string>();
    for (const { caseDefinition, consequence } of everyConsequence) {
      const { before } = consequenceExtras(
        "laboratorio", caseDefinition, consequence, createGameSession(caseDefinition),
      );
      shapes.add(skeleton(before));
    }
    // Un único esqueleto: nada del contenido puede alterar la forma, el número ni el papel.
    expect(shapes.size).toBe(1);
  });

  it("no contiene ningún elemento por persona", () => {
    for (const { caseDefinition, consequence } of everyConsequence) {
      const { before } = consequenceExtras(
        "laboratorio", caseDefinition, consequence, createGameSession(caseDefinition),
      );
      expect(before).not.toMatch(/<circle/);
      expect(before).not.toMatch(/<g[\s>]/);
      // Dos siluetas continuas y constantes, nunca una por participante.
      expect((before.match(/<path/g) ?? []).length).toBe(2);
    }
  });

  it("no varía con el reparto de personajes que declare el caso", () => {
    const [, pilotCase] = everyCase;
    const consequence = pilotCase!.consequences[0] as Consequence;
    const session = createGameSession(pilotCase!);
    const baseline = consequenceExtras("laboratorio", pilotCase!, consequence, session).before;
    for (const size of [0, 1, 2, 3, 6, 20]) {
      const variant: CaseDefinition = {
        ...pilotCase!,
        characterIds: Array.from({ length: size }, (_, index) => `persona-${index}`),
      };
      expect(consequenceExtras("laboratorio", variant, consequence, session).before).toBe(baseline);
    }
  });

  it("publica los textos exactos de agencia y barrera, y ningún otro observable", () => {
    for (const { caseDefinition, consequence } of everyConsequence) {
      const { before } = consequenceExtras(
        "laboratorio", caseDefinition, consequence, createGameSession(caseDefinition),
      );
      expect(before).toContain(escapeHtml(consequence.observables.agency));
      expect(before).toContain(escapeHtml(consequence.observables.barrier));
      expect(before).not.toContain(escapeHtml(consequence.observables.learning));
      expect(before).not.toContain(escapeHtml(consequence.observables.evidence));
    }
  });

  it("sólo deja que el estado cualitativo llegue como atributo, no como forma", () => {
    const ratings = new Set<string>();
    for (const { caseDefinition, consequence } of everyConsequence) {
      const { before } = consequenceExtras(
        "laboratorio", caseDefinition, consequence, createGameSession(caseDefinition),
      );
      const match = before.match(/data-rating="([a-z-]+)"/);
      expect(match?.[1]).toBe(consequence.rating);
      ratings.add(consequence.rating);
    }
    // Los tres estados aparecen y ninguno cambia el marcado, sólo la iluminación por CSS.
    expect(ratings.size).toBe(3);
  });
});

describe("ruta de comparación", () => {
  it("resuelve y reconstruye #/direcciones", () => {
    expect(parseHash("#/direcciones")).toEqual({ name: "directions" });
    expect(hrefFor({ name: "directions" })).toBe("#/direcciones");
    expect(parseHash(hrefFor({ name: "directions" }))).toEqual({ name: "directions" });
  });

  it("no altera las rutas del contrato M3", () => {
    expect(parseHash("#/")).toEqual({ name: "home" });
    expect(parseHash("#/bitacora")).toEqual({ name: "journal" });
    expect(parseHash("#/prueba-publicacion")).toEqual({ name: "publication-proof" });
    expect(parseHash("#/ruta/clase")).toEqual({ name: "class-route" });
  });
});
