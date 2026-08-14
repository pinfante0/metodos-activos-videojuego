/**
 * Navegación estática por fragmento.
 *
 * Sigue sin haber servidor: cada ruta vive detrás de `#`, de modo que un enlace docente o un código
 * QR funcionan igual en GitHub Pages, en el paquete de PLATEA y en un archivo abierto localmente.
 *
 * M6 añade tres cosas al contrato de M3:
 *
 * - `#/campana`, el mapa de la campaña, que sustituye a los dos enlaces escritos a mano en la
 *   portada.
 * - `#/caso/<slug>/<escena>`, enlace directo a mitad de un caso. El progreso orienta y no bloquea:
 *   entrar por el medio es un uso previsto, no una vía de escape.
 * - `#/pruebas` y `#/prueba/<estado>`, las rutas de prueba de los estados difíciles.
 */
export type AppRoute =
  | { name: "home" }
  | { name: "campaign" }
  | { name: "publication-proof" }
  | { name: "case"; slug: string; sceneId?: string }
  | { name: "class-route" }
  | { name: "journal" }
  | { name: "test-index" }
  | { name: "test-state"; id: string }
  | { name: "not-found"; requested: string };

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseHash(hash: string): AppRoute {
  const path = hash.replace(/^#/, "").replace(/\/+$/, "") || "/";
  if (path === "/") return { name: "home" };
  if (path === "/campana") return { name: "campaign" };
  if (path === "/prueba-publicacion") return { name: "publication-proof" };
  if (path === "/ruta/clase") return { name: "class-route" };
  if (path === "/bitacora") return { name: "journal" };
  if (path === "/pruebas") return { name: "test-index" };

  const testMatch = path.match(/^\/prueba\/([^/]+)$/);
  if (testMatch?.[1]) return { name: "test-state", id: safeDecode(testMatch[1]) };

  const sceneMatch = path.match(/^\/caso\/([^/]+)\/([^/]+)$/);
  if (sceneMatch?.[1] && sceneMatch[2]) {
    return { name: "case", slug: safeDecode(sceneMatch[1]), sceneId: safeDecode(sceneMatch[2]) };
  }
  const caseMatch = path.match(/^\/caso\/([^/]+)$/);
  if (caseMatch?.[1]) return { name: "case", slug: safeDecode(caseMatch[1]) };

  return { name: "not-found", requested: safeDecode(path) };
}

export function hrefFor(route: Exclude<AppRoute, { name: "not-found" }>): string {
  switch (route.name) {
    case "home":
      return "#/";
    case "campaign":
      return "#/campana";
    case "publication-proof":
      return "#/prueba-publicacion";
    case "class-route":
      return "#/ruta/clase";
    case "journal":
      return "#/bitacora";
    case "test-index":
      return "#/pruebas";
    case "test-state":
      return `#/prueba/${encodeURIComponent(route.id)}`;
    case "case":
      return route.sceneId
        ? `#/caso/${encodeURIComponent(route.slug)}/${encodeURIComponent(route.sceneId)}`
        : `#/caso/${encodeURIComponent(route.slug)}`;
  }
}
