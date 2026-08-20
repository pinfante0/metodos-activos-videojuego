/**
 * Medición reproducible de los cinco tamaños objetivo.
 *
 * Sirve `dist/` en un puerto local, conduce Chrome sin interfaz por el protocolo de DevTools y
 * recorre **los recorridos declarados en `src/content/playable/walkthroughs.json`** hasta su
 * pantalla de cierre. En cada pantalla mide desbordamiento horizontal, desplazamiento vertical y el
 * menor lado de todo control interactivo visible, **con los desplegables cerrados y abiertos**.
 *
 * Comprueba la regla 6 de `docs/decision_producto_m5.md`: ninguna pantalla de acción puede
 * desplazarse, en ningún estado. Las páginas de referencia —campaña, bitácora, diagnóstico— quedan
 * excluidas de esa regla, pero se miden igual. Si algo se desplaza, el arnés **falla con código de
 * salida 1**.
 *
 * Comprueba también que todo bloque con desplazamiento interno real sea alcanzable con el
 * tabulador, tenga nombre accesible expuesto en el árbol de accesibilidad, muestre foco visible y
 * se pueda desplazar con el teclado.
 *
 * ## Qué cambió en M6
 *
 * En M5 los dos recorridos y sus identificadores de acción estaban escritos dentro de este archivo.
 * Con una campaña de nueve unidades eso no se sostiene: cada caso nuevo obligaría a editar el
 * arnés, y un caso que dejara de ofrecer una decisión pasaría por otro camino sin avisar. Ahora:
 *
 * - los recorridos son un dato, compartido con `tests/walkthroughs.test.ts`, que los ejecuta sobre
 *   la sesión pura. Uno demuestra la lógica y el otro, la pantalla;
 * - las rutas de prueba de los estados difíciles se descubren leyendo `#/pruebas`, de modo que
 *   añadir un estado lo incorpora a la medición sin tocar este archivo;
 * - una acción se consume al usarse, lo que permite describir un reintento sin girar en vacío.
 *
 * Tres garantías impiden que una avería se disfrace de éxito:
 *
 * 1. **El camino es explícito.** Elegir siempre la primera opción hacía que el tutorial volviera a
 *    su propia escena de observación y el recorrido girara en vacío hasta agotar los pasos.
 * 2. **Llegar al final es obligatorio.** Agotar el límite de pasos o quedarse sin control que
 *    pulsar es un fallo, nunca una salida silenciosa.
 * 3. **Todo tiene tiempo límite.** Cada operación del protocolo, cada carga y la ejecución completa
 *    fallan con diagnóstico en lugar de esperar indefinidamente.
 *
 * Chrome es una dependencia externa deliberada: no se añade al proyecto un navegador de pruebas de
 * decenas de megabytes para una comprobación que se ejecuta al cerrar cada fase.
 *
 *   pnpm build
 *   pnpm measure:viewports                 # tres pasadas, resumen en Markdown
 *   pnpm measure:viewports --runs=1        # una sola pasada
 *   pnpm measure:viewports --all-viewports # los cinco tamaños en todos los recorridos
 *   pnpm measure:viewports --allow-scroll  # informa del desplazamiento sin fallar
 *   pnpm measure:viewports --out=docs/x.md # además escribe el resumen a un archivo
 *
 * Si Chrome no está en una ruta habitual, indíquelo con CHROME_PATH o con --chrome=<ruta>.
 */
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";

const args = new Map(
  process.argv.slice(2)
    .filter((value) => value.startsWith("--"))
    .map((value) => {
      const [key, ...rest] = value.slice(2).split("=");
      return [key, rest.join("=") || "true"];
    }),
);

const RUNS = Number(args.get("runs") ?? 3);
const DIST = resolve(args.get("dist") ?? "dist");
const OUT = args.get("out");
const CDP_PORT = Number(args.get("port") ?? 9333);

const COMMAND_TIMEOUT_MS = 15_000;
const LOAD_TIMEOUT_MS = 30_000;
const GLOBAL_TIMEOUT_MS = Number(args.get("timeout") ?? 900_000);
const MAX_STEPS = 40;

