import { describe, expect, it } from "vitest";
import pilotData from "../src/content/playable/pilot-case.json";
import tutorialData from "../src/content/playable/tutorial.json";
import { validateCaseDefinition } from "../src/domain/validation";
import {
  buildJournalEntry,
  consequenceForScene,
  createGameSession,
  selectAction,
  selectGrammar,
} from "../src/app/game-session";

function parsed(input: unknown) {
  const result = validateCaseDefinition(input);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.issues.map((issue) => issue.message).join("\n"));
  return result.value;
}

describe("corte vertical dirigido por contenido", () => {
  it("valida el tutorial y el caso completo con todos los campos de bitácora", () => {
    const tutorial = parsed(tutorialData);
    const pilot = parsed(pilotData);
    expect(tutorial.experienceType).toBe("tutorial");
    expect(pilot.scenes.map((scene) => scene.kind)).toEqual(
      expect.arrayContaining(["design", "consequence", "incident", "revision", "justification", "reflection"]),
    );
    expect(pilot.journalFields).toHaveLength(10);
  });

  it("calcula consecuencias distintas desde etiquetas de autoría sin codificar el texto en el motor", () => {
    const pilot = parsed(pilotData);
    let session = createGameSession(pilot);
    session = { ...session, sceneId: "pilot-entry" };
    const entry = pilot.scenes.find((scene) => scene.id === "pilot-entry");
    const process = pilot.scenes.find((scene) => scene.id === "pilot-process");
    const evidence = pilot.scenes.find((scene) => scene.id === "pilot-evidence");
    const consequenceScene = pilot.scenes.find((scene) => scene.id === "pilot-first-consequence");
    if (entry?.kind !== "design" || process?.kind !== "design" || evidence?.kind !== "design" || consequenceScene?.kind !== "consequence") throw new Error("Escenas incompletas");
    session = selectAction(pilot, session, entry, "entry-recording-choice");
    session = selectAction(pilot, session, process, "process-imitate-explore-vary");
    session = selectAction(pilot, session, evidence, "evidence-rondo-explain");
    expect(consequenceForScene(pilot, consequenceScene, session).id).toBe("outcome-coherent");

    session = { ...session, selectedActions: { ...session.selectedActions, "pilot-process": "process-closed-copy" } };
    expect(consequenceForScene(pilot, consequenceScene, session).id).toBe("outcome-copy");
  });

  it("genera una bitácora legible sustituyendo elecciones y gramática", () => {
    const pilot = parsed(pilotData);
    let session = createGameSession(pilot);
    session = {
      ...session,
      selectedActions: {
        "pilot-entry": "entry-recording-choice",
        "pilot-process": "process-imitate-explore-vary",
        "pilot-evidence": "evidence-rondo-explain",
        "pilot-revision": "revision-rotating-decisions",
      },
    };
    session = selectGrammar(session, "objective", "objective-riff");
    session = selectGrammar(session, "principleAction", "principle-recording-create");
    session = selectGrammar(session, "conditionRisk", "risk-affinity-hierarchy");
    session = selectGrammar(session, "adaptation", "adapt-visible-contributions");
    session = selectGrammar(session, "evidence", "evidence-shared-arrangement");
    const entry = buildJournalEntry(
      pilot,
      session,
      "2026-08-13T21:00:00.000Z",
      "00000000-0000-4000-8000-000000000000",
    );
    expect(entry.firstDecision).toContain("Escuchar el bucle");
    expect(entry.revisedDecision).toContain("Reorganizar grupos");
    expect(entry.finalGrammar).not.toContain("{{");
    expect(entry.combinedApproachIds).toEqual(["orff-keetman", "green-pme"]);
  });

  it("permite cambiar textos y títulos del contenido sin modificar el motor", () => {
    const variant = structuredClone(tutorialData);
    variant.title = "Variante de autoría";
    variant.scenes[0]!.introduction = "Una escena alternativa escrita por el equipo docente.";
    variant.actions[0]!.label = "Un indicio nuevo con el mismo contrato.";
    const result = validateCaseDefinition(variant);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(createGameSession(result.value).sceneId).toBe(result.value.entrySceneId);
  });
});
