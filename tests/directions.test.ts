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

  it("D2 acompaña la banda con un equivalente textual que incluye la barrera del grupo", () => {
    const { before } = consequenceExtras("laboratorio", pilot, consequence, session);
    expect(before).toContain("<figcaption>");
    expect(before).toContain(consequence.observables.barrier);
    expect(before).toContain("Equivalente textual");
    // Seis personajes en el caso piloto: la banda se dibuja y queda oculta a tecnología de apoyo.
    expect(before).toContain('class="dir-stage__band"');
    expect((before.match(/dir-stage__figure/g) ?? []).length).toBe(pilot.characterIds.length);
    // La salvaguarda de M2 debe seguir visible en pantalla, no sólo en la documentación.
    expect(before).toContain("no personas concretas");
    expect(before).toContain("ni un recuento");
  });

  it("D2 renuncia a la banda cuando el caso no representa un grupo", () => {
    const tutorial = findPlayableCase("mucho-hacer-poco-aprender") as CaseDefinition;
    const reveal = tutorial.consequences[0] as Consequence;
    const { before } = consequenceExtras(
      "laboratorio", tutorial, reveal, createGameSession(tutorial),
    );
    expect(tutorial.characterIds.length).toBeLessThan(3);
    expect(before).not.toContain("dir-stage__band");
    expect(before).toContain("Equivalente textual");
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
