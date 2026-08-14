import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { strToU8, zipSync } from "fflate";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const distDirectory = resolve(projectRoot, "dist");
const releaseDirectory = resolve(projectRoot, "release");

/*
 * La fase se lee de `package.json` en lugar de escribirse aquí. Estaba puesta a mano y llegó a M6
 * diciendo todavía «m5»: un nombre de paquete equivocado es difícil de detectar y fácil de repartir.
 */
const packageJson = JSON.parse(
  await readFile(resolve(projectRoot, "package.json"), "utf8"),
);
const PHASE = (packageJson.version.split("-").pop() ?? "sin-fase").toUpperCase();
const outputFile = resolve(
  releaseDirectory,
  `el-aula-de-los-dos-minutos-${PHASE.toLowerCase()}-platea.zip`,
);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const fullPath = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
    }),
  );
  return nested.flat();
}

function packagePath(file) {
  return relative(distDirectory, file).split(sep).join("/");
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character]);
}

const files = (await listFiles(distDirectory)).sort();
const paths = files.map(packagePath);
if (!paths.includes("index.html")) throw new Error("dist/index.html no existe");

const fileElements = paths
  .map((path) => `      <file href="${escapeXml(path)}"/>`)
  .join("\n");
const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="METODOS-${PHASE}" version="1.0"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 http://www.imsglobal.org/xsd/imscp_v1p1.xsd">
  <metadata>
    <schema>IMS Content</schema>
    <schemaversion>1.1</schemaversion>
  </metadata>
  <organizations default="ORG-${PHASE}">
    <organization identifier="ORG-${PHASE}">
      <title>El aula de los dos minutos · ${PHASE}</title>
      <item identifier="ITEM-${PHASE}" identifierref="RESOURCE-${PHASE}">
        <title>Campaña, tutorial y caso completo</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RESOURCE-${PHASE}" type="webcontent" href="index.html">
${fileElements}
    </resource>
  </resources>
</manifest>
`;

const archiveEntries = { "imsmanifest.xml": strToU8(manifest) };
for (const file of files) archiveEntries[packagePath(file)] = new Uint8Array(await readFile(file));

await mkdir(releaseDirectory, { recursive: true });
await writeFile(outputFile, zipSync(archiveEntries, { level: 9 }));
console.log(`Paquete PLATEA: ${outputFile}`);
