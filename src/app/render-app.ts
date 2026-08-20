import validCase from "../content/fixtures/case.valid.json";
import invalidCase from "../content/fixtures/case.invalid.json";
import validResources from "../content/fixtures/resources.valid.json";
import identityResources from "../content/identity/resources.json";
import {
  campaign, campaignUnits, cast, findCharacter, findPlayableCase, findUnitByCaseSlug,
  outsideCampaignCases, playableCases, walkthroughs,
} from "../content";
import type {
  ApproachId, CampaignUnit, CaseDefinition, Consequence, JournalEntry, Participation, ParticipationRole,
  Progress, Scene,
} from "../domain/contracts";
import { validateCaseDefinition, validateResourceInventory } from "../domain/validation";
import { createProgressRepository, MemoryStorage, type ProgressRepository, type StorageMode } from "../infrastructure/progress-repository";
import {
  attemptsFor, journalSummary, unitState, withCompletedCase, type UnitState,
} from "./campaign-progress";
import { findCue, IDENTITY_NAME, type SoundCueId } from "./identity/identity";
import { createSoundSketch } from "./identity/sound";
import { stageBand } from "./identity/stage";
import {
  advanceFromInformationalScene, assemblyPieces, buildJournalEntry, consequenceForScene,
  continueFromFeedback, createGameSession, grammarComplete, grammarSentence, incidentForScene,
  sceneFor, selectAction, selectGrammar, type GameSession, type GrammarKey,
} from "./game-session";
import { parseHash, type AppRoute } from "./router";
import { findTestState, seedJournalEntries, TEST_STATES, type TestState } from "./test-states";

interface TechnicalState {
  contractValid: boolean;
  resourcesValid: boolean;
  identityResourcesValid: boolean;
  playableContentValid: boolean;
  storageMode: StorageMode;
  deploymentTarget: string;
  baseUrl: string;
  buildId: string;
  commitSha: string;
}

const JOURNAL_LABELS = {
  objective: "Objetivo", firstDecision: "Primera decisión",
  maintainedDecision: "Decisión mantenida", revisedDecision: "Decisión revisada",
  trigger: "Detonante", conditionRisk: "Condición o riesgo", adaptation: "Adaptación",
  observableEvidence: "Evidencia observable", defensibleAlternative: "Alternativa defendible",
  finalGrammar: "Justificación final",
} as const;

const APPROACH_LABELS: Record<ApproachId, string> = {
  dalcroze: "Dalcroze",
  kodaly: "Concepto Kodály",
  "orff-keetman": "Orff-Schulwerk / Orff-Keetman",
  suzuki: "Suzuki",
  willems: "Willems",
  martenot: "Martenot",
  "campbell-wmp": "World Music Pedagogy / Campbell",
  "green-pme": "Popular Music Education / Green",
  schafer: "R. Murray Schafer",
  gordon: "Music Learning Theory / Gordon",
};

const GRAMMAR_LABELS: Record<GrammarKey, string> = {
  objective: "Objetivo", principleAction: "Principio y acción",
  conditionRisk: "Condición o riesgo", adaptation: "Adaptación",
  evidence: "Evidencia observable",
};

const RATING_LABELS: Record<Consequence["rating"], string> = {
  "coherent-defensible": "Coherente y defendible",
  "defensible-needs-revision": "Defendible con revisión",
  "incoherent-with-brief": "Incoherente con el encargo",
};

/**
 * Etiquetas de las vías de participación. Describen qué permite el diseño en ese momento, nunca a
 * la persona: por eso ninguna nombra una capacidad, y «sin vía» señala el diseño que la produce.
 */
const ROLE_LABELS: Record<ParticipationRole, string> = {
  decides: "Decide",
  proposes: "Propone",
  performs: "Interpreta",
  supports: "Apoya",
  "no-route": "Sin vía",
};

const UNIT_STATE_LABELS: Record<UnitState, string> = {
  completed: "Completada",
  recommended: "Te toca",
  available: "Disponible",
  planned: "Pendiente · M7",
};

function storageFromBrowser(): Storage | undefined {
  try { return window.localStorage; } catch { return undefined; }
}

function makeTechnicalState(repository: ProgressRepository): TechnicalState {
  const resources = validateResourceInventory(validResources);
  const identity = validateResourceInventory(identityResources);
  const resourceIds = new Set(resources.ok ? resources.value.resources.map((item) => item.id) : []);
  const probe = validateCaseDefinition(validCase, resourceIds);
  const progress = repository.load();
  repository.save(progress);
  return {
    contractValid: probe.ok, resourcesValid: resources.ok,
    identityResourcesValid: identity.ok,
    // El registro de contenido valida campaña, reparto, casos y recorridos al importarse: si algo
    // no cumpliera su contrato, la aplicación no llegaría hasta aquí.
    playableContentValid: playableCases.length > 0 && campaignUnits.length > 0,
    storageMode: repository.mode,
    deploymentTarget: import.meta.env.VITE_DEPLOY_TARGET ?? "portable",
    baseUrl: import.meta.env.BASE_URL, buildId: import.meta.env.VITE_BUILD_ID ?? "local",
    commitSha: import.meta.env.VITE_COMMIT_SHA ?? "sin-commit",
  };
}

