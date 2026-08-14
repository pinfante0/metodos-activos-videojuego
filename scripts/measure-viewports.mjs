/**
 * Medición reproducible de los cinco tamaños objetivo con la identidad fijada en M5.
 *
 * Sirve `dist/` en un puerto local, conduce Chrome sin interfaz por el protocolo de DevTools y
 * recorre el tutorial y el caso piloto **hasta su pantalla de cierre**, por un camino explícito.
 * En cada pantalla mide desbordamiento horizontal, desplazamiento vertical y el menor lado de todo
 * control interactivo visible, **con los desplegables cerrados y abiertos**.
 *
 * Comprueba la regla 6 de `docs/decision_producto_m5.md`: ninguna pantalla de acción puede
 * desplazarse, en ningún estado. Las páginas de referencia —bitácora general, diagnóstico— quedan
 * excluidas. Si algo se desplaza, el arnés **falla con código de salida 1**.
 *
 * Comprueba también que todo bloque con desplazamiento interno real sea alcanzable con el
 * tabulador, tenga nombre accesible expuesto en el árbol de accesibilidad, muestre foco visible y
 * se pueda desplazar con el teclado.
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
 *   pnpm measure:viewports --allow-scroll  # informa del desplazamiento sin fallar
 *   pnpm measure:viewports --out=docs/x.md # además escribe el resumen a un archivo
 *
 * Si Chrome no está en una ruta habitual, indíquelo con CHROME_PATH o con --chrome=<ruta>.
 */
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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

/**
 * Camino explícito por identificador de acción. En el tutorial, `observe-movement` y
 * `observe-choice` devuelven a la propia escena de observación: sólo `observe-missing-evidence`
 * avanza. Si el contenido cambiara y ninguna de estas acciones estuviera disponible, el recorrido
 * falla en lugar de improvisar.
 */
const CASE_ROUTES = [
  {
    name: "tutorial",
    hash: "#/caso/mucho-hacer-poco-aprender",
    actions: ["observe-missing-evidence", "repair-phrase-response"],
  },
  {
    name: "caso piloto",
    hash: "#/caso/el-arreglo-que-no-escucha-a-todos",
    actions: [
      "brief-mediated-choice",
      "entry-recording-choice",
      "process-imitate-explore-vary",
      "evidence-rondo-explain",
      "revision-rotating-decisions",
    ],
  },
];

const IDENTITY = "aula-laboratorio";
const PROGRESS_KEY = "metodos.progress.v1";