const VIEWPORTS = [
  { name: "360 × 640", width: 360, height: 640 },
  { name: "390 × 844", width: 390, height: 844 },
  { name: "768 × 1024", width: 768, height: 1024 },
  { name: "1366 × 768", width: 1366, height: 768 },
  { name: "1440 × 900", width: 1440, height: 900 },
];

const REFERENCE_VIEWPORT = VIEWPORTS[3];

/**
 * Recorridos declarados: la misma fuente que ejecuta `tests/walkthroughs.test.ts`.
 *
 * Si el contenido cambiara y una acción prevista dejara de ofrecerse, el recorrido falla en lugar
 * de improvisar otro camino. Cada acción se consume al usarse, de modo que un recorrido puede
 * describir un reintento —elegir una opción que devuelve a la misma escena y después otra— sin
 * girar en vacío.
 */
const CATALOGUE = JSON.parse(
  readFileSync(resolve("src/content/playable/walkthroughs.json"), "utf8"),
);

const WALKS = CATALOGUE.walkthroughs.map((walk) => ({
  name: walk.name,
  hash: walk.startSceneId
    ? `#/caso/${walk.caseSlug}/${walk.startSceneId}`
    : `#/caso/${walk.caseSlug}`,
  actions: walk.actions ?? [],
  viewports:
    args.has("all-viewports") || walk.viewportCoverage === "all" ? VIEWPORTS : [REFERENCE_VIEWPORT],
}));

/** Páginas de referencia y navegación. Pueden desplazarse, pero no desbordar ni encoger un control. */
const STATIC_ROUTES = [
  { name: "portada", hash: "#/" },
  { name: "campaña", hash: "#/campana" },
  { name: "ruta de clase", hash: "#/ruta/clase" },
  { name: "bitácora", hash: "#/bitacora" },
  { name: "diagnóstico", hash: "#/prueba-publicacion" },
  { name: "índice de pruebas", hash: "#/pruebas" },
];

const IDENTITY = "aula-laboratorio";
const PROGRESS_KEY = "metodos.progress.v1";

/** Bloques que declaran desplazamiento interno propio y deben ser accesibles con teclado. */
const SCROLLABLE_BLOCKS = [
  { selector: "#panel-razonamiento", label: "reparación, observables y reparto" },
  { selector: ".grammar-preview", label: "justificación en construcción" },
  { selector: "#panel-bitacora", label: "vista previa de la bitácora" },
  { selector: "#panel-montaje", label: "montaje de la microclase" },
  { selector: "#panel-incidente", label: "relato del incidente" },
  { selector: "#panel-marco-consecuencia", label: "marco pedagógico de la consecuencia" },
];

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  args.get("chrome"),
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

function findChrome() {
  const found = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
  if (found) return found;
  throw new Error("No se ha encontrado Chrome ni Edge. Indique la ruta con CHROME_PATH o --chrome=<ruta>.");
}

if (!existsSync(join(DIST, "index.html"))) {
  throw new Error(`No hay compilación en ${DIST}. Ejecute antes 'pnpm build'.`);
}

const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2",
};

const MEASURE = `(() => {
  const main = document.querySelector('main');
  const de = document.documentElement;
  const h1 = document.querySelector('main h1');
  const isAction = !!document.querySelector('.game-screen') && !document.querySelector('.reference-page');
  let minSide = Infinity, worst = '';
  for (const el of document.querySelectorAll('button, a[href], select, input, summary')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const side = Math.min(r.width, r.height);
    if (side < minSide) { minSide = side; worst = el.tagName.toLowerCase() + '.' + (el.className || '') + ' ' + Math.round(r.width) + 'x' + Math.round(r.height); }
  }
  return JSON.stringify({
    title: h1 ? h1.textContent.trim() : '(sin h1)',
    isAction,
    hOverflow: de.scrollWidth - window.innerWidth,
    mainScroll: main ? main.scrollHeight - main.clientHeight : 0,
    minSide: minSide === Infinity ? null : Math.round(minSide),
    worst: worst.slice(0, 70),
    completed: !!document.querySelector('.completion'),
    disclosures: document.querySelectorAll('[data-toggle-disclosure]').length,
  });
})()`;

const setDetails = (open) => `(() => {
  const toggles = [...document.querySelectorAll('[data-toggle-disclosure]')];
  for (const toggle of toggles) {
    if ((toggle.getAttribute('aria-expanded') === 'true') !== ${open}) toggle.click();
  }
  return toggles.length;
})()`;

