/**
 * Medición reproducible de los cinco tamaños objetivo con la identidad fijada en M5.
 *
 * Sirve `dist/` en un puerto local, conduce Chrome sin interfaz por el protocolo de DevTools y
 * recorre el tutorial y el caso piloto completos tomando siempre la misma ruta de decisiones. En
 * cada pantalla mide desbordamiento horizontal, desplazamiento vertical y el menor lado de todo
 * control interactivo visible.
 *
 * La regla que comprueba es la sexta de las decisiones de producto de M5: **ninguna pantalla de
 * acción puede desplazarse** en ninguno de los cinco tamaños objetivo. Las páginas de referencia
 * —bitácora general, diagnóstico— sí pueden hacerlo y quedan excluidas.
 *
 * Chrome es una dependencia externa deliberada: no se añade al proyecto un navegador de
 * pruebas de decenas de megabytes para una comprobación que se ejecuta a mano en cada fase.
 *
 *   pnpm build
 *   pnpm measure:viewports                 # tres pasadas, resumen en Markdown
 *   pnpm measure:viewports --runs=1        # una sola pasada
 *   pnpm measure:viewports --allow-scroll  # informa del desplazamiento sin fallar
 *   pnpm measure:viewports --out=docs/x.md # además escribe el resumen a un archivo
 *
 * Si Chrome no está en una ruta habitual, indíquelo con CHROME_PATH o con --chrome=<ruta>.
 *
 * La comprobación clave es la aserción de que la identidad esperada está realmente aplicada: sin
 * ella, una navegación que no confirme produce medidas del documento anterior y los números bailan
 * entre pasadas sin que nada lo delate.
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

const VIEWPORTS = [
  { name: "360 × 640", width: 360, height: 640 },
  { name: "390 × 844", width: 390, height: 844 },
  { name: "768 × 1024", width: 768, height: 1024 },
  { name: "1366 × 768", width: 1366, height: 768 },
  { name: "1440 × 900", width: 1440, height: 900 },
];
const CASE_ROUTES = [
  { name: "tutorial", hash: "#/caso/mucho-hacer-poco-aprender" },
  { name: "caso piloto", hash: "#/caso/el-arreglo-que-no-escucha-a-todos" },
];
const IDENTITY = "aula-laboratorio";
const PROGRESS_KEY = "metodos.progress.v1";

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
  throw new Error(
    "No se ha encontrado Chrome ni Edge. Indique la ruta con CHROME_PATH o --chrome=<ruta>.",
  );
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
  });
})()`;

const ADVANCE = `(() => {
  const q = (s) => document.querySelector(s);
  const fb = q('[data-continue-feedback]'); if (fb) { fb.click(); return 'feedback'; }
  const info = q('[data-advance-info]'); if (info) { info.click(); return 'info'; }
  const just = q('[data-advance-justification]');
  if (just) {
    const pendingSelect = [...document.querySelectorAll('[data-grammar-key]')].find((s) => !s.value);
    if (pendingSelect) { pendingSelect.value = pendingSelect.options[1].value; pendingSelect.dispatchEvent(new Event('change', { bubbles: true })); return 'grammar'; }
    if (!just.disabled) { just.click(); return 'justification'; }
  }
  const finish = q('[data-finish-case]'); if (finish) { finish.click(); return 'finish'; }
  const choice = q('.choice'); if (choice) { choice.click(); return 'choice'; }
  return 'end';
})()`;

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
  if (!socketUrl) throw new Error("Chrome no expuso ningún destino de página");

  const socket = new WebSocket(socketUrl);
  await new Promise((done, fail) => { socket.onopen = done; socket.onerror = fail; });

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
      const { done, fail } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? fail(new Error(JSON.stringify(message.error))) : done(message.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((done, fail) => {
      const id = (nextId += 1);
      pending.set(id, { done, fail });
      socket.send(JSON.stringify({ id, method, params }));
    });
  const nextLoad = () => new Promise((done) => loadWaiters.push(done));

  await send("Page.enable");
  await send("Runtime.enable");
  return { chrome, socket, send, nextLoad };
}

async function runPass(base, cdp, passIndex) {
  const { send, nextLoad } = cdp;
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(`${result.exceptionDetails.text} :: ${expression.slice(0, 70)}`);
    return result.result.value;
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
    await send("Page.navigate", { url: `${base}?pasada=${passIndex}&n=${navigation}${hash}` });
    await settled;
    await waitReady();
  };

  const findings = [];
  let minTarget = Infinity;
  let horizontal = 0;

  for (const route of CASE_ROUTES) {
    for (const viewport of VIEWPORTS) {
      await send("Emulation.setDeviceMetricsOverride", {
        width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: false,
      });
      await load("#/");
      await evaluate(`localStorage.removeItem(${JSON.stringify(PROGRESS_KEY)}); true`);
      await load(route.hash);

      // Sin esta aserción, una navegación que no confirme mide el documento anterior en
      // silencio y el resultado parece ruido del navegador.
      const applied = await evaluate(`document.documentElement.dataset.identity`);
      if (applied !== IDENTITY) {
        throw new Error(`Identidad no aplicada: se esperaba ${IDENTITY} y el documento declara ${applied}`);
      }

      for (let step = 0; step < 45; step += 1) {
        const measurement = JSON.parse(await evaluate(MEASURE));
        if (measurement.minSide !== null) minTarget = Math.min(minTarget, measurement.minSide);
        if (measurement.hOverflow > 1) horizontal += 1;
        if (measurement.isAction && measurement.mainScroll > 1) {
          findings.push({
            key: `${route.name}|${viewport.name}|${measurement.title}`,
            viewport: viewport.name, screen: measurement.title,
            value: measurement.mainScroll,
          });
        }
        if (await evaluate(ADVANCE) === "end") break;
        await new Promise((done) => setTimeout(done, 40));
      }
    }
  }

  const worst = new Map();
  for (const finding of findings) {
    worst.set(finding.key, Math.max(worst.get(finding.key) ?? 0, finding.value));
  }
  return { horizontal, minTarget: minTarget === Infinity ? null : minTarget, worst };
}

/**
 * Comprobaciones de interacción y accesibilidad que no dependen del tamaño de ventana y que, por
 * tanto, basta ejecutar una vez: teclado real, sonido silenciado, movimiento reducido y carácter
 * decorativo de la banda de escena.
 */
