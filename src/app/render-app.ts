import validCase from "../content/fixtures/case.valid.json";
import validResources from "../content/fixtures/resources.valid.json";
import { findPlayableCase, playableCases } from "../content/playable";
import type { CaseDefinition, Consequence, JournalEntry, Progress, Scene } from "../domain/contracts";
import { validateCaseDefinition, validateResourceInventory } from "../domain/validation";
import { createProgressRepository, type ProgressRepository, type StorageMode } from "../infrastructure/progress-repository";
import {
  advanceFromInformationalScene, buildJournalEntry, consequenceForScene,
  continueFromFeedback, createGameSession, grammarComplete, grammarSentence,
  sceneFor, selectAction, selectGrammar, type GameSession, type GrammarKey,
} from "./game-session";
import { parseHash, type AppRoute } from "./router";

interface TechnicalState {
  contractValid: boolean;
  resourcesValid: boolean;
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

const GRAMMAR_LABELS: Record<GrammarKey, string> = {
  objective: "Objetivo", principleAction: "Principio y acción",
  conditionRisk: "Condición o riesgo", adaptation: "Adaptación",
  evidence: "Evidencia observable",
};

function storageFromBrowser(): Storage | undefined {
  try { return window.localStorage; } catch { return undefined; }
}

function makeTechnicalState(repository: ProgressRepository): TechnicalState {
  const resources = validateResourceInventory(validResources);
  const resourceIds = new Set(resources.ok ? resources.value.resources.map((item) => item.id) : []);
  const probe = validateCaseDefinition(validCase, resourceIds);
  const progress = repository.load();
  repository.save(progress);
  return {
    contractValid: probe.ok, resourcesValid: resources.ok,
    playableContentValid: playableCases.length === 2, storageMode: repository.mode,
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

function feedbackCard(consequence: Consequence): string {
  const rating = {
    "coherent-defensible": "Coherente y defendible",
    "defensible-needs-revision": "Defendible con revisión",
    "incoherent-with-brief": "Incoherente con el encargo",
  }[consequence.rating];
  return `<section class="feedback feedback--${consequence.rating}" aria-live="polite" aria-labelledby="feedback-title">
    <p class="feedback__rating">${rating}</p><h2 id="feedback-title">Contrasta tu decisión</h2>
    <dl class="feedback__grid"><div><dt>Sostiene</dt><dd>${esc(consequence.feedback.supports)}</dd></div>
    <div><dt>Tensiona</dt><dd>${esc(consequence.feedback.tension)}</dd></div>
    <div><dt>Podrías reparar</dt><dd>${esc(consequence.feedback.possibleRepair)}</dd></div>
    <div><dt>Mira esta evidencia</dt><dd>${esc(consequence.feedback.observableEvidence)}</dd></div></dl></section>`;
}

function sceneHeader(caseDefinition: CaseDefinition, scene: Scene): string {
  const index = caseDefinition.scenes.findIndex((candidate) => candidate.id === scene.id) + 1;
  return `<div class="scene-heading"><div><p class="eyebrow">${caseDefinition.experienceType === "tutorial" ? "Detective de aula" : "Caso completo"} · paso ${index} de ${caseDefinition.scenes.length}</p><h1 tabindex="-1">${esc(scene.title)}</h1></div><progress value="${index}" max="${caseDefinition.scenes.length}" aria-label="Progreso del recorrido">${index}/${caseDefinition.scenes.length}</progress></div>`;
}

function choiceScene(caseDefinition: CaseDefinition, scene: Extract<Scene, { kind: "observation" | "design" | "revision" }>, session: GameSession): string {
  if (session.feedbackConsequenceId) {
    const consequence = caseDefinition.consequences.find((item) => item.id === session.feedbackConsequenceId);
    if (!consequence) throw new Error("No se encontró la retroalimentación");
    return `${sceneHeader(caseDefinition, scene)}${feedbackCard(consequence)}<div class="scene-actions"><button class="primary" type="button" data-continue-feedback>${consequence.nextSceneId === scene.id ? "Probar otra lectura" : "Continuar"}</button></div>`;
  }
  const choices = scene.actionIds.map((actionId, index) => {
    const action = caseDefinition.actions.find((item) => item.id === actionId);
    return action ? `<button class="choice" type="button" data-action-id="${action.id}"><span class="choice__key" aria-hidden="true">${index + 1}</span><span>${esc(action.label)}</span></button>` : "";
  }).join("");
  return `${sceneHeader(caseDefinition, scene)}<p class="scene-intro">${esc(scene.introduction)}</p><fieldset class="choice-list"><legend>${esc(scene.prompt)}</legend>${choices}</fieldset>`;
}

function consequenceScene(caseDefinition: CaseDefinition, scene: Extract<Scene, { kind: "consequence" }>, session: GameSession): string {
  const consequence = consequenceForScene(caseDefinition, scene, session);
  return `${sceneHeader(caseDefinition, scene)}<p class="scene-intro">${esc(scene.introduction)}</p>${feedbackCard(consequence)}
    <details class="observables"><summary>Ver cuatro observables</summary><dl>
    <div><dt>Aprendizaje</dt><dd>${esc(consequence.observables.learning)}</dd></div>
    <div><dt>Agencia</dt><dd>${esc(consequence.observables.agency)}</dd></div>
    <div><dt>Barrera</dt><dd>${esc(consequence.observables.barrier)}</dd></div>
    <div><dt>Evidencia</dt><dd>${esc(consequence.observables.evidence)}</dd></div></dl></details>
    <div class="scene-actions"><button class="primary" type="button" data-advance-info>Continuar</button></div>`;
}

function incidentScene(caseDefinition: CaseDefinition, scene: Extract<Scene, { kind: "incident" }>): string {
  const incident = caseDefinition.incidents.find((item) => item.id === scene.incidentId);
  if (!incident) throw new Error("Incidente inexistente");
  return `${sceneHeader(caseDefinition, scene)}<p class="scene-intro">${esc(scene.introduction)}</p><blockquote class="incident"><p>${esc(incident.reveal)}</p></blockquote><p class="quiet">La tensión pertenece a la organización del aula; ninguna persona funciona como problema o giro sorpresa.</p><div class="scene-actions"><button class="primary" type="button" data-advance-info>Revisar el diseño</button></div>`;
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
  return `${sceneHeader(caseDefinition, scene)}<p class="scene-intro">${esc(scene.introduction)}</p><div class="grammar-form">${grammarOptions(scene, session)}</div><p class="grammar-preview" aria-live="polite">${esc(grammarSentence(caseDefinition, session))}</p><div class="scene-actions"><button class="primary" type="button" data-advance-justification ${grammarComplete(session) ? "" : "disabled"}>Llevar a la bitácora</button></div>`;
}

function journalDefinition(entry: JournalEntry): string {
  return (Object.keys(JOURNAL_LABELS) as Array<keyof typeof JOURNAL_LABELS>).map((property) => `<div><dt>${JOURNAL_LABELS[property]}</dt><dd>${esc(entry[property])}</dd></div>`).join("");
}

function reflectionScene(caseDefinition: CaseDefinition, scene: Extract<Scene, { kind: "reflection" }>, session: GameSession): string {
  const preview = buildJournalEntry(caseDefinition, session, new Date().toISOString(), "00000000-0000-4000-8000-000000000000");
  return `${sceneHeader(caseDefinition, scene)}<p class="scene-intro">${esc(scene.introduction)}</p><details class="journal-preview" open><summary>Revisar la entrada</summary><dl>${journalDefinition(preview)}</dl></details><div class="scene-actions"><button class="primary" type="button" data-finish-case>Guardar y cerrar</button></div>`;
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
    case "consequence": return consequenceScene(caseDefinition, scene, session);
    case "incident": return incidentScene(caseDefinition, scene);
    case "justification": return justificationScene(caseDefinition, scene, session);
    case "reflection": return reflectionScene(caseDefinition, scene, session);
  }
}

function journalText(entries: JournalEntry[]): string {
  return entries.map((entry) => {
    const title = playableCases.find((item) => item.id === entry.caseId)?.title ?? entry.caseId;
    return `${title}\n${(Object.keys(JOURNAL_LABELS) as Array<keyof typeof JOURNAL_LABELS>).map((property) => `${JOURNAL_LABELS[property]}: ${entry[property]}`).join("\n")}`;
  }).join("\n\n");
}

function journalView(progress: Progress, storageMode: StorageMode): string {
  const entries = progress.journal.map((entry) => {
    const title = playableCases.find((item) => item.id === entry.caseId)?.title ?? entry.caseId;
    return `<article class="journal-entry"><h2>${esc(title)}</h2><dl>${journalDefinition(entry)}</dl></article>`;
  }).join("");
  return `<section class="reference-page" aria-labelledby="journal-title"><p class="eyebrow">Bitácora local · ${storageMode === "persistent" ? "guardada en este navegador" : "memoria temporal"}</p><h1 id="journal-title" tabindex="-1">Decisiones, revisiones y evidencias</h1><p>No contiene identidad, nota ni envío automático.</p>${entries || '<div class="notice"><strong>Aún no hay entradas.</strong><p>Completa el tutorial o el caso para guardar tu razonamiento.</p></div>'}<div class="actions"><button class="primary" type="button" data-copy-journal ${entries ? "" : "disabled"}>Copiar bitácora</button><button class="secondary" type="button" data-print-journal ${entries ? "" : "disabled"}>Imprimir</button><a class="text-link" href="#/">Volver</a></div><p class="copy-status" role="status"></p></section>`;
}

function settingsPanel(progress: Progress, storageMode: StorageMode): string {
  return `<aside class="settings-panel" aria-labelledby="settings-title"><div><p class="eyebrow">Accesibilidad del corte gris</p><h2 id="settings-title" tabindex="-1">Sonido y movimiento</h2></div><label class="toggle"><input type="checkbox" data-setting="muted" ${progress.settings.muted ? "checked" : ""}><span>Silenciar todo</span></label><label><span>Volumen</span><input type="range" min="0" max="1" step="0.1" value="${progress.settings.volume}" data-setting="volume"></label><label class="toggle"><input type="checkbox" data-setting="reducedMotion" ${progress.settings.reducedMotion ? "checked" : ""}><span>Reducir movimiento</span></label><p class="quiet">Este prototipo no incorpora audio: toda la información ya es textual y cada recorrido puede repetirse al terminar.</p><p class="quiet">Progreso: ${storageMode === "persistent" ? "persistente en este navegador" : "temporal; el navegador bloquea el almacenamiento"}.</p><button class="secondary" type="button" data-close-settings>Cerrar</button></aside>`;
}

function homeView(progress: Progress): string {
  const completed = progress.completedCaseIds.includes("mucho-hacer-poco-aprender");
  return `<section class="hero" aria-labelledby="home-title"><p class="eyebrow">M4 · corte vertical gris</p><h1 id="home-title" tabindex="-1">Observa, diseña y revisa una microclase</h1><p class="lede">Primero distinguirás actividad de evidencia. Después resolverás un caso completo con tres decisiones, una prueba, un incidente y una revisión.</p><div class="actions"><a class="button" href="#/caso/mucho-hacer-poco-aprender">${completed ? "Repetir tutorial" : "Comenzar tutorial"}</a><a class="text-link" href="#/caso/el-arreglo-que-no-escucha-a-todos">Abrir directamente el caso</a></div><div class="grey-note" role="note"><strong>Prototipo sin arte definitivo.</strong> La jerarquía, los controles y los estados son funcionales; la identidad visual y sonora pertenecen a M5.</div></section>`;
}

function technicalView(state: TechnicalState): string {
  return `<section class="reference-page" aria-labelledby="proof-title"><p class="eyebrow">Diagnóstico reproducible</p><h1 id="proof-title" tabindex="-1">Estado técnico del corte</h1><ul class="status-list">${statusItem("Contratos M3", state.contractValid, "La sonda técnica sigue siendo válida")}${statusItem("Contenido M4", state.playableContentValid, "Tutorial y caso validados al cargar")}${statusItem("Inventario audiovisual", state.resourcesValid, "Las alternativas siguen siendo exigibles")}${statusItem("Ruta portátil", state.baseUrl === "./", `Base compilada: ${state.baseUrl}`)}</ul><dl class="build-data"><div><dt>Destino</dt><dd>${esc(state.deploymentTarget)}</dd></div><div><dt>Compilación</dt><dd>${esc(state.buildId)}</dd></div><div><dt>Revisión</dt><dd>${esc(state.commitSha.slice(0, 12))}</dd></div></dl><p><a class="text-link" href="#/">Volver al corte</a></p></section>`;
}

function routeContent(route: AppRoute, state: TechnicalState, progress: Progress, sessions: Map<string, GameSession>): string {
  switch (route.name) {
    case "home": return homeView(progress);
    case "publication-proof": return technicalView(state);
    case "case": {
      const item = findPlayableCase(route.slug);
      if (!item) return `<section><p class="eyebrow">Acceso directo</p><h1 tabindex="-1">Caso no disponible en M4</h1><p><code>${esc(route.slug)}</code></p><p>Este corte contiene únicamente el tutorial y el caso piloto aprobado. La campaña completa pertenece a fases posteriores.</p><p><a class="text-link" href="#/">Volver</a></p></section>`;
      const session = sessions.get(item.id) ?? createGameSession(item);
      sessions.set(item.id, session);
      return `<section class="game-screen" data-case-id="${item.id}">${gameView(item, session)}</section>`;
    }
    case "class-route": return `<section class="reference-page"><p class="eyebrow">Ruta presencial · alcance M4</p><h1 tabindex="-1">Dos recorridos compartidos, todavía sin campaña</h1><p>La ruta definitiva de 25–28 minutos se equilibrará en M7C. En M4 puedes abrir los mismos datos que usa la ruta doméstica.</p><div class="actions"><a class="button" href="#/caso/mucho-hacer-poco-aprender">Tutorial</a><a class="text-link" href="#/caso/el-arreglo-que-no-escucha-a-todos">Caso completo</a></div></section>`;
    case "journal": return journalView(progress, state.storageMode);
    case "not-found": return `<section><p class="eyebrow">Ruta no encontrada</p><h1 tabindex="-1">Este enlace no forma parte del contrato</h1><p><code>${esc(route.requested)}</code></p><p><a class="text-link" href="#/">Ir al inicio</a></p></section>`;
  }
}

function randomAttemptId(): string {
  return globalThis.crypto?.randomUUID?.() ?? "00000000-0000-4000-8000-000000000001";
}

export function mountApp(root: HTMLElement): void {
  const repository = createProgressRepository(storageFromBrowser());
  const state = makeTechnicalState(repository);
  const sessions = new Map<string, GameSession>();
  let progress = repository.load();
  let settingsOpen = false;

  const render = (focusMain = false) => {
    const route = parseHash(window.location.hash);
    root.innerHTML = `<header class="site-header"><a class="brand" href="#/" aria-label="Inicio de El aula de los dos minutos"><span class="brand__mark" aria-hidden="true">02′</span><span>El aula de los dos minutos</span></a><nav aria-label="Utilidades"><a href="#/bitacora">Bitácora</a><button type="button" data-open-settings>Ajustes</button></nav></header><main id="contenido" tabindex="-1">${routeContent(route, state, progress, sessions)}</main><footer><p>M4 · corte gris · sin cuentas, analítica ni arte definitivo</p><a href="#/prueba-publicacion">Diagnóstico</a></footer>${settingsOpen ? settingsPanel(progress, state.storageMode) : ""}`;
    document.title = "M4 · El aula de los dos minutos";
    document.documentElement.dataset.appReady = "true";
    document.documentElement.dataset.reducedMotion = String(progress.settings.reducedMotion);
    if (focusMain) root.querySelector<HTMLElement>("main h1, main")?.focus();
  };

  root.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement;
    const route = parseHash(window.location.hash);
    const item = route.name === "case" ? findPlayableCase(route.slug) : undefined;
    const session = item ? sessions.get(item.id) : undefined;
    const scene = item && session ? sceneFor(item, session) : undefined;
    const actionButton = target.closest<HTMLButtonElement>("[data-action-id]");
    if (actionButton && item && session && scene && (scene.kind === "observation" || scene.kind === "design" || scene.kind === "revision")) {
      sessions.set(item.id, selectAction(item, session, scene, actionButton.dataset.actionId ?? "")); render(true); return;
    }
    if (target.closest("[data-continue-feedback]") && item && session) {
      sessions.set(item.id, continueFromFeedback(item, session)); render(true); return;
    }
    if (target.closest("[data-advance-info]") && item && session && scene && (scene.kind === "consequence" || scene.kind === "incident")) {
      sessions.set(item.id, advanceFromInformationalScene(item, session, scene)); render(true); return;
    }
    if (target.closest("[data-advance-justification]") && item && session && scene?.kind === "justification" && grammarComplete(session)) {
      sessions.set(item.id, { ...session, sceneId: scene.nextSceneId ?? session.sceneId }); render(true); return;
    }
    if (target.closest("[data-finish-case]") && item && session) {
      const now = new Date().toISOString();
      const entry = buildJournalEntry(item, session, now, randomAttemptId());
      progress = { ...progress, updatedAt: now,
        completedCaseIds: [...new Set([...progress.completedCaseIds, item.id])],
        attemptsByCase: { ...progress.attemptsByCase, [item.id]: (progress.attemptsByCase[item.id] ?? 0) + 1 },
        journal: [...progress.journal, entry],
        recommendedNextCaseId: item.experienceType === "tutorial" ? "el-arreglo-que-no-escucha-a-todos" : null };
      repository.save(progress); sessions.set(item.id, { ...session, completed: true }); render(true); return;
    }
    if (target.closest("[data-restart-case]") && item) { sessions.set(item.id, createGameSession(item)); render(true); return; }
    if (target.closest("[data-open-settings]")) { settingsOpen = true; render(); root.querySelector<HTMLElement>(".settings-panel h2")?.focus(); return; }
    if (target.closest("[data-close-settings]")) { settingsOpen = false; render(); root.querySelector<HTMLElement>("[data-open-settings]")?.focus(); return; }
    if (target.closest("[data-copy-journal]")) {
      const status = root.querySelector<HTMLElement>(".copy-status");
      try { await navigator.clipboard.writeText(journalText(progress.journal)); if (status) status.textContent = "Bitácora copiada."; }
      catch { if (status) status.textContent = "No se pudo copiar automáticamente; selecciona el texto visible."; }
      return;
    }
    if (target.closest("[data-print-journal]")) window.print();
  });

