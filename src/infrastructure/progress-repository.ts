import { ProgressSchema, createEmptyProgress, type Progress } from "../domain/contracts";

export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type StorageMode = "persistent" | "memory";

export interface ProgressRepository {
  readonly mode: StorageMode;
  load(): Progress;
  save(progress: Progress): void;
  clear(): void;
}

export const PROGRESS_STORAGE_KEY = "metodos.progress.v1";

export class MemoryStorage implements StoragePort {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

function storageWorks(storage: StoragePort): boolean {
  const probeKey = `${PROGRESS_STORAGE_KEY}.probe`;
  try {
    storage.setItem(probeKey, "ok");
    const readBack = storage.getItem(probeKey) === "ok";
    storage.removeItem(probeKey);
    return readBack;
  } catch {
    return false;
  }
}

class VersionedProgressRepository implements ProgressRepository {
  constructor(
    private readonly storage: StoragePort,
    readonly mode: StorageMode,
    private readonly now: () => string,
  ) {}

  load(): Progress {
    try {
      const raw = this.storage.getItem(PROGRESS_STORAGE_KEY);
      if (raw === null) return createEmptyProgress(this.now());
      const parsed = ProgressSchema.safeParse(JSON.parse(raw) as unknown);
      return parsed.success ? parsed.data : createEmptyProgress(this.now());
    } catch {
      return createEmptyProgress(this.now());
    }
  }

  save(progress: Progress): void {
    const validated = ProgressSchema.parse(progress);
    this.storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(validated));
  }

  clear(): void {
    this.storage.removeItem(PROGRESS_STORAGE_KEY);
  }
}

export function createProgressRepository(
  preferredStorage: StoragePort | undefined,
  now: () => string = () => new Date().toISOString(),
): ProgressRepository {
  if (preferredStorage && storageWorks(preferredStorage)) {
    return new VersionedProgressRepository(preferredStorage, "persistent", now);
  }
  return new VersionedProgressRepository(new MemoryStorage(), "memory", now);
}