function esc(value: string): string {
  return value.replace(/[&<>'"]/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function statusItem(label: string, ok: boolean, detail: string): string {
  return `<li class="status status--${ok ? "correcto" : "fallo"}"><span aria-hidden="true">${ok ? "✓" : "×"}</span><span><strong>${esc(label)}</strong><small>${esc(detail)}</small></span></li>`;
}

/**
 * Regla de composición 2: lo imprescindible se entiende en la primera vista. El contraste entre
 * lo que la decisión sostiene y lo que tensiona es la operación de esta pantalla; el resto es
 * explicación y baja al desplegable.
 */
function feedbackCard(consequence: Consequence): string {
  return `<section class="feedback feedback--${consequence.rating}" aria-live="polite" aria-labelledby="feedback-title">
    <p class="feedback__rating">${RATING_LABELS[consequence.rating]}</p><h2 id="feedback-title">Contrasta tu decisión</h2>
    <dl class="feedback__grid"><div><dt>Sostiene</dt><dd>${esc(consequence.feedback.supports)}</dd></div>
    <div><dt>Tensiona</dt><dd>${esc(consequence.feedback.tension)}</dd></div></dl></section>`;
}

/**
 * Revelado progresivo sin `<details>`.
 *
 * `<details>` envuelve su contenido en una caja propia que no es un elemento flexible, de modo que
 * el panel interior no podía encoger para caber en la pantalla: abrirlo desplazaba la página entre
 * 14 y 85 px según el tamaño. Un botón con `aria-expanded` y una región asociada sí se comportan
 * como elementos flexibles, y además dan un nombre accesible y un foco propios al bloque que se
 * desplaza por dentro.
 */
function disclosure(options: {
  id: string; className: string; toggleLabel: string; regionLabel: string; body: string; expanded: boolean;
}): string {
  return `<div class="${options.className}">
    <button class="disclosure__toggle" type="button" aria-expanded="${options.expanded}" aria-controls="${options.id}" data-toggle-disclosure="${options.id}">${esc(options.toggleLabel)}</button>
    <div class="disclosure__panel" id="${options.id}" role="region" tabindex="0" aria-label="${esc(options.regionLabel)}"${options.expanded ? "" : " hidden"}>${options.body}</div>
  </div>`;
}

/**
 * Reparto de la participación.
 *
 * Es la ampliación de contrato decidida en M6 hecha visible. Cada fila procede de un dato escrito
 * por la autoría en la consecuencia: nada aquí se deduce del estado cualitativo ni del recuento de
 * personajes. Sin este dato ninguna imagen podría mostrar a quién favorece una decisión sin
 * inventarlo, que es exactamente lo que M5 dejó anotado como límite.
 *
 * Va dentro del mismo desplegable que los observables, y no en uno propio, porque un segundo botón
 * en la pantalla de consecuencia la haría desplazarse en 360 × 640 y la regla 6 no admite excepciones.
 */
function participationPanel(participation: Participation): string {
  const rows = participation.roles.map((entry) => {
    const character = findCharacter(entry.characterId);
    const note = entry.note ? `<small>${esc(entry.note)}</small>` : "";
    return `<li class="participation__row participation__row--${entry.role}"><span class="participation__role">${ROLE_LABELS[entry.role]}</span><span><strong>${esc(character?.name ?? entry.characterId)}</strong>${note}</span></li>`;
  }).join("");
  return `<div class="participation"><h3 class="participation__title">Quién participa y cómo</h3><ul class="participation__list">${rows}</ul></div>`;
}

/**
 * Regla de composición 3: la explicación pedagógica completa sigue estando entera, pero se pide.
 * Regla 4: nada de lo que hay aquí aparece ya en la pantalla.
 */
function consequenceDetails(consequence: Consequence): string {
  const participation = consequence.participation ? participationPanel(consequence.participation) : "";
  return disclosure({
    id: "panel-razonamiento",
    className: "reasoning",
    toggleLabel: consequence.participation
      ? "Ver reparación, observables y reparto"
      : "Ver reparación y los cuatro observables",
    regionLabel: consequence.participation
      ? "Reparación, observables y reparto de la participación"
      : "Reparación y los cuatro observables",
    expanded: false,
    body: `<dl class="reasoning__grid">
    <div><dt>Podrías reparar</dt><dd>${esc(consequence.feedback.possibleRepair)}</dd></div>
    <div><dt>Mira esta evidencia</dt><dd>${esc(consequence.feedback.observableEvidence)}</dd></div>
    <div><dt>Aprendizaje</dt><dd>${esc(consequence.observables.learning)}</dd></div>
    <div><dt>Agencia</dt><dd>${esc(consequence.observables.agency)}</dd></div>
    <div><dt>Barrera</dt><dd>${esc(consequence.observables.barrier)}</dd></div>
    <div><dt>Evidencia</dt><dd>${esc(consequence.observables.evidence)}</dd></div></dl>${participation}`,
  });
}

function sceneKindLabel(caseDefinition: CaseDefinition): string {
  if (caseDefinition.experienceType === "tutorial") return "Detective de aula";
  if (caseDefinition.experienceType === "probe") return "Banco de mecánicas · contenido provisional";
  return findUnitByCaseSlug(caseDefinition.slug)?.title ?? "Caso completo";
}

function sceneHeader(caseDefinition: CaseDefinition, scene: Scene): string {
  const index = caseDefinition.scenes.findIndex((candidate) => candidate.id === scene.id) + 1;
  return `<div class="scene-heading"><div><p class="eyebrow">${esc(sceneKindLabel(caseDefinition))} · paso ${index} de ${caseDefinition.scenes.length}</p><h1 tabindex="-1">${esc(scene.title)}</h1></div><progress value="${index}" max="${caseDefinition.scenes.length}" aria-label="Progreso del recorrido">${index}/${caseDefinition.scenes.length}</progress></div>`;
}

/**
 * Tira del montador.
 *
 * Marca estado, nunca premio: dice qué hueco está resuelto y cuál no, sin repetir el texto de la
 * decisión, que vive entero en la pantalla de montaje. Así la regla 4 se cumple y la tira ocupa una
 * línea en lugar de tres párrafos.
 */
function assemblyStrip(caseDefinition: CaseDefinition, session: GameSession, activeSlotId?: string): string {
  if (!caseDefinition.assembly) return "";
  const pieces = assemblyPieces(caseDefinition, session);
  const chips = pieces.map((piece) => {
    const state = piece.actionId ? "elegido" : piece.slot.id === activeSlotId ? "actual" : "pendiente";
    return `<li class="assembly-strip__chip" data-state="${state}">${esc(piece.slot.label)}<span class="assembly-strip__state"> · ${state}</span></li>`;
  }).join("");
  return `<nav class="assembly-strip" aria-label="${esc(caseDefinition.assembly.title)}"><ol>${chips}</ol></nav>`;
}

function choiceScene(caseDefinition: CaseDefinition, scene: Extract<Scene, { kind: "observation" | "design" | "revision" }>, session: GameSession): string {
  if (session.feedbackConsequenceId) {
    const consequence = caseDefinition.consequences.find((item) => item.id === session.feedbackConsequenceId);
    if (!consequence) throw new Error("No se encontró la retroalimentación");
    return `${sceneHeader(caseDefinition, scene)}${stageBand(consequence.rating)}${feedbackCard(consequence)}${consequenceDetails(consequence)}<div class="scene-actions"><button class="primary" type="button" data-continue-feedback>${consequence.nextSceneId === scene.id ? "Probar otra lectura" : "Continuar"}</button></div>`;
  }
  const strip = scene.kind === "design" ? assemblyStrip(caseDefinition, session, scene.assemblySlotId) : "";
  const choices = scene.actionIds.map((actionId, index) => {
    const action = caseDefinition.actions.find((item) => item.id === actionId);
    return action ? `<button class="choice" type="button" data-action-id="${action.id}"><span class="choice__key" aria-hidden="true">${index + 1}</span><span>${esc(action.label)}</span></button>` : "";
  }).join("");
  return `${sceneHeader(caseDefinition, scene)}${strip}<p class="scene-intro">${esc(scene.introduction)}</p><fieldset class="choice-list"><legend>${esc(scene.prompt)}</legend>${choices}</fieldset>`;
}

/**
 * Pantalla de montaje: la microclase entera, una sola vez y con una sola tarea, que es probarla.
 *
 * El bloque se desplaza por dentro y es alcanzable con el tabulador, como los demás bloques de
 * repaso: cuatro decisiones con su texto completo no caben en 360 × 640, y encogerlas rompería la
 * regla 5.
 */
function assemblyReviewScene(caseDefinition: CaseDefinition, scene: Extract<Scene, { kind: "assembly-review" }>, session: GameSession): string {
  const pieces = assemblyPieces(caseDefinition, session);
  const rows = pieces.map((piece) => `<div><dt>${esc(piece.slot.label)}</dt><dd>${piece.label ? esc(piece.label) : "<em>Sin decidir todavía.</em>"}</dd></div>`).join("");
  return `${sceneHeader(caseDefinition, scene)}${assemblyStrip(caseDefinition, session)}<p class="scene-intro">${esc(scene.introduction)}</p>
    <div class="assembly-review" id="panel-montaje" role="region" tabindex="0" aria-label="Montaje de la microclase"><dl>${rows}</dl></div>
    <div class="scene-actions"><button class="primary" type="button" data-advance-info>${esc(scene.testLabel)}</button></div>`;
}

function consequenceScene(caseDefinition: CaseDefinition, scene: Extract<Scene, { kind: "consequence" }>, session: GameSession): string {
  const consequence = consequenceForScene(caseDefinition, scene, session);
  /*
   * El marco de una consecuencia puede contener la comparación histórica completa. Se conserva
   * entero, pero cede altura y se desplaza por dentro como los demás bloques largos: así una unidad
   * nueva no obliga a recortar pedagogía ni a desplazar la pantalla de acción.
   */
  return `${sceneHeader(caseDefinition, scene)}${stageBand(consequence.rating)}<p class="scene-intro consequence-intro" id="panel-marco-consecuencia" role="region" tabindex="0" aria-label="Marco pedagógico de la consecuencia">${esc(scene.introduction)}</p>${feedbackCard(consequence)}${consequenceDetails(consequence)}
    <div class="scene-actions"><button class="primary" type="button" data-advance-info>Continuar</button></div>`;
}

function incidentScene(caseDefinition: CaseDefinition, scene: Extract<Scene, { kind: "incident" }>, session: GameSession): string {
  const incident = incidentForScene(caseDefinition, scene, session);
  /*
   * El relato del incidente se comporta como los demás bloques de repaso: encoge al hueco
   * disponible y se desplaza por dentro, con foco, nombre accesible y flechas. No es una precaución
   * teórica: los incidentes de M7A y M7B serán más largos que este, y encoger su texto rompería la
   * regla 5. La medición encontró el primer desbordamiento en 360 × 640.
   */
  return `${sceneHeader(caseDefinition, scene)}${stageBand("incident")}<p class="scene-intro">${esc(scene.introduction)}</p><blockquote class="incident" id="panel-incidente" role="region" tabindex="0" aria-label="Qué revela el incidente"><p>${esc(incident.reveal)}</p></blockquote><p class="quiet">La tensión pertenece a la organización del aula; ninguna persona funciona como problema o giro sorpresa.</p><div class="scene-actions"><button class="primary" type="button" data-advance-info>Revisar el diseño</button></div>`;
}

function grammarOptions(scene: Extract<Scene, { kind: "justification" }>, session: GameSession): string {
  return (Object.keys(GRAMMAR_LABELS) as GrammarKey[]).map((key) => {
    const options = scene.grammarOptions[key].map((option) => {
      const id = typeof option === "string" ? option : option.id;
      const label = typeof option === "string" ? option : option.label;
      return `<option value="${esc(id)}" ${session.selectedGrammar[key] === id ? "selected" : ""}>${esc(label)}</option>`;
    }).join("");
    return `<label><span>${GRAMMAR_LABELS[key]}</span><select data-grammar-key="${key}"><option value="">Elige una pieza…</option>${options}</select></label>`;
  }).join("");
}

function justificationScene(caseDefinition: CaseDefinition, scene: Extract<Scene, { kind: "justification" }>, session: GameSession): string {
  return `${sceneHeader(caseDefinition, scene)}<p class="scene-intro">${esc(scene.introduction)}</p><div class="grammar-form">${grammarOptions(scene, session)}</div><p class="grammar-preview" role="region" tabindex="0" aria-label="Justificación en construcción" aria-live="polite">${esc(grammarSentence(caseDefinition, session))}</p><div class="scene-actions"><button class="primary" type="button" data-advance-justification ${grammarComplete(session) ? "" : "disabled"}>Llevar a la bitácora</button></div>`;
}

function journalDefinition(entry: JournalEntry): string {
  return (Object.keys(JOURNAL_LABELS) as Array<keyof typeof JOURNAL_LABELS>).map((property) => `<div><dt>${JOURNAL_LABELS[property]}</dt><dd>${esc(entry[property])}</dd></div>`).join("");
}

function reflectionScene(caseDefinition: CaseDefinition, scene: Extract<Scene, { kind: "reflection" }>, session: GameSession): string {
  const preview = buildJournalEntry(caseDefinition, session, new Date().toISOString(), "00000000-0000-4000-8000-000000000000");
  return `${sceneHeader(caseDefinition, scene)}<p class="scene-intro">${esc(scene.introduction)}</p>${disclosure({
    id: "panel-bitacora",
    className: "journal-preview",
    toggleLabel: "Revisar la entrada",
    regionLabel: "Entrada de bitácora en revisión",
    expanded: true,
    body: `<dl>${journalDefinition(preview)}</dl>`,
  })}<div class="scene-actions"><button class="primary" type="button" data-finish-case>Guardar y cerrar</button></div>`;
}

function completionView(caseDefinition: CaseDefinition): string {
  const item = caseDefinition.completion;
  return item ? `<section class="completion" aria-labelledby="completion-title"><p class="eyebrow">${esc(item.eyebrow)}</p><h1 id="completion-title" tabindex="-1">${esc(item.title)}</h1><p class="lede">${esc(item.body)}</p><div class="actions"><a class="button" href="${item.nextRoute}">${esc(item.nextLabel)}</a><button class="secondary" type="button" data-restart-case>Repetir este recorrido</button></div></section>` : "";
}

function gameView(caseDefinition: CaseDefinition, session: GameSession): string {
  if (session.completed) return completionView(caseDefinition);
  const scene = sceneFor(caseDefinition, session);
  switch (scene.kind) {
    case "observation": case "design": case "revision": return choiceScene(caseDefinition, scene, session);
    case "assembly-review": return assemblyReviewScene(caseDefinition, scene, session);
    case "consequence": return consequenceScene(caseDefinition, scene, session);
    case "incident": return incidentScene(caseDefinition, scene, session);
    case "justification": return justificationScene(caseDefinition, scene, session);
    case "reflection": return reflectionScene(caseDefinition, scene, session);
  }
}

function caseTitleFor(caseId: string): string {
  return playableCases.find((item) => item.id === caseId)?.title ?? caseId;
}

function approachLabels(ids: readonly ApproachId[]): string[] {
  return ids.map((id) => APPROACH_LABELS[id]);
}

function journalSummaryRows(progress: Progress): [string, string][] {
  const summary = journalSummary(progress);
  return [
    ["Casos recorridos", summary.caseTitles.join(" · ")],
    ["Principios combinados", approachLabels(summary.approachIds).join(" · ")],
    ["Decisión mantenida", summary.maintained],
    ["Decisión revisada", summary.revised],
    ["Tensión detectada", summary.tension],
    ["Evidencia que te llevas", summary.evidence],
  ].filter((row): row is [string, string] => Boolean(row[1]));
}

export function journalText(progress: Progress): string {
  const entries = progress.journal.map((entry) => {
    const title = caseTitleFor(entry.caseId);
    return `${title}\n${(Object.keys(JOURNAL_LABELS) as Array<keyof typeof JOURNAL_LABELS>).map((property) => `${JOURNAL_LABELS[property]}: ${entry[property]}`).join("\n")}`;
  }).join("\n\n");
  if (progress.journal.length === 0) return entries;
  const summary = `Lo que te llevas\n${journalSummaryRows(progress)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n")}`;
  return `${summary}\n\n${entries}`;
}

/**
 * Resumen final de la bitácora, con los campos de `docs/biblia_juego_m2.md`, apartado 11.
 * Selecciona; no puntúa, no ordena y no compara con nadie.
 */
export function journalSummaryView(progress: Progress): string {
  if (progress.journal.length === 0) return "";
  const rows = journalSummaryRows(progress);
  return `<section class="journal-summary" aria-labelledby="summary-title"><h2 id="summary-title">Lo que te llevas</h2><dl>${rows.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl></section>`;
}

function journalView(progress: Progress, storageMode: StorageMode): string {
  const entries = progress.journal.map((entry) => {
    return `<article class="journal-entry"><h2>${esc(caseTitleFor(entry.caseId))}</h2><dl>${journalDefinition(entry)}</dl></article>`;
  }).join("");
  return `<section class="reference-page" aria-labelledby="journal-title"><p class="eyebrow">Bitácora local · ${storageMode === "persistent" ? "guardada en este navegador" : "memoria temporal"}</p><h1 id="journal-title" tabindex="-1">Decisiones, revisiones y evidencias</h1><p>No contiene identidad, nota ni envío automático.</p>${journalSummaryView(progress)}${entries || '<div class="notice"><strong>Aún no hay entradas.</strong><p>Completa una unidad de la campaña para guardar tu razonamiento.</p></div>'}<div class="actions"><button class="primary" type="button" data-copy-journal ${entries ? "" : "disabled"}>Copiar bitácora</button><button class="secondary" type="button" data-print-journal ${entries ? "" : "disabled"}>Imprimir</button><a class="text-link" href="#/campana">Volver a la campaña</a></div><p class="copy-status" role="status"></p></section>`;
}

function settingsPanel(progress: Progress, storageMode: StorageMode): string {
  return `<aside class="settings-panel" aria-labelledby="settings-title"><div><p class="eyebrow">Accesibilidad</p><h2 id="settings-title" tabindex="-1">Sonido y movimiento</h2></div><label class="toggle"><input type="checkbox" data-setting="muted" ${progress.settings.muted ? "checked" : ""}><span>Silenciar todo</span></label><label><span>Volumen</span><input type="range" min="0" max="1" step="0.1" value="${progress.settings.volume}" data-setting="volume"></label><label class="toggle"><input type="checkbox" data-setting="reducedMotion" ${progress.settings.reducedMotion ? "checked" : ""}><span>Reducir movimiento</span></label><p class="quiet">Las seis señales sonoras son un boceto sintetizado, no recursos definitivos. Su equivalente textual aparece siempre abajo a la izquierda, incluso con el sonido silenciado. No hay música de fondo en ningún momento.</p><p class="quiet">Progreso: ${storageMode === "persistent" ? "persistente en este navegador" : "temporal; el navegador bloquea el almacenamiento"}.</p><div class="actions"><button class="secondary" type="button" data-close-settings>Cerrar</button></div></aside>`;
}

function unitHref(unit: CampaignUnit): string | undefined {
  return unit.caseSlug ? `#/caso/${encodeURIComponent(unit.caseSlug)}` : undefined;
}

function homeView(progress: Progress): string {
  const recommended = campaignUnits.find((unit) => unitState(unit, progress) === "recommended");
  const target = recommended ?? campaignUnits.find((unit) => unit.status === "playable");
  const href = target ? unitHref(target) : undefined;
  const playable = campaignUnits.filter((unit) => unit.status === "playable").length;
  const label = target && attemptsFor(target, progress) > 0 ? "Repetir" : "Continuar";
  return `<section class="hero" aria-labelledby="home-title"><p class="eyebrow">M7A en curso · dos unidades históricas jugables</p><h1 id="home-title" tabindex="-1">Observa, repara y revisa una microclase</h1><p class="lede">Primero distinguirás actividad de evidencia y repararás una variable prediciendo su efecto. Después montarás una microclase de dos minutos, la probarás, afrontarás un incidente y defenderás lo que decidas.</p><div class="actions">${href && target ? `<a class="button" href="${href}">${label}: ${esc(target.title)}</a>` : ""}<a class="text-link" href="#/campana">Ver la campaña</a></div><div class="grey-note" role="note"><strong>Sistema completo, campaña a medias.</strong> Las mecánicas funcionan de principio a fin con ${playable} de las ${campaignUnits.length} unidades escritas; el resto se escribe en M7A y M7B. Las ilustraciones, los personajes dibujados y el sonido grabado son M8.</div></section>`;
}

function campaignView(progress: Progress): string {
  const rows = campaignUnits.map((unit) => {
    const state = unitState(unit, progress);
    const href = unitHref(unit);
    const attempts = attemptsFor(unit, progress);
    const action = href
      ? `<a class="text-link" href="${href}">${state === "completed" ? "Repetir" : "Abrir"}</a>`
      : `<span class="quiet">Se escribe en M7</span>`;
    return `<li class="unit" data-state="${state}"><p class="unit__state">${UNIT_STATE_LABELS[state]}${attempts > 0 ? ` · ${attempts} ${attempts === 1 ? "intento" : "intentos"}` : ""}</p><h2>${unit.order}. ${esc(unit.title)}</h2><p class="unit__focus">${esc(unit.focus)}</p><p class="quiet">${esc(unit.operation)} · ${unit.minutes} min</p>${action}</li>`;
  }).join("");
  const total = campaignUnits.reduce((sum, unit) => sum + unit.minutes, 0);
  return `<section class="reference-page" aria-labelledby="campaign-title"><p class="eyebrow">Campaña · ${total} minutos previstos</p><h1 id="campaign-title" tabindex="-1">${esc(campaign.title)}</h1><p>Cualquier unidad con contenido se abre por enlace directo sin completar las anteriores: la secuencia orienta y no bloquea. No hay puntos ni niveles.</p><ol class="unit-list">${rows}</ol><div class="actions"><a class="text-link" href="#/ruta/clase">Ruta presencial</a><a class="text-link" href="#/bitacora">Bitácora</a></div></section>`;
}

function classRouteView(): string {
  const rows = campaign.classRoute.segments.map((segment) => {
    const unit = segment.unitId ? campaignUnits.find((item) => item.id === segment.unitId) : undefined;
    const href = unit ? unitHref(unit) : undefined;
    return `<article class="segment"><p class="eyebrow">${segment.minMinutes}-${segment.maxMinutes} min</p><h2>${esc(segment.label)}</h2><p>${esc(segment.pairAdjustment)}</p><p class="quiet">Conversación buscada: ${esc(segment.conversation)}</p>${href ? `<a class="text-link" href="${href}">Abrir ${esc(unit?.title ?? "")}</a>` : `<p class="quiet">${unit ? "Se escribe en M7." : "Cierre compartido, fuera del juego."}</p>`}</article>`;
  }).join("");
  return `<section class="reference-page" aria-labelledby="class-title"><p class="eyebrow">Ruta presencial · ${campaign.classRoute.minMinutes}-${campaign.classRoute.maxMinutes} minutos por parejas</p><h1 id="class-title" tabindex="-1">Cuatro tramos que comparten sistema con la campaña</h1><p>La ruta no duplica contenido: abre las mismas unidades con un ajuste para parejas. M7C equilibrará los tiempos con datos de uso, no con estimaciones.</p><div class="segment-list">${rows}</div><p><a class="text-link" href="#/campana">Ver la campaña completa</a></p></section>`;
}

function technicalView(state: TechnicalState): string {
  return `<section class="reference-page" aria-labelledby="proof-title"><p class="eyebrow">Diagnóstico reproducible</p><h1 id="proof-title" tabindex="-1">Estado técnico del sistema</h1><ul class="status-list">${statusItem("Contratos M3", state.contractValid, "La sonda técnica sigue siendo válida")}${statusItem("Contenido jugable", state.playableContentValid, `${playableCases.length} casos y ${campaignUnits.length} unidades validados al cargar`)}${statusItem("Reparto compartido M6", cast.characters.length > 0, `${cast.characters.length} personajes con rasgo funcional, condición y salvaguarda`)}${statusItem("Recorridos declarados M6", walkthroughs.length > 0, `${walkthroughs.length} rutas de prueba con resultado esperado`)}${statusItem("Inventario audiovisual", state.resourcesValid, "Las alternativas siguen siendo exigibles")}${statusItem("Registro de procedencia M5", state.identityResourcesValid, "Ocho recursos de identidad con origen, licencia y alternativa")}${statusItem("Ruta portátil", state.baseUrl === "./", `Base compilada: ${state.baseUrl}`)}</ul><dl class="build-data"><div><dt>Destino</dt><dd>${esc(state.deploymentTarget)}</dd></div><div><dt>Identidad</dt><dd>${esc(IDENTITY_NAME)}</dd></div><div><dt>Compilación</dt><dd>${esc(state.buildId)}</dd></div><div><dt>Revisión</dt><dd>${esc(state.commitSha.slice(0, 12))}</dd></div></dl><div class="actions"><a class="text-link" href="#/pruebas">Rutas de prueba</a><a class="text-link" href="#/">Volver al inicio</a></div></section>`;
}

function testIndexView(): string {
  const rows = TEST_STATES.map((state) => `<li class="unit"><h2><a href="#/prueba/${encodeURIComponent(state.id)}">${esc(state.name)}</a></h2><p class="quiet">${esc(state.purpose)}</p></li>`).join("");
  const extra = outsideCampaignCases.map((item) => `<li><a class="text-link" href="#/caso/${encodeURIComponent(item.slug)}">${esc(item.title)}</a></li>`).join("");
  return `<section class="reference-page" aria-labelledby="tests-title"><p class="eyebrow">Rutas de prueba · ${TEST_STATES.length} estados difíciles</p><h1 id="tests-title" tabindex="-1">Los estados a los que casi nunca se llega jugando</h1><p>No desbloquean nada ni alteran el progreso guardado. <code>pnpm measure:viewports</code> los recorre midiendo lo mismo que en el resto del juego.</p><ol class="unit-list">${rows}</ol><h2>Contenido fuera de la campaña</h2><ul class="plain-list">${extra}</ul><p><a class="text-link" href="#/prueba-publicacion">Diagnóstico técnico</a></p></section>`;
}

function invalidContentView(): string {
  const result = validateCaseDefinition(invalidCase);
  const rows = result.ok
    ? '<li class="status status--fallo"><span aria-hidden="true">×</span><span><strong>El caso inválido ha validado</strong><small>El validador ha dejado de detectar el contrato roto</small></span></li>'
    : result.issues.map((issue) => `<li class="status status--fallo"><span aria-hidden="true">×</span><span><strong>${esc(issue.code)}</strong><small>${esc(issue.path)}: ${esc(issue.message)}</small></span></li>`).join("");
  return `<section class="reference-page" aria-labelledby="invalid-title"><p class="eyebrow">Ruta de prueba · contenido inválido</p><h1 id="invalid-title" tabindex="-1">Lo que dice el validador cuando el contrato se rompe</h1><p>Ejecutado sobre <code>src/content/fixtures/case.invalid.json</code>, roto a propósito. Los mensajes deben servir a quien escribe contenido, no solo a quien escribe código.</p><ul class="status-list">${rows}</ul><p><a class="text-link" href="#/pruebas">Volver a las rutas de prueba</a></p></section>`;
}

function testStateFrame(state: TestState, body: string): string {
  return `<p class="test-banner" role="note">Ruta de prueba · ${esc(state.name)}. <a class="text-link" href="#/pruebas">Volver</a></p>${body}`;
}

/** Señal sonora que corresponde al estado actual, o ninguna si el estado no la tiene. */
function cueForState(caseDefinition: CaseDefinition, session: GameSession): SoundCueId | undefined {
  if (session.completed) return "journal";
  if (session.feedbackConsequenceId) {
    const consequence = caseDefinition.consequences.find((item) => item.id === session.feedbackConsequenceId);
    return consequence ? (`consequence-${consequence.rating}` as SoundCueId) : undefined;
  }
  const scene = sceneFor(caseDefinition, session);
  if (scene.kind === "consequence") {
    return `consequence-${consequenceForScene(caseDefinition, scene, session).rating}` as SoundCueId;
  }
  if (scene.kind === "incident") return "incident";
  return undefined;
}

function randomAttemptId(): string {
  return globalThis.crypto?.randomUUID?.() ?? "00000000-0000-4000-8000-000000000001";
}

/** Contexto de juego resuelto desde la ruta: vale igual para un caso y para una ruta de prueba. */
interface CaseContext {
  item: CaseDefinition;
  key: string;
  sceneId?: string;
  selectedActions?: Record<string, string>;
  completed?: boolean;
}

function caseContextFor(route: AppRoute): CaseContext | undefined {
  if (route.name === "case") {
    const item = findPlayableCase(route.slug);
    return item ? { item, key: item.id, sceneId: route.sceneId } : undefined;
  }
  if (route.name === "test-state") {
    const state = findTestState(route.id);
    if (state?.kind !== "case") return undefined;
    const item = findPlayableCase(state.caseSlug);
    return item
      ? {
          item, key: `prueba:${state.id}`, sceneId: state.sceneId,
          selectedActions: state.selectedActions, completed: state.completed,
        }
      : undefined;
  }
  return undefined;
}

export function mountApp(root: HTMLElement): void {
  const repository = createProgressRepository(storageFromBrowser());
  const state = makeTechnicalState(repository);
  const sessions = new Map<string, GameSession>();
  const soundSketch = createSoundSketch();
  // Región viva persistente, fuera de `#app`: sobrevive a cada repintado, de modo que el
  // equivalente textual de una señal sonora sí llega a un lector de pantalla.
  const soundCaption = document.createElement("p");
  soundCaption.className = "sound-caption";
  soundCaption.setAttribute("role", "status");
  document.body.append(soundCaption);
  let progress = repository.load();
  let settingsOpen = false;
  let lastCueKey = "";
  /*
   * Un enlace directo a una escena se aplica **una sola vez**. El fragmento no cambia mientras se
   * juega dentro del caso, de modo que volver a leerlo en cada repintado devolvería el recorrido a
   * la escena del enlace y sería imposible avanzar.
   */
  const appliedDeepLinks = new Set<string>();

  const sessionFor = (context: CaseContext): GameSession => {
    const existing = sessions.get(context.key);
    const deepLink = `${context.key}|${context.sceneId ?? ""}`;
    if (existing && (!context.sceneId || appliedDeepLinks.has(deepLink))) return existing;
    appliedDeepLinks.add(deepLink);
    const fresh: GameSession = {
      ...createGameSession(context.item, context.sceneId),
      selectedActions: { ...(context.selectedActions ?? {}) },
      completed: context.completed ?? false,
    };
    sessions.set(context.key, fresh);
    return fresh;
  };

  const playCue = (cue: SoundCueId) => {
    const spec = findCue(cue);
    soundSketch.play(cue, { muted: progress.settings.muted, volume: progress.settings.volume });
    const prefix = progress.settings.muted ? "Sonido silenciado" : "Sonido";
    soundCaption.textContent = `${prefix} · ${spec.textEquivalent} (${spec.sketch})`;
  };

  /** Cada estado del recorrido suena como mucho una vez, aunque la pantalla se repinte. */
  const announceState = (route: AppRoute) => {
    const context = caseContextFor(route);
    if (!context) return;
    const session = sessions.get(context.key);
    if (!session) return;
    const key = `${context.key}|${session.sceneId}|${session.feedbackConsequenceId ?? ""}|${session.completed}`;
    if (key === lastCueKey) return;
    lastCueKey = key;
    const cue = cueForState(context.item, session);
    if (cue) playCue(cue);
  };

  const testStateContent = (stateId: string): string => {
    const testState = findTestState(stateId);
    if (!testState) {
      return `<section><p class="eyebrow">Ruta de prueba</p><h1 tabindex="-1">No hay ningún estado con ese identificador</h1><p><code>${esc(stateId)}</code></p><p><a class="text-link" href="#/pruebas">Ver los estados disponibles</a></p></section>`;
    }
    switch (testState.kind) {
      case "case": {
        const context = caseContextFor({ name: "test-state", id: stateId });
        if (!context) return testStateFrame(testState, "<section><p>El caso de este estado ya no existe.</p></section>");
        return testStateFrame(testState, `<section class="game-screen" data-case-id="${context.item.id}">${gameView(context.item, sessionFor(context))}</section>`);
      }
      case "journal": {
        const seeded: Progress = testState.seed === "full"
          ? { ...progress, journal: seedJournalEntries() }
          : { ...progress, journal: [] };
        return testStateFrame(testState, journalView(seeded, state.storageMode));
      }
      case "storage-denied": {
        // Un repositorio en memoria reproduce exactamente la degradación, sin tocar lo guardado.
        const denied = createProgressRepository(new MemoryStorage());
        return testStateFrame(testState, journalView(denied.load(), denied.mode));
      }
      case "invalid-content":
        return testStateFrame(testState, invalidContentView());
      case "hash":
        return testStateFrame(testState, `<section><p class="eyebrow">Estado difícil</p><h1 tabindex="-1">Abre el enlace para verlo</h1><p><a class="button" href="${testState.hash}">${esc(testState.hash)}</a></p><p class="quiet">${esc(testState.purpose)}</p></section>`);
    }
  };

  const routeContent = (route: AppRoute): string => {
    switch (route.name) {
      case "home": return homeView(progress);
      case "campaign": return campaignView(progress);
      case "publication-proof": return technicalView(state);
      case "test-index": return testIndexView();
      case "test-state": return testStateContent(route.id);
      case "case": {
        const context = caseContextFor(route);
        if (!context) {
          const unit = campaignUnits.find((candidate) => candidate.caseSlug === route.slug);
          return `<section><p class="eyebrow">Acceso directo</p><h1 tabindex="-1">Esta unidad todavía no tiene contenido</h1><p><code>${esc(route.slug)}</code></p><p>${unit ? "La unidad existe en la campaña y se escribe en M7." : "El enlace no corresponde a ninguna unidad de la campaña."} Puedes abrir cualquier otra desde el mapa.</p><p><a class="text-link" href="#/campana">Ver la campaña</a></p></section>`;
        }
        return `<section class="game-screen" data-case-id="${context.item.id}">${gameView(context.item, sessionFor(context))}</section>`;
      }
      case "class-route": return classRouteView();
      case "journal": return journalView(progress, state.storageMode);
      case "not-found": return `<section><p class="eyebrow">Ruta no encontrada</p><h1 tabindex="-1">Este enlace no forma parte del contrato</h1><p><code>${esc(route.requested)}</code></p><p><a class="text-link" href="#/">Ir al inicio</a></p></section>`;
    }
  };

  const render = (focusMain = false) => {
    const route = parseHash(window.location.hash);
    const content = routeContent(route);
    announceState(route);
    root.innerHTML = `<header class="site-header"><a class="brand" href="#/" aria-label="Inicio de El aula de los dos minutos"><span class="brand__mark" aria-hidden="true">02′</span><span>El aula de los dos minutos</span></a><nav aria-label="Utilidades"><a href="#/campana">Campaña</a><a href="#/bitacora">Bitácora</a><button type="button" data-open-settings>Ajustes</button></nav></header><main id="contenido" tabindex="-1">${content}</main><footer><p>M7A · ${esc(IDENTITY_NAME)} · sin cuentas, analítica ni arte definitivo</p><a href="#/prueba-publicacion">Diagnóstico</a></footer>${settingsOpen ? settingsPanel(progress, state.storageMode) : ""}`;
    document.title = "El aula de los dos minutos";
    document.documentElement.dataset.appReady = "true";
    document.documentElement.dataset.identity = "aula-laboratorio";
    document.documentElement.dataset.reducedMotion = String(progress.settings.reducedMotion);
    if (focusMain) root.querySelector<HTMLElement>("main h1, main")?.focus();
  };

  root.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement;
    const route = parseHash(window.location.hash);
    const context = caseContextFor(route);
    const item = context?.item;
    const session = context ? sessions.get(context.key) : undefined;
    const scene = item && session && !session.completed ? sceneFor(item, session) : undefined;
    const store = (next: GameSession) => { if (context) sessions.set(context.key, next); };

    const actionButton = target.closest<HTMLButtonElement>("[data-action-id]");
    if (actionButton && item && session && scene && (scene.kind === "observation" || scene.kind === "design" || scene.kind === "revision")) {
      // Con retroalimentación diferida no hay consecuencia inmediata que suene: la señal
      // confirma que la decisión quedó registrada.
      if (scene.feedbackMode === "deferred") playCue("decision");
      store(selectAction(item, session, scene, actionButton.dataset.actionId ?? "")); render(true); return;
    }
    // El revelado progresivo no cambia el estado del juego: se conmuta en el sitio, sin repintar,
    // de modo que el foco y la posición de lectura se conservan.
    const disclosureToggle = target.closest<HTMLButtonElement>("[data-toggle-disclosure]");
    if (disclosureToggle) {
      const panel = root.querySelector<HTMLElement>(`#${CSS.escape(disclosureToggle.dataset.toggleDisclosure ?? "")}`);
      if (panel) {
        const expanded = disclosureToggle.getAttribute("aria-expanded") === "true";
        disclosureToggle.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
      }
      return;
    }
    if (target.closest("[data-continue-feedback]") && item && session) {
      store(continueFromFeedback(item, session)); render(true); return;
    }
    if (target.closest("[data-advance-info]") && item && session && scene && (scene.kind === "consequence" || scene.kind === "incident" || scene.kind === "assembly-review")) {
      store(advanceFromInformationalScene(item, session, scene)); render(true); return;
    }
    if (target.closest("[data-advance-justification]") && item && session && scene?.kind === "justification" && grammarComplete(session)) {
      store({ ...session, sceneId: scene.nextSceneId ?? session.sceneId }); render(true); return;
    }
    if (target.closest("[data-finish-case]") && item && session) {
      const now = new Date().toISOString();
      const entry = buildJournalEntry(item, session, now, randomAttemptId());
      progress = withCompletedCase(progress, item.id, entry, now);
      repository.save(progress); store({ ...session, completed: true }); render(true); return;
    }
    if (target.closest("[data-restart-case]") && item && context) {
      sessions.set(context.key, createGameSession(item)); render(true); return;
    }
    if (target.closest("[data-open-settings]")) { settingsOpen = true; render(); root.querySelector<HTMLElement>(".settings-panel h2")?.focus(); return; }
    if (target.closest("[data-close-settings]")) { settingsOpen = false; render(); root.querySelector<HTMLElement>("[data-open-settings]")?.focus(); return; }
    if (target.closest("[data-copy-journal]")) {
      const status = root.querySelector<HTMLElement>(".copy-status");
      try { await navigator.clipboard.writeText(journalText(progress)); if (status) status.textContent = "Bitácora copiada."; }
      catch { if (status) status.textContent = "No se pudo copiar automáticamente; selecciona el texto visible."; }
      return;
    }
    if (target.closest("[data-print-journal]")) window.print();
  });

  root.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const grammarKey = target.dataset.grammarKey as GrammarKey | undefined;
    const route = parseHash(window.location.hash);
    const context = caseContextFor(route);
    const session = context ? sessions.get(context.key) : undefined;
    if (grammarKey && context && session) {
      sessions.set(context.key, selectGrammar(session, grammarKey, target.value)); render();
      root.querySelector<HTMLSelectElement>(`[data-grammar-key="${grammarKey}"]`)?.focus(); return;
    }
    const setting = target.dataset.setting as "muted" | "volume" | "reducedMotion" | undefined;
    if (setting) {
      const value = setting === "volume" ? Number(target.value) : (target as HTMLInputElement).checked;
      progress = { ...progress, updatedAt: new Date().toISOString(), settings: { ...progress.settings, [setting]: value } };
      repository.save(progress); render();
    }
  });

  /*
   * En `document` y no en `#app`. Al abrir un caso por enlace directo el foco está en `body`, que
   * no es descendiente de `#app`: el atajo numérico no llegaba a oírse hasta que la persona
   * interactuaba con algo. Lo detectó `pnpm measure:viewports`.
   */
  document.addEventListener("keydown", (event) => {
    if (!/^[1-9]$/.test(event.key) || settingsOpen) return;
    const target = event.target as HTMLElement;
    if (target.matches("input, select, textarea")) return;
    const context = caseContextFor(parseHash(window.location.hash));
    const session = context ? sessions.get(context.key) : undefined;
    if (!context || !session || session.completed || session.feedbackConsequenceId) return;
    const scene = sceneFor(context.item, session);
    if (scene.kind !== "observation" && scene.kind !== "design" && scene.kind !== "revision") return;
    const actionId = scene.actionIds[Number(event.key) - 1];
    if (!actionId) return;
    event.preventDefault();
    if (scene.feedbackMode === "deferred") playCue("decision");
    sessions.set(context.key, selectAction(context.item, session, scene, actionId));
    render(true);
  });

  window.addEventListener("hashchange", () => render(true));
  render();
}