/** Estado por defecto: el razonamiento cerrado y la vista previa de la bitácora abierta. */
const restoreDetails = `(() => {
  for (const toggle of document.querySelectorAll('[data-toggle-disclosure]')) {
    const wanted = toggle.dataset.toggleDisclosure === 'panel-bitacora';
    if ((toggle.getAttribute('aria-expanded') === 'true') !== wanted) toggle.click();
  }
  return true;
})()`;

/**
 * Un paso del recorrido. `remaining` son las acciones aún sin consumir: quien llama retira la que
 * se haya usado, que es lo que permite describir un reintento sin repetir la misma elección para
 * siempre.
 */
function advanceScript(remaining) {
  return `(() => {
  const q = (s) => document.querySelector(s);
  if (q('.completion')) return 'fin';
  const fb = q('[data-continue-feedback]'); if (fb) { fb.click(); return 'retroalimentación'; }
  const info = q('[data-advance-info]'); if (info) { info.click(); return 'información'; }
  const just = q('[data-advance-justification]');
  if (just) {
    const pending = [...document.querySelectorAll('[data-grammar-key]')].find((s) => !s.value);
    if (pending) { pending.value = pending.options[1].value; pending.dispatchEvent(new Event('change', { bubbles: true })); return 'gramática'; }
    if (!just.disabled) { just.click(); return 'justificación'; }
    return 'bloqueado: la justificación sigue deshabilitada';
  }
  const finish = q('[data-finish-case]'); if (finish) { finish.click(); return 'cierre'; }
  const planned = ${JSON.stringify(remaining)};
  for (const id of planned) {
    const choice = document.querySelector('.choice[data-action-id="' + id + '"]');
    if (choice) { choice.click(); return 'decisión ' + id; }
  }
  const offered = [...document.querySelectorAll('.choice')].map((c) => c.dataset.actionId);
  if (offered.length) return 'bloqueado: ninguna acción prevista sigue disponible entre ' + offered.join(', ');
  return 'bloqueado: no hay ningún control que pulsar';
})()`;
}

