import { describe, expect, it } from "vitest";
import { createEmptyProgress } from "../src/domain/contracts";
import {
  createProgressRepository,
  MemoryStorage,
  PROGRESS_STORAGE_KEY,
  type StoragePort,
} from "../src/infrastructure/progress-repository";

const NOW = "2026-08-13T18:00:00.000Z";

describe("persistencia local degradable", () => {
  it("guarda únicamente el contrato de progreso versionado", () => {
    const storage = new MemoryStorage();
    const repository = createProgressRepository(storage, () => NOW);
    const progress = createEmptyProgress(NOW);
    repository.save(progress);

    expect(repository.mode).toBe("persistent");
    expect(repository.load()).toEqual(progress);
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).not.toContain("email");
  });

  it("usa memoria temporal cuando el navegador impide almacenar", () => {
    const blockedStorage: StoragePort = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };

    const repository = createProgressRepository(blockedStorage, () => NOW);
    expect(repository.mode).toBe("memory");
    expect(repository.load()).toEqual(createEmptyProgress(NOW));
  });

  it("descarta de forma segura una versión o forma inválida", () => {
    const storage = new MemoryStorage();
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ schemaVersion: 99 }));
    const repository = createProgressRepository(storage, () => NOW);
    expect(repository.load()).toEqual(createEmptyProgress(NOW));
  });
});