  root.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const grammarKey = target.dataset.grammarKey as GrammarKey | undefined;
    const route = parseHash(window.location.hash);
    const item = route.name === "case" ? findPlayableCase(route.slug) : undefined;
    const session = item ? sessions.get(item.id) : undefined;
    if (grammarKey && item && session) {
      sessions.set(item.id, selectGrammar(session, grammarKey, target.value)); render();
      root.querySelector<HTMLSelectElement>(`[data-grammar-key="${grammarKey}"]`)?.focus(); return;
    }
    const setting = target.dataset.setting as "muted" | "volume" | "reducedMotion" | undefined;
    if (setting) {
      const value = setting === "volume" ? Number(target.value) : (target as HTMLInputElement).checked;
      progress = { ...progress, updatedAt: new Date().toISOString(), settings: { ...progress.settings, [setting]: value } };
      repository.save(progress); render();
    }
  });

  root.addEventListener("keydown", (event) => {
    if (!/^[1-9]$/.test(event.key) || settingsOpen) return;
    const target = event.target as HTMLElement;
    if (target.matches("input, select, textarea")) return;
    const route = parseHash(window.location.hash);
    const item = route.name === "case" ? findPlayableCase(route.slug) : undefined;
    const session = item ? sessions.get(item.id) : undefined;
    const scene = item && session ? sceneFor(item, session) : undefined;
    if (!item || !session || !scene || session.feedbackConsequenceId) return;
    if (scene.kind !== "observation" && scene.kind !== "design" && scene.kind !== "revision") return;
    const actionId = scene.actionIds[Number(event.key) - 1];
    if (!actionId) return;
    event.preventDefault();
    sessions.set(item.id, selectAction(item, session, scene, actionId));
    render(true);
  });

  window.addEventListener("hashchange", () => render(true));
  render();
}