async function startServer() {
  const server = createServer(async (request, response) => {
    const path = (request.url ?? "/").split("?")[0];
    const file = join(DIST, normalize(path === "/" ? "/index.html" : path));
    try {
      const body = await readFile(file);
      response.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
      response.end(body);
    } catch {
      response.writeHead(404).end("no encontrado");
    }
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  return { server, base: `http://127.0.0.1:${server.address().port}/` };
}

async function connect(chromePath, profile) {
  const chrome = spawn(chromePath, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--disable-extensions", "--mute-audio", `--user-data-dir=${profile}`,
    `--remote-debugging-port=${CDP_PORT}`, "about:blank",
  ], { stdio: "ignore" });

  let socketUrl;
  for (let attempt = 0; attempt < 80 && !socketUrl; attempt += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
      socketUrl = list.find((target) => target.type === "page" && target.webSocketDebuggerUrl)?.webSocketDebuggerUrl;
    } catch { /* el navegador todavía está arrancando */ }
    if (!socketUrl) await new Promise((done) => setTimeout(done, 250));
  }
  if (!socketUrl) throw new Error("Chrome no expuso ningún destino de página en 20 segundos");

  const socket = new WebSocket(socketUrl);
  await new Promise((done, fail) => {
    const timer = setTimeout(() => fail(new Error("La conexión con Chrome no se abrió en 15 segundos")), COMMAND_TIMEOUT_MS);
    socket.onopen = () => { clearTimeout(timer); done(); };
    socket.onerror = (event) => { clearTimeout(timer); fail(new Error(`Fallo de conexión con Chrome: ${event?.message ?? "desconocido"}`)); };
  });

  let nextId = 0;
  const pending = new Map();
  let loadWaiters = [];
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Page.loadEventFired") {
      const waiters = loadWaiters;
      loadWaiters = [];
      for (const done of waiters) done();
    }
    if (message.id !== undefined && pending.has(message.id)) {
      const { done, fail, timer } = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(timer);
      message.error ? fail(new Error(JSON.stringify(message.error))) : done(message.result);
    }
  };

  /** Toda orden del protocolo falla con diagnóstico si el navegador deja de responder. */
  const send = (method, params = {}) =>
    new Promise((done, fail) => {
      const id = (nextId += 1);
      const timer = setTimeout(() => {
        pending.delete(id);
        fail(new Error(`Sin respuesta de Chrome a ${method} tras ${COMMAND_TIMEOUT_MS / 1000} s`));
      }, COMMAND_TIMEOUT_MS);
      pending.set(id, { done, fail, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });

  const nextLoad = () =>
    new Promise((done, fail) => {
      const timer = setTimeout(() => fail(new Error(`La página no confirmó su carga en ${LOAD_TIMEOUT_MS / 1000} s`)), LOAD_TIMEOUT_MS);
      loadWaiters.push(() => { clearTimeout(timer); done(); });
    });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("DOM.enable");
  await send("Accessibility.enable");
  return { chrome, socket, send, nextLoad };
}

function makeDriver(base, cdp, tag) {
  const { send, nextLoad } = cdp;
  const evaluate = async (expression, options = {}) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: !options.handle });
    if (result.exceptionDetails) throw new Error(`${result.exceptionDetails.text} :: ${expression.slice(0, 70)}`);
    return options.handle ? result.result.objectId : result.result.value;
  };
  const waitReady = async () => {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (await evaluate(`document.documentElement.dataset.appReady === 'true'`)) return;
      await new Promise((done) => setTimeout(done, 60));
    }
    throw new Error("La aplicación no marcó appReady");
  };
  let navigation = 0;
  const load = async (hash) => {
    navigation += 1;
    // Cada navegación debe ser una carga real de documento y hay que esperar a que confirme:
    // encadenar un cambio de hash con un reload produce medidas del documento anterior.
    const settled = nextLoad();
    await send("Page.navigate", { url: `${base}?${tag}=${navigation}${hash}` });
    await settled;
    await waitReady();
  };
  const key = async (key, code, virtual) => {
    const shared = { key, code, windowsVirtualKeyCode: virtual, nativeVirtualKeyCode: virtual };
    await send("Input.dispatchKeyEvent", { type: "keyDown", ...shared, text: key.length === 1 ? key : undefined });
    await send("Input.dispatchKeyEvent", { type: "keyUp", ...shared });
    await new Promise((done) => setTimeout(done, 40));
  };
  return { send, evaluate, load, key };
}

/**
 * Comprueba que un bloque con desplazamiento interno cumple las cuatro condiciones exigidas.
 * El nombre accesible se lee del árbol de accesibilidad real, no del atributo, y el foco se
 * alcanza con pulsaciones de tabulador auténticas, no con `focus()`.
 */
