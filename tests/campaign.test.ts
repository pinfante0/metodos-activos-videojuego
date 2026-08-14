import { describe, expect, it } from "vitest";
import campaignData from "../src/content/campaign/campaign.json";
import { campaign, campaignUnits, playableCases, playableUnits } from "../src/content";
import { validateCampaign } from "../src/domain/validation";
import { createEmptyProgress, type Progress } from "../src/domain/contracts";
import {
  attemptsFor, isUnitCompleted, recommendedCaseId, recommendedUnit, unitCaseId, unitState,
} from "../src/app/campaign-progress";

function clone(): any {
  return structuredClone(campaignData);
}

const slugs = new Set(playableCases.map((item) => item.slug));

/*
 * Las unidades se localizan por su estado y no por su posición: cada entrega de M7 convierte una
 * pendiente en jugable, y una prueba escrita contra `units[1]` deja de comprobar lo que dice su
 * nombre en cuanto esa unidad se escribe.
 */
function indexOfFirst(status: "planned" | "playable"): number {
  const index = campaignData.units.findIndex((unit) => unit.status === status);
  if (index < 0) throw new Error(`La campaña ya no tiene ninguna unidad ${status}`);
  return index;
}

const firstPlanned = indexOfFirst("planned");
const playableUnitIds = campaignUnits.filter((unit) => unit.status === "playable").map((unit) => unit.id);

function progressWith(completedCaseIds: string[]): Progress {
  return { ...createEmptyProgress("2026-08-14T00:00:00.000Z"), completedCaseIds };
}

describe("contrato de campaña", () => {
  it("valida el mapa real contra los casos que existen", () => {
    const result = validateCampaign(campaignData, slugs);
    expect(result.ok, JSON.stringify(result.ok ? [] : result.issues)).toBe(true);
  });

  it("traza las nueve unidades de `docs/mapa_campana_m2.md` en orden consecutivo", () => {
    expect(campaignUnits).toHaveLength(9);
    expect(campaignUnits.map((unit) => unit.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(campaignUnits.filter((unit) => unit.kind === "tutorial")).toHaveLength(2);
    expect(campaignUnits.filter((unit) => unit.kind === "final")).toHaveLength(1);
  });

  it("mantiene la duración prevista dentro del intervalo aprobado en el plan maestro", () => {
    const total = campaignUnits.reduce((sum, unit) => sum + unit.minutes, 0);
    expect(total).toBeGreaterThanOrEqual(campaign.homeMinutes.min);
    expect(total).toBeLessThanOrEqual(campaign.homeMinutes.max);
    expect(total).toBe(84);
  });

  it("rechaza una unidad que se anuncia jugable sin contenido", () => {
    const variant = clone();
    variant.units[firstPlanned].status = "playable";
    const result = validateCampaign(variant, slugs);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.code)).toContain("playable-without-case");
  });

  it("rechaza una unidad pendiente que finge señalar un caso", () => {
    const variant = clone();
    variant.units[firstPlanned].caseSlug = "mucho-hacer-poco-aprender";
    const result = validateCampaign(variant, slugs);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.code)).toContain("planned-with-case");
  });

  it("rechaza un caso inexistente y una secuencia con saltos", () => {
    const variant = clone();
    variant.units[0].caseSlug = "un-caso-que-no-existe";
    variant.units[8].order = 12;
    const result = validateCampaign(variant, slugs);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const codes = result.issues.map((issue) => issue.code);
    expect(codes).toContain("broken-reference");
    expect(codes).toContain("non-consecutive-order");
  });

  it("no deja que los tramos de la ruta de clase digan una duración distinta de la que suman", () => {
    const variant = clone();
    variant.classRoute.segments[0].maxMinutes = 9;
    const result = validateCampaign(variant, slugs);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.code)).toContain("class-route-mismatch");
  });

  it("deriva la ruta presencial de las mismas unidades, sin duplicar contenido", () => {
    expect(campaign.classRoute.minMinutes).toBe(25);
    expect(campaign.classRoute.maxMinutes).toBe(28);
    for (const segment of campaign.classRoute.segments) {
      if (!segment.unitId) continue;
      expect(campaignUnits.some((unit) => unit.id === segment.unitId), segment.id).toBe(true);
    }
  });
});

describe("el progreso orienta y no bloquea", () => {
  it("resuelve el id del caso por su slug aunque ambos identificadores sean distintos", () => {
    const unit = { ...campaignUnits[0]!, caseSlug: "slug-distinto" };
    const caseDefinition = { ...playableCases[0]!, id: "id-interno", slug: "slug-distinto" };
    expect(unitCaseId(unit, [caseDefinition])).toBe("id-interno");
  });

  it("recomienda la primera unidad con contenido que no se ha completado", () => {
    const fresh = progressWith([]);
    expect(recommendedUnit(fresh)?.id).toBe("tutorial-0");
    const afterTutorial = progressWith(["mucho-hacer-poco-aprender"]);
    expect(recommendedUnit(afterTutorial)?.id).toBe("tutorial-1");
    expect(recommendedCaseId(afterTutorial)).toBe("el-material-intruso");
    const afterBothTutorials = progressWith(["mucho-hacer-poco-aprender", "el-material-intruso"]);
    expect(recommendedUnit(afterBothTutorials)?.id).toBe("caso-6");
    expect(recommendedCaseId(afterBothTutorials)).toBe("el-arreglo-que-no-escucha-a-todos");
  });

  it("no recomienda nada cuando ya se ha recorrido todo lo escrito", () => {
    const done = progressWith(playableUnits.map((unit) => unit.caseSlug));
    expect(recommendedUnit(done)).toBeNull();
    expect(recommendedCaseId(done)).toBeNull();
  });

  /*
   * La comprobación que importa: ninguna unidad depende de la anterior. Un enlace docente al caso 6
   * debe abrirlo aunque no se haya tocado el tutorial, tal como fija el plan maestro.
   */
  it("no marca ninguna unidad como inaccesible por no haber completado las anteriores", () => {
    const fresh = progressWith([]);
    const states = campaignUnits.map((unit) => unitState(unit, fresh));
    expect(states).not.toContain("locked");
    for (const unit of playableUnits) {
      expect(["recommended", "available"], unit.id).toContain(unitState(unit, fresh));
    }
  });

  it("distingue completada, recomendada, disponible y pendiente", () => {
    const progress = progressWith(["mucho-hacer-poco-aprender"]);
    const [first, second, third] = playableUnitIds;
    const unitOf = (id?: string) => campaignUnits.find((unit) => unit.id === id)!;
    expect(unitState(unitOf(first), progress)).toBe("completed");
    expect(unitState(unitOf(second), progress)).toBe("recommended");
    expect(unitState(unitOf(third), progress)).toBe("available");
    expect(unitState(campaignUnits[firstPlanned]!, progress)).toBe("planned");
    expect(isUnitCompleted(unitOf(first), progress)).toBe(true);
  });

  it("cuenta los intentos por unidad sin convertirlos en puntuación", () => {
    const progress: Progress = {
      ...progressWith([]),
      attemptsByCase: { "mucho-hacer-poco-aprender": 3 },
    };
    expect(attemptsFor(campaignUnits[0]!, progress)).toBe(3);
    expect(attemptsFor(campaignUnits[1]!, progress)).toBe(0);
  });
});
