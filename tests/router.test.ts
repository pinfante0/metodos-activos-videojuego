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

  /*
   * Enlaces directos de M6. El progreso orienta y no bloquea: un enlace docente a mitad de un caso
   * es un uso previsto, y por eso la escena forma parte del contrato de navegación y no de un
   * parámetro suelto.
   */
  it("conserva enlaces directos a una escena concreta", () => {
    const href = hrefFor({ name: "case", slug: "banco-de-mecanicas", sceneId: "probe-assembly" });
    expect(href).toBe("#/caso/banco-de-mecanicas/probe-assembly");
    expect(parseHash(href)).toEqual({
      name: "case", slug: "banco-de-mecanicas", sceneId: "probe-assembly",
    });
  });

  it("distingue el caso completo de la escena suelta", () => {
    expect(parseHash("#/caso/banco-de-mecanicas")).toEqual({
      name: "case", slug: "banco-de-mecanicas", sceneId: undefined,
    });
  });

  it("resuelve el mapa de campaña y las rutas de prueba", () => {
    expect(parseHash("#/campana")).toEqual({ name: "campaign" });
    expect(parseHash("#/pruebas")).toEqual({ name: "test-index" });
    expect(parseHash("#/prueba/reparto-sin-via")).toEqual({
      name: "test-state", id: "reparto-sin-via",
    });
  });

  it("mantiene estable la ida y vuelta de todas las rutas sin parámetros", () => {
    const routes = ["home", "campaign", "publication-proof", "class-route", "journal", "test-index"] as const;
    for (const name of routes) expect(parseHash(hrefFor({ name }))).toEqual({ name });
  });

  it("no confunde una ruta de tres tramos con un caso", () => {
    expect(parseHash("#/caso/uno/dos/tres")).toEqual({
      name: "not-found", requested: "/caso/uno/dos/tres",
    });
  });
});