async function inspectScrollable(driver, block) {
  const { send, evaluate, key } = driver;
  const state = JSON.parse(await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(block.selector)});
    if (!el) return JSON.stringify({ present: false });
    return JSON.stringify({
      present: true,
      scrolls: el.scrollHeight - el.clientHeight > 1,
      tabbable: el.getAttribute('tabindex') === '0',
    });
  })()`));
  if (!state.present) return [];

  const results = [];
  const named = await (async () => {
    // `DOM.requestNode` sólo resuelve si el mapa de nodos está poblado, y se vacía en cada
    // navegación: hay que pedir el documento antes de traducir el objeto a nodo.
    await send("DOM.getDocument", { depth: -1 });
    const objectId = await evaluate(`document.querySelector(${JSON.stringify(block.selector)})`, { handle: true });
    const { nodeId } = await send("DOM.requestNode", { objectId });
    const tree = await send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false });
    const node = tree.nodes.find((candidate) => candidate.backendDOMNodeId !== undefined && candidate.name?.value);
    return node?.name?.value ?? "";
  })();
  results.push({
    name: `«${block.label}»: nombre accesible`,
    ok: named.trim().length > 0,
    detail: named ? `«${named}»` : "el árbol de accesibilidad no expone ningún nombre",
  });

  // Alcanzar el bloque con el tabulador, desde el principio del documento.
  await evaluate(`document.body.focus(); document.activeElement === document.body`);
  let reached = false;
  for (let press = 0; press < 40 && !reached; press += 1) {
    await key("Tab", "Tab", 9);
    reached = await evaluate(`document.activeElement === document.querySelector(${JSON.stringify(block.selector)})`);
  }
  results.push({
    name: `«${block.label}»: alcanzable con el tabulador`,
    ok: reached,
    detail: reached ? "recibe el foco tabulando" : "no se alcanzó en 40 pulsaciones",
  });

  if (reached) {
    const outline = JSON.parse(await evaluate(`(() => {
      const s = getComputedStyle(document.querySelector(${JSON.stringify(block.selector)}));
      return JSON.stringify({ style: s.outlineStyle, width: parseFloat(s.outlineWidth) || 0 });
    })()`));
    results.push({
      name: `«${block.label}»: foco visible`,
      ok: outline.style !== "none" && outline.width >= 2,
      detail: `contorno ${outline.style} de ${outline.width} px`,
    });

    if (state.scrolls) {
      const before = await evaluate(`document.querySelector(${JSON.stringify(block.selector)}).scrollTop`);
      await key("ArrowDown", "ArrowDown", 40);
      await key("ArrowDown", "ArrowDown", 40);
      const after = await evaluate(`document.querySelector(${JSON.stringify(block.selector)}).scrollTop`);
      // Se informa del recorrido disponible, que es determinista, y no del avance conseguido, que
      // depende del paso de desplazamiento del navegador y haría irreproducible este archivo.
      const range = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(block.selector)}); return el.scrollHeight - el.clientHeight; })()`);
      results.push({
        name: `«${block.label}»: se desplaza con el teclado`,
        ok: after > before,
        detail: `las flechas mueven el bloque; recorrido disponible de ${range} px`,
      });
    } else {
      results.push({
        name: `«${block.label}»: se desplaza con el teclado`,
        ok: true,
        detail: "no desborda a este tamaño, no hay nada que desplazar",
      });
    }
  }
  return results;
}

/** Descubre las rutas de prueba leyendo el índice: añadir un estado no obliga a tocar este archivo. */
async function discoverTestRoutes(driver) {
  await driver.load("#/pruebas");
  const found = JSON.parse(await driver.evaluate(`JSON.stringify(
    [...document.querySelectorAll('a[href^="#/prueba/"]')].map((a) => ({ hash: a.getAttribute('href'), name: a.textContent.trim() })),
  )`));
  if (found.length === 0) {
    throw new Error("El índice `#/pruebas` no publica ninguna ruta de prueba: la medición se quedaría sin estados difíciles.");
  }
  return found;
}

/** Mide una pantalla con los desplegables cerrados y después abiertos, y la deja como estaba. */
async function measureScreen(evaluate, collect) {
  for (const state of ["cerrado", "abierto"]) {
    if (state === "abierto") {
      const count = await evaluate(setDetails(true));
      if (count === 0) continue;
    }
    collect(JSON.parse(await evaluate(MEASURE)), state);
  }
  await evaluate(restoreDetails);
}

/** Acumulador de una tanda de medidas. Separar tandas es lo que hace comparable una pasada. */
function makeTally() {
  return { findings: [], horizontal: 0, minTarget: Infinity, screens: 0 };
}

function collectInto(tally, prefix) {
  return (measurement, state) => {
    if (measurement.minSide !== null) tally.minTarget = Math.min(tally.minTarget, measurement.minSide);
    if (measurement.hOverflow > 1) tally.horizontal += 1;
    if (measurement.isAction && measurement.mainScroll > 1) {
      tally.findings.push({ key: `${prefix}|${measurement.title}|detalle ${state}`, value: measurement.mainScroll });
    }
  };
}

function summarise(tally) {
  const worst = new Map();
  for (const finding of tally.findings) {
    worst.set(finding.key, Math.max(worst.get(finding.key) ?? 0, finding.value));
  }
  return {
    worst, horizontal: tally.horizontal, screens: tally.screens,
    minTarget: tally.minTarget === Infinity ? null : tally.minTarget,
  };
}

/**
 * `deepPass` sólo se activa en la primera pasada. Sus medidas van a una tanda propia: mezclarlas
 * con las de los recorridos haría que las pasadas dejaran de ser comparables entre sí y la
 * comprobación de reproducibilidad fallara siempre.
 */
