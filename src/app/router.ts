export type AppRoute =
  | { name: "home" }
  | { name: "publication-proof" }
  | { name: "case"; slug: string }
  | { name: "class-route" }
  | { name: "journal" }
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
  if (path === "/prueba-publicacion") return { name: "publication-proof" };
  if (path === "/ruta/clase") return { name: "class-route" };
  if (path === "/bitacora") return { name: "journal" };
  const caseMatch = path.match(/^\/caso\/([^/]+)$/);
  if (caseMatch?.[1]) return { name: "case", slug: safeDecode(caseMatch[1]) };
  return { name: "not-found", requested: safeDecode(path) };
}

export function hrefFor(route: Exclude<AppRoute, { name: "not-found" }>): string {
  switch (route.name) {
    case "home":
      return "#/";
    case "publication-proof":
      return "#/prueba-publicacion";
    case "class-route":
      return "#/ruta/clase";
    case "journal":
      return "#/bitacora";
    case "case":
      return `#/caso/${encodeURIComponent(route.slug)}`;
  }
}
