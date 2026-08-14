import { campaignUnits, findCaseById, findUnitByCaseSlug, playableCases } from "../content";
import type { ApproachId, CampaignUnit, CaseDefinition, JournalEntry, Progress } from "../domain/contracts";

/**
 * Progreso leído contra la campaña.
 *
 * En M4 y M5 la recomendación estaba escrita a mano —«si acabas el tutorial, te toca el piloto»— y
 * la portada conocía dos identificadores literales. Aquí se deriva del mapa: la unidad recomendada
 * es la primera de la secuencia que tenga contenido y no esté completada.
 *
 * **Orienta y no bloquea.** No hay ninguna función que impida abrir una unidad, porque el plan
 * maestro lo prohíbe expresamente: quien cambia de dispositivo o entra por un enlace docente debe
 * poder seguir. Lo único que existe es una sugerencia y un estado visible.
 */
export type UnitState = "completed" | "recommended" | "available" | "planned";

export function unitCaseId(
  unit: CampaignUnit,
  cases: readonly CaseDefinition[] = playableCases,
): string | undefined {
  return unit.caseSlug
    ? cases.find((caseDefinition) => caseDefinition.slug === unit.caseSlug)?.id ?? unit.caseSlug
    : undefined;
}

export function isUnitCompleted(unit: CampaignUnit, progress: Progress): boolean {
  const caseId = unitCaseId(unit);
  return caseId !== undefined && progress.completedCaseIds.includes(caseId);
}

/** Primera unidad con contenido que aún no se ha completado. `null` si no queda ninguna. */
export function recommendedUnit(progress: Progress): CampaignUnit | null {
  return (
    campaignUnits.find((unit) => unit.status === "playable" && !isUnitCompleted(unit, progress)) ??
    null
  );
}

export function recommendedCaseId(progress: Progress): string | null {
  const unit = recommendedUnit(progress);
  return unit ? unitCaseId(unit) ?? null : null;
}

export function unitState(unit: CampaignUnit, progress: Progress): UnitState {
  if (unit.status === "planned") return "planned";
  if (isUnitCompleted(unit, progress)) return "completed";
  return recommendedUnit(progress)?.id === unit.id ? "recommended" : "available";
}

export function attemptsFor(unit: CampaignUnit, progress: Progress): number {
  const caseId = unitCaseId(unit);
  return caseId ? progress.attemptsByCase[caseId] ?? 0 : 0;
}

/** Progreso actualizado tras cerrar un caso. La recomendación se recalcula contra la campaña. */
export function withCompletedCase(
  progress: Progress,
  caseId: string,
  entry: JournalEntry,
  now: string,
): Progress {
  const completedCaseIds = [...new Set([...progress.completedCaseIds, caseId])];
  const next: Progress = {
    ...progress,
    updatedAt: now,
    completedCaseIds,
    attemptsByCase: {
      ...progress.attemptsByCase,
      [caseId]: (progress.attemptsByCase[caseId] ?? 0) + 1,
    },
    journal: [...progress.journal, entry],
    recommendedNextCaseId: null,
  };
  return { ...next, recommendedNextCaseId: recommendedCaseId(next) };
}

export interface JournalSummary {
  caseTitles: string[];
  approachIds: ApproachId[];
  maintained?: string;
  revised?: string;
  tension?: string;
  evidence?: string;
}

/**
 * Resumen final de la bitácora, con los campos que fija `docs/biblia_juego_m2.md`, apartado 11.
 * Selecciona de las entradas guardadas; no resume con criterio propio ni puntúa nada.
 */
export function journalSummary(progress: Progress): JournalSummary {
  const entries = progress.journal;
  const last = entries[entries.length - 1];
  return {
    caseTitles: entries.map(
      (entry) => findCaseById(entry.caseId)?.title ?? findUnitByCaseSlug(entry.caseId)?.title ?? entry.caseId,
    ),
    approachIds: [...new Set(entries.flatMap((entry) => entry.combinedApproachIds))],
    maintained: last?.maintainedDecision,
    revised: last?.revisedDecision,
    tension: last?.conditionRisk,
    evidence: last?.observableEvidence,
  };
}
