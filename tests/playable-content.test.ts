import { describe, expect, it } from "vitest";
import pilotData from "../src/content/playable/pilot-case.json";
import tutorialData from "../src/content/playable/tutorial.json";
import materialData from "../src/content/playable/tutorial-material-intruso.json";
import walkthroughData from "../src/content/playable/walkthroughs.json";
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

  /*
   * La operación nueva del tutorial 1 es «reparar una variable y predecir su efecto». Predecir sólo
   * enseña algo si el resultado depende de las dos decisiones a la vez: si dependiera sólo de la
   * reparación, la predicción sería decorado y podría acertarse siempre.
   */
  it("hace que el resultado del tutorial 1 dependa de la reparación y de la predicción a la vez", () => {
    const unit = parsed(materialData);
    const scene = unit.scenes.find((item) => item.id === "t1-test");
    if (scene?.kind !== "consequence") throw new Error("Falta la pantalla de prueba");
    const outcome = (repair: string, prediction: string) => {
      const session = {
        ...createGameSession(unit),
        selectedActions: { "t1-repair": repair, "t1-prediction": prediction },
      };
      return consequenceForScene(unit, scene, session).id;
    };

    // Misma reparación, dos predicciones: el resultado cambia.
    expect(outcome("t1-repair-voice-first", "t1-predict-reproduce")).toBe("t1-outcome-voice-matched");
    expect(outcome("t1-repair-voice-first", "t1-predict-variation")).toBe("t1-outcome-voice-mismatch");
    // Misma predicción, dos reparaciones: también.
    expect(outcome("t1-repair-body-explore", "t1-predict-reproduce")).toBe("t1-outcome-body-mismatch");
    expect(outcome("t1-repair-body-explore", "t1-predict-variation")).toBe("t1-outcome-body-matched");
    // Una predicción que se cumple siempre no distingue reparaciones, y eso es lo que enseña.
    expect(outcome("t1-repair-voice-first", "t1-predict-engagement")).toBe("t1-outcome-engagement");
    expect(outcome("t1-repair-body-explore", "t1-predict-engagement")).toBe("t1-outcome-engagement");
  });

  it("no deja pasar un cambio de material como si fuera una reparación", () => {
    const unit = parsed(materialData);
    const scene = unit.scenes.find((item) => item.id === "t1-test");
    if (scene?.kind !== "consequence") throw new Error("Falta la pantalla de prueba");
    const session = {
      ...createGameSession(unit),
      selectedActions: { "t1-repair": "t1-repair-more-material", "t1-prediction": "t1-predict-reproduce" },
    };
    const outcome = consequenceForScene(unit, scene, session);
    expect(outcome.id).toBe("t1-outcome-material");
    expect(outcome.rating).toBe("incoherent-with-brief");
    // Devuelve a la reparación: no bloquea el progreso, pero tampoco da por reparada la escena.
    expect(outcome.nextSceneId).toBe("t1-repair");
  });

  it("mantiene dos reparaciones y dos revisiones defendibles sin declarar una ganadora", () => {
    const unit = parsed(materialData);
    const rating = (id: string) => unit.consequences.find((item) => item.id === id)?.rating;
    expect(rating("t1-outcome-voice-matched")).toBe("coherent-defensible");
    expect(rating("t1-outcome-body-matched")).toBe("coherent-defensible");
    expect(rating("t1-revision-rotate-outcome")).toBe("coherent-defensible");
    expect(rating("t1-revision-decide-outcome")).toBe("coherent-defensible");
    expect(unit.pedagogy.avoidsUniversalWinner).toBe(true);
    expect(unit.approachIds).toEqual(["orff-keetman", "kodaly"]);
  });

  /*
   * Los cuatro bloqueos de la auditoría del tutorial 1. Cada uno se cerró en el contenido y deja
   * aquí su regresión: son defectos de coherencia entre ramas, que no se ven leyendo el archivo
   * seguido y que reaparecen en cuanto se añade una rama nueva.
   */
  describe("tutorial 1 · coherencia entre ramas", () => {
    const unit = parsed(materialData);
    const revealScene = unit.scenes.find((item) => item.id === "t1-reveal");
    if (revealScene?.kind !== "consequence") throw new Error("Falta la pantalla de revelación");

    const reveal = (selectedActions: Record<string, string>) =>
      consequenceForScene(unit, revealScene, { ...createGameSession(unit), selectedActions });

    const REPAIRS = ["t1-repair-voice-first", "t1-repair-body-explore"] as const;
    const REVISIONS = ["t1-revision-rotate-medium", "t1-revision-decide-before-playing"] as const;

    it("cierra con una revelación distinta por cada combinación de reparación y revisión", () => {
      const ids = REPAIRS.flatMap((repair) =>
        REVISIONS.map((revision) => reveal({ "t1-repair": repair, "t1-revision": revision }).id),
      );
      expect(new Set(ids).size, ids.join(", ")).toBe(4);
      // Ninguna revelación puede servir a las dos reparaciones: ahí se coló la afirmación de que
      // la rama de voz había transformado algo que nunca llegó a pedirse.
      const voice = new Set(REVISIONS.map((revision) => reveal({ "t1-repair": REPAIRS[0], "t1-revision": revision }).id));
      const body = REVISIONS.map((revision) => reveal({ "t1-repair": REPAIRS[1], "t1-revision": revision }).id);
      for (const id of body) expect(voice.has(id), id).toBe(false);
    });

    it("no inventa una rama cuando se entra por enlace directo sin decisiones", () => {
      expect(reveal({}).id).toBe("t1-reveal-shared");
      expect(reveal({ "t1-revision": REVISIONS[0] }).id).toBe("t1-reveal-shared");
    });

    it("declara el reparto completo en las cinco revelaciones", () => {
      for (const consequence of unit.consequences.filter((item) => item.id.startsWith("t1-reveal-"))) {
        expect(consequence.participation?.roles.map((entry) => entry.characterId).sort(), consequence.id)
          .toEqual([...unit.characterIds].sort());
      }
    });

    it("nombra en cada rama la mitad del objetivo que le queda pendiente", () => {
      const tension = (id: string) =>
        unit.consequences.find((item) => item.id === id)?.feedback.tension.toLowerCase() ?? "";
      // La rama de voz reconoce y deja pendiente transformar; la de cuerpo, al revés.
      expect(tension("t1-reveal-voice-rotate")).toContain("transformar");
      expect(tension("t1-reveal-voice-decide")).toContain("conserve");
      expect(tension("t1-reveal-body-rotate")).toContain("reconocer");
      expect(tension("t1-reveal-body-decide")).toContain("reconocer");
    });

    it("declara un recorrido para cada acción del tutorial 1", () => {
      const declared = new Set(
        walkthroughData.walkthroughs
          .filter((walk) => walk.caseSlug === unit.slug)
          .flatMap((walk) => walk.actions ?? []),
      );
      // La cobertura declarada es el contrato de M6: una acción sin recorrido es texto pedagógico
      // que ninguna comprobación recorre, ni en la sesión pura ni en el navegador.
      for (const action of unit.actions) {
        expect(declared.has(action.id), `${action.id} no lo consume ningún recorrido declarado`).toBe(true);
      }
    });

    it("guarda en la bitácora una decisión mantenida con su razón, distinta de la revisada", () => {
      const journalFor = (repair: string, revision: string) =>
        buildJournalEntry(
          unit,
          {
            ...createGameSession(unit),
            selectedActions: {
              "t1-observation": "t1-clue-symbol-first",
              "t1-naming": "t1-name-process-authorship",
              "t1-repair": repair,
              "t1-prediction": "t1-predict-reproduce",
              "t1-revision": revision,
            },
          },
          "2026-08-15T00:00:00.000Z",
          "00000000-0000-4000-8000-000000000000",
        );
      const label = (id: string) => unit.actions.find((item) => item.id === id)?.label ?? "";

      for (const repair of REPAIRS) {
        const entry = journalFor(repair, REVISIONS[0]);
        // La decisión mantenida es la reparación que sobrevive al incidente, no la lectura previa.
        expect(entry.maintainedDecision).toContain(label(repair));
        expect(entry.maintainedDecision).toContain("porque");
        expect(entry.maintainedDecision).not.toBe(entry.revisedDecision);
        expect(entry.revisedDecision).toContain(label(REVISIONS[0]));
        expect(entry.revisedDecision).not.toContain(label(repair));
      }
    });
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
