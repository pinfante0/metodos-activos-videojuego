import { describe, expect, it } from "vitest";
import pilotData from "../src/content/playable/pilot-case.json";
import tutorialData from "../src/content/playable/tutorial.json";
import materialData from "../src/content/playable/tutorial-material-intruso.json";
import phraseData from "../src/content/playable/caso-una-frase-dos-entradas.json";
import formData from "../src/content/playable/caso-del-modelo-a-una-forma-propia.json";
import walkthroughData from "../src/content/playable/walkthroughs.json";
import { validateCaseDefinition } from "../src/domain/validation";
import {
  assemblyPieces,
  buildJournalEntry,
  canFinishCase,
  consequenceForScene,
  createGameSession,
  selectAction,
  selectGrammar,
} from "../src/app/game-session";
import { withCompletedCase } from "../src/app/campaign-progress";
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
