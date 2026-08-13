import { defineConfig } from "vitest/config";

export default defineConfig({
  // La salida debe funcionar bajo cualquier subruta de Pages o PLATEA.
  base: "./",
  build: {
    target: "es2022",
    assetsDir: "assets",
    sourcemap: false,
  },
  test: {
    environment: "node",
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