async function runPass(base, cdp, passIndex, deepPass) {
  const driver = makeDriver(base, cdp, `pasada${passIndex}`);
  const { send, evaluate, load } = driver;
  const walkTally = makeTally();
  const stateTally = makeTally();
  const accessibility = [];

  const setViewport = (viewport) => send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: false,
  });

  for (const walk of WALKS) {
    for (const viewport of walk.viewports) {
      await setViewport(viewport);
      await load("#/");
      await evaluate(`localStorage.removeItem(${JSON.stringify(PROGRESS_KEY)}); true`);
      await load(walk.hash);

      // Sin esta aserción, una navegación que no confirme mide el documento anterior en silencio.
      const applied = await evaluate(`document.documentElement.dataset.identity`);
      if (applied !== IDENTITY) {
        throw new Error(`Identidad no aplicada en ${walk.name} · ${viewport.name}: se esperaba ${IDENTITY} y el documento declara ${applied}`);
      }

      const remaining = [...walk.actions];
      let finished = false;
      let steps = 0;

      while (steps < MAX_STEPS && !finished) {
        steps += 1;
        walkTally.screens += 1;

        await measureScreen(evaluate, collectInto(walkTally, `${walk.name}|${viewport.name}`));

        // Los bloques se inspeccionan con los desplegables abiertos: cerrados no son enfocables ni
        // tienen nombre expuesto, de modo que medirlos ahí no comprobaría nada.
        if (deepPass && viewport.width === 360 && viewport.height === 640) {
          await evaluate(setDetails(true));
          for (const block of SCROLLABLE_BLOCKS) {
            accessibility.push(...await inspectScrollable(driver, block));
          }
          await evaluate(restoreDetails);
        }

        const moved = await evaluate(advanceScript(remaining));
        if (moved === "fin") { finished = true; break; }
        if (typeof moved === "string" && moved.startsWith("bloqueado")) {
          const title = await evaluate(`(document.querySelector('main h1') || {}).textContent || '(sin h1)'`);
          throw new Error(`Recorrido detenido en ${walk.name} · ${viewport.name}, pantalla «${title.trim()}»: ${moved}`);
        }
        if (typeof moved === "string" && moved.startsWith("decisión ")) {
          const used = moved.slice("decisión ".length);
          const index = remaining.indexOf(used);
          if (index >= 0) remaining.splice(index, 1);
        }
        await new Promise((done) => setTimeout(done, 40));
      }

      if (!finished) {
        const title = await evaluate(`(document.querySelector('main h1') || {}).textContent || '(sin h1)'`);
        throw new Error(`El recorrido ${walk.name} · ${viewport.name} agotó ${MAX_STEPS} pasos sin llegar al cierre; se quedó en «${title.trim()}»`);
      }
    }
  }

  /*
   * Páginas de referencia y estados difíciles: una pantalla cada uno, en los cinco tamaños. No se
   * recorren porque no tienen recorrido; lo que hay que comprobar es que caben, que no desbordan y
   * que ningún control encoge por debajo del objetivo táctil.
   */
  let routesMeasured = 0;
  if (deepPass) {
    const testRoutes = await discoverTestRoutes(driver);
    routesMeasured = STATIC_ROUTES.length + testRoutes.length;
    for (const route of [...STATIC_ROUTES, ...testRoutes]) {
      for (const viewport of VIEWPORTS) {
        await setViewport(viewport);
        await load(route.hash);
        stateTally.screens += 1;
        await measureScreen(evaluate, collectInto(stateTally, `${route.name}|${viewport.name}`));
      }
    }
  }

  return {
    walk: summarise(walkTally),
    states: deepPass ? { ...summarise(stateTally), routesMeasured } : undefined,
    accessibility,
  };
}

