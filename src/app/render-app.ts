import validCase from "../content/fixtures/case.valid.json";
import validResources from "../content/fixtures/resources.valid.json";
import { validateCaseDefinition, validateResourceInventory } from "../domain/validation";
import {
  createProgressRepository,
  type ProgressRepository,
  type StorageMode,
} from "../infrastructure/progress-repository";
import { hrefFor, parseHash, type AppRoute } from "./router";

interface TechnicalState {
  contractValid: boolean;
  resourcesValid: boolean;
  storageMode: StorageMode;
  deploymentTarget: string;
  baseUrl: string;
  buildId: string;
  commitSha: string;
}

function storageFromBrowser(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function makeTechnicalState(repository: ProgressRepository): TechnicalState {
  const resourceResult = validateResourceInventory(validResources);
  const resourceIds = new Set(
    resourceResult.ok ? resourceResult.value.resources.map((resource) => resource.id) : [],
  );
  const caseResult = validateCaseDefinition(validCase, resourceIds);
  const progress = repository.load();
  repository.save(progress);

  return {
    contractValid: caseResult.ok,
    resourcesValid: resourceResult.ok,
    storageMode: repository.mode,
    deploymentTarget: import.meta.env.VITE_DEPLOY_TARGET ?? "portable",
    baseUrl: import.meta.env.BASE_URL,
    buildId: import.meta.env.VITE_BUILD_ID ?? "local",
    commitSha: import.meta.env.VITE_COMMIT_SHA ?? "sin-commit",
  };
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ] ?? character,
  );
}

function statusItem(label: string, ok: boolean, detail: string): string {
  const state = ok ? "correcto" : "fallo";
  return `<li class="status status--${state}">
    <span aria-hidden="true">${ok ? "✓" : "×"}</span>
    <span><strong>${escapeHtml(label)}</strong><small>${escapeHtml(detail)}</small></span>
  </li>`;
}

function routeContent(route: AppRoute, state: TechnicalState): string {
  switch (route.name) {
    case "home":
      return `<section class="hero" aria-labelledby="titulo-m3">
        <p class="eyebrow">El aula de los dos minutos · fase M3</p>
        <h1 id="titulo-m3">Arquitectura lista para probar, juego aún no construido</h1>
        <p class="lede">Esta pantalla verifica contratos, navegación bajo subruta y almacenamiento local. El tutorial y el caso piloto comienzan en M4.</p>
        <div class="actions">
          <a class="button" href="${hrefFor({ name: "publication-proof" })}">Ver prueba de publicación</a>
          <a class="text-link" href="${hrefFor({ name: "case", slug: "m3-contract-probe" })}">Probar enlace profundo técnico</a>
        </div>
      </section>`;
    case "publication-proof":
      return `<section aria-labelledby="titulo-prueba">
        <p class="eyebrow">Prueba reproducible</p>
        <h1 id="titulo-prueba">Estado técnico del despliegue</h1>
        <p>Todos los indicadores se calculan en este navegador. No se envían resultados ni identificadores.</p>
        <ul class="status-list" data-testid="technical-status">
          ${statusItem("Contrato de caso", state.contractValid, "Tipos y referencias semánticas válidos")}
          ${statusItem("Inventario audiovisual", state.resourcesValid, "Procedencia y alternativas exigidas")}
          ${statusItem(
            "Almacenamiento",
            true,
            state.storageMode === "persistent"
              ? "Persistencia local disponible"
              : "Memoria temporal: el navegador bloquea la persistencia",
          )}
          ${statusItem("Ruta portátil", state.baseUrl === "./", `Base compilada: ${state.baseUrl}`)}
        </ul>
        <dl class="build-data">
          <div><dt>Destino</dt><dd data-testid="deploy-target">${escapeHtml(state.deploymentTarget)}</dd></div>
          <div><dt>Compilación</dt><dd>${escapeHtml(state.buildId)}</dd></div>
          <div><dt>Revisión</dt><dd>${escapeHtml(state.commitSha.slice(0, 12))}</dd></div>
        </dl>
        <p><a class="text-link" href="${hrefFor({ name: "home" })}">Volver al inicio técnico</a></p>
      </section>`;
    case "case":
      return `<section aria-labelledby="titulo-enlace">
        <p class="eyebrow">Acceso directo comprobado</p>
        <h1 id="titulo-enlace">Ruta de caso: ${escapeHtml(route.slug)}</h1>
        <div class="notice" role="note">
          <strong>Parada deliberada de M3.</strong>
          <p>La ruta resuelve bajo alojamiento estático, pero no contiene todavía el tutorial ni el caso piloto. Su implementación corresponde al corte gris de M4.</p>
        </div>
        <p><a class="text-link" href="${hrefFor({ name: "publication-proof" })}">Volver a la prueba</a></p>
      </section>`;
    case "class-route":
      return `<section><p class="eyebrow">Contrato de navegación</p><h1>Ruta presencial reservada</h1><p>El acceso directo existe; la secuencia de 25-28 minutos se ensamblará después del corte gris.</p></section>`;
    case "journal":
      return `<section><p class="eyebrow">Contrato de progreso</p><h1>Bitácora local reservada</h1><p>El esquema está validado y no contiene identidad, puntuación ni envío automático. La interfaz se construirá en M4.</p></section>`;
    case "not-found":
      return `<section><p class="eyebrow">Ruta no encontrada</p><h1>Este enlace no forma parte del contrato</h1><p><code>${escapeHtml(route.requested)}</code></p><p><a class="text-link" href="${hrefFor({ name: "home" })}">Ir al inicio técnico</a></p></section>`;
  }
}

export function mountApp(root: HTMLElement): void {
  const repository = createProgressRepository(storageFromBrowser());
  const technicalState = makeTechnicalState(repository);

  const render = () => {
    const route = parseHash(window.location.hash);
    root.innerHTML = `<header class="site-header">
      <a class="brand" href="${hrefFor({ name: "home" })}" aria-label="Inicio técnico de El aula de los dos minutos">
        <span class="brand__mark" aria-hidden="true">02′</span>
        <span>El aula de los dos minutos</span>
      </a>
      <span class="phase">M3 · prueba mínima</span>
    </header>
    <main id="contenido" tabindex="-1">${routeContent(route, technicalState)}</main>
    <footer><p>Prototipo técnico sin analítica, cuentas ni contenido jugable completo.</p></footer>`;
    document.title = "M3 · El aula de los dos minutos";
    document.documentElement.dataset.appReady = "true";
  };

  window.addEventListener("hashchange", render);
  render();
}
