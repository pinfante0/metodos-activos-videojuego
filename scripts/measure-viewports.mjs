/**
 * Medición reproducible de los cinco tamaños objetivo para cada dirección de M5.
 *
 * Sirve `dist/` en un puerto local, conduce Chrome sin interfaz por el protocolo de DevTools y
 * recorre el caso piloto completo tomando siempre la misma ruta de decisiones. En cada pantalla
 * mide desbordamiento horizontal, desplazamiento vertical y el menor lado de todo control
 * interactivo visible.
 *
 * Chrome es una dependencia externa deliberada: no se añade al proyecto un navegador de
 * pruebas de decenas de megabytes para una comprobación que se ejecuta a mano en cada fase.
 *
 *   pnpm build
 *   pnpm measure:viewports                 # tres pasadas, resumen en Markdown
 *   pnpm measure:viewports --runs=1        # una sola pasada
 *   pnpm measure:viewports --out=docs/x.md # además escribe el resumen a un archivo
 *
 * Si Chrome no está en una ruta habitual, indíquelo con CHROME_PATH o con --chrome=<ruta>.
 *
 * La comprobación clave es la aserción de que la dirección solicitada está realmente aplicada:
 * sin ella, una navegación que no confirme produce medidas del documento anterior y los números
 * bailan entre pasadas sin que nada lo delate.
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
const DIRECTIONS = ["gris", "cuaderno", "laboratorio", "consola"];
const CASE_ROUTE = "#/caso/el-arreglo-que-no-escucha-a-todos";
const DIRECTION_KEY = "metodos.direccion-m5.v1";
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

  for (const direction of DIRECTIONS) {
    for (const viewport of VIEWPORTS) {
      await send("Emulation.setDeviceMetricsOverride", {
        width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: false,
      });
      await load("#/");
      await evaluate(
        `localStorage.setItem(${JSON.stringify(DIRECTION_KEY)}, ${JSON.stringify(direction)});` +
        `localStorage.removeItem(${JSON.stringify(PROGRESS_KEY)}); true`,
      );
      await load(CASE_ROUTE);

      // Sin esta aserción, una navegación que no confirme mide el documento anterior en
      // silencio y el resultado parece ruido del navegador.
      const applied = await evaluate(`document.documentElement.dataset.direction`);
      if (applied !== direction) {
        throw new Error(`Dirección no aplicada: se pidió ${direction} y el documento declara ${applied}`);
      }

      for (let step = 0; step < 45; step += 1) {
        const measurement = JSON.parse(await evaluate(MEASURE));
        if (measurement.minSide !== null) minTarget = Math.min(minTarget, measurement.minSide);
        if (measurement.hOverflow > 1) horizontal += 1;
        if (measurement.isAction && measurement.mainScroll > 1) {
          findings.push({
            key: `${direction}|${viewport.name}|${measurement.title}`,
            direction, viewport: viewport.name, screen: measurement.title,
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
  lines.push("| Dirección | Tamaño | Pantalla de acción | Desplazamiento |");
  lines.push("| --- | --- | --- | ---: |");
  for (const key of keys) {
    const [direction, viewport, screen] = key.split("|");
    const values = passes.map((pass) => pass.worst.get(key) ?? 0);
    const shown = new Set(values).size === 1 ? `${values[0]} px` : `${values.join(" / ")} px (inestable)`;
    lines.push(`| ${direction} | ${viewport} | ${screen} | ${shown} |`);
  }
  return { report: lines.join("\n"), stable };
}

const profile = mkdtempSync(join(tmpdir(), "medicion-m5-"));
const { server, base } = await startServer();
const cdp = await connect(findChrome(), profile);
let failure;

try {
  const passes = [];
  for (let pass = 1; pass <= RUNS; pass += 1) {
    passes.push(await runPass(base, cdp, pass));
  }
  const { report, stable } = renderReport(passes);
  console.log(report);
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