/** Comprobaciones que no dependen del tamaño y basta ejecutar una vez. */
async function verifyInteraction(base, cdp) {
  const driver = makeDriver(base, cdp, "verificacion");
  const { send, evaluate, load, key } = driver;

  await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  const checks = [];

  const interactive = WALKS.find((walk) => walk.actions.length > 0) ?? WALKS[0];
  await load("#/");
  await evaluate(`localStorage.removeItem(${JSON.stringify(PROGRESS_KEY)}); true`);
  await load(interactive.hash);
  await key("1", "Digit1", 49);
  checks.push({
    name: "Teclado: el atajo numérico toma la decisión",
    ok: await evaluate(`!!document.querySelector('.feedback')`),
    detail: "aparece la retroalimentación sin haber tocado el ratón",
  });
  checks.push({
    name: "La banda de escena es decorativa",
    ok: await evaluate(`(() => { const s = document.querySelector('.stage'); return !!s && s.getAttribute('aria-hidden') === 'true' && s.textContent.trim() === ''; })()`),
    detail: "oculta a la tecnología de apoyo y sin texto propio",
  });

  await evaluate(`(() => {
    const raw = localStorage.getItem(${JSON.stringify(PROGRESS_KEY)});
    const progress = raw ? JSON.parse(raw) : null;
    if (!progress) return false;
    progress.settings.muted = true;
    progress.settings.reducedMotion = true;
    localStorage.setItem(${JSON.stringify(PROGRESS_KEY)}, JSON.stringify(progress));
    return true;
  })()`);
  await load(interactive.hash);
  await key("1", "Digit1", 49);
  const caption = await evaluate(`(document.querySelector('.sound-caption') || {}).textContent || ''`);
  checks.push({
    name: "Silencio: el equivalente textual sigue anunciándose",
    ok: caption.startsWith("Sonido silenciado") && caption.length > 25,
    detail: caption ? `«${caption.slice(0, 58)}…»` : "no se anunció nada",
  });
  checks.push({
    name: "El equivalente textual vive en una región viva persistente",
    ok: await evaluate(`(() => { const n = document.querySelector('.sound-caption'); return !!n && n.getAttribute('role') === 'status' && !document.querySelector('#app').contains(n); })()`),
    detail: "role=status y fuera del contenedor que se repinta",
  });

  const motion = JSON.parse(await evaluate(`(() => {
    const svg = document.querySelector('.stage svg');
    return JSON.stringify({
      flag: document.documentElement.dataset.reducedMotion,
      duration: svg ? getComputedStyle(svg).animationDuration : 'sin banda',
    });
  })()`));
  checks.push({
    name: "Movimiento reducido: la entrada de la banda queda anulada",
    ok: motion.flag === "true" && parseFloat(motion.duration) < 0.002,
    detail: `data-reduced-motion=${motion.flag}, animation-duration=${motion.duration}`,
  });

  return checks;
}

function scrollTable(title, worst, passes) {
  const keys = [...worst.keys()].sort();
  if (keys.length === 0) return [`- ${title}: **ninguno**, en ningún tamaño ni estado.`];
  const lines = ["", `| ${title} | Tamaño | Pantalla | Estado | Desplazamiento |`, "| --- | --- | --- | --- | ---: |"];
  for (const key of keys) {
    const [walk, viewport, screen, state] = key.split("|");
    const values = passes.map((pass) => pass.worst.get(key) ?? 0);
    const shown = new Set(values).size === 1 ? `${values[0]} px` : `${values.join(" / ")} px (inestable)`;
    lines.push(`| ${walk} | ${viewport} | ${screen} | ${state} | ${shown} |`);
  }
  return lines;
}

