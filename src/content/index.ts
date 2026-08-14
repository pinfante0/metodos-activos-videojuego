import campaignData from "./campaign/campaign.json";
import castData from "./campaign/cast.json";
import pilotCaseData from "./playable/pilot-case.json";
import probeCaseData from "./playable/probe-case.json";
import tutorialData from "./playable/tutorial.json";
import tutorialMaterialData from "./playable/tutorial-material-intruso.json";
import walkthroughData from "./playable/walkthroughs.json";
import type {
  Campaign,
  CampaignUnit,
  CaseDefinition,
  Cast,
  Character,
  Walkthrough,
} from "../domain/contracts";
import {
  validateCampaign,
  validateCaseDefinition,
  validateCast,
  validateWalkthroughCatalogue,
  type ValidationResult,
} from "../domain/validation";

/**
 * Registro único de contenido.
 *
 * Hasta M5 el contenido jugable eran dos archivos que la aplicación conocía por su nombre, y la
 * portada, la ruta de clase y el arnés de medición repetían esos nombres escritos a mano. M6 lo
 * generaliza: aquí se carga todo, se valida al arrancar y todo lo demás —navegación, mapa de
 * campaña, progreso recomendado, rutas de prueba y comprobaciones— se deriva de este registro.
 *
 * La validación es cruzada y ocurre en un orden que importa: el reparto primero, porque los casos
 * se validan contra él; los casos después; la campaña al final, contra los casos que existen de
 * verdad. Un fallo aquí detiene el arranque con el detalle del contrato roto, que es preferible a
 * una campaña que anuncia unidades inexistentes.
 */

function unwrap<T>(result: ValidationResult<T>, what: string): T {
  if (result.ok) return result.value;
  throw new Error(
    `${what} inválido:\n${result.issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n")}`,
  );
}

export const cast: Cast = unwrap(validateCast(castData), "Reparto compartido");

const castIds = new Set(cast.characters.map((character) => character.id));

export function findCharacter(id: string): Character | undefined {
  return cast.characters.find((character) => character.id === id);
}

/**
 * Los casos se declaran en el orden de la campaña; el banco de mecánicas va al final porque no
 * pertenece a ella.
 *
 * `banco-de-mecanicas` es contenido provisional de M6: ejercita el sistema completo —montador de
 * cuatro huecos, etiquetas excluidas, dos incidentes— y **no forma parte de la campaña**. Se llega
 * a él desde las rutas de prueba. M7A y M7B escriben el contenido real de las unidades pendientes;
 * `el-material-intruso` es la primera de ellas.
 */
export const playableCases: CaseDefinition[] = [
  unwrap(validateCaseDefinition(tutorialData, new Set(), castIds), "Tutorial 0"),
  unwrap(validateCaseDefinition(tutorialMaterialData, new Set(), castIds), "Tutorial 1"),
  unwrap(validateCaseDefinition(pilotCaseData, new Set(), castIds), "Caso piloto"),
  unwrap(validateCaseDefinition(probeCaseData, new Set(), castIds), "Banco de mecánicas"),
];

export function findPlayableCase(slug: string): CaseDefinition | undefined {
  return playableCases.find((caseDefinition) => caseDefinition.slug === slug);
}

export function findCaseById(id: string): CaseDefinition | undefined {
  return playableCases.find((caseDefinition) => caseDefinition.id === id);
}

export const campaign: Campaign = unwrap(
  validateCampaign(campaignData, new Set(playableCases.map((item) => item.slug))),
  "Campaña",
);

export const campaignUnits: CampaignUnit[] = [...campaign.units].sort(
  (left, right) => left.order - right.order,
);

/** Unidades que ya tienen contenido. El resto se anuncia como pendiente, nunca se oculta. */
export const playableUnits = campaignUnits.filter(
  (unit): unit is CampaignUnit & { caseSlug: string } => unit.caseSlug !== null,
);

export function findUnitByCaseSlug(slug: string): CampaignUnit | undefined {
  return campaignUnits.find((unit) => unit.caseSlug === slug);
}

export function findUnit(id: string): CampaignUnit | undefined {
  return campaignUnits.find((unit) => unit.id === id);
}

/** Casos que no pertenecen a la campaña: hoy, el banco de mecánicas provisional de M6. */
export const outsideCampaignCases = playableCases.filter(
  (item) => !campaignUnits.some((unit) => unit.caseSlug === item.slug),
);

export const walkthroughs: Walkthrough[] = unwrap(
  validateWalkthroughCatalogue(walkthroughData, playableCases),
  "Catálogo de recorridos",
).walkthroughs;

export function findWalkthrough(id: string): Walkthrough | undefined {
  return walkthroughs.find((walk) => walk.id === id);
}