/** Bloques que declaran desplazamiento interno propio y deben ser accesibles con teclado. */
const SCROLLABLE_BLOCKS = [
  { selector: "#panel-razonamiento", label: "reparación y observables" },
  { selector: ".grammar-preview", label: "justificación en construcción" },
  { selector: "#panel-bitacora", label: "vista previa de la bitácora" },
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

function advanceScript(actions) {
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
  const planned = ${JSON.stringify(actions)};
  for (const id of planned) {
    const choice = document.querySelector('.choice[data-action-id="' + id + '"]');
    if (choice) { choice.click(); return 'decisión ' + id; }
  }
  const offered = [...document.querySelectorAll('.choice')].map((c) => c.dataset.actionId);
  if (offered.length) return 'bloqueado: ninguna acción prevista entre ' + offered.join(', ');
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

async function runPass(base, cdp, passIndex, collectAccessibility) {
  const driver = makeDriver(base, cdp, `pasada${passIndex}`);
  const { send, evaluate, load } = driver;
  const findings = [];
  const accessibility = [];
  let minTarget = Infinity;
  let horizontal = 0;
  let screensVisited = 0;

  for (const route of CASE_ROUTES) {
    for (const viewport of VIEWPORTS) {
      await send("Emulation.setDeviceMetricsOverride", {
        width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: false,
      });
      await load("#/");
      await evaluate(`localStorage.removeItem(${JSON.stringify(PROGRESS_KEY)}); true`);
      await load(route.hash);

      // Sin esta aserción, una navegación que no confirme mide el documento anterior en silencio.
      const applied = await evaluate(`document.documentElement.dataset.identity`);
      if (applied !== IDENTITY) {
        throw new Error(`Identidad no aplicada en ${route.name} · ${viewport.name}: se esperaba ${IDENTITY} y el documento declara ${applied}`);
      }

      const advance = advanceScript(route.actions);
      let finished = false;
      let steps = 0;

      while (steps < MAX_STEPS && !finished) {
        steps += 1;
        screensVisited += 1;

        for (const state of ["cerrado", "abierto"]) {
          if (state === "abierto") {
            const count = await evaluate(setDetails(true));
            if (count === 0) continue;
          }
          const measurement = JSON.parse(await evaluate(MEASURE));
          if (measurement.minSide !== null) minTarget = Math.min(minTarget, measurement.minSide);
          if (measurement.hOverflow > 1) horizontal += 1;
          if (measurement.isAction && measurement.mainScroll > 1) {
            findings.push({
              key: `${route.name}|${viewport.name}|${measurement.title}|detalle ${state}`,
              value: measurement.mainScroll,
            });
          }
        }
        // Los bloques se inspeccionan con los desplegables abiertos: dentro de un `details`
        // cerrado nada es enfocable ni tiene nombre expuesto, de modo que medirlo ahí no
        // comprobaría nada.
        if (collectAccessibility && viewport.width === 360 && viewport.height === 640) {
          await evaluate(setDetails(true));
          for (const block of SCROLLABLE_BLOCKS) {
            accessibility.push(...await inspectScrollable(driver, block));
          }
        }
        await evaluate(restoreDetails);

        const moved = await evaluate(advance);
        if (moved === "fin") { finished = true; break; }
        if (typeof moved === "string" && moved.startsWith("bloqueado")) {
          const title = await evaluate(`(document.querySelector('main h1') || {}).textContent || '(sin h1)'`);
          throw new Error(`Recorrido detenido en ${route.name} · ${viewport.name}, pantalla «${title.trim()}»: ${moved}`);
        }
        await new Promise((done) => setTimeout(done, 40));
      }

      if (!finished) {
        const title = await evaluate(`(document.querySelector('main h1') || {}).textContent || '(sin h1)'`);
        throw new Error(`El recorrido de ${route.name} · ${viewport.name} agotó ${MAX_STEPS} pasos sin llegar al cierre; se quedó en «${title.trim()}»`);
      }
    }
  }

  const worst = new Map();
  for (const finding of findings) {
    worst.set(finding.key, Math.max(worst.get(finding.key) ?? 0, finding.value));
  }
  return { horizontal, minTarget: minTarget === Infinity ? null : minTarget, worst, screensVisited, accessibility };
}

/** Comprobaciones que no dependen del tamaño y basta ejecutar una vez. */
async function verifyInteraction(base, cdp) {
  const driver = makeDriver(base, cdp, "verificacion");
  const { send, evaluate, load, key } = driver;

  await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  const checks = [];

  await load("#/");
  await evaluate(`localStorage.removeItem(${JSON.stringify(PROGRESS_KEY)}); true`);
  await load(CASE_ROUTES[1].hash);
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
  await load(CASE_ROUTES[1].hash);
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

function renderReport(passes, checks, accessibility) {
  const keys = [...new Set(passes.flatMap((pass) => [...pass.worst.keys()]))].sort();
  const stable = keys.every((key) => new Set(passes.map((pass) => pass.worst.get(key) ?? 0)).size === 1)
    && new Set(passes.map((pass) => pass.horizontal)).size === 1
    && new Set(passes.map((pass) => pass.minTarget)).size === 1
    && new Set(passes.map((pass) => pass.screensVisited)).size === 1;

  const lines = [];
  lines.push(`Pasadas ejecutadas: ${passes.length}.`);
  lines.push(`Resultados idénticos en todas las pasadas: **${stable ? "sí" : "NO"}**.`);
  lines.push("");
  lines.push(`- Recorridos completados hasta su pantalla de cierre: ${CASE_ROUTES.length} × ${VIEWPORTS.length} = ${CASE_ROUTES.length * VIEWPORTS.length}.`);
  lines.push(`- Pantallas medidas por pasada: ${passes[0].screensVisited}, cada una con los desplegables cerrados y abiertos.`);
  lines.push(`- Desbordamiento horizontal: ${passes[0].horizontal === 0 ? "ninguno" : `${passes[0].horizontal} pantallas`}.`);
  lines.push(`- Objetivo táctil mínimo: ${passes[0].minTarget} px.`);
  if (keys.length === 0) {
    lines.push("- Desplazamiento vertical en pantallas de acción: **ninguno**, en ningún tamaño ni estado.");
  } else {
    lines.push("");
    lines.push("| Recorrido | Tamaño | Pantalla de acción | Estado | Desplazamiento |");
    lines.push("| --- | --- | --- | --- | ---: |");
    for (const key of keys) {
      const [walk, viewport, screen, state] = key.split("|");
      const values = passes.map((pass) => pass.worst.get(key) ?? 0);
      const shown = new Set(values).size === 1 ? `${values[0]} px` : `${values.join(" / ")} px (inestable)`;
      lines.push(`| ${walk} | ${viewport} | ${screen} | ${state} | ${shown} |`);
    }
  }

  const table = (title, rows) => {
    if (rows.length === 0) return [];
    return ["", `| ${title} | Resultado | Detalle |`, "| --- | --- | --- |",
      ...rows.map((row) => `| ${row.name} | ${row.ok ? "correcto" : "**FALLO**"} | ${row.detail} |`)];
  };
  lines.push(...table("Comprobación de interacción", checks));
  lines.push(...table("Bloque con desplazamiento interno · 360 × 640", accessibility));

  const clean = keys.length === 0 && passes[0].horizontal === 0;
  return { report: lines.join("\n"), stable, clean };
}

const watchdog = setTimeout(() => {
  console.error(`La medición superó el límite global de ${GLOBAL_TIMEOUT_MS / 1000} s y se aborta.`);
  process.exit(1);
}, GLOBAL_TIMEOUT_MS);

const profile = mkdtempSync(join(tmpdir(), "medicion-m5-"));
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
      "# Salida reproducible de `pnpm measure:viewports --runs=3`",
      "",
      "Generada por el propio arnés. **No se edita a mano**: se regenera con",
      "`pnpm measure:viewports --runs=3 --out=docs/medicion_tamanos_m5_salida.md`.",
      "El procedimiento y la interpretación están en `docs/medicion_tamanos_m5.md`.",
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
