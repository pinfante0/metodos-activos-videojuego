import type { StoragePort } from "../../infrastructure/progress-repository";
import { BASELINE_DIRECTION_ID, resolveDirectionId, type DirectionId } from "./catalogue";

/**
 * La dirección en prueba NO forma parte del contrato `Progress` de M3.
 *
 * Vive en su propia clave para que borrarla, ignorarla o eliminar toda la capa de dirección
 * no altere el progreso, la bitácora ni las preferencias ya versionadas del alumnado.
 */
export const DIRECTION_PREVIEW_KEY = "metodos.direccion-m5.v1";

export interface DirectionPreview {
  get(): DirectionId;
  set(id: DirectionId): void;
}

export function createDirectionPreview(storage: StoragePort | undefined): DirectionPreview {
  let current: DirectionId = BASELINE_DIRECTION_ID;

  if (storage) {
    try {
      current = resolveDirectionId(storage.getItem(DIRECTION_PREVIEW_KEY));
    } catch {
      current = BASELINE_DIRECTION_ID;
    }
  }

  return {
    get: () => current,
    set: (id: DirectionId) => {
      current = resolveDirectionId(id);
      try {
        storage?.setItem(DIRECTION_PREVIEW_KEY, current);
      } catch {
        // Si el navegador bloquea el almacenamiento, la prueba dura lo que dure la sesión.
      }
    },
  };
}
