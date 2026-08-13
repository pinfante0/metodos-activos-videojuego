import pilotCaseData from "./pilot-case.json";
import tutorialData from "./tutorial.json";
import { validateCaseDefinition } from "../../domain/validation";
import type { CaseDefinition } from "../../domain/contracts";

function validatedCase(input: unknown): CaseDefinition {
  const result = validateCaseDefinition(input);
  if (!result.ok) {
    throw new Error(
      `Contenido jugable inválido:\n${result.issues
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join("\n")}`,
    );
  }
  return result.value;
}

export const playableCases = [validatedCase(tutorialData), validatedCase(pilotCaseData)];

export function findPlayableCase(slug: string): CaseDefinition | undefined {
  return playableCases.find((caseDefinition) => caseDefinition.slug === slug);
}
