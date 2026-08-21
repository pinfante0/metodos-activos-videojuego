import { describe, expect, it } from "vitest";
import pilotData from "../src/content/playable/pilot-case.json";
import tutorialData from "../src/content/playable/tutorial.json";
import materialData from "../src/content/playable/tutorial-material-intruso.json";
import phraseData from "../src/content/playable/caso-una-frase-dos-entradas.json";
import formData from "../src/content/playable/caso-del-modelo-a-una-forma-propia.json";
import environmentData from "../src/content/playable/caso-un-entorno-que-no-todos-tienen.json";
import campaignData from "../src/content/campaign/campaign.json";
import walkthroughData from "../src/content/playable/walkthroughs.json";
import { validateCaseDefinition, validateWalkthroughCatalogue } from "../src/domain/validation";
import {
  assemblyPieces,
  buildJournalEntry,
  canFinishCase,
  consequenceForScene,
  grammarComplete,
  createGameSession,
  selectAction,
  selectGrammar,
} from "../src/app/game-session";
import { withCompletedCase } from "../src/app/campaign-progress";
import { runWalkthrough } from "../src/app/walkthrough-runner";
import { grammarChoices, pendingGrammarDecisions } from "../src/app/game-session";
import { findPlayableCase, playableCases, walkthroughs as declaredWalkthroughs } from "../src/content";
import { createEmptyProgress, ProgressSchema } from "../src/domain/contracts";

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
    session = selectGrammar(pilot, session, "objective", "objective-riff");
    session = selectGrammar(pilot, session, "principleAction", "principle-recording-create");
    session = selectGrammar(pilot, session, "conditionRisk", "risk-affinity-hierarchy");
    session = selectGrammar(pilot, session, "adaptation", "adapt-visible-contributions");
    session = selectGrammar(pilot, session, "evidence", "evidence-shared-arrangement");
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

  /*
   * Caso 2. La operación nueva es «comparar dos soluciones defendibles», y comparar sólo enseña
   * algo si las dos puertas siguen siendo defendibles al final del recorrido y si cada una deja
   * declarado lo que la otra habría dado. Lo que estas pruebas vigilan es exactamente eso, más las
   * dos maneras de perder la evidencia que el mapa de campaña pide para esta unidad.
   */
  describe("caso 2 · dos entradas para el mismo objetivo", () => {
    const unit = parsed(phraseData);
    const testScene = unit.scenes.find((item) => item.id === "c2-test");
    const revealScene = unit.scenes.find((item) => item.id === "c2-reveal");
    if (testScene?.kind !== "consequence") throw new Error("Falta la pantalla de prueba");
    if (revealScene?.kind !== "consequence") throw new Error("Falta la pantalla de revelación");

    const probe = (selectedActions: Record<string, string>) =>
      consequenceForScene(unit, testScene, { ...createGameSession(unit), selectedActions });
    const reveal = (selectedActions: Record<string, string>) =>
      consequenceForScene(unit, revealScene, { ...createGameSession(unit), selectedActions });

    const outcome = (entry: string, teacher: string) =>
      probe({ "c2-entry": entry, "c2-teacher": teacher });

    const ENTRIES = ["c2-entry-body-listen", "c2-entry-voice-inner"] as const;
    const TEACHERS = ["c2-teacher-improvise-adapt", "c2-teacher-sequence-symbol"] as const;
    const REVISIONS = ["c2-revision-checkable-anticipation", "c2-revision-two-versions"] as const;

    it("hace que el resultado dependa de la puerta de entrada y del papel docente a la vez", () => {
      // Misma puerta, dos papeles docentes: el resultado cambia.
      expect(outcome(ENTRIES[0], "c2-teacher-improvise-adapt").id).toBe("c2-outcome-body-adapt");
      expect(outcome(ENTRIES[0], "c2-teacher-sequence-symbol").id).toBe("c2-outcome-body-sequence");
      // Mismo papel docente, dos puertas: también.
      expect(outcome(ENTRIES[1], "c2-teacher-sequence-symbol").id).toBe("c2-outcome-voice-sequence");
      expect(outcome(ENTRIES[1], "c2-teacher-improvise-adapt").id).toBe("c2-outcome-voice-improvise");
    });

    it("no deja pasar el símbolo por delante ni la entrada marcada por el docente", () => {
      // Las dos tensiones que el mapa de campaña pide para esta unidad, cada una con su vuelta.
      const symbolFirst = outcome("c2-entry-score-count", "c2-teacher-sequence-symbol");
      expect(symbolFirst.id).toBe("c2-outcome-score-first");
      expect(symbolFirst.rating).toBe("incoherent-with-brief");
      expect(symbolFirst.nextSceneId).toBe("c2-entry");

      const cued = outcome(ENTRIES[0], "c2-teacher-count-cues");
      expect(cued.id).toBe("c2-outcome-count-cues");
      expect(cued.rating).toBe("incoherent-with-brief");
      expect(cued.nextSceneId).toBe("c2-teacher");
    });

    it("declara el hueco en lugar de inventar un resultado cuando no hay diseño", () => {
      const undecided = probe({});
      expect(undecided.id).toBe("c2-outcome-undecided");
      expect(undecided.nextSceneId).toBe("c2-entry");
      // Sin decisiones nadie tiene vía, y la ausencia se atribuye al recorrido vacío, no a nadie.
      for (const entry of undecided.participation?.roles ?? []) {
        expect(entry.role, entry.characterId).toBe("no-route");
        expect(entry.note, entry.characterId).toBeTruthy();
      }
    });

    it("mantiene dos puertas defendibles y reconoce que las cuatro pruebas iniciales necesitan revisión", () => {
      const rating = (id: string) => unit.consequences.find((item) => item.id === id)?.rating;
      for (const entry of ENTRIES) {
        for (const teacher of TEACHERS) {
          expect(outcome(entry, teacher).rating, `${entry} + ${teacher}`).toBe("defensible-needs-revision");
        }
      }
      expect(rating("c2-revision-checkable-outcome")).toBe("coherent-defensible");
      expect(rating("c2-revision-two-versions-outcome")).toBe("coherent-defensible");
      expect(unit.pedagogy.avoidsUniversalWinner).toBe(true);
      expect(unit.approachIds).toEqual(["dalcroze", "kodaly"]);
    });

    it("cierra coherentemente las ocho combinaciones de puerta, papel docente y revisión", () => {
      const ids = ENTRIES.flatMap((entry) => REVISIONS.map((revision) =>
        reveal({ "c2-entry": entry, "c2-revision": revision }).id));
      expect(new Set(ids).size, ids.join(", ")).toBe(4);
      for (const entry of ENTRIES) {
        for (const teacher of TEACHERS) {
          for (const revision of REVISIONS) {
            const consequence = reveal({
              "c2-entry": entry,
              "c2-teacher": teacher,
              "c2-revision": revision,
            });
            expect(consequence.rating, `${entry} + ${teacher} + ${revision}`).toBe("coherent-defensible");
            expect(consequence.id).toBe(reveal({ "c2-entry": entry, "c2-revision": revision }).id);
          }
        }
      }
      // Ninguna revelación puede servir a las dos puertas: es donde se colaría afirmar de una lo
      // que sólo la otra hizo posible.
      const body = new Set(
        REVISIONS.map((revision) => reveal({ "c2-entry": ENTRIES[0], "c2-revision": revision }).id),
      );
      for (const revision of REVISIONS) {
        const id = reveal({ "c2-entry": ENTRIES[1], "c2-revision": revision }).id;
        expect(body.has(id), id).toBe(false);
      }
    });

    it("no inventa una rama cuando se entra por enlace directo sin decisiones", () => {
      expect(reveal({}).id).toBe("c2-reveal-shared");
      expect(reveal({ "c2-revision": REVISIONS[0] }).id).toBe("c2-reveal-shared");
    });

    it("declara el reparto completo en las cinco revelaciones", () => {
      const reveals = unit.consequences.filter((item) => item.id.startsWith("c2-reveal-"));
      expect(reveals).toHaveLength(5);
      for (const consequence of reveals) {
        expect(consequence.participation?.roles.map((entry) => entry.characterId).sort(), consequence.id)
          .toEqual([...unit.characterIds].sort());
      }
    });

    it("no deja a nadie sin vía en ninguna de las cuatro ramas defendibles", () => {
      for (const entry of ENTRIES) {
        for (const revision of REVISIONS) {
          const consequence = reveal({ "c2-entry": entry, "c2-revision": revision });
          for (const role of consequence.participation?.roles ?? []) {
            expect(role.role, `${consequence.id}: ${role.characterId}`).not.toBe("no-route");
          }
        }
      }
    });

    it("nombra en cada cierre lo que la otra puerta habría dejado ver", () => {
      const tension = (id: string) =>
        unit.consequences.find((item) => item.id === id)?.feedback.tension.toLowerCase() ?? "";
      // La puerta del cuerpo deja pendiente cantar y representar; la de la voz, observar con el
      // cuerpo cómo responde a una música adaptada en tiempo real.
      expect(tension("c2-reveal-body-checkable")).toContain("cantar");
      expect(tension("c2-reveal-body-versions")).toContain("cantar");
      expect(tension("c2-reveal-voice-checkable")).toContain("corporal");
      expect(tension("c2-reveal-voice-versions")).toContain("corporal");
      expect(tension("c2-reveal-voice-checkable")).not.toContain("cantar");
      expect(tension("c2-reveal-voice-versions")).not.toContain("cantar");
    });

    it("hace defendibles todas las combinaciones ofrecidas por la gramática", () => {
      const grammar = revealScene.nextSceneId
        ? unit.scenes.find((item) => item.id === revealScene.nextSceneId)
        : undefined;
      if (grammar?.kind !== "justification") throw new Error("Falta la justificación del caso 2");
      const label = (option: string | { id: string; label: string }) =>
        (typeof option === "string" ? option : option.label).toLowerCase();

      expect(grammar.grammarOptions.conditionRisk).toHaveLength(2);
      for (const option of grammar.grammarOptions.principleAction) {
        expect(label(option)).toContain("puerta elegida");
      }
      for (const option of grammar.grammarOptions.adaptation) {
        expect(label(option)).toMatch(/visual/);
        expect(label(option)).toMatch(/vibra/);
        expect(label(option)).toMatch(/anunci|variar/);
      }
      for (const option of grammar.grammarOptions.evidence) {
        expect(label(option)).toMatch(/antes|sin copiar/);
      }

      const combinations = grammar.grammarOptions.principleAction.flatMap((principle) =>
        grammar.grammarOptions.conditionRisk.flatMap((risk) =>
          grammar.grammarOptions.adaptation.flatMap((adaptation) =>
            grammar.grammarOptions.evidence.map((evidence) =>
              [label(principle), label(risk), label(adaptation), label(evidence)].join(" ")))));
      expect(combinations).toHaveLength(16);
      for (const sentence of combinations) {
        expect(sentence).toContain("puerta elegida");
        expect(sentence).toMatch(/aire|memoria/);
        expect(sentence).toMatch(/visual/);
        expect(sentence).toMatch(/vibra/);
        expect(sentence).toMatch(/antes|sin copiar/);
      }
    });

    it("cuenta el incidente sin dar por hecha ninguna de las dos puertas", () => {
      expect(unit.incidents).toHaveLength(1);
      const reveal = unit.incidents[0]!.reveal.toLowerCase();
      // El mismo relato sirve a las dos ramas: si hablara de gestos o de canto, estaría afirmando
      // de una clase lo que sólo la otra puerta produjo.
      expect(reveal).not.toContain("gesto");
      expect(reveal).not.toContain("cant");
    });

    it("declara un recorrido para cada acción del caso 2", () => {
      const declared = new Set(
        walkthroughData.walkthroughs
          .filter((walk) => walk.caseSlug === unit.slug)
          .flatMap((walk) => walk.actions ?? []),
      );
      for (const action of unit.actions) {
        expect(declared.has(action.id), `${action.id} no lo consume ningún recorrido declarado`).toBe(true);
      }
    });

    it("guarda la puerta mantenida con su razón, distinta de la revisión", () => {
      const label = (id: string) => unit.actions.find((item) => item.id === id)?.label ?? "";
      for (const entry of ENTRIES) {
        const journal = buildJournalEntry(
          unit,
          {
            ...createGameSession(unit),
            selectedActions: {
              "c2-brief": "c2-brief-enter-on-time",
              "c2-comparison": "c2-compare-door-and-symbol",
              "c2-entry": entry,
              "c2-teacher": "c2-teacher-improvise-adapt",
              "c2-revision": REVISIONS[0],
            },
          },
          "2026-08-15T00:00:00.000Z",
          "00000000-0000-4000-8000-000000000000",
        );
        expect(journal.maintainedDecision).toContain(label(entry));
        expect(journal.maintainedDecision).toContain("porque");
        expect(journal.revisedDecision).toContain(label(REVISIONS[0]));
        expect(journal.revisedDecision).not.toContain(label(entry));
        expect(journal.combinedApproachIds).toEqual(["dalcroze", "kodaly"]);
      }
    });

    it("cierra el caso 2 sin adelantar el contenido de ninguna unidad pendiente", () => {
      if (!unit.completion) throw new Error("Falta el cierre del caso 2");
      const completion = `${unit.completion.title} ${unit.completion.body}`.toLowerCase();
      expect(completion).not.toMatch(/caso 3|caso 4|orff|keetman|willems|martenot|suzuki|m7b|m7c|m8/);
    });
  });

  /*
   * Caso 3. La operación nueva es «montar tres momentos», y montar sólo enseña algo si los tres se
   * leen juntos: cambiar uno tiene que cambiar lo que ocurre en los otros dos. Lo segundo que estas
   * pruebas vigilan es el reparto de peso entre tradiciones. Orff-Keetman es el proceso; Willems y
   * Martenot son lentes que lo sostienen, y una lente no puede acabar ocupando el sitio del proceso
   * ni fundiéndose con él.
   */
  describe("caso 3 · tres momentos que llevan del modelo a una forma propia", () => {
    const unit = parsed(formData);
    const testScene = unit.scenes.find((item) => item.id === "c3-test");
    const revealScene = unit.scenes.find((item) => item.id === "c3-reveal");
    if (testScene?.kind !== "consequence") throw new Error("Falta la pantalla de prueba");
    if (revealScene?.kind !== "consequence") throw new Error("Falta la pantalla de revelación");

    const probe = (selectedActions: Record<string, string>) =>
      consequenceForScene(unit, testScene, { ...createGameSession(unit), selectedActions });
    const reveal = (selectedActions: Record<string, string>) =>
      consequenceForScene(unit, revealScene, { ...createGameSession(unit), selectedActions });

    const outcome = (model: string, explore: string, form: string) =>
      probe({ "c3-model": model, "c3-explore": explore, "c3-form": form });

    const MODELS = ["c3-model-open-echo", "c3-model-closed-echo"] as const;
    const EXPLORES = ["c3-explore-one-trait", "c3-explore-declared-trait"] as const;
    const FORMS = ["c3-form-aba-sustained", "c3-form-listen-and-name"] as const;
    const REVISIONS = ["c3-revision-graded-listening", "c3-revision-prepared-entries"] as const;

    const combinations = MODELS.flatMap((model) =>
      EXPLORES.flatMap((explore) => FORMS.map((form) => [model, explore, form] as const)));

    it("monta los tres momentos del bucle de M2, uno por pantalla", () => {
      expect(unit.assembly?.slots.map((slot) => slot.kind)).toEqual([
        "entry", "musical-action", "evidence",
      ]);
      const sceneIds = (unit.assembly?.slots ?? []).map((slot) => slot.sceneId);
      expect(new Set(sceneIds).size).toBe(3);
      for (const sceneId of sceneIds) {
        const scene = unit.scenes.find((item) => item.id === sceneId);
        expect(scene?.kind, sceneId).toBe("design");
      }
    });

    it("hace que el resultado dependa de los tres momentos a la vez", () => {
      const ids = combinations.map(([model, explore, form]) => outcome(model, explore, form).id);
      // Ocho montajes defendibles y ocho resultados distintos: si dos coincidieran, uno de los tres
      // momentos habría dejado de contar y montarlo sería decorado.
      expect(new Set(ids).size, ids.join(", ")).toBe(8);
      // Y cambiar exactamente una pieza cambia el resultado, en las tres direcciones.
      for (const [model, explore, form] of combinations) {
        const other = (list: readonly string[], value: string) =>
          list.find((candidate) => candidate !== value)!;
        expect(outcome(other(MODELS, model), explore, form).id).not.toBe(outcome(model, explore, form).id);
        expect(outcome(model, other(EXPLORES, explore), form).id).not.toBe(outcome(model, explore, form).id);
        expect(outcome(model, explore, other(FORMS, form)).id).not.toBe(outcome(model, explore, form).id);
      }
    });

    it("devuelve al momento que hay que cambiar en las tres tensiones del mapa de campaña", () => {
      const instruments = outcome("c3-model-instruments-first", EXPLORES[0], FORMS[0]);
      expect(instruments.id).toBe("c3-outcome-instruments-first");
      expect(instruments.rating).toBe("incoherent-with-brief");
      expect(instruments.nextSceneId).toBe("c3-model");

      const menu = outcome(MODELS[0], "c3-explore-teacher-menu", FORMS[0]);
      expect(menu.id).toBe("c3-outcome-chosen-not-made");
      expect(menu.rating).toBe("incoherent-with-brief");
      expect(menu.nextSceneId).toBe("c3-explore");

      const tutti = outcome(MODELS[0], EXPLORES[0], "c3-form-all-at-once");
      expect(tutti.id).toBe("c3-outcome-all-at-once");
      expect(tutti.rating).toBe("incoherent-with-brief");
      expect(tutti.nextSceneId).toBe("c3-form");
    });

    it("declara el hueco en lugar de inventar un resultado cuando no hay montaje", () => {
      const unbuilt = probe({});
      expect(unbuilt.id).toBe("c3-outcome-unbuilt");
      expect(unbuilt.nextSceneId).toBe("c3-model");
      for (const entry of unbuilt.participation?.roles ?? []) {
        expect(entry.role, entry.characterId).toBe("no-route");
        expect(entry.note, entry.characterId).toBeTruthy();
      }
    });

    it("ofrece dos opciones defendibles en cada momento y ninguna gana de antemano", () => {
      for (const [model, explore, form] of combinations) {
        expect(outcome(model, explore, form).rating, `${model} + ${explore} + ${form}`)
          .toBe("defensible-needs-revision");
      }
      const rating = (id: string) => unit.consequences.find((item) => item.id === id)?.rating;
      expect(rating("c3-revision-listening-outcome")).toBe("coherent-defensible");
      expect(rating("c3-revision-entries-outcome")).toBe("coherent-defensible");
      expect(rating("c3-revision-calm-outcome")).toBe("incoherent-with-brief");
      expect(unit.pedagogy.avoidsUniversalWinner).toBe(true);
    });

    /*
     * La regresión del primer bloqueo de la auditoría del tutorial 1, aplicada aquí: un cierre no
     * puede afirmar de todas las ramas lo que sólo una produjo. El cierre depende de la consigna
     * del momento 2 y de la lente elegida, y ninguna revelación puede servir a las dos consignas.
     */
    it("no comparte ningún cierre entre las dos consignas del momento 2", () => {
      const ids = EXPLORES.flatMap((explore) => REVISIONS.map((revision) =>
        reveal({ "c3-explore": explore, "c3-revision": revision }).id));
      expect(new Set(ids).size, ids.join(", ")).toBe(4);
      const bounded = new Set(
        REVISIONS.map((revision) => reveal({ "c3-explore": EXPLORES[0], "c3-revision": revision }).id),
      );
      for (const revision of REVISIONS) {
        const id = reveal({ "c3-explore": EXPLORES[1], "c3-revision": revision }).id;
        expect(bounded.has(id), id).toBe(false);
      }
      // El cierre es estable frente a los momentos que no le corresponden: si el modelo o la forma
      // lo cambiaran, estaría afirmando de una clase lo que decidió otra pantalla.
      for (const [model, explore, form] of combinations) {
        for (const revision of REVISIONS) {
          expect(
            reveal({ "c3-model": model, "c3-explore": explore, "c3-form": form, "c3-revision": revision }).id,
            `${model} + ${explore} + ${form} + ${revision}`,
          ).toBe(reveal({ "c3-explore": explore, "c3-revision": revision }).id);
        }
      }
    });

    it("no inventa una rama cuando se entra por enlace directo sin decisiones", () => {
      expect(reveal({}).id).toBe("c3-reveal-shared");
      expect(reveal({ "c3-revision": REVISIONS[0] }).id).toBe("c3-reveal-shared");
    });

    /*
     * Hallazgo 1 de la auditoría. La exploración sin límite dejaba completar el caso con un cierre
     * coherente cuyas propias consecuencias decían que no existía el rasgo reconocible que el
     * objetivo exige. Ahora las dos exploraciones defendibles conservan un rasgo —una sobre un
     * terreno común, la otra sobre el criterio que elige cada pareja— y esta regresión comprueba lo
     * que el objetivo pide, no las palabras con que se dice: **toda rama que llegue al cierre
     * afirma una versión reconocible, y ninguna niega tenerla**.
     */
    it("hace que toda rama completada produzca una variación reconocible", () => {
      const NIEGA = /no conservan|sin conservar|no hay rasgo|falta un rasgo|no remite al motivo|no tiene nada que reconocer|no puede decirse qué conserva/;
      for (const explore of EXPLORES) {
        for (const revision of REVISIONS) {
          const cierre = reveal({ "c3-explore": explore, "c3-revision": revision });
          const dicho = [
            cierre.observables.learning,
            cierre.observables.evidence,
            cierre.feedback.supports,
          ].join(" ").toLowerCase();
          expect(dicho, `${cierre.id}: el cierre no afirma ninguna versión reconocible`)
            .toMatch(/conserva|rasgo/);
          const todo = JSON.stringify(cierre).toLowerCase();
          expect(NIEGA.test(todo), `${cierre.id} niega el rasgo que el objetivo exige`).toBe(false);
        }
      }
      // Y las ocho pruebas defendibles tampoco pueden negarlo: son las que llevan al incidente.
      for (const [model, explore, form] of combinations) {
        const prueba = JSON.stringify(outcome(model, explore, form)).toLowerCase();
        expect(NIEGA.test(prueba), `${model} + ${explore} + ${form} niega el rasgo`).toBe(false);
      }
    });

    it("cierra cada rama nombrando lo que la otra lente habría dejado ver", () => {
      for (const explore of EXPLORES) {
        for (const revision of REVISIONS) {
          const cierre = reveal({ "c3-explore": explore, "c3-revision": revision });
          expect(cierre.feedback.tension.toLowerCase(), cierre.id).toContain("la otra lente");
          expect(cierre.rating, cierre.id).toBe("coherent-defensible");
        }
      }
      // Ninguna gana: cada exploración declara en su barrera lo que la otra habría dado.
      const barrera = (id: string) =>
        unit.consequences.find((item) => item.id === id)?.observables.barrier.toLowerCase() ?? "";
      expect(barrera("c3-reveal-limit-listening")).toContain("lo pusiste tú");
      expect(barrera("c3-reveal-limit-entries")).toContain("lo pusiste tú");
      expect(barrera("c3-reveal-declared-listening")).toContain("doce criterios distintos");
      expect(barrera("c3-reveal-declared-entries")).toContain("doce criterios distintos");
    });

    /*
     * Hallazgo 3. Entrar por enlace directo al cierre histórico no puede inventar un reparto ni dar
     * por recorrido un proceso que nadie ha montado.
     */
    it("declara los huecos y conduce al montaje cuando se entra sin decisiones", () => {
      const compartido = reveal({});
      expect(compartido.id).toBe("c3-reveal-shared");
      for (const entry of compartido.participation?.roles ?? []) {
        expect(entry.role, entry.characterId).toBe("no-route");
        expect(entry.note, entry.characterId).toBeTruthy();
      }
      // No conduce a la justificación: conduce al primer momento del montador.
      expect(compartido.nextSceneId).toBe("c3-model");
      const destino = unit.scenes.find((item) => item.id === compartido.nextSceneId);
      expect(destino?.kind).toBe("design");
      // Y por tanto no existe ninguna terminación prematura desde el cierre compartido.
      const finales = new Set(["c3-justification", "c3-reflection"]);
      expect(finales.has(compartido.nextSceneId ?? "")).toBe(false);
    });

    it("declara el reparto completo en las cinco revelaciones y no deja a nadie sin vía tras revisar", () => {
      const reveals = unit.consequences.filter((item) => item.id.startsWith("c3-reveal-"));
      expect(reveals).toHaveLength(5);
      for (const consequence of reveals) {
        expect(consequence.participation?.roles.map((entry) => entry.characterId).sort(), consequence.id)
          .toEqual([...unit.characterIds].sort());
      }
      for (const explore of EXPLORES) {
        for (const revision of REVISIONS) {
          const consequence = reveal({ "c3-explore": explore, "c3-revision": revision });
          for (const role of consequence.participation?.roles ?? []) {
            expect(role.role, `${consequence.id}: ${role.characterId}`).not.toBe("no-route");
          }
        }
      }
    });

    /*
     * El reparto de peso. Orff-Keetman es el proceso que ocupa los tres momentos; Willems y
     * Martenot entran al revisar, como lentes. Si una lente apareciera como uno de los tres
     * momentos, el caso estaría presentando tres enfoques equivalentes.
     */
    it("conserva Orff-Keetman como proceso y deja a Willems y Martenot como lentes", () => {
      expect(unit.approachIds).toEqual(["orff-keetman", "willems", "martenot"]);

      const assemblySceneIds = new Set((unit.assembly?.slots ?? []).map((slot) => slot.sceneId));
      const momentActionIds = new Set(
        unit.scenes
          .filter((scene) => scene.kind === "design" && assemblySceneIds.has(scene.id))
          .flatMap((scene) => (scene.kind === "design" ? scene.actionIds : [])),
      );
      for (const action of unit.actions) {
        if (!action.tags.some((tag) => tag.startsWith("revision-"))) continue;
        expect(momentActionIds.has(action.id), `${action.id} ocupa un momento del montador`).toBe(false);
      }

      const intro = revealScene.introduction;
      expect(intro).toContain("Orff-Schulwerk");
      expect(intro).toContain("Gunild Keetman");
      expect(intro).toContain("Willems");
      expect(intro).toContain("Martenot");
      // El proceso se nombra antes que las lentes, y se dice que no se funden con él.
      expect(intro.indexOf("Orff-Schulwerk")).toBeLessThan(intro.indexOf("lente"));
      expect(intro.indexOf("lente")).toBeLessThan(intro.indexOf("Willems"));
      expect(intro).toMatch(/ninguno? lo sustituye|ninguna lo sustituye/);
      expect(intro).toContain("se funde");

      /*
       * Hallazgo 5. La atribución histórica se afirma en un solo sitio, que es la pantalla de
       * revelación: repetirla en una consecuencia la duplicaba treinta segundos antes de que el
       * recorrido llegara a ella, y fue además lo que rompió la regla 6 en 360 × 640.
       */
      const NOMBRES = /keetman|schulwerk|willems|martenot|\borff\b/i;
      for (const consequence of unit.consequences) {
        expect(NOMBRES.test(JSON.stringify(consequence)), `${consequence.id} repite la atribución`)
          .toBe(false);
      }
      for (const scene of unit.scenes) {
        if (scene.id === revealScene.id) continue;
        const visible = [scene.title, scene.introduction, "prompt" in scene ? scene.prompt : ""].join(" ");
        expect(NOMBRES.test(visible), `${scene.id} repite la atribución`).toBe(false);
      }
    });

    it("no convierte ninguna corrección histórica en una pregunta del juego", () => {
      const choices = unit.actions.map((action) => action.label).join(" ");
      expect(choices).not.toMatch(/\b1[89]\d\d\b/);
      expect(choices.toLowerCase()).not.toMatch(/murió|nació|willems|martenot|keetman|schulwerk/);
      const prompts = unit.scenes
        .map((scene) => ("prompt" in scene ? scene.prompt : ""))
        .join(" ")
        .toLowerCase();
      expect(prompts).not.toMatch(/willems|martenot|keetman|orff/);
    });

    it("cuenta el incidente sin dar por hecho ningún montaje concreto", () => {
      expect(unit.incidents).toHaveLength(1);
      const story = unit.incidents[0]!.reveal.toLowerCase();
      // Si nombrara el límite, el remate abierto o el reparto por mitades, estaría describiendo un
      // aula que sólo algunas de las ocho ramas defendibles produjeron.
      expect(story).not.toMatch(/acento|último tiempo|media clase|sin ningún límite|abre un hueco/);
      expect(unit.incidents[0]!.constraintFamily).toBe("sensory-access-load");
    });

    it("declara un recorrido para cada acción y para cada resultado de la prueba", () => {
      const walks = walkthroughData.walkthroughs.filter((walk) => walk.caseSlug === unit.slug);
      const declaredActions = new Set(walks.flatMap((walk) => walk.actions ?? []));
      for (const action of unit.actions) {
        expect(declaredActions.has(action.id), `${action.id} no lo consume ningún recorrido declarado`).toBe(true);
      }
      // Un resultado sin recorrido es texto pedagógico que ninguna comprobación atraviesa, ni en la
      // sesión pura ni en el navegador. Con doce resultados en una sola pantalla es el defecto más
      // fácil de dejar atrás.
      const declaredConsequences = new Set(walks.flatMap((walk) => walk.expect.consequenceIds ?? []));
      for (const consequenceId of testScene.consequenceIds) {
        expect(declaredConsequences.has(consequenceId), `${consequenceId} no lo produce ningún recorrido`).toBe(true);
      }
      for (const consequenceId of revealScene.consequenceIds) {
        expect(declaredConsequences.has(consequenceId), `${consequenceId} no lo produce ningún recorrido`).toBe(true);
      }
    });

    /*
     * Hallazgo 2 de la auditoría. La comprobación anterior sólo miraba palabras sueltas en cada
     * frase, y por eso dejó pasar un riesgo que ninguna adaptación reparaba y cruces
     * adaptación–evidencia que no se sostenían. Aquí se declaran las **relaciones** que la gramática
     * debe cumplir —de dónde sale cada riesgo, qué lo repara y qué hace observable cada evidencia— y
     * se comprueban una a una, más la compatibilidad de cada evidencia con las cuatro ramas que el
     * juego permite terminar.
     */
    describe("gramática · toda combinación que la interfaz permite construir se sostiene", () => {
      const grammar = unit.scenes.find((item) => item.id === "c3-justification");
      if (grammar?.kind !== "justification") throw new Error("Falta la justificación del caso 3");
      const options = grammar.grammarOptions;
      const label = (option: string | { id: string; label: string }) =>
        (typeof option === "string" ? option : option.label).toLowerCase();
      const id = (option: string | { id: string; label: string }) =>
        typeof option === "string" ? option : option.id;
      const texto = (key: keyof typeof options, optionId: string) =>
        label(options[key].find((candidate) => id(candidate) === optionId)!);

      /** De dónde sale cada riesgo: tiene que ser algo que el caso jugado ponga de verdad encima. */
      const RIESGO_VIENE_DE: Record<string, RegExp> = {
        "c3-risk-loudest-surface": /a la vez/,
        "c3-risk-air-and-surprise": /aire|anunciar/,
      };
      /** Qué tiene que hacer una adaptación para reparar ese riesgo. */
      const REPARA: Record<string, RegExp[]> = {
        "c3-risk-loudest-surface": [/turnos?|tandas/],
        "c3-risk-air-and-surprise": [/visible|visual/, /vibra/, /anunciad/],
      };
      /**
       * Qué nombra cada evidencia. Los patrones se comprueban **contra la propia opción y contra el
       * cierre**, no sólo contra el cierre: anclar la tabla en el identificador dejaba que alguien
       * reescribiera la evidencia para hablar de otra cosa sin que nada fallara, y así se coló la
       * primera vez. Todos los patrones de una evidencia deben cumplirse a la vez.
       */
      const EVIDENCIA_EXIGE: Record<string, RegExp[]> = {
        "c3-evidence-name-the-trait": [/rasgo/, /conserv/],
        "c3-evidence-turn-in-form": [/turno/, /forma|sitio/],
      };
      const cumple = (texto: string, patrones: RegExp[]) =>
        patrones.every((patron) => patron.test(texto));

      it("declara dos riesgos que el caso pone de verdad encima de la mesa", () => {
        expect(options.objective).toHaveLength(1);
        expect(options.conditionRisk).toHaveLength(2);
        const jugado = [
          unit.incidents[0]!.reveal,
          unit.scenes.find((item) => item.id === "c3-brief")?.introduction ?? "",
        ].join(" ").toLowerCase();
        for (const option of options.conditionRisk) {
          const origen = RIESGO_VIENE_DE[id(option)];
          expect(origen, `${id(option)} no declara de dónde sale`).toBeDefined();
          // La comprobación es de ida y vuelta a propósito: el riesgo tiene que nombrar la
          // condición, y el caso tiene que ponerla de verdad encima de la mesa. Mirar sólo el
          // segundo lado deja pasar que alguien reescriba el riesgo y hable de otra cosa.
          expect(label(option), `${id(option)} no nombra la condición que dice reparar`)
            .toMatch(origen!);
          expect(jugado, `${id(option)} habla de algo que el caso no pone encima`).toMatch(origen!);
        }
      });

      it("repara cada riesgo con las dos adaptaciones, no solo con una", () => {
        for (const risk of options.conditionRisk) {
          for (const adaptation of options.adaptation) {
            for (const exigencia of REPARA[id(risk)]!) {
              expect(
                label(adaptation),
                `«${id(adaptation)}» no repara «${id(risk)}»: falta ${exigencia}`,
              ).toMatch(exigencia);
            }
          }
        }
      });

      /*
       * La comprobación anterior buscaba la evidencia en el cierre entero, y así una evidencia
       * respaldada **sólo** por la barrera o la tensión —es decir, declarada precisamente como lo
       * que falta— pasaba por buena. Fue lo que dejó vivos los cruces «escucha graduada + oír los
       * cortes» y «entradas preparadas + nombrar el rasgo». Ahora el respaldo tiene que estar en el
       * lado que **afirma**: aprendizaje, evidencia observable y lo que la decisión sostiene.
       */
      const AFIRMA = (consequence: { observables: { learning: string; evidence: string }; feedback: { supports: string } }) =>
        [consequence.observables.learning, consequence.observables.evidence, consequence.feedback.supports]
          .join(" ").toLowerCase();
      const DECLARA_PENDIENTE = (consequence: { observables: { barrier: string }; feedback: { tension: string } }) =>
        [consequence.observables.barrier, consequence.feedback.tension].join(" ").toLowerCase();

      it("respalda cada evidencia en el lado que afirma, no en el que declara lo que falta", () => {
        for (const evidence of options.evidence) {
          const exigencia = EVIDENCIA_EXIGE[id(evidence)];
          expect(exigencia, `${id(evidence)} no declara qué hace observable`).toBeDefined();
          // De ida: la opción tiene que nombrar aquello mismo que se busca en el cierre.
          expect(cumple(label(evidence), exigencia!), `${id(evidence)} habla de otra cosa`).toBe(true);
          // Y de vuelta: las cuatro ramas terminables tienen que afirmarlo.
          for (const explore of EXPLORES) {
            for (const revision of REVISIONS) {
              const cierre = reveal({ "c3-explore": explore, "c3-revision": revision });
              expect(
                cumple(AFIRMA(cierre), exigencia!),
                `«${id(evidence)}» no está respaldada en positivo por ${cierre.id}`,
              ).toBe(true);
            }
          }
        }
      });

      it("no ofrece ninguna evidencia que un cierre declare precisamente como pendiente", () => {
        for (const evidence of options.evidence) {
          const exigencia = EVIDENCIA_EXIGE[id(evidence)]!;
          for (const explore of EXPLORES) {
            for (const revision of REVISIONS) {
              const cierre = reveal({ "c3-explore": explore, "c3-revision": revision });
              // Si sólo aparece del lado de lo pendiente, la frase prometería comprobar
              // exactamente lo que esa rama acaba de declarar que no consiguió.
              const soloPendiente =
                cumple(DECLARA_PENDIENTE(cierre), exigencia) && !cumple(AFIRMA(cierre), exigencia);
              expect(soloPendiente, `${cierre.id} sólo nombra «${id(evidence)}» como lo que falta`)
                .toBe(false);
            }
          }
        }
      });

      it("construye dieciséis frases y ninguna cruza piezas sin relación", () => {
        const combinaciones = options.principleAction.flatMap((principle) =>
          options.conditionRisk.flatMap((risk) =>
            options.adaptation.flatMap((adaptation) =>
              options.evidence.map((evidence) => ({
                principle: id(principle), risk: id(risk),
                adaptation: id(adaptation), evidence: id(evidence),
              })))));
        expect(combinaciones).toHaveLength(16);
        for (const frase of combinaciones) {
          const rotulo = `${frase.principle} + ${frase.risk} + ${frase.adaptation} + ${frase.evidence}`;
          // El principio nombra el camino montado, que es lo que hace la frase de este caso y no
          // de cualquier otro.
          expect(texto("principleAction", frase.principle), rotulo).toContain("camino montado");
          // La adaptación repara el riesgo que la frase acaba de declarar.
          for (const exigencia of REPARA[frase.risk]!) {
            expect(texto("adaptation", frase.adaptation), rotulo).toMatch(exigencia);
          }
          // Y la evidencia se puede observar en cualquiera de las ramas terminables.
          const exigencia = EVIDENCIA_EXIGE[frase.evidence];
          expect(exigencia, rotulo).toBeDefined();
          for (const explore of EXPLORES) {
            for (const revision of REVISIONS) {
              const cierre = reveal({ "c3-explore": explore, "c3-revision": revision });
              expect(cumple(AFIRMA(cierre), exigencia!), `${rotulo} · ${cierre.id}`).toBe(true);
            }
          }
        }
      });
    });

    /*
     * Hallazgo 4. La bitácora registraba las tres tradiciones del caso aunque sólo se eligiera una
     * lente. Debe registrar el proceso más la lente realmente elegida, y ninguna lente si no hubo
     * revisión.
     */
    it("registra en la bitácora el proceso más la lente realmente elegida", () => {
      const journal = (selectedActions: Record<string, string>) =>
        buildJournalEntry(
          unit,
          { ...createGameSession(unit), selectedActions },
          "2026-08-20T00:00:00.000Z",
          "00000000-0000-4000-8000-000000000000",
        );
      const montaje = { "c3-model": MODELS[0], "c3-explore": EXPLORES[0], "c3-form": FORMS[0] };

      expect(journal({ ...montaje, "c3-revision": "c3-revision-graded-listening" }).combinedApproachIds)
        .toEqual(["orff-keetman", "willems"]);
      expect(journal({ ...montaje, "c3-revision": "c3-revision-prepared-entries" }).combinedApproachIds)
        .toEqual(["orff-keetman", "martenot"]);
      // Sin revisión no se atribuye ninguna lente, y la revisión incoherente tampoco la aporta.
      expect(journal(montaje).combinedApproachIds).toEqual(["orff-keetman"]);
      expect(journal({ ...montaje, "c3-revision": "c3-revision-calm-instead" }).combinedApproachIds)
        .toEqual(["orff-keetman"]);
      // Enlace directo sin ninguna decisión: no se atribuye nada a nadie.
      expect(journal({}).combinedApproachIds).toEqual([]);
      // Todo enfoque que declare una acción pertenece a los que el caso declara.
      for (const action of unit.actions) {
        for (const approachId of action.approachIds ?? []) {
          expect(unit.approachIds, action.id).toContain(approachId);
        }
      }
    });

    /*
     * Y no basta con que el contenido de hoy lo cumpla: el contrato tiene que rechazarlo. Sin esta
     * comprobación, una acción podría poner en juego una tradición que la unidad no cubre y la
     * bitácora la anotaría como recorrida sin que nadie lo viera hasta leer una entrada guardada.
     */
    it("rechaza una acción que ponga en juego un enfoque que el caso no declara", () => {
      const variante = structuredClone(formData) as {
        approachIds: string[];
        actions: Array<{ id: string; approachIds?: string[] }>;
      };
      const accion = variante.actions.find((item) => item.approachIds?.length)!;
      accion.approachIds = ["suzuki"];
      const resultado = validateCaseDefinition(variante);
      expect(resultado.ok).toBe(false);
      if (resultado.ok) return;
      expect(resultado.issues.map((issue) => issue.code)).toContain("approach-outside-case");
      expect(resultado.issues.find((issue) => issue.code === "approach-outside-case")?.path)
        .toMatch(/^actions\.\d+\.approachIds\.0$/);
    });

    /*
     * Hallazgo 2 de la segunda auditoría. Un enlace directo a la reflexión mostraba «Guardar y
     * cerrar» sin ninguna decisión: la bitácora salía con todos los campos sin selección y sin
     * ningún enfoque recorrido, y esa entrada ni siquiera pasa el contrato de progreso.
     */
    it("no deja cerrar el caso desde una reflexión sin montaje, y el contrato lo respalda", () => {
      const vacia = createGameSession(unit, "c3-reflection");
      expect(vacia.sceneId).toBe("c3-reflection");
      expect(canFinishCase(unit, vacia)).toBe(false);
      // La pantalla orienta al momento que falta, que es el primero del montador.
      const pendiente = assemblyPieces(unit, vacia).find((piece) => piece.actionId === undefined);
      expect(pendiente?.slot.sceneId).toBe("c3-model");

      // Si alguien forzara el cierre, esto es lo que se intentaría guardar.
      const entrada = buildJournalEntry(
        unit, vacia, "2026-08-20T00:00:00.000Z", "00000000-0000-4000-8000-000000000000",
      );
      expect(entrada.combinedApproachIds).toEqual([]);
      const progreso = withCompletedCase(
        createEmptyProgress("2026-08-20T00:00:00.000Z"), unit.id, entrada, "2026-08-20T00:00:00.000Z",
      );
      // El contrato de progreso la rechaza: por eso la pantalla no puede ofrecer el cierre.
      expect(() => ProgressSchema.parse(progreso)).toThrow();

      // Con los tres momentos montados, el cierre vuelve a estar disponible y la entrada valida.
      const montada = {
        ...vacia,
        selectedActions: { "c3-model": MODELS[0], "c3-explore": EXPLORES[0], "c3-form": FORMS[0] },
      };
      expect(canFinishCase(unit, montada)).toBe(true);
      const buena = withCompletedCase(
        createEmptyProgress("2026-08-20T00:00:00.000Z"),
        unit.id,
        buildJournalEntry(unit, montada, "2026-08-20T00:00:00.000Z", "00000000-0000-4000-8000-000000000000"),
        "2026-08-20T00:00:00.000Z",
      );
      expect(() => ProgressSchema.parse(buena)).not.toThrow();
    });

    it("guarda el momento mantenido con su razón, distinto de la revisión", () => {
      const label = (id: string) => unit.actions.find((item) => item.id === id)?.label ?? "";
      for (const form of FORMS) {
        const journal = buildJournalEntry(
          unit,
          {
            ...createGameSession(unit),
            selectedActions: {
              "c3-brief": "c3-brief-recognisable-variation",
              "c3-model": MODELS[0],
              "c3-explore": EXPLORES[0],
              "c3-form": form,
              "c3-revision": REVISIONS[0],
            },
          },
          "2026-08-20T00:00:00.000Z",
          "00000000-0000-4000-8000-000000000000",
        );
        expect(journal.maintainedDecision).toContain(label(form));
        expect(journal.maintainedDecision).toContain("porque");
        expect(journal.revisedDecision).toContain(label(REVISIONS[0]));
        expect(journal.revisedDecision).not.toContain(label(form));
        expect(journal.firstDecision).toContain(label(MODELS[0]));
        expect(journal.combinedApproachIds).toEqual(["orff-keetman", "willems"]);
      }
    });

    it("cierra el caso 3 sin adelantar el contenido de ninguna unidad pendiente", () => {
      if (!unit.completion) throw new Error("Falta el cierre del caso 3");
      const completion = `${unit.completion.title} ${unit.completion.body}`.toLowerCase();
      expect(completion).not.toMatch(/caso 4|suzuki|campbell|green|schafer|gordon|m7b|m7c|m8/);
    });
  });

  describe("caso 4 · un principio que viaja y un entorno que no", () => {
    const unit = parsed(environmentData);
    const testScene = unit.scenes.find((item) => item.id === "c4-test");
    const revealScene = unit.scenes.find((item) => item.id === "c4-reveal");
    if (testScene?.kind !== "consequence") throw new Error("Falta la pantalla de prueba");
    if (revealScene?.kind !== "consequence") throw new Error("Falta la pantalla de revelación");

    const probe = (selectedActions: Record<string, string>) =>
      consequenceForScene(unit, testScene, { ...createGameSession(unit), selectedActions });
    const reveal = (selectedActions: Record<string, string>) =>
      consequenceForScene(unit, revealScene, { ...createGameSession(unit), selectedActions });

    const outcome = (principle: string, substitute: string) =>
      probe({ "c4-principle": principle, "c4-substitute": substitute });
    const cierre = (principle: string, substitute: string, revision: string) =>
      reveal({ "c4-principle": principle, "c4-substitute": substitute, "c4-revision": revision });

    const PRINCIPLES = ["c4-principle-model-before-playing", "c4-principle-small-steps"] as const;
    const SUBSTITUTES = ["c4-substitute-repetition-in-class", "c4-substitute-shared-medium"] as const;
    const REVISIONS = ["c4-revision-audible-target", "c4-revision-many-models"] as const;

    const designs = PRINCIPLES.flatMap((principle) =>
      SUBSTITUTES.map((substitute) => [principle, substitute] as const));
    const branches = designs.flatMap(([principle, substitute]) =>
      REVISIONS.map((revision) => [principle, substitute, revision] as const));

    /*
     * Las tres decisiones del caso, cada una con la huella que **tiene que** dejar en el cierre:
     * lo que consigue y, cuando corresponde, lo que deja pendiente. Esta tabla es el corazón de las
     * regresiones semánticas de la unidad: no busca palabras sueltas, sino que cada cierre afirme lo
     * que su rama consiguió y declare pendiente exactamente lo que la otra opción habría dado.
     */
    const LOGRO_PRINCIPIO: Record<string, RegExp> = {
      "c4-principle-model-before-playing": /se instaló de oído/,
      "c4-principle-small-steps": /cada paso salió antes/,
    };
    const SUSTITUCION: Record<string, { logro: RegExp; pendiente: RegExp }> = {
      "c4-substitute-repetition-in-class": {
        logro: /repeticiones ocurrieron aquí|se repitió dentro de la clase/,
        pendiente: /seis flautas no llegan a veinticuatro personas/,
      },
      "c4-substitute-shared-medium": {
        logro: /flautas rotando por papel declarado/,
        pendiente: /repetición sostenida sigue cabiendo pocas veces/,
      },
    };
    /** Lo que cada revisión aporta. El cierre la afirma, y declara pendiente la de la otra. */
    const APORTE_REVISION: Record<string, RegExp> = {
      "c4-revision-audible-target": /objetivo dicho/,
      "c4-revision-many-models": /fuentes/,
    };
    const otra = <T extends string>(lista: readonly T[], valor: T) =>
      lista.find((candidato) => candidato !== valor)!;

    /** Juega una rama entera decidiendo en cada pantalla, como lo haría una persona. */
    const jugarRama = (principle: string, substitute: string, revision: string) => {
      let session = createGameSession(unit);
      const decidir = (sceneId: string, actionId: string) => {
        const scene = unit.scenes.find((item) => item.id === sceneId);
        if (scene?.kind !== "observation" && scene?.kind !== "design" && scene?.kind !== "revision") {
          throw new Error(`${sceneId} no admite decisiones`);
        }
        session = selectAction(unit, session, scene, actionId);
      };
      decidir("c4-brief", "c4-brief-same-shape");
      decidir("c4-plan", "c4-plan-conditions");
      decidir("c4-principle", principle);
      decidir("c4-substitute", substitute);
      decidir("c4-revision", revision);
      return session;
    };

    /** Las cinco condiciones del ecosistema, con las palabras que el caso usa en todas partes. */
    const CINCO_CONDICIONES = [
      "continuidad y práctica diaria",
      "enseñanza individual",
      "instrumento",
      "tiempo fuera de clase",
      "apoyo cuidador",
    ] as const;

    it("hace que el resultado de la prueba dependa del hilo y de la sustitución a la vez", () => {
      const ids = designs.map(([principle, substitute]) => outcome(principle, substitute).id);
      expect(new Set(ids).size, ids.join(", ")).toBe(4);
      for (const [principle, substitute] of designs) {
        expect(outcome(otra(PRINCIPLES, principle), substitute).id)
          .not.toBe(outcome(principle, substitute).id);
        expect(outcome(principle, otra(SUBSTITUTES, substitute)).id)
          .not.toBe(outcome(principle, substitute).id);
      }
    });

    /*
     * El cierre depende de **las tres** decisiones. Una versión anterior lo resolvía solo por hilo y
     * revisión, y entonces afirmaba de la clase cosas que la sustitución elegida había hecho
     * imposibles: prometía repeticiones frecuentes a quien había sustituido el medio y no el tiempo.
     */
    it("resuelve ocho cierres distintos y ninguno ignora ninguna de las tres decisiones", () => {
      const ids = branches.map(([p, s, r]) => cierre(p, s, r).id);
      expect(new Set(ids).size, ids.join(", ")).toBe(8);
      for (const [p, s, r] of branches) {
        expect(cierre(otra(PRINCIPLES, p), s, r).id, `hilo: ${p}`).not.toBe(cierre(p, s, r).id);
        expect(cierre(p, otra(SUBSTITUTES, s), r).id, `sustitución: ${s}`).not.toBe(cierre(p, s, r).id);
        expect(cierre(p, s, otra(REVISIONS, r)).id, `revisión: ${r}`).not.toBe(cierre(p, s, r).id);
      }
    });

    /*
     * Regresión semántica, no búsqueda de palabras: cada cierre tiene que **afirmar** lo que sus
     * tres decisiones consiguieron y **declarar pendiente** exactamente lo que las otras dos
     * opciones habrían dado. Si una sola de las tres huellas faltara o apareciera cambiada, el
     * cierre estaría hablando de una clase que no es la que se montó.
     */
    it("afirma en cada cierre lo que consiguieron sus tres decisiones", () => {
      for (const [p, s, r] of branches) {
        const consequence = cierre(p, s, r);
        const afirma = [
          consequence.observables.learning,
          consequence.observables.evidence,
          consequence.feedback.supports,
        ].join(" ").toLowerCase();

        expect(afirma, `${consequence.id}: no afirma el hilo elegido`).toMatch(LOGRO_PRINCIPIO[p]!);
        expect(afirma, `${consequence.id}: afirma el hilo que no se eligió`)
          .not.toMatch(LOGRO_PRINCIPIO[otra(PRINCIPLES, p)]!);

        expect(afirma, `${consequence.id}: no afirma la sustitución elegida`)
          .toMatch(SUSTITUCION[s]!.logro);
        expect(afirma, `${consequence.id}: no afirma lo que aportó la revisión`)
          .toMatch(APORTE_REVISION[r]!);
      }
    });

    it("declara pendiente en cada cierre exactamente lo que la otra opción habría dado", () => {
      for (const [p, s, r] of branches) {
        const consequence = cierre(p, s, r);
        const barrera = consequence.observables.barrier.toLowerCase();
        const tension = consequence.feedback.tension.toLowerCase();

        // La dependencia que sigue en pie es la que esta sustitución no tocó, y solo esa.
        expect(barrera, `${consequence.id}: la barrera no nombra la dependencia que queda`)
          .toMatch(SUSTITUCION[s]!.pendiente);
        expect(barrera, `${consequence.id}: la barrera nombra una dependencia que sí se sustituyó`)
          .not.toMatch(SUSTITUCION[otra(SUBSTITUTES, s)]!.pendiente);

        // Y lo pendiente de la revisión es lo que aporta la otra, nunca lo que aporta la propia.
        expect(tension, `${consequence.id}: no nombra la otra revisión`).toContain("la otra revisión");
        expect(tension, `${consequence.id}: no declara pendiente lo que la otra revisión aporta`)
          .toMatch(APORTE_REVISION[otra(REVISIONS, r)]!);
        expect(tension, `${consequence.id}: declara pendiente lo que su propia revisión ya dio`)
          .not.toMatch(APORTE_REVISION[r]!);

        expect(consequence.rating, consequence.id).toBe("coherent-defensible");
      }
    });

    it("hace que toda rama completada cumpla las dos mitades del objetivo", () => {
      const NIEGA = /no llega a sonar igual|sin el mismo perfil|nadie ha mejorado|sigue dependiendo de casa|no puede saberse quién ha mejorado/;
      for (const [p, s, r] of branches) {
        const consequence = cierre(p, s, r);
        const afirma = [
          consequence.observables.learning,
          consequence.observables.evidence,
          consequence.feedback.supports,
        ].join(" ").toLowerCase();
        expect(afirma, `${consequence.id}: no afirma el perfil compartido`).toMatch(/mismo perfil/);
        expect(afirma, `${consequence.id}: no afirma la mejora de hoy`).toMatch(/mejorado hoy/);
        expect(NIEGA.test(JSON.stringify(consequence).toLowerCase()), `${consequence.id} niega lo que el objetivo exige`)
          .toBe(false);
      }
      for (const [principle, substitute] of designs) {
        const prueba = JSON.stringify(outcome(principle, substitute)).toLowerCase();
        expect(NIEGA.test(prueba), `${principle} + ${substitute} niega lo que el objetivo exige`).toBe(false);
      }
    });

    it("devuelve a la pantalla que hay que cambiar en las tres tensiones del mapa de campaña", () => {
      const tiempo = outcome("c4-principle-daily-home-listening", SUBSTITUTES[0]);
      expect(tiempo.id).toBe("c4-outcome-home-practice");
      expect(tiempo.rating).toBe("incoherent-with-brief");
      expect(tiempo.nextSceneId).toBe("c4-principle");

      const familia = outcome(PRINCIPLES[0], "c4-substitute-ask-families");
      expect(familia.id).toBe("c4-outcome-family-shift");
      expect(familia.rating).toBe("incoherent-with-brief");
      expect(familia.nextSceneId).toBe("c4-substitute");

      const instrumento = unit.consequences.find((item) => item.id === "c4-revision-home-outcome");
      expect(instrumento?.rating).toBe("incoherent-with-brief");
      expect(instrumento?.nextSceneId).toBe("c4-revision");

      for (const id of ["c4-outcome-home-practice", "c4-outcome-family-shift"]) {
        expect(unit.consequences.find((item) => item.id === id)?.nextSceneId, id).not.toBe("c4-incident");
      }
    });

    it("declara el hueco en lugar de inventar un resultado cuando no se ha separado nada", () => {
      const vacio = probe({});
      expect(vacio.id).toBe("c4-outcome-unseparated");
      expect(vacio.nextSceneId).toBe("c4-principle");
      for (const entry of vacio.participation?.roles ?? []) {
        expect(entry.role, entry.characterId).toBe("no-route");
        expect(entry.note, entry.characterId).toBeTruthy();
      }
    });

    it("no inventa una rama cuando se entra por enlace directo sin decisiones", () => {
      const compartido = reveal({});
      expect(compartido.id).toBe("c4-reveal-shared");
      // Dos de las tres decisiones tampoco bastan: el cierre depende de las tres.
      expect(reveal({ "c4-revision": REVISIONS[0] }).id).toBe("c4-reveal-shared");
      expect(reveal({ "c4-principle": PRINCIPLES[0], "c4-revision": REVISIONS[0] }).id).toBe("c4-reveal-shared");
      for (const entry of compartido.participation?.roles ?? []) {
        expect(entry.role, entry.characterId).toBe("no-route");
        expect(entry.note, entry.characterId).toBeTruthy();
      }
      expect(compartido.nextSceneId).toBe("c4-principle");
      expect(new Set(["c4-justification", "c4-reflection"]).has(compartido.nextSceneId ?? "")).toBe(false);
    });

    it("ofrece dos hilos y dos sustituciones defendibles y ninguna gana de antemano", () => {
      for (const [principle, substitute] of designs) {
        expect(outcome(principle, substitute).rating, `${principle} + ${substitute}`)
          .toBe("defensible-needs-revision");
      }
      const rating = (id: string) => unit.consequences.find((item) => item.id === id)?.rating;
      expect(rating("c4-revision-target-outcome")).toBe("coherent-defensible");
      expect(rating("c4-revision-models-outcome")).toBe("coherent-defensible");
      expect(rating("c4-revision-home-outcome")).toBe("incoherent-with-brief");
      expect(unit.pedagogy.avoidsUniversalWinner).toBe(true);
      expect(unit.approachIds).toEqual(["suzuki"]);
    });

    /*
     * Bloqueo pedagógico corregido: los hilos del ecosistema no son técnicas alternativas entre sí.
     * La pantalla que obliga a elegir uno tiene que decir que allí se sostienen unos a otros y que
     * separarlos es un efecto del traslado; el cierre histórico tiene que conservar el ecosistema
     * entero y declarar que la transferencia es parcial y no da una receta universal.
     */
    it("presenta los hilos del ecosistema como inseparables allí y no como técnicas alternativas", () => {
      const eleccion = unit.scenes.find((item) => item.id === "c4-principle");
      const intro = (eleccion?.introduction ?? "").toLowerCase();
      expect(intro).toContain("se sostienen unos a otros");
      expect(intro).toContain("efecto del traslado");
      expect(intro).not.toMatch(/técnicas? distintas?|una u otra|excluyentes/);

      const marco = revealScene.introduction.toLowerCase();
      expect(marco).toContain("no son alternativas entre sí");
      expect(marco).toContain("se sostienen unas a otras");
      expect(marco).toContain("la transferencia es parcial");
      expect(marco).toContain("no da una receta universal");
      // El ecosistema se nombra entero: es lo que impide leerlo como una técnica suelta.
      for (const pieza of [
        "escucha frecuente", "modelado", "imitación", "repetición", "pasos pequeños",
        "instrumento propio", "clase individual", "experiencias de grupo",
        "familia o persona cuidadora",
      ]) {
        expect(marco, pieza).toContain(pieza);
      }
      // Y las dos opciones defendibles llevan modelado e imitación dentro, no una cada cosa.
      for (const id of PRINCIPLES) {
        const accion = unit.actions.find((item) => item.id === id);
        expect(accion?.approachIds, id).toEqual(["suzuki"]);
      }
    });

    it("no convierte la imitación ni la repetición en receta universal", () => {
      const UNIVERSALIZA = /sirve para todo|como se aprende (casi )?todo|vale para cualquier|funciona siempre|en cualquier objetivo/;
      for (const consequence of unit.consequences) {
        expect(UNIVERSALIZA.test(JSON.stringify(consequence).toLowerCase()), `${consequence.id} universaliza`)
          .toBe(false);
      }
      for (const action of unit.actions) {
        expect(UNIVERSALIZA.test(action.label.toLowerCase()), `${action.id} universaliza`).toBe(false);
      }
      // Y donde el caso defiende la repetición, la acota explícitamente.
      const defensa = unit.consequences.find((item) => item.id === "c4-feedback-repetition-blamed");
      expect(defensa?.feedback.tension.toLowerCase()).toContain("no es la receta de cualquier objetivo");
      expect(defensa?.observables.learning.toLowerCase()).toContain("en esta tradición");
    });

    it("corrige el malentendido de la selección por talento sin convertirlo en pregunta", () => {
      const equivocacion = unit.consequences.find((item) => item.id === "c4-feedback-gifted");
      expect(equivocacion?.rating).toBe("incoherent-with-brief");
      const texto = JSON.stringify(equivocacion).toLowerCase();
      expect(texto).toMatch(/no es educación para alumnado superdotado/);
      expect(texto).toMatch(/entorno adecuado/);
      const donde = equivocacion?.observables.evidence.toLowerCase() ?? "";
      expect(donde).toMatch(/entorno disponible/);
      expect(donde).toMatch(/no en quién/);

      const marco = revealScene.introduction.toLowerCase();
      expect(marco).toContain("no era una escuela para alumnado superdotado");
      expect(marco).toContain("captación de jóvenes talentos");
      expect(marco).toContain("la capacidad se desarrolla en un entorno adecuado");
      expect(marco).toContain("repertorio cuidadosamente secuenciado");
    });

    it("nombra al autor en un solo sitio y no lo convierte en pregunta del juego", () => {
      const NOMBRE = /suzuki|shinichi|matsumoto|einstein/i;
      for (const consequence of unit.consequences) {
        expect(NOMBRE.test(JSON.stringify(consequence)), `${consequence.id} repite la atribución`).toBe(false);
      }
      for (const scene of unit.scenes) {
        if (scene.id === revealScene.id) continue;
        const visible = [scene.title, scene.introduction, "prompt" in scene ? scene.prompt : ""].join(" ");
        expect(NOMBRE.test(visible), `${scene.id} repite la atribución`).toBe(false);
      }
      expect(NOMBRE.test(JSON.stringify(unit.completion))).toBe(false);
      const rotulos = unit.actions.map((action) => action.label).join(" ");
      expect(NOMBRE.test(rotulos)).toBe(false);
      expect(rotulos).not.toMatch(/\b1[89]\d\d\b|\b20\d\d\b/);
      expect(rotulos.toLowerCase()).not.toMatch(/murió|nació|fundó/);
    });

    it("cuenta el incidente sin dar por hecho ningún diseño concreto", () => {
      expect(unit.incidents).toHaveLength(1);
      expect(unit.incidents[0]!.constraintFamily).toBe("transfer");
      const relato = unit.incidents[0]!.reveal.toLowerCase();
      expect(relato).not.toMatch(/tomas cortas|dos sonidos|flautas|tres vías|papel declarado|perfil con la mano/);
      expect(relato).toContain("una persona del grupo");
      expect(relato).toContain("mejorando hoy");
    });

    /*
     * Bloqueo corregido: las seis devoluciones de una decisión de diseño declaran reparto. Sin ellas
     * el juego mostraba a quién favorece una decisión en unas pantallas y lo callaba justo en las
     * dos donde se decide el diseño entero.
     */
    describe("reparto declarado en todas las pantallas que afirman algo del aula", () => {
      const designSceneIds = new Set(
        unit.scenes.filter((scene) => scene.kind === "design").map((scene) => scene.id),
      );
      const designChoiceIds = unit.scenes
        .filter((scene) => scene.kind === "design" && designSceneIds.has(scene.id))
        .flatMap((scene) => (scene.kind === "design" ? scene.actionIds : []))
        .map((actionId) => unit.actions.find((action) => action.id === actionId)!.consequenceId);

      it("declara reparto completo en las seis devoluciones de diseño", () => {
        expect(new Set(designChoiceIds).size).toBe(6);
        for (const id of designChoiceIds) {
          const consequence = unit.consequences.find((item) => item.id === id)!;
          expect(consequence.participation, `${id} no declara reparto`).toBeDefined();
          expect(consequence.participation!.roles.map((role) => role.characterId).sort(), id)
            .toEqual([...unit.characterIds].sort());
          for (const role of consequence.participation!.roles) {
            if (role.role === "no-route") expect(role.note, `${id}: ${role.characterId}`).toBeTruthy();
          }
        }
      });

      it("declara reparto completo en los diecinueve resultados de prueba, revisión y cierre", () => {
        const outcomes = [
          ...testScene.consequenceIds,
          ...revealScene.consequenceIds,
          "c4-revision-target-outcome", "c4-revision-models-outcome", "c4-revision-home-outcome",
        ];
        expect(new Set(outcomes).size).toBe(19);
        for (const id of outcomes) {
          const consequence = unit.consequences.find((item) => item.id === id)!;
          expect(consequence.participation?.roles.map((role) => role.characterId).sort(), id)
            .toEqual([...unit.characterIds].sort());
        }
      });

      it("no deja a nadie sin vía en ninguno de los ocho cierres", () => {
        for (const [p, s, r] of branches) {
          const consequence = cierre(p, s, r);
          for (const role of consequence.participation?.roles ?? []) {
            expect(role.role, `${consequence.id}: ${role.characterId}`).not.toBe("no-route");
          }
        }
      });

      /*
       * El dato dice la tesis del caso, y lo dice ya en la pantalla donde se decide: el diseño que
       * saca la mejora del aula se la entrega a quien ya tenía el entorno. La devolución inmediata
       * y el resultado de la prueba tienen que coincidir en eso; si divergieran, una de las dos
       * pantallas estaría afirmando algo distinto de la otra sobre la misma decisión.
       */
      it("coincide entre la devolución de la decisión y el resultado que produce", () => {
        const papel = (consequenceId: string, characterId: string) =>
          unit.consequences
            .find((item) => item.id === consequenceId)
            ?.participation?.roles.find((entry) => entry.characterId === characterId)?.role;
        for (const [eleccion, resultado] of [
          ["c4-choice-principle-home", "c4-outcome-home-practice"],
          ["c4-choice-substitute-family", "c4-outcome-family-shift"],
        ] as const) {
          // La pantalla que devuelve la decisión y la que muestra su resultado hablan de la misma
          // decisión: no pueden repartir la agencia de maneras distintas.
          expect(papel(eleccion, "oscar"), `${eleccion} vs ${resultado}`).toBe(papel(resultado, "oscar"));
          expect(papel(eleccion, "oscar"), eleccion).toBe("decides");
        }
        expect(papel("c4-revision-home-outcome", "oscar")).toBe("decides");
        // Y en las dos revisiones defendibles deja de repartir nada, sin que se le retire nada.
        expect(papel("c4-revision-target-outcome", "oscar")).toBe("decides");
        expect(papel("c4-revision-models-outcome", "oscar")).toBe("decides");
      });
    });

    it("declara un recorrido para cada acción, cada resultado de la prueba y cada cierre", () => {
      const walks = walkthroughData.walkthroughs.filter((walk) => walk.caseSlug === unit.slug);
      const declaredActions = new Set(walks.flatMap((walk) => walk.actions ?? []));
      for (const action of unit.actions) {
        expect(declaredActions.has(action.id), `${action.id} no lo consume ningún recorrido declarado`).toBe(true);
      }
      const declaredConsequences = new Set(walks.flatMap((walk) => walk.expect.consequenceIds ?? []));
      for (const consequenceId of [...testScene.consequenceIds, ...revealScene.consequenceIds]) {
        expect(declaredConsequences.has(consequenceId), `${consequenceId} no lo produce ningún recorrido`).toBe(true);
      }
      // Los ocho cierres de rama, uno por recorrido: es lo que impide que un cierre nuevo entre sin
      // que nadie lo recorra ni el arnés lo mida.
      expect(revealScene.consequenceIds).toHaveLength(9);
    });

    /*
     * La gramática dejaba de hablar de la partida: sus piezas valían para cualquier rama, las dos
     * adaptaciones reparaban todo y alguna evidencia prometía justo lo que el cierre declaraba
     * pendiente. Ahora cada dimensión corresponde a una decisión real —hilo, sustitución y
     * revisión—, y cada una de las dieciséis frases nombra **una** de las ocho ramas y se comprueba
     * contra el cierre que esa rama produce de verdad.
     */
    describe("gramática · las dieciséis frases se comprueban contra la rama que nombran", () => {
      const grammar = unit.scenes.find((item) => item.id === "c4-justification");
      if (grammar?.kind !== "justification") throw new Error("Falta la justificación del caso 4");
      const options = grammar.grammarOptions;
      const label = (option: string | { id: string; label: string }) =>
        (typeof option === "string" ? option : option.label).toLowerCase();
      const id = (option: string | { id: string; label: string }) =>
        typeof option === "string" ? option : option.id;
      const texto = (key: keyof typeof options, optionId: string) =>
        label(options[key].find((candidate) => id(candidate) === optionId)!);

      /** Cada pieza de la gramática nombra una decisión concreta del recorrido. */
      const PIEZA_HILO: Record<string, string> = {
        "c4-principle-listen-before-playing": "c4-principle-model-before-playing",
        "c4-principle-step-by-step": "c4-principle-small-steps",
      };
      const PIEZA_SUSTITUCION: Record<string, string> = {
        "c4-risk-medium-still-unequal": "c4-substitute-repetition-in-class",
        "c4-risk-repetition-still-scarce": "c4-substitute-shared-medium",
      };
      const PIEZA_REVISION: Record<string, string> = {
        "c4-adapt-public-target": "c4-revision-audible-target",
        "c4-adapt-several-sources": "c4-revision-many-models",
      };
      /** El coste que cada adaptación declara. Tienen que ser distintos, y ser el de su rama. */
      const COSTE_DECLARADO: Record<string, RegExp> = {
        "c4-adapt-public-target": /tiempo que se va entre vuelta y vuelta/,
        "c4-adapt-several-sources": /tiempo que se va en encadenar las tres/,
      };
      const EVIDENCIA_EXIGE: Record<string, RegExp[]> = {
        "c4-evidence-same-shape": [/perfil/, /final/],
        "c4-evidence-improved-today": [/mejorado hoy/],
      };
      const cumple = (frase: string, patrones: RegExp[]) =>
        patrones.every((patron) => patron.test(frase));

      it("ofrece una pieza por decisión real del recorrido y ninguna genérica", () => {
        expect(options.objective).toHaveLength(1);
        expect(options.principleAction).toHaveLength(2);
        expect(options.conditionRisk).toHaveLength(2);
        expect(options.adaptation).toHaveLength(2);
        expect(options.evidence).toHaveLength(2);
        for (const [pieza, accion] of Object.entries(PIEZA_HILO)) {
          expect(unit.actions.some((action) => action.id === accion), pieza).toBe(true);
        }
        for (const [pieza, accion] of Object.entries({ ...PIEZA_SUSTITUCION, ...PIEZA_REVISION })) {
          expect(unit.actions.some((action) => action.id === accion), pieza).toBe(true);
        }
      });

      /*
       * El límite de transferencia no es «algunas condiciones»: son las cinco del ecosistema. Las
       * dos formulaciones del principio tienen que mantenerlas enteras, porque son la mitad de lo
       * que esta unidad enseña a decir. Antes nombraban tres.
       */
      it("mantiene las cinco condiciones en las dos formulaciones del principio", () => {
        expect(label(options.objective[0]!)).toMatch(/sin que nadie haya necesitado/);
        expect(options.principleAction).toHaveLength(2);
        for (const option of options.principleAction) {
          expect(label(option), `${id(option)} no nombra de dónde viene el hilo`)
            .toMatch(/ecosistema prestado/);
          expect(label(option), `${id(option)} no declara que las condiciones no se suponen`)
            .toMatch(/sin dar por supuestas/);
          for (const condicion of CINCO_CONDICIONES) {
            expect(label(option), `${id(option)} pierde «${condicion}»`).toContain(condicion);
          }
        }
      });

      /*
       * El riesgo ya no es un enunciado general: nombra la dependencia que **esa** sustitución dejó
       * en pie, y el cierre de esa rama tiene que declarar la misma.
       */
      it("hace que cada riesgo nombre la dependencia que su propia sustitución dejó en pie", () => {
        for (const option of options.conditionRisk) {
          const sustitucion = PIEZA_SUSTITUCION[id(option)]!;
          expect(label(option), `${id(option)} no nombra su dependencia`)
            .toMatch(SUSTITUCION[sustitucion]!.pendiente);
          expect(label(option), `${id(option)} nombra la dependencia de la otra sustitución`)
            .not.toMatch(SUSTITUCION[otra(SUBSTITUTES, sustitucion as (typeof SUBSTITUTES)[number])]!.pendiente);
          // Y el cierre de las cuatro ramas con esa sustitución declara exactamente esa.
          for (const p of PRINCIPLES) {
            for (const r of REVISIONS) {
              const consequence = cierre(p, sustitucion, r);
              expect(consequence.observables.barrier.toLowerCase(), `${id(option)} · ${consequence.id}`)
                .toMatch(SUSTITUCION[sustitucion]!.pendiente);
            }
          }
        }
      });

      /*
       * Las dos adaptaciones ya no reparan todo: cada una declara **su** coste, los dos son
       * distintos, y el coste declarado es el mismo que el cierre de esa revisión deja pendiente.
       */
      it("declara en cada adaptación un coste propio, distinto del de la otra", () => {
        const costes = options.adaptation.map((option) => ({ id: id(option), texto: label(option) }));
        for (const { id: optionId, texto: cuerpo } of costes) {
          expect(cuerpo, `${optionId} no declara ningún coste`).toContain("a cambio de");
          expect(cuerpo, `${optionId} no declara su propio coste`).toMatch(COSTE_DECLARADO[optionId]!);
          const otroId = costes.find((candidate) => candidate.id !== optionId)!.id;
          expect(cuerpo, `${optionId} declara también el coste de la otra`)
            .not.toMatch(COSTE_DECLARADO[otroId]!);
        }
        // El coste declarado es lo que el cierre de esa revisión deja pendiente, en las cuatro ramas.
        for (const option of options.adaptation) {
          const revision = PIEZA_REVISION[id(option)]! as (typeof REVISIONS)[number];
          for (const p of PRINCIPLES) {
            for (const s of SUBSTITUTES) {
              const consequence = cierre(p, s, revision);
              expect(consequence.feedback.tension.toLowerCase(), `${id(option)} · ${consequence.id}`)
                .toMatch(APORTE_REVISION[otra(REVISIONS, revision)]!);
            }
          }
        }
      });

      it("respalda cada evidencia en el lado que afirma de los ocho cierres", () => {
        for (const evidence of options.evidence) {
          const exigencia = EVIDENCIA_EXIGE[id(evidence)];
          expect(exigencia, `${id(evidence)} no declara qué hace observable`).toBeDefined();
          expect(cumple(label(evidence), exigencia!), `${id(evidence)} habla de otra cosa`).toBe(true);
          for (const [p, s, r] of branches) {
            const consequence = cierre(p, s, r);
            const afirma = [
              consequence.observables.learning,
              consequence.observables.evidence,
              consequence.feedback.supports,
            ].join(" ").toLowerCase();
            const pendiente = [consequence.observables.barrier, consequence.feedback.tension]
              .join(" ").toLowerCase();
            expect(cumple(afirma, exigencia!), `«${id(evidence)}» no la respalda ${consequence.id}`).toBe(true);
            expect(
              cumple(pendiente, exigencia!) && !cumple(afirma, exigencia!),
              `${consequence.id} sólo nombra «${id(evidence)}» como lo que falta`,
            ).toBe(false);
          }
        }
      });

      /*
       * La comprobación central del bloqueo: cada frase de la gramática **nombra una rama** —hilo,
       * sustitución y revisión— y se contrasta contra el cierre que esa rama produce de verdad en el
       * motor. Una pieza reescrita para hablar de otra cosa deja de coincidir con su cierre y falla.
       */
      it("construye dieciséis frases y cada una se sostiene para la rama que nombra", () => {
        const combinaciones = options.principleAction.flatMap((principle) =>
          options.conditionRisk.flatMap((risk) =>
            options.adaptation.flatMap((adaptation) =>
              options.evidence.map((evidence) => ({
                principle: id(principle), risk: id(risk),
                adaptation: id(adaptation), evidence: id(evidence),
              })))));
        expect(combinaciones).toHaveLength(16);

        const ramasNombradas = new Set<string>();
        for (const frase of combinaciones) {
          const rotulo = `${frase.principle} + ${frase.risk} + ${frase.adaptation} + ${frase.evidence}`;
          const hilo = PIEZA_HILO[frase.principle]! as (typeof PRINCIPLES)[number];
          const sustitucion = PIEZA_SUSTITUCION[frase.risk]! as (typeof SUBSTITUTES)[number];
          const revision = PIEZA_REVISION[frase.adaptation]! as (typeof REVISIONS)[number];
          const consequence = cierre(hilo, sustitucion, revision);
          ramasNombradas.add(consequence.id);

          const afirma = [
            consequence.observables.learning,
            consequence.observables.evidence,
            consequence.feedback.supports,
          ].join(" ").toLowerCase();

          // El principio nombra el hilo que esa rama recorrió.
          expect(texto("principleAction", frase.principle), rotulo).toContain("ecosistema prestado");
          expect(afirma, `${rotulo}: el cierre no afirma el hilo que la frase nombra`)
            .toMatch(LOGRO_PRINCIPIO[hilo]!);
          // El riesgo nombra la dependencia que ese cierre declara en pie.
          expect(consequence.observables.barrier.toLowerCase(), rotulo)
            .toMatch(SUSTITUCION[sustitucion]!.pendiente);
          // La adaptación nombra la revisión que ese cierre afirma, con su coste.
          expect(afirma, `${rotulo}: el cierre no afirma la revisión que la frase nombra`)
            .toMatch(APORTE_REVISION[revision]!);
          expect(texto("adaptation", frase.adaptation), rotulo).toMatch(COSTE_DECLARADO[frase.adaptation]!);
          // Y la evidencia se observa en esa misma rama.
          expect(cumple(afirma, EVIDENCIA_EXIGE[frase.evidence]!), `${rotulo} · ${consequence.id}`).toBe(true);
        }
        // Las dieciséis frases cubren las ocho ramas: ninguna queda sin defensa posible.
        expect(ramasNombradas.size, [...ramasNombradas].join(", ")).toBe(8);
      });
    });

    it("registra la tradición solo cuando alguna decisión la puso realmente en juego", () => {
      const journal = (selectedActions: Record<string, string>) =>
        buildJournalEntry(
          unit,
          { ...createGameSession(unit), selectedActions },
          "2026-08-20T00:00:00.000Z",
          "00000000-0000-4000-8000-000000000000",
        );
      expect(journal({ "c4-principle": PRINCIPLES[0], "c4-substitute": SUBSTITUTES[0] }).combinedApproachIds)
        .toEqual(["suzuki"]);
      expect(journal({}).combinedApproachIds).toEqual([]);
      expect(journal({
        "c4-principle": "c4-principle-daily-home-listening",
        "c4-substitute": "c4-substitute-ask-families",
      }).combinedApproachIds).toEqual([]);
      for (const action of unit.actions) {
        for (const approachId of action.approachIds ?? []) {
          expect(unit.approachIds, action.id).toContain(approachId);
        }
      }
    });

    it("guarda la sustitución mantenida con su razón, distinta de la revisión", () => {
      const label = (id: string) => unit.actions.find((item) => item.id === id)?.label ?? "";
      for (const substitute of SUBSTITUTES) {
        const journal = buildJournalEntry(
          unit,
          {
            ...createGameSession(unit),
            selectedActions: {
              "c4-brief": "c4-brief-same-shape",
              "c4-plan": "c4-plan-conditions",
              "c4-principle": PRINCIPLES[0],
              "c4-substitute": substitute,
              "c4-revision": REVISIONS[0],
            },
          },
          "2026-08-20T00:00:00.000Z",
          "00000000-0000-4000-8000-000000000000",
        );
        // Lo que se mantiene es la sustitución, no la dependencia: la dependencia es justo lo que
        // se quitó de en medio, y llamarla «la dependencia que sustituí» decía lo contrario.
        expect(journal.maintainedDecision).toContain("Mantengo la sustitución que hice");
        expect(journal.maintainedDecision).not.toContain("Mantengo la dependencia");
        expect(journal.maintainedDecision).toContain(label(substitute));
        expect(journal.maintainedDecision).toContain("porque");
        expect(journal.revisedDecision).toContain(label(REVISIONS[0]));
        expect(journal.revisedDecision).not.toContain(label(substitute));
        expect(journal.firstDecision).toContain(label(PRINCIPLES[0]));
        expect(journal.defensibleAlternative).toContain("Allí no eran alternativas");
        expect(journal.combinedApproachIds).toEqual(["suzuki"]);
      }
    });

    it("continúa desde el caso 3 y se anuncia jugable en la campaña", () => {
      const anterior = parsed(formData);
      expect(anterior.completion?.nextRoute).toBe(`#/caso/${unit.slug}`);
      const unidad = campaignData.units.find((item) => item.caseSlug === unit.slug);
      expect(unidad?.id).toBe("caso-4");
      expect(unidad?.status).toBe("playable");
      expect(unidad?.approachIds).toEqual(["suzuki"]);
      expect(unidad?.minutes).toBe(unit.durationMinutes);
    });

    it("cierra el caso 4 sin adelantar el contenido de ninguna unidad pendiente", () => {
      if (!unit.completion) throw new Error("Falta el cierre del caso 4");
      const completion = `${unit.completion.title} ${unit.completion.body}`.toLowerCase();
      expect(completion).not.toMatch(/caso 5|caso 7|campbell|green|schafer|gordon|m7b|m7c|m8/);
    });

    /*
     * Y no basta con que el contenido de hoy lo cumpla: el contrato y el analizador tienen que
     * rechazar las cuatro maneras de romperlo que este caso hace más probables.
     */
    /*
     * ─────────────────────────────────────────────────────────────────────────────────────────
     * Coherencia causal: una rama no puede afirmar el fragmento entero si nada en su cadena lo
     * produjo.
     *
     * El defecto era exactamente ése en las cuatro ramas de pasos pequeños: la consigna troceaba el
     * fragmento en dos sonidos, ni ella ni ninguna de las dos revisiones devolvían al conjunto, y
     * los cierres afirmaban de todos modos que al final sonaba entero. La regresión no busca la
     * frase del cierre: sigue la cadena desde la acción elegida hasta lo que el cierre afirma.
     */
    describe("cadena causal · el conjunto se afirma sólo si algo lo produjo", () => {
      /** Qué compromiso de cada hilo hace que el fragmento llegue a sonar entero. */
      const PRODUCE_EL_CONJUNTO: Record<string, RegExp> = {
        // La escucha trabaja el fragmento entero desde el principio: es la unidad de todas las tomas.
        "c4-principle-model-before-playing": /el fragmento suene muchas veces/,
        // El paso pequeño trocea, y por eso su consigna tiene que devolver al conjunto.
        "c4-principle-small-steps": /el fragmento entero cada dos pasos/,
      };
      /** Y el cierre tiene que poder rastrearlo: dice por qué el conjunto existe. */
      const RASTRO_EN_EL_CIERRE: Record<string, RegExp> = {
        "c4-principle-model-before-playing": /de oído entero/,
        "c4-principle-small-steps": /el conjunto volvió cada dos pasos/,
      };
      const AFIRMA_EL_CONJUNTO = /mismo perfil y el mismo final/;
      const rotulo = (actionId: string) =>
        unit.actions.find((action) => action.id === actionId)!.label.toLowerCase();

      it("exige el compromiso con el conjunto en la acción de todo hilo que lo afirme", () => {
        for (const [p, sub_, r] of branches) {
          const consequence = cierre(p, sub_, r);
          const afirma = [
            consequence.observables.learning,
            consequence.observables.evidence,
            consequence.feedback.supports,
          ].join(" ").toLowerCase();
          if (!AFIRMA_EL_CONJUNTO.test(afirma)) continue;
          // Si el cierre afirma el fragmento entero, la acción elegida tiene que producirlo.
          expect(
            rotulo(p),
            `${consequence.id} afirma el fragmento entero y «${p}» no se compromete a producirlo`,
          ).toMatch(PRODUCE_EL_CONJUNTO[p]!);
          // Y el cierre tiene que decir de dónde sale, no darlo por supuesto.
          expect(
            afirma,
            `${consequence.id} afirma el fragmento entero sin decir qué lo produjo`,
          ).toMatch(RASTRO_EN_EL_CIERRE[p]!);
        }
      });

      it("hace que las ocho ramas terminables afirmen el conjunto, y ninguna termine sin él", () => {
        for (const [p, sub_, r] of branches) {
          const consequence = cierre(p, sub_, r);
          const afirma = [
            consequence.observables.learning,
            consequence.observables.evidence,
            consequence.feedback.supports,
          ].join(" ").toLowerCase();
          expect(afirma, `${consequence.id} no cumple el objetivo`).toMatch(AFIRMA_EL_CONJUNTO);
          // Y por tanto ninguna rama terminable devuelve a revisión: todas siguen a la defensa.
          expect(consequence.nextSceneId, consequence.id).toBe("c4-justification");
        }
        // La que no cumple el objetivo es la única que no sigue: devuelve a la primera decisión.
        const compartido = reveal({});
        expect(compartido.nextSceneId).toBe("c4-principle");
      });

      /*
       * El troceo tiene un precio, y tiene que ser el real: volver al conjunto cuesta tiempo. Si el
       * caso dijera que el precio es «el fragmento puede no sonar nunca» estaría describiendo un
       * diseño distinto del que la consigna produce.
       */
      it("cobra el troceo en tiempo, no en un fragmento que nunca suena", () => {
        for (const s_ of SUBSTITUTES) {
          const prueba = outcome("c4-principle-small-steps", s_);
          const declarado = [prueba.observables.barrier, prueba.feedback.tension]
            .join(" ").toLowerCase();
          expect(declarado, `${prueba.id} no cobra el troceo donde se paga`)
            .toMatch(/tiempo|reloj|caben pocos|se come/);
          expect(declarado, `${prueba.id} sigue diciendo que el conjunto puede no sonar`)
            .not.toMatch(/puede no llegar a sonar|sin fragmento|no llegan a ser una pieza/);
        }
      });
    });

    /*
     * ─────────────────────────────────────────────────────────────────────────────────────────
     * La gramática pertenece a la partida.
     *
     * Los recorridos no declaraban gramática, así que el arnés tomaba la primera opción de cada
     * hueco: las doce bitácoras salían con el hilo de la escucha, el riesgo del medio y el objetivo
     * dicho, dijeran lo que dijeran las acciones. La bitácora mezclaba ramas y nadie lo veía.
     */
    describe("bitácora · toda la entrada pertenece a una sola rama", () => {
      const PIEZA_HILO: Record<string, string> = {
        "c4-principle-model-before-playing": "c4-principle-listen-before-playing",
        "c4-principle-small-steps": "c4-principle-step-by-step",
      };
      const PIEZA_SUSTITUCION: Record<string, string> = {
        "c4-substitute-repetition-in-class": "c4-risk-medium-still-unequal",
        "c4-substitute-shared-medium": "c4-risk-repetition-still-scarce",
      };
      const PIEZA_REVISION: Record<string, string> = {
        "c4-revision-audible-target": "c4-adapt-public-target",
        "c4-revision-many-models": "c4-adapt-several-sources",
      };
      const walks = declaredWalkthroughs.filter((walk) => walk.caseSlug === unit.slug);
      const definicion = findPlayableCase(unit.slug)!;
      const grammarScene = unit.scenes.find((item) => item.id === "c4-justification");
      if (grammarScene?.kind !== "justification") throw new Error("Falta la justificación");
      const piezaLabel = (key: keyof typeof grammarScene.grammarOptions, optionId: string) => {
        const option = grammarScene.grammarOptions[key].find((candidate) =>
          typeof candidate === "string" ? candidate === optionId : candidate.id === optionId,
        )!;
        return typeof option === "string" ? option : option.label;
      };

      it("declara gramática en los doce recorridos del caso", () => {
        expect(walks).toHaveLength(12);
        for (const walk of walks) {
          expect(walk.grammar, `${walk.id} no declara gramática`).toBeDefined();
          for (const key of ["objective", "principleAction", "conditionRisk", "adaptation", "evidence"]) {
            expect(walk.grammar?.[key], `${walk.id} no declara ${key}`).toBeTruthy();
          }
        }
      });

      /*
       * La comprobación de fondo: se ejecuta el recorrido de verdad y se mira la bitácora que
       * produce. Cada pieza tiene que ser la de la rama que las acciones recorrieron, no la primera
       * de la lista. Si alguien quita el `grammar` de un recorrido, la entrada vuelve a describir
       * otra rama y esto falla.
       */
      it("produce en cada recorrido una bitácora cuyas piezas son las de su propia rama", () => {
        for (const walk of walks) {
          const trace = runWalkthrough(definicion, walk);
          expect(trace.blocked, walk.id).toBeUndefined();
          const journal = trace.journal;
          expect(journal, walk.id).toBeDefined();
          if (!journal) continue;

          // La rama efectiva es la última acción de cada tipo que el recorrido llegó a consumir.
          const ultima = (mapa: Record<string, string>) =>
            [...walk.actions].reverse().find((actionId) => actionId in mapa)!;
          const hilo = ultima(PIEZA_HILO);
          const sustitucion = ultima(PIEZA_SUSTITUCION);
          const revision = ultima(PIEZA_REVISION);

          // Lo que la bitácora guarda como decisiones tiene que ser esa misma rama.
          expect(journal.firstDecision, `${walk.id}: el hilo guardado no es el recorrido`)
            .toContain(unit.actions.find((action) => action.id === hilo)!.label);
          expect(journal.maintainedDecision, `${walk.id}: la sustitución guardada no es la recorrida`)
            .toContain(unit.actions.find((action) => action.id === sustitucion)!.label);
          expect(journal.revisedDecision, `${walk.id}: la revisión guardada no es la recorrida`)
            .toContain(unit.actions.find((action) => action.id === revision)!.label);

          // Y las piezas de gramática tienen que ser las de esa rama, no las primeras de la lista.
          expect(journal.finalGrammar, `${walk.id}: el principio de la frase es de otra rama`)
            .toContain(piezaLabel("principleAction", PIEZA_HILO[hilo]!));
          expect(journal.conditionRisk, `${walk.id}: el riesgo es de otra sustitución`)
            .toBe(piezaLabel("conditionRisk", PIEZA_SUSTITUCION[sustitucion]!));
          expect(journal.adaptation, `${walk.id}: la adaptación es de otra revisión`)
            .toBe(piezaLabel("adaptation", PIEZA_REVISION[revision]!));

          // Y la frase final tiene que ser coherente con el cierre que esa rama produjo de verdad.
          const consequence = cierre(
            hilo as (typeof PRINCIPLES)[number],
            sustitucion as (typeof SUBSTITUTES)[number],
            revision as (typeof REVISIONS)[number],
          );
          expect(consequence.observables.barrier.toLowerCase(), `${walk.id} · ${consequence.id}`)
            .toMatch(SUSTITUCION[sustitucion]!.pendiente);
          expect(journal.observableEvidence, walk.id).not.toContain("decisión pendiente");
        }
      });

      it("recorre las ocho ramas y las dos evidencias entre los recorridos declarados", () => {
        const ramas = new Set<string>();
        const evidencias = new Set<string>();
        for (const walk of walks) {
          const ultima = (mapa: Record<string, string>) =>
            [...walk.actions].reverse().find((actionId) => actionId in mapa)!;
          ramas.add(cierre(
            ultima(PIEZA_HILO) as (typeof PRINCIPLES)[number],
            ultima(PIEZA_SUSTITUCION) as (typeof SUBSTITUTES)[number],
            ultima(PIEZA_REVISION) as (typeof REVISIONS)[number],
          ).id);
          evidencias.add(walk.grammar!.evidence!);
        }
        expect(ramas.size, [...ramas].join(", ")).toBe(8);
        expect(evidencias.size).toBe(2);
        // Ocho ramas por dos evidencias son las dieciséis frases que la unidad puede defender.
        expect(ramas.size * evidencias.size).toBe(16);
      });
    });

    /*
     * ─────────────────────────────────────────────────────────────────────────────────────────
     * Los costes de las dos revisiones son causales y observables: los dos gastan el mismo recurso
     * escaso —los dos minutos— y cada uno lo gasta en un sitio distinto que puede contarse. Antes
     * eran carencias afirmadas sin causa: nada impedía decir el objetivo *y* repartir las fuentes.
     */
    it("cobra las dos revisiones en el mismo recurso escaso y lo hace contable", () => {
      const revisiones = {
        "c4-revision-target-outcome": /entre vuelta y vuelta|decir el objetivo y juzgar/,
        "c4-revision-models-outcome": /encadenar las tres/,
      } as const;
      for (const [id, donde] of Object.entries(revisiones)) {
        const consequence = unit.consequences.find((item) => item.id === id)!;
        const coste = [consequence.observables.barrier, consequence.feedback.tension]
          .join(" ").toLowerCase();
        // El coste se paga en el reloj, y se dice dónde.
        expect(coste, `${id} no dice dónde se va el tiempo`).toMatch(donde);
        expect(coste, `${id} no cobra en vueltas que dejan de sonar`)
          .toMatch(/menos vueltas|vueltas que dejan de sonar|suenan menos/);
        // Y es observable: se cuenta.
        expect(
          [consequence.observables.evidence, consequence.feedback.observableEvidence]
            .join(" ").toLowerCase(),
          `${id} no ofrece manera de contarlo`,
        ).toMatch(/cuenta|contar|cuántas vueltas/);
      }
      // Los ocho cierres cobran el mismo precio y lo dicen.
      for (const [p, sub_, r] of branches) {
        expect(cierre(p, sub_, r).feedback.tension.toLowerCase(), cierre(p, sub_, r).id)
          .toMatch(/el reloj lo paga/);
      }
    });

    /*
     * ─────────────────────────────────────────────────────────────────────────────────────────
     * Las cinco condiciones del ecosistema se separan enteras, y el caso no promete que el ciclo
     * completo quepa justo antes de obligar a aislar un hilo.
     */
    describe("las cinco condiciones se nombran y ninguna se da por disponible", () => {
      const CONDICIONES = CINCO_CONDICIONES;
      const escena = unit.scenes.find((item) => item.id === "c4-plan");
      const acierto = unit.actions.find((item) => item.id === "c4-plan-conditions")!;

      it("las enumera en la respuesta que separa principio y condiciones", () => {
        const rotulo = acierto.label.toLowerCase();
        for (const condicion of CONDICIONES) {
          expect(rotulo, `la respuesta no nombra «${condicion}»`).toContain(condicion);
        }
      });

      it("las pone todas en la escena antes de preguntar por ellas", () => {
        const relato = (escena?.introduction ?? "").toLowerCase();
        for (const marca of [
          "continuidad y práctica diaria", "instrumento", "enseñanza instrumental individual",
          "tiempo fuera de clase", "persona cuidadora",
        ]) {
          expect(relato, `la escena no pone «${marca}» sobre la mesa`).toContain(marca);
        }
      });

      /*
       * Y no puede prometerse el ciclo entero: la pantalla siguiente obliga a tirar de un solo
       * hilo, así que decir aquí que «escuchar, modelar, imitar y repetir sí cabe hoy» sería
       * desmentido treinta segundos después por el propio juego.
       */
      it("no promete el ciclo completo justo antes de obligar a aislar un hilo", () => {
        const rotulo = acierto.label.toLowerCase();
        expect(rotulo, "la respuesta sigue prometiendo el ciclo entero")
          .not.toMatch(/modelar, imitar y repetir por pasos pequeños sí cab|el ciclo entero cabe/);
        expect(rotulo, "la respuesta no dice que hoy sólo cabe un hilo").toMatch(/un hilo/);
        const devolucion = unit.consequences.find((item) => item.id === "c4-feedback-conditions")!;
        expect(devolucion.feedback.tension.toLowerCase(), "la devolución no declara el límite")
          .toMatch(/no cabe en dos minutos|el ciclo completo no cabe/);
        // Y la pantalla que viene detrás es, de hecho, la que obliga a elegir uno.
        expect(devolucion.nextSceneId).toBe("c4-principle");
      });
    });

    /*
     * ─────────────────────────────────────────────────────────────────────────────────────────
     * Partidas humanas.
     *
     * Los recorridos declarados prueban la lógica de un guion; no prueban lo que puede hacer quien
     * juega. Y ahí estaba el defecto: la pantalla de justificación ofrecía las seis piezas de
     * principio, riesgo y adaptación en todas las ramas, de modo que cualquiera podía montar una
     * clase y defender otra. Declarar la gramática en los recorridos no lo arreglaba: sólo hacía
     * que el arnés eligiera bien.
     *
     * Estas pruebas juegan las ocho ramas **como las jugaría una persona** —escena a escena, con
     * `selectAction` y `selectGrammar`— y comprueban qué le ofrece y qué le acepta el juego.
     */
    describe("partida humana · la defensa pertenece a la clase que se montó", () => {
      const PIEZA_HILO: Record<string, string> = {
        "c4-principle-model-before-playing": "c4-principle-listen-before-playing",
        "c4-principle-small-steps": "c4-principle-step-by-step",
      };
      const PIEZA_SUSTITUCION: Record<string, string> = {
        "c4-substitute-repetition-in-class": "c4-risk-medium-still-unequal",
        "c4-substitute-shared-medium": "c4-risk-repetition-still-scarce",
      };
      const PIEZA_REVISION: Record<string, string> = {
        "c4-revision-audible-target": "c4-adapt-public-target",
        "c4-revision-many-models": "c4-adapt-several-sources",
      };
      const EVIDENCIAS = ["c4-evidence-same-shape", "c4-evidence-improved-today"] as const;

      const jugar = jugarRama;
      const idDe = (option: string | { id: string; label: string }) =>
        typeof option === "string" ? option : option.id;

      it("ofrece en las ocho ramas solo la pieza de la rama, y las dos evidencias", () => {
        for (const [p, sub_, r] of branches) {
          const session = jugar(p, sub_, r);
          const rotulo = `${p} + ${sub_} + ${r}`;

          expect(grammarChoices(unit, session, "principleAction").map(idDe), rotulo)
            .toEqual([PIEZA_HILO[p]]);
          expect(grammarChoices(unit, session, "conditionRisk").map(idDe), rotulo)
            .toEqual([PIEZA_SUSTITUCION[sub_]]);
          expect(grammarChoices(unit, session, "adaptation").map(idDe), rotulo)
            .toEqual([PIEZA_REVISION[r]]);
          // La evidencia sigue siendo una elección: las dos se sostienen en cualquier rama.
          expect(grammarChoices(unit, session, "evidence").map(idDe).sort(), rotulo)
            .toEqual([...EVIDENCIAS].sort());
        }
      });

      /*
       * Y no basta con no ofrecerla: si alguien la fuerza —un envío manipulado, un recorrido mal
       * declarado— la justificación no puede aceptarla.
       */
      it("rechaza una pieza válida que pertenece a otra rama", () => {
        for (const [p, sub_, r] of branches) {
          const session = jugar(p, sub_, r);
          const ajenas: Array<[Parameters<typeof grammarChoices>[2], string]> = [
            ["principleAction", PIEZA_HILO[otra(PRINCIPLES, p)]!],
            ["conditionRisk", PIEZA_SUSTITUCION[otra(SUBSTITUTES, sub_)]!],
            ["adaptation", PIEZA_REVISION[otra(REVISIONS, r)]!],
          ];
          for (const [hueco, ajena] of ajenas) {
            // La pieza existe y es válida: sólo pertenece a otra rama.
            const existe = (unit.scenes.find((item) => item.id === "c4-justification") as
              Extract<typeof unit.scenes[number], { kind: "justification" }>)
              .grammarOptions[hueco].some((option) => idDe(option) === ajena);
            expect(existe, `${ajena} debería existir en la gramática`).toBe(true);

            const despues = selectGrammar(unit, session, hueco, ajena);
            expect(despues.selectedGrammar[hueco], `${hueco}: aceptó «${ajena}» de otra rama`)
              .toBeUndefined();
            expect(despues, `${hueco}: la sesión cambió al rechazar la pieza`).toBe(session);
          }
        }
      });

      /*
       * Ocho ramas por dos evidencias son dieciséis defensas, y las dieciséis tienen que producir
       * una bitácora completa: todos sus campos escritos, sin plantillas sin sustituir, sin huecos
       * pendientes y con las piezas de su propia rama.
       */
      it("produce dieciséis bitácoras completas y ninguna mezcla ramas", () => {
        const frases = new Set<string>();
        for (const [p, sub_, r] of branches) {
          for (const evidencia of EVIDENCIAS) {
            let session = jugar(p, sub_, r);
            for (const [hueco, pieza] of [
              ["objective", "c4-objective-same-shape-no-ecosystem"],
              ["principleAction", PIEZA_HILO[p]!],
              ["conditionRisk", PIEZA_SUSTITUCION[sub_]!],
              ["adaptation", PIEZA_REVISION[r]!],
              ["evidence", evidencia],
            ] as const) {
              session = selectGrammar(unit, session, hueco, pieza);
              expect(session.selectedGrammar[hueco], `${hueco} de su propia rama`).toBe(pieza);
            }
            expect(grammarComplete(session)).toBe(true);
            expect(canFinishCase(unit, session)).toBe(true);

            const journal = buildJournalEntry(
              unit, session, "2026-08-21T00:00:00.000Z", "00000000-0000-4000-8000-000000000000",
            );
            const rotulo = `${p} + ${sub_} + ${r} + ${evidencia}`;

            // Todos los campos de la bitácora, no sólo los que se miraban antes.
            for (const [campo, valor] of Object.entries(journal)) {
              if (typeof valor !== "string") continue;
              expect(valor, `${rotulo}: ${campo} vacío`).not.toHaveLength(0);
              expect(valor, `${rotulo}: ${campo} con plantilla sin sustituir`).not.toContain("{{");
              expect(valor, `${rotulo}: ${campo} con un hueco sin decidir`)
                .not.toContain("decisión pendiente");
              expect(valor, `${rotulo}: ${campo} con una acción sin elegir`)
                .not.toContain("Sin selección");
            }
            expect(journal.combinedApproachIds, rotulo).toEqual(["suzuki"]);

            // Y cada campo habla de su rama: las piezas de las otras no aparecen en ningún sitio.
            const entera = JSON.stringify(journal);
            for (const ajena of [
              PIEZA_HILO[otra(PRINCIPLES, p)]!, PIEZA_SUSTITUCION[otra(SUBSTITUTES, sub_)]!,
              PIEZA_REVISION[otra(REVISIONS, r)]!,
            ]) {
              const etiqueta = (unit.scenes.find((item) => item.id === "c4-justification") as
                Extract<typeof unit.scenes[number], { kind: "justification" }>);
              const texto = Object.values(etiqueta.grammarOptions)
                .flat()
                .find((option) => idDe(option) === ajena);
              const label = typeof texto === "string" ? texto : texto!.label;
              expect(entera, `${rotulo}: la bitácora recoge «${ajena}», que es de otra rama`)
                .not.toContain(label);
            }
            frases.add(`${journal.finalGrammar}`);
          }
        }
        // Dieciséis defensas distintas: ocho ramas por dos evidencias.
        expect(frases.size).toBe(16);
      });

      /*
       * La alternativa defendible comparaba dos carencias inventadas —«una sola fuente», «nadie
       * diga qué se busca»— que ya no existen. Tiene que comparar el coste real: el mismo reloj.
       */
      it("compara en la bitácora los costes causales y no los antiguos", () => {
        const alternativa = unit.journalTemplate!["defensible-alternative"]!.toLowerCase();
        expect(alternativa, "sigue el coste antiguo de la fuente única")
          .not.toMatch(/una sola fuente/);
        expect(alternativa, "sigue el coste antiguo del criterio ausente")
          .not.toMatch(/nadie diga/);
        expect(alternativa, "no nombra el recurso que las dos gastan").toMatch(/dos minutos/);
        expect(alternativa, "no nombra dónde se va el tiempo en cada una")
          .toMatch(/entre vuelta y vuelta/);
        expect(alternativa, "no nombra la otra manera de gastarlo").toMatch(/encadenar las tres/);
        expect(alternativa, "no dice qué se pierde").toMatch(/menos vueltas/);
        // Y sigue diciendo que allí los hilos no eran alternativas.
        expect(alternativa).toMatch(/no eran alternativas/);
      });
    });

    /*
     * ─────────────────────────────────────────────────────────────────────────────────────────
     * Enlace directo y partidas a medias.
     *
     * La corrección anterior ató la gramática a la rama, pero dejó una reserva: si el filtro vaciaba
     * un hueco, se ofrecían **todas** sus piezas. Eso convertía el enlace directo a la justificación
     * —el estado donde no hay ninguna clase de la que hablar— en el más permisivo de todos:
     * cualquiera podía construir la defensa completa de una rama que nadie había jugado. Un hueco
     * ligado sin rama presente tiene que quedarse vacío, y la pantalla tiene que decir qué falta.
     */
    describe("defensa sin rama · el hueco vacío no se rellena con piezas de nadie", () => {
      const LIGADOS = ["principleAction", "conditionRisk", "adaptation"] as const;
      const PIEZAS_LIGADAS: Record<(typeof LIGADOS)[number], readonly string[]> = {
        principleAction: ["c4-principle-listen-before-playing", "c4-principle-step-by-step"],
        conditionRisk: ["c4-risk-medium-still-unequal", "c4-risk-repetition-still-scarce"],
        adaptation: ["c4-adapt-public-target", "c4-adapt-several-sources"],
      };
      const DECIDE_EL_HUECO: Record<(typeof LIGADOS)[number], string> = {
        principleAction: "c4-principle",
        conditionRisk: "c4-substitute",
        adaptation: "c4-revision",
      };
      const idDe = (option: string | { id: string; label: string }) =>
        typeof option === "string" ? option : option.id;

      it("no ofrece ninguna pieza ligada al entrar por enlace directo sin decisiones", () => {
        const directa = createGameSession(unit, "c4-justification");
        expect(directa.sceneId).toBe("c4-justification");
        for (const hueco of LIGADOS) {
          expect(grammarChoices(unit, directa, hueco).map(idDe), hueco).toEqual([]);
        }
        // El hueco libre no depende de ninguna rama: las dos evidencias siguen ahí.
        expect(grammarChoices(unit, directa, "evidence")).toHaveLength(2);
        expect(grammarChoices(unit, directa, "objective")).toHaveLength(1);
        // Y por tanto no hay defensa que llevar a la bitácora.
        expect(grammarComplete(directa)).toBe(false);
      });

      it("rechaza cualquier pieza ligada mientras falte su decisión", () => {
        const directa = createGameSession(unit, "c4-justification");
        for (const hueco of LIGADOS) {
          for (const pieza of PIEZAS_LIGADAS[hueco]) {
            const despues = selectGrammar(unit, directa, hueco, pieza);
            expect(despues.selectedGrammar[hueco], `${hueco}: aceptó «${pieza}» sin decisión`)
              .toBeUndefined();
            expect(despues, `${hueco}: la sesión cambió al rechazar «${pieza}»`).toBe(directa);
          }
        }
        // La evidencia sí puede elegirse: no depende de ninguna rama.
        const conEvidencia = selectGrammar(unit, directa, "evidence", "c4-evidence-same-shape");
        expect(conEvidencia.selectedGrammar.evidence).toBe("c4-evidence-same-shape");
      });

      /*
       * Los estados a medias son el caso interesante: una o dos decisiones tomadas abren su hueco y
       * dejan los otros cerrados. Si un hueco se abriera antes de tiempo, la defensa podría hablar
       * de algo que todavía no se ha decidido.
       */
      it("abre cada hueco exactamente cuando se toma su decisión, ni antes ni después", () => {
        const escenaDe = (sceneId: string) => {
          const scene = unit.scenes.find((item) => item.id === sceneId);
          if (scene?.kind !== "design" && scene?.kind !== "revision" && scene?.kind !== "observation") {
            throw new Error(`${sceneId} no admite decisiones`);
          }
          return scene;
        };
        const pasos: Array<[string, string, (typeof LIGADOS)[number]]> = [
          ["c4-principle", "c4-principle-model-before-playing", "principleAction"],
          ["c4-substitute", "c4-substitute-shared-medium", "conditionRisk"],
          ["c4-revision", "c4-revision-many-models", "adaptation"],
        ];
        let session = createGameSession(unit, "c4-justification");
        const abiertos = new Set<string>();

        for (const [sceneId, actionId, hueco] of pasos) {
          // Antes de decidir: cerrado.
          expect(grammarChoices(unit, session, hueco), `${hueco} abierto antes de tiempo`).toEqual([]);
          session = selectAction(unit, session, escenaDe(sceneId), actionId);
          abiertos.add(hueco);
          // Después: exactamente una pieza, la de la decisión tomada.
          expect(grammarChoices(unit, session, hueco).map(idDe), hueco).toHaveLength(1);
          // Y los que aún no se han decidido siguen cerrados.
          for (const otro of LIGADOS) {
            if (abiertos.has(otro)) continue;
            expect(grammarChoices(unit, session, otro), `${otro} se abrió con otra decisión`).toEqual([]);
          }
        }
        expect(grammarChoices(unit, session, "principleAction").map(idDe))
          .toEqual(["c4-principle-listen-before-playing"]);
        expect(grammarChoices(unit, session, "conditionRisk").map(idDe))
          .toEqual(["c4-risk-repetition-still-scarce"]);
        expect(grammarChoices(unit, session, "adaptation").map(idDe))
          .toEqual(["c4-adapt-several-sources"]);
      });

      /*
       * Y la pantalla tiene que orientar: decir qué falta y a dónde ir. La escena se deriva del
       * contenido —qué etiquetas pide el hueco, qué acciones las aportan, a qué escena pertenecen—,
       * de modo que no hay ninguna escrita a mano que pueda quedarse desfasada.
       */
      it("orienta a la pantalla donde se toma cada decisión que falta", () => {
        const directa = createGameSession(unit, "c4-justification");
        const pendientes = pendingGrammarDecisions(unit, directa);
        expect(pendientes.map((item) => item.key)).toEqual([...LIGADOS]);
        for (const pendiente of pendientes) {
          expect(pendiente.sceneId, pendiente.key)
            .toBe(DECIDE_EL_HUECO[pendiente.key as (typeof LIGADOS)[number]]);
          const escena = unit.scenes.find((item) => item.id === pendiente.sceneId);
          expect(escena?.title, pendiente.key).toBe(pendiente.sceneTitle);
        }
        // La primera orientación es la primera decisión del caso.
        expect(pendientes[0]?.sceneId).toBe("c4-principle");

        // Con el hilo ya elegido, deja de orientar a esa pantalla y pasa a la siguiente.
        const escena = unit.scenes.find((item) => item.id === "c4-principle");
        if (escena?.kind !== "design") throw new Error("Falta la primera decisión");
        const conHilo = selectAction(unit, directa, escena, "c4-principle-small-steps");
        const siguientes = pendingGrammarDecisions(unit, conHilo);
        expect(siguientes.map((item) => item.key)).toEqual(["conditionRisk", "adaptation"]);
        expect(siguientes[0]?.sceneId).toBe("c4-substitute");

        // Y con la rama entera no queda nada pendiente.
        const completa = jugarRama(
          "c4-principle-model-before-playing",
          "c4-substitute-repetition-in-class",
          "c4-revision-audible-target",
        );
        expect(pendingGrammarDecisions(unit, completa)).toEqual([]);
      });

      /*
       * Piezas que exigen más de una etiqueta.
       *
       * El caso 4 no las usa —cada pieza suya depende de una sola decisión—, pero el contrato las
       * admite y el intérprete tiene que tratarlas bien, porque el defecto sólo aparece ahí: si la
       * orientación mira las etiquetas que la pieza **exige** en lugar de las que **faltan**, manda
       * de vuelta a una pantalla ya resuelta. Con una pieza que pide `a` y `b` y una partida que ya
       * tiene `a`, la salida apuntaría a `a` y quien juega daría vueltas en la decisión que ya
       * tomó, mientras la que abre el hueco es `b`.
       *
       * La comprobación se hace sobre una variante sintética del caso —el contenido publicado no se
       * toca— porque es la única manera de ejercitar el camino sin inventar contenido pedagógico.
       */
      describe("piezas con varias etiquetas · la salida apunta a lo que falta", () => {
        /** Las dos piezas del hueco pasan a exigir el hilo **y** una revisión. */
        const conDosEtiquetas = () => {
          const variante = structuredClone(environmentData) as {
            scenes: Array<{
              id: string;
              grammarOptions?: Record<string, Array<{ id: string; requiredTags?: string[] }>>;
            }>;
          };
          const justificacion = variante.scenes.find((item) => item.id === "c4-justification")!;
          const piezas = justificacion.grammarOptions!.principleAction!;
          piezas[0]!.requiredTags = ["principle-listening", "revision-target"];
          piezas[1]!.requiredTags = ["principle-listening", "revision-sources"];
          const resultado = validateCaseDefinition(variante);
          expect(resultado.ok, resultado.ok ? "" : JSON.stringify(resultado.issues)).toBe(true);
          if (!resultado.ok) throw new Error("La variante no valida");
          return resultado.value;
        };
        const con = (unidad: ReturnType<typeof conDosEtiquetas>, selectedActions: Record<string, string>) =>
          ({ ...createGameSession(unidad, "c4-justification"), selectedActions });

        it("orienta a la primera decisión cuando no falta ninguna en concreto", () => {
          const unidad = conDosEtiquetas();
          const vacia = con(unidad, {});
          expect(grammarChoices(unidad, vacia, "principleAction")).toEqual([]);
          const pendiente = pendingGrammarDecisions(unidad, vacia)
            .find((item) => item.key === "principleAction");
          // Sin nada decidido, la primera etiqueta que falta se consigue en el primer momento.
          expect(pendiente?.sceneId).toBe("c4-principle");
        });

        it("mueve la orientación a la etiqueta que falta cuando la primera ya está", () => {
          const unidad = conDosEtiquetas();
          const conHilo = con(unidad, { "c4-principle": "c4-principle-model-before-playing" });

          // El hueco sigue cerrado: las dos piezas necesitan además una revisión.
          expect(grammarChoices(unidad, conHilo, "principleAction")).toEqual([]);

          const pendiente = pendingGrammarDecisions(unidad, conHilo)
            .find((item) => item.key === "principleAction");
          expect(pendiente, "el hueco vacío tiene que seguir orientando").toBeDefined();
          // Y ya no manda de vuelta al hilo, que es la decisión que la partida ya tomó.
          expect(pendiente?.sceneId, "vuelve a una pantalla ya resuelta").not.toBe("c4-principle");
          expect(pendiente?.sceneId).toBe("c4-revision");
          expect(pendiente?.sceneTitle)
            .toBe(unidad.scenes.find((item) => item.id === "c4-revision")!.title);
        });

        it("abre el hueco en cuanto se consigue la etiqueta que faltaba", () => {
          const unidad = conDosEtiquetas();
          const completa = con(unidad, {
            "c4-principle": "c4-principle-model-before-playing",
            "c4-revision": "c4-revision-audible-target",
          });
          const disponibles = grammarChoices(unidad, completa, "principleAction")
            .map((option) => (typeof option === "string" ? option : option.id));
          // Sólo la pieza cuyas dos etiquetas están presentes; la otra pedía la otra revisión.
          expect(disponibles).toEqual(["c4-principle-listen-before-playing"]);
          expect(pendingGrammarDecisions(unidad, completa).map((item) => item.key))
            .not.toContain("principleAction");
          // Y ahora sí puede elegirse, mientras la de la otra revisión sigue rechazada.
          const elegida = selectGrammar(unidad, completa, "principleAction", "c4-principle-listen-before-playing");
          expect(elegida.selectedGrammar.principleAction).toBe("c4-principle-listen-before-playing");
          const ajena = selectGrammar(unidad, completa, "principleAction", "c4-principle-step-by-step");
          expect(ajena.selectedGrammar.principleAction).toBeUndefined();
        });

        it("no altera el caso publicado, cuyas piezas dependen de una sola decisión", () => {
          const justificacion = unit.scenes.find((item) => item.id === "c4-justification");
          if (justificacion?.kind !== "justification") throw new Error("Falta la justificación");
          for (const [key, options] of Object.entries(justificacion.grammarOptions)) {
            for (const option of options) {
              if (typeof option === "string" || !option.requiredTags) continue;
              expect(option.requiredTags, `${key}.${option.id}`).toHaveLength(1);
            }
          }
        });
      });

      /*
       * La orientación no puede hablar de «montaje»: es la palabra del caso 3, que sí tiene
       * montador. El caso 4 separa condiciones y no monta nada.
       */
      it("no llama montaje a lo que en este caso no lo es", () => {
        const escena = unit.scenes.find((item) => item.id === "c4-justification");
        expect(escena?.introduction.toLowerCase()).not.toMatch(/mont/);
        expect(unit.assembly, "el caso 4 no usa montador").toBeUndefined();
        for (const pendiente of pendingGrammarDecisions(unit, createGameSession(unit, "c4-justification"))) {
          expect(pendiente.sceneTitle.toLowerCase(), pendiente.key).not.toMatch(/mont/);
        }
      });
    });

    /*
     * ─────────────────────────────────────────────────────────────────────────────────────────
     * Y nada de esto puede tocar a quien no ata su gramática. El caso 6 abre su justificación por
     * enlace directo desde M4 y esa pantalla es una deuda documentada que esta entrega no arregla:
     * lo que sí tiene que hacer es no empeorarla.
     */
    it("conserva intacto el enlace directo a la justificación del caso 6 y de todo caso sin ataduras", () => {
      for (const otroCaso of playableCases) {
        if (otroCaso.slug === unit.slug) continue;
        const justificacion = otroCaso.scenes.find((item) => item.kind === "justification");
        if (justificacion?.kind !== "justification") continue;

        const directa = createGameSession(otroCaso, justificacion.id);
        // Ninguna pieza de estos casos declara etiquetas, así que nada se filtra…
        for (const [key, options] of Object.entries(justificacion.grammarOptions)) {
          for (const option of options) {
            expect(
              typeof option === "string" || option.requiredTags === undefined,
              `${otroCaso.slug}.${key}: declara requiredTags y este caso no debía cambiar`,
            ).toBe(true);
          }
          expect(
            grammarChoices(otroCaso, directa, key as Parameters<typeof grammarChoices>[2]).length,
            `${otroCaso.slug}.${key}`,
          ).toBe(options.length);
        }
        // …y por tanto no hay nada pendiente ni aviso que mostrar.
        expect(pendingGrammarDecisions(otroCaso, directa), otroCaso.slug).toEqual([]);
        // La pieza se puede elegir sin decisiones previas, como hasta ahora.
        const primera = justificacion.grammarOptions.objective[0]!;
        const id = typeof primera === "string" ? primera : primera.id;
        expect(selectGrammar(otroCaso, directa, "objective", id).selectedGrammar.objective).toBe(id);
      }
      // El caso 6 en concreto, que es el que tiene ruta de prueba desde M6.
      const caso6 = playableCases.find((item) => item.slug === "el-arreglo-que-no-escucha-a-todos")!;
      const directa6 = createGameSession(caso6, "pilot-justification");
      expect(pendingGrammarDecisions(caso6, directa6)).toEqual([]);
      expect(grammarChoices(caso6, directa6, "principleAction").length).toBeGreaterThan(1);
    });

    /*
     * ─────────────────────────────────────────────────────────────────────────────────────────
     * El reparto no puede contradecir la consigna. La vuelta al conjunto está dentro del paso
     * pequeño, así que ninguna nota puede decir que no hay sitio para el fragmento entero: era lo
     * que decían las de Mara, escritas cuando el troceo no volvía nunca.
     */
    it("no deja ninguna nota de reparto que niegue la vuelta al conjunto", () => {
      const NIEGA_EL_CONJUNTO =
        /no ha reservado sitio|no hay sitio para (eso|el fragmento)|sin sitio para el conjunto|no llega a sonar entero/;
      for (const consequence of unit.consequences) {
        for (const role of consequence.participation?.roles ?? []) {
          expect(
            NIEGA_EL_CONJUNTO.test((role.note ?? "").toLowerCase()),
            `${consequence.id} · ${role.characterId}: la nota niega la vuelta al conjunto que la consigna sí hace`,
          ).toBe(false);
        }
      }
      // Y donde el reparto habla del conjunto en las ramas de paso pequeño, lo hace como algo que
      // ocurre, no como algo que falta.
      for (const id of ["c4-choice-principle-steps", "c4-outcome-steps-time"]) {
        const nota = unit.consequences
          .find((item) => item.id === id)!
          .participation!.roles.find((role) => role.characterId === "mara")!.note!.toLowerCase();
        expect(nota, `${id}: la nota de Mara no reconoce la vuelta al conjunto`)
          .toMatch(/vuelta al conjunto/);
      }
    });

    it("rechaza un hueco de gramática atado a medias", () => {
      const variante = structuredClone(environmentData) as {
        scenes: Array<{ id: string; grammarOptions?: Record<string, Array<{ id: string; requiredTags?: string[] }>> }>;
      };
      const justificacion = variante.scenes.find((item) => item.id === "c4-justification")!;
      // Una sola pieza sin atar basta para que el filtro deje de filtrar: se ofrecería siempre.
      delete justificacion.grammarOptions!.adaptation![0]!.requiredTags;
      const resultado = validateCaseDefinition(variante);
      expect(resultado.ok).toBe(false);
      if (resultado.ok) return;
      expect(resultado.issues.map((issue) => issue.code)).toContain("partial-grammar-branch");
    });

    it("rechaza una pieza que exija una etiqueta que ninguna acción pone en juego", () => {
      const variante = structuredClone(environmentData) as {
        scenes: Array<{ id: string; grammarOptions?: Record<string, Array<{ id: string; requiredTags?: string[] }>> }>;
      };
      const justificacion = variante.scenes.find((item) => item.id === "c4-justification")!;
      justificacion.grammarOptions!.conditionRisk![0]!.requiredTags = ["etiqueta-inexistente"];
      const resultado = validateCaseDefinition(variante);
      expect(resultado.ok).toBe(false);
      if (resultado.ok) return;
      expect(resultado.issues.map((issue) => issue.code)).toContain("unknown-tag");
    });

    it("rechaza un recorrido que declare una pieza de gramática inexistente", () => {
      const variante = structuredClone(walkthroughData) as {
        walkthroughs: Array<{ id: string; caseSlug: string; grammar?: Record<string, string> }>;
      };
      const walk = variante.walkthroughs.find((item) => item.id === "caso-4-pasos-medio-fuentes")!;
      walk.grammar!.conditionRisk = "c4-risk-que-no-existe";
      const resultado = validateWalkthroughCatalogue(variante, playableCases);
      expect(resultado.ok).toBe(false);
      if (resultado.ok) return;
      expect(resultado.issues.map((issue) => issue.code)).toContain("broken-reference");
      expect(resultado.issues.find((issue) => issue.path.endsWith("grammar.conditionRisk"))?.message)
        .toContain("c4-risk-que-no-existe");
    });

    it("rechaza un cierre compartido entre dos ramas", () => {
      const variante = structuredClone(environmentData) as {
        scenes: Array<{ id: string; rules?: Array<{ consequenceId: string }> }>;
      };
      const escena = variante.scenes.find((item) => item.id === "c4-reveal")!;
      escena.rules![0]!.consequenceId = "c4-reveal-steps-medium-sources";
      const resultado = validateCaseDefinition(variante);
      expect(resultado.ok).toBe(false);
      if (resultado.ok) return;
      expect(resultado.issues.map((issue) => issue.code)).toContain("unreachable-consequence");
      expect(resultado.issues.find((issue) => issue.code === "unreachable-consequence")?.message)
        .toContain("c4-reveal-listening-time-target");
    });

    it("rechaza una devolución de diseño que se quede sin reparto declarado", () => {
      const variante = structuredClone(environmentData) as {
        consequences: Array<{ id: string; participation?: unknown }>;
      };
      delete variante.consequences.find((item) => item.id === "c4-choice-substitute-medium")!.participation;
      const resultado = validateCaseDefinition(variante);
      expect(resultado.ok).toBe(false);
      if (resultado.ok) return;
      expect(resultado.issues.map((issue) => issue.code)).toContain("partial-design-participation");
      expect(resultado.issues.find((issue) => issue.code === "partial-design-participation")?.message)
        .toContain("c4-choice-substitute-medium");
    });

    it("rechaza un cierre que omita a alguien del reparto", () => {
      const variante = structuredClone(environmentData) as {
        consequences: Array<{ id: string; participation?: { roles: Array<{ characterId: string }> } }>;
      };
      const cierreRoto = variante.consequences.find((item) => item.id === "c4-reveal-steps-medium-sources")!;
      cierreRoto.participation!.roles = cierreRoto.participation!.roles.filter((role) => role.characterId !== "ines");
      const resultado = validateCaseDefinition(variante);
      expect(resultado.ok).toBe(false);
      if (resultado.ok) return;
      expect(resultado.issues.map((issue) => issue.code)).toContain("incomplete-participation");
    });

    it("rechaza una acción que ponga en juego un enfoque que este caso no declara", () => {
      const variante = structuredClone(environmentData) as {
        actions: Array<{ id: string; approachIds?: string[] }>;
      };
      variante.actions.find((item) => item.approachIds?.length)!.approachIds = ["kodaly"];
      const resultado = validateCaseDefinition(variante);
      expect(resultado.ok).toBe(false);
      if (resultado.ok) return;
      expect(resultado.issues.map((issue) => issue.code)).toContain("approach-outside-case");
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