async function verifyInteraction(base, cdp) {
  const { send, nextLoad } = cdp;
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
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
    const settled = nextLoad();
    await send("Page.navigate", { url: `${base}?verificacion=${navigation}${hash}` });
    await settled;
    await waitReady();
  };
  const pressDigit = async (digit) => {
    const shared = { key: digit, code: `Digit${digit}`, windowsVirtualKeyCode: 48 + Number(digit), text: digit };
    await send("Input.dispatchKeyEvent", { type: "keyDown", ...shared });
    await send("Input.dispatchKeyEvent", { type: "keyUp", ...shared });
    await new Promise((done) => setTimeout(done, 60));
  };

  await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  const checks = [];

  // Teclado: el atajo numérico debe elegir de verdad, no sólo enfocar.
  await load("#/");
  await evaluate(`localStorage.removeItem(${JSON.stringify(PROGRESS_KEY)}); true`);
  await load(CASE_ROUTES[1].hash);
  const firstTitle = await evaluate(`document.querySelector('main h1').textContent`);
  await pressDigit("1");
  const afterKey = await evaluate(`document.querySelector('main h1').textContent`);
  const feedbackShown = await evaluate(`!!document.querySelector('.feedback')`);
  checks.push({
    name: "Teclado: el atajo numérico toma la decisión",
    ok: feedbackShown && afterKey === firstTitle,
    detail: feedbackShown ? "aparece la retroalimentación de la opción 1" : "la pulsación no eligió nada",
  });

  // Silencio: el equivalente textual debe seguir apareciendo con el sonido apagado.
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
  await pressDigit("1");
  const caption = await evaluate(`(document.querySelector('.sound-caption') || {}).textContent || ''`);
  checks.push({
    name: "Silencio: el equivalente textual sigue anunciándose",
    ok: caption.startsWith("Sonido silenciado") && caption.length > "Sonido silenciado".length + 5,
    detail: caption ? `«${caption.slice(0, 60)}»` : "no se anunció nada",
  });
  checks.push({
    name: "El equivalente textual vive en una región viva persistente",
    ok: await evaluate(`(() => { const n = document.querySelector('.sound-caption'); return !!n && n.getAttribute('role') === 'status' && !document.querySelector('#app').contains(n); })()`),
    detail: "role=status y fuera del contenedor que se repinta",
  });

  // Movimiento reducido: la animación de la banda debe quedar anulada.
  const motion = await evaluate(`(() => {
    const flag = document.documentElement.dataset.reducedMotion;
    const svg = document.querySelector('.stage svg');
    const duration = svg ? getComputedStyle(svg).animationDuration : 'sin banda';
    return JSON.stringify({ flag, duration });
  })()`);
  const motionState = JSON.parse(motion);
  checks.push({
    name: "Movimiento reducido: la entrada de la banda queda anulada",
    ok: motionState.flag === "true" && parseFloat(motionState.duration) < 0.002,
    detail: `data-reduced-motion=${motionState.flag}, animation-duration=${motionState.duration}`,
  });

  return checks;
}

