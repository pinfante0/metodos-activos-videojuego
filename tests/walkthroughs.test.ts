import { describe, expect, it } from "vitest";
import walkthroughData from "../src/content/playable/walkthroughs.json";
import { findPlayableCase, playableCases, walkthroughs } from "../src/content";
import { runWalkthrough } from "../src/app/walkthrough-runner";
import { validateWalkthroughCatalogue } from "../src/domain/validation";
import type { CaseDefinition, Walkthrough } from "../src/domain/contracts";

/*
 * Los recorridos declarados son la ruta de prueba de cada estado difícil, y tienen dos consumidores
 * con una sola fuente: esta simulación pura y el arnés de navegador de `measure-viewports`. Aquí se
 * demuestra la lógica; allí, la pantalla.
 *
 * Bloquearse es un fallo con diagnóstico. En M5 un recorrido que giraba en vacío hasta agotar los
 * pasos terminaba pareciendo correcto, y ese defecto no debe poder repetirse con nueve unidades.
 */

const cases = new Map(playableCases.map((item) => [item.slug, item]));

function caseFor(walk: Walkthrough): CaseDefinition {
  const item = cases.get(walk.caseSlug);
  if (!item) throw new Error(`Sin caso para ${walk.id}`);
  return item;
}

describe("catálogo de recorridos", () => {
  it("valida contra los casos existentes", () => {
    const result = validateWalkthroughCatalogue(walkthroughData, playableCases);
    expect(result.ok, JSON.stringify(result.ok ? [] : result.issues)).toBe(true);
  });

  it("cubre todos los casos jugables", () => {
    const covered = new Set(walkthroughs.map((walk) => walk.caseSlug));
    for (const item of playableCases) expect(covered.has(item.slug), item.slug).toBe(true);
  });

  it("rechaza un recorrido que nombre una acción inexistente", () => {
    const variant = structuredClone(walkthroughData) as any;
    variant.walkthroughs[0].actions.push("una-accion-que-no-existe");
    const result = validateWalkthroughCatalogue(variant, playableCases);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.code)).toContain("broken-reference");
  });
});

describe.each(walkthroughs.map((walk) => [walk.id, walk] as const))("recorrido %s", (_id, walk) => {
  const trace = runWalkthrough(caseFor(walk), walk);

  it("llega a su pantalla de cierre sin bloquearse", () => {
    expect(trace.blocked, trace.blocked ?? "").toBeUndefined();
    expect(trace.completed).toBe(walk.expect.completes);
  });

  it("atraviesa las consecuencias declaradas", () => {
    for (const consequenceId of walk.expect.consequenceIds) {
      expect(trace.consequenceIds, walk.purpose).toContain(consequenceId);
    }
  });

  it("encuentra el incidente que la regla determinista selecciona", () => {
    for (const incidentId of walk.expect.incidentIds) {
      expect(trace.incidentIds, walk.purpose).toContain(incidentId);
    }
    // Un caso no puede mostrar dos incidentes en la misma escena.
    expect(new Set(trace.incidentIds).size).toBe(trace.incidentIds.length);
  });

  it("produce una bitácora legible, sin plantillas sin sustituir", () => {
    expect(trace.journal).toBeDefined();
    if (!trace.journal) return;
    for (const [field, value] of Object.entries(trace.journal)) {
      if (typeof value !== "string") continue;
      expect(value, field).not.toContain("{{");
      expect(value.length, field).toBeGreaterThan(0);
    }
  });

  it("es reproducible: dos ejecuciones dan exactamente el mismo rastro", () => {
    const again = runWalkthrough(caseFor(walk), walk);
    expect(again.scenes).toEqual(trace.scenes);
    expect(again.consequenceIds).toEqual(trace.consequenceIds);
    expect(again.incidentIds).toEqual(trace.incidentIds);
  });
});

describe("un recorrido que deja de existir falla en lugar de improvisar", () => {
  it("se bloquea con diagnóstico si la acción prevista ya no se ofrece", () => {
    const tutorial = findPlayableCase("mucho-hacer-poco-aprender") as CaseDefinition;
    const trace = runWalkthrough(tutorial, {
      id: "inventado", caseSlug: tutorial.slug, name: "Inventado",
      purpose: "Comprobar el diagnóstico", actions: ["repair-phrase-response"],
      viewportCoverage: "reference",
      expect: { consequenceIds: [], incidentIds: [], completes: true },
    });
    expect(trace.completed).toBe(false);
    expect(trace.blocked).toContain("ninguna acción prevista");
  });

  it("se bloquea si el recorrido gira en vacío hasta agotar los pasos", () => {
    const tutorial = findPlayableCase("mucho-hacer-poco-aprender") as CaseDefinition;
    const trace = runWalkthrough(
      tutorial,
      {
        id: "en-vacio", caseSlug: tutorial.slug, name: "En vacío",
        purpose: "Comprobar el límite de pasos", actions: ["observe-movement"],
        viewportCoverage: "reference",
        expect: { consequenceIds: [], incidentIds: [], completes: true },
      },
      4,
    );
    expect(trace.completed).toBe(false);
    expect(trace.blocked).toBeTruthy();
  });
});
