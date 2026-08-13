import { describe, expect, it } from "vitest";
import { hrefFor, parseHash } from "../src/app/router";

describe("navegación estática", () => {
  it.each(["", "#", "#/", "#//"])("resuelve %s como inicio", (hash) => {
    expect(parseHash(hash)).toEqual({ name: "home" });
  });

  it("conserva enlaces directos a casos sin depender del servidor", () => {
    const href = hrefFor({ name: "case", slug: "caso-con-espacio" });
    expect(href).toBe("#/caso/caso-con-espacio");
    expect(parseHash(href)).toEqual({ name: "case", slug: "caso-con-espacio" });
  });

  it("hace comprensible una ruta desconocida", () => {
    expect(parseHash("#/fuera")).toEqual({ name: "not-found", requested: "/fuera" });
  });
});
