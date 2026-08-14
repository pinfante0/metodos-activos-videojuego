import { describe, expect, it } from "vitest";
import identityResources from "../src/content/identity/resources.json";
import { IDENTITY_NAME, SOUND_CUES, findCue, type SoundCueId } from "../src/app/identity/identity";
import { stageBand, type StageLight } from "../src/app/identity/stage";
import { validateResourceInventory } from "../src/domain/validation";
import { hrefFor, parseHash } from "../src/app/router";
import { findPlayableCase } from "../src/content/playable";
import type { CaseDefinition } from "../src/domain/contracts";

const EXPECTED_CUES: readonly SoundCueId[] = [
  "decision",
  "consequence-coherent-defensible",
  "consequence-defensible-needs-revision",
  "consequence-incoherent-with-brief",
  "incident",
  "journal",
];

describe("identidad fijada en M5", () => {
  it("declara una sola identidad, ya elegida", () => {
    expect(IDENTITY_NAME).toBe("Aula-laboratorio escénica");
  });

  it("mantiene seis señales sonoras, cada una con equivalente textual", () => {
    expect(SOUND_CUES.map((cue) => cue.id)).toEqual([...EXPECTED_CUES]);
    for (const cue of SOUND_CUES) {
      expect(cue.textEquivalent.length, cue.id).toBeGreaterThan(0);
      expect(cue.sketch.length, cue.id).toBeGreaterThan(0);
      expect(findCue(cue.id)).toBe(cue);
    }
  });

  it("cubre los tres estados cualitativos de consecuencia, sin cuarto estado", () => {
    expect(SOUND_CUES.filter((cue) => cue.id.startsWith("consequence-"))).toHaveLength(3);
  });

  it("retira la ruta de comparación de direcciones", () => {
    expect(parseHash("#/direcciones")).toEqual({ name: "not-found", requested: "/direcciones" });
    const routes = ["home", "publication-proof", "class-route", "journal"] as const;
    for (const name of routes) {
      expect(parseHash(hrefFor({ name }))).toEqual({ name });
    }
    expect(parseHash(hrefFor({ name: "case", slug: "el-arreglo-que-no-escucha-a-todos" })))
      .toEqual({ name: "case", slug: "el-arreglo-que-no-escucha-a-todos" });
  });
});

/*
 * Salvaguarda de M2: una consecuencia declara posibilidades plausibles, nunca un diagnóstico ni un
 * recuento de personas. La identidad admitirá personajes estilizados y diversos cuando el contenido
 * los declare, pero hasta entonces la banda no puede representar a nadie. Estas pruebas no buscan
 * palabras: comprueban estructuralmente que el marcado es invariante.
 */
describe("la banda de escena no puede representar un reparto de personas", () => {
  const LIGHTS: readonly StageLight[] = [
    "coherent-defensible",
    "defensible-needs-revision",
    "incoherent-with-brief",
    "incident",
  ];

  const skeleton = (html: string): string => html.replace(/data-light="[a-z-]+"/, 'data-light="«LUZ»"');

  it("dibuja exactamente el mismo marcado sea cual sea el estado", () => {
    const shapes = new Set(LIGHTS.map((light) => skeleton(stageBand(light))));
    expect(shapes.size).toBe(1);
  });

  it("no contiene ningún elemento por persona", () => {
    for (const light of LIGHTS) {
      const html = stageBand(light);
      expect(html).not.toMatch(/<circle/);
      expect(html).not.toMatch(/<g[\s>]/);
      // Dos siluetas continuas y constantes, nunca una por participante.
      expect((html.match(/<path/g) ?? []).length).toBe(2);
    }
  });

  it("queda oculta a la tecnología de apoyo y no publica ningún texto", () => {
    for (const light of LIGHTS) {
      const html = stageBand(light);
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain('role="presentation"');
      // Sin nodos de texto: si no dice nada, no puede afirmar nada sobre nadie.
      expect(html.replace(/<[^>]*>/g, "").trim()).toBe("");
    }
  });

  it("no expone ningún dato del caso, empezando por el reparto de personajes", () => {
    const pilot = findPlayableCase("el-arreglo-que-no-escucha-a-todos") as CaseDefinition;
    const html = LIGHTS.map((light) => stageBand(light)).join("");
    for (const characterId of pilot.characterIds) {
      expect(html).not.toContain(characterId);
    }
    expect(pilot.characterIds.length).toBeGreaterThan(0);
  });

  it("no introduce puntuación ni recompensa", () => {
    for (const light of LIGHTS) {
      expect(stageBand(light)).not.toMatch(/punto|premio|insignia|nivel|\b\d+\s*\/\s*\d+\b/i);
    }
  });
});

describe("registro de procedencia de la identidad", () => {
  const result = validateResourceInventory(identityResources);

  it("valida contra el contrato de recursos de M3", () => {
    expect(result.ok, JSON.stringify(result.issues)).toBe(true);
  });

  it("registra origen, creador, licencia y atribución en todos los recursos", () => {
    if (!result.ok) throw new Error("inventario inválido");
    expect(result.value.resources.length).toBeGreaterThan(0);
    for (const resource of result.value.resources) {
      expect(resource.source.origin, resource.id).toBe("original");
      expect(resource.source.creator.length, resource.id).toBeGreaterThan(0);
      expect(resource.source.license.length, resource.id).toBeGreaterThan(0);
      expect(resource.source.attribution.length, resource.id).toBeGreaterThan(0);
      // Ningún recurso definitivo todavía: M8 los produce.
      expect(resource.status, resource.id).not.toBe("final");
    }
  });

  it("cubre las seis señales sonoras con su equivalente textual", () => {
    if (!result.ok) throw new Error("inventario inválido");
    const sounds = result.value.resources.filter((resource) => resource.kind === "effect");
    expect(sounds).toHaveLength(SOUND_CUES.length);
    for (const sound of sounds) {
      expect(sound.alternatives.textEquivalent, sound.id).toBeTruthy();
      expect(sound.alternatives.visualEquivalent, sound.id).toBeTruthy();
    }
    const equivalents = sounds.map((sound) => sound.alternatives.textEquivalent);
    for (const cue of SOUND_CUES) {
      expect(equivalents).toContain(cue.textEquivalent);
    }
  });

  it("exige alternativa con movimiento reducido a toda animación", () => {
    if (!result.ok) throw new Error("inventario inválido");
    const animations = result.value.resources.filter((resource) => resource.kind === "animation");
    expect(animations.length).toBeGreaterThan(0);
    for (const animation of animations) {
      expect(animation.alternatives.reducedMotionFallback, animation.id).toBeTruthy();
    }
  });
});
