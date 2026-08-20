import { describe, expect, it } from "vitest";
import pilotData from "../src/content/playable/pilot-case.json";
import tutorialData from "../src/content/playable/tutorial.json";
import materialData from "../src/content/playable/tutorial-material-intruso.json";
import phraseData from "../src/content/playable/caso-una-frase-dos-entradas.json";
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