function renderReport(passes, checks, accessibility) {
  const walks = passes.map((pass) => pass.walk);
  const keys = [...new Set(walks.flatMap((pass) => [...pass.worst.keys()]))].sort();
  const stable = keys.every((key) => new Set(walks.map((pass) => pass.worst.get(key) ?? 0)).size === 1)
    && new Set(walks.map((pass) => pass.horizontal)).size === 1
    && new Set(walks.map((pass) => pass.minTarget)).size === 1
    && new Set(walks.map((pass) => pass.screens)).size === 1;

  const states = passes[0].states;
  const walkLoads = WALKS.reduce((sum, walk) => sum + walk.viewports.length, 0);
  const minTarget = Math.min(walks[0].minTarget ?? Infinity, states?.minTarget ?? Infinity);
  const horizontal = walks[0].horizontal + (states?.horizontal ?? 0);

  const lines = [];
  lines.push(`Pasadas ejecutadas: ${passes.length}.`);
  lines.push(`Resultados idénticos en todas las pasadas: **${stable ? "sí" : "NO"}**.`);
  lines.push("");
  lines.push(`- Recorridos declarados: ${WALKS.length}, completados hasta su pantalla de cierre en ${walkLoads} combinaciones de recorrido y tamaño.`);
  lines.push(`- Pantallas de recorrido medidas por pasada: ${walks[0].screens}, cada una con los desplegables cerrados y abiertos.`);
  if (states) {
    lines.push(`- Páginas de referencia y estados difíciles: ${states.routesMeasured} rutas × ${VIEWPORTS.length} tamaños = ${states.screens} pantallas, medidas una vez.`);
  }
  lines.push(`- Desbordamiento horizontal: ${horizontal === 0 ? "ninguno" : `${horizontal} pantallas`}.`);
  lines.push(`- Objetivo táctil mínimo: ${minTarget === Infinity ? "sin datos" : `${minTarget} px`}.`);
  lines.push(...scrollTable("Desplazamiento en pantallas de acción · recorridos", new Map([...walks[0].worst]), walks));
  if (states) {
    lines.push(...scrollTable("Desplazamiento en pantallas de acción · estados difíciles", states.worst, [states]));
  }

  const table = (title, rows) => {
    if (rows.length === 0) return [];
    return ["", `| ${title} | Resultado | Detalle |`, "| --- | --- | --- |",
      ...rows.map((row) => `| ${row.name} | ${row.ok ? "correcto" : "**FALLO**"} | ${row.detail} |`)];
  };
  lines.push(...table("Comprobación de interacción", checks));
  lines.push(...table("Bloque con desplazamiento interno · 360 × 640", accessibility));

  const clean = keys.length === 0 && horizontal === 0 && (states?.worst.size ?? 0) === 0;
  return { report: lines.join("\n"), stable, clean };
}

const watchdog = setTimeout(() => {
  console.error(`La medición superó el límite global de ${GLOBAL_TIMEOUT_MS / 1000} s y se aborta.`);
  process.exit(1);
}, GLOBAL_TIMEOUT_MS);

const profile = mkdtempSync(join(tmpdir(), "medicion-"));
const { server, base } = await startServer();
const cdp = await connect(findChrome(), profile);
let failure;

try {
  const checks = await verifyInteraction(base, cdp);
  const passes = [];
  for (let pass = 1; pass <= RUNS; pass += 1) {
    passes.push(await runPass(base, cdp, pass, pass === 1));
  }
  // Sólo la primera pasada recorre las comprobaciones de teclado: son lentas y no dependen del azar.
  const accessibility = [];
  const seen = new Set();
  for (const row of passes[0].accessibility) {
    if (seen.has(row.name)) continue;
    seen.add(row.name);
    accessibility.push(row);
  }

  const { report, stable, clean } = renderReport(passes, checks, accessibility);
  console.log(report);
  if (OUT) {
    const header = [
      `# Salida reproducible de \`pnpm measure:viewports --runs=${RUNS}\``,
      "",
      "Generada por el propio arnés. **No se edita a mano**: se regenera con",
      `\`pnpm measure:viewports --runs=${RUNS} --out=${OUT}\`.`,
      "El procedimiento y la interpretación están en `docs/comprobaciones_m6.md`.",
      "",
      "",
    ].join("\n");
    writeFileSync(OUT, `${header}${report}\n`, "utf8");
    console.log(`\nResumen escrito en ${OUT}`);
  }
  if (!clean && !args.has("allow-scroll")) {
    failure = new Error("Hay pantallas de acción que se desplazan: la regla 6 de M5 no se cumple.");
  }
  if ([...checks, ...accessibility].some((row) => !row.ok)) {
    failure = new Error("Alguna comprobación de interacción o accesibilidad ha fallado.");
  }
  if (accessibility.length === 0) {
    failure = new Error("No se inspeccionó ningún bloque con desplazamiento interno: la comprobación no llegó a ejecutarse.");
  }
  if (!stable) failure = new Error("Las pasadas no coinciden: la medición no es reproducible.");
  // Decir en voz alta que ha pasado: el silencio no distingue «correcto» de «no llegó a ejecutarse».
  if (!failure) console.log("\nTodas las comprobaciones pasan.");
} catch (error) {
  failure = error;
} finally {
  clearTimeout(watchdog);
  try { cdp.socket.close(); } catch { /* ya cerrado */ }
  cdp.chrome.kill();
  server.close();
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* el perfil se limpia solo */ }
}

if (failure) {
  console.error(String(failure.message ?? failure));
  process.exit(1);
}
process.exit(0);