function renderReport(passes) {
  const keys = [...new Set(passes.flatMap((pass) => [...pass.worst.keys()]))].sort();
  const stable = keys.every((key) => new Set(passes.map((pass) => pass.worst.get(key) ?? 0)).size === 1)
    && new Set(passes.map((pass) => pass.horizontal)).size === 1
    && new Set(passes.map((pass) => pass.minTarget)).size === 1;

  const lines = [];
  lines.push(`Pasadas ejecutadas: ${passes.length}.`);
  lines.push(`Resultados idénticos en todas las pasadas: **${stable ? "sí" : "NO"}**.`);
  lines.push("");
  lines.push(`- Desbordamiento horizontal: ${passes[0].horizontal === 0 ? "ninguno" : `${passes[0].horizontal} pantallas`}.`);
  lines.push(`- Objetivo táctil mínimo: ${passes[0].minTarget} px.`);
  lines.push("");
  if (keys.length === 0) {
    lines.push("- Desplazamiento vertical en pantallas de acción: **ninguno**, en ningún tamaño.");
  } else {
    lines.push("| Recorrido | Tamaño | Pantalla de acción | Desplazamiento |");
    lines.push("| --- | --- | --- | ---: |");
    for (const key of keys) {
      const [walk, viewport, screen] = key.split("|");
      const values = passes.map((pass) => pass.worst.get(key) ?? 0);
      const shown = new Set(values).size === 1 ? `${values[0]} px` : `${values.join(" / ")} px (inestable)`;
      lines.push(`| ${walk} | ${viewport} | ${screen} | ${shown} |`);
    }
  }
  const clean = keys.length === 0 && passes[0].horizontal === 0;
  return { report: lines.join("\n"), stable, clean };
}

const profile = mkdtempSync(join(tmpdir(), "medicion-m5-"));
const { server, base } = await startServer();
const cdp = await connect(findChrome(), profile);
let failure;

try {
  const checks = await verifyInteraction(base, cdp);
  const passes = [];
  for (let pass = 1; pass <= RUNS; pass += 1) {
    passes.push(await runPass(base, cdp, pass));
  }
  const { report, stable, clean } = renderReport(passes);
  const checkLines = [
    "",
    "| Comprobación de interacción | Resultado | Detalle |",
    "| --- | --- | --- |",
    ...checks.map((check) => `| ${check.name} | ${check.ok ? "correcto" : "**FALLO**"} | ${check.detail} |`),
  ].join("\n");
  console.log(`${report}\n${checkLines}`);
  if (!clean && !args.has("allow-scroll")) {
    failure = new Error("Hay pantallas de acción que se desplazan: la regla 6 de M5 no se cumple.");
  }
  if (checks.some((check) => !check.ok)) {
    failure = new Error("Alguna comprobación de interacción o accesibilidad ha fallado.");
  }
  if (OUT) {
    writeFileSync(OUT, `${report}\n`, "utf8");
    console.log(`\nResumen escrito en ${OUT}`);
  }
  if (!stable) failure = new Error("Las pasadas no coinciden: la medición no es reproducible.");
} catch (error) {
  failure = error;
} finally {
  cdp.socket.close();
  cdp.chrome.kill();
  server.close();
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* el perfil se limpia solo */ }
}

if (failure) {
  console.error(String(failure.message ?? failure));
  process.exit(1);
}
process.exit(0);
