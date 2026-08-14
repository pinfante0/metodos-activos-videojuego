import { z } from "zod";
import { ApproachIdSchema, IdentifierSchema } from "./shared";

/**
 * Contrato de campaña de M6.
 *
 * Hasta M5 la navegación conocía dos casos por su identificador literal, escrito a mano en la
 * portada, en la ruta de clase y en el arnés de medición. M6 la generaliza: la campaña es un dato
 * validado y todo lo demás —portada, mapa, ruta presencial, progreso recomendado, enlaces directos
 * y comprobaciones— se deriva de él.
 *
 * El trazado pedagógico procede de `docs/mapa_campana_m2.md` y no se altera aquí. M7A y M7B
 * escribirán el contenido de las unidades declaradas como `planned`; M7C ajustará tiempos y
 * equilibrio con datos de uso.
 *
 * Dos decisiones aprobadas quedan grabadas en el esquema:
 *
 * - **El progreso orienta, no bloquea.** No existe ningún campo de desbloqueo: cualquier unidad
 *   con contenido se abre por enlace directo sin completar las anteriores.
 * - **No hay puntuación.** No existe ningún campo numérico de logro. La regla 7 de
 *   `docs/decision_producto_m5.md` no depende de que alguien se acuerde de respetarla.
 */

export const CampaignUnitSchema = z
  .object({
    id: IdentifierSchema,
    /** Posición en la secuencia recomendada. Debe ser consecutiva desde 1. */
    order: z.number().int().min(1),
    kind: z.enum(["tutorial", "case", "final"]),
    title: z.string().min(1),
    /** Foco pedagógico resumido, tomado del mapa de campaña de M2. */
    focus: z.string().min(1),
    /** Operación mental nueva que introduce la unidad. */
    operation: z.string().min(1),
    minutes: z.number().int().min(1).max(20),
    approachIds: z.array(ApproachIdSchema).min(1),
    /**
     * Caso jugable que implementa la unidad, o `null` mientras el contenido no exista. Una unidad
     * sin caso se anuncia como pendiente; nunca se finge que es jugable.
     */
    caseSlug: IdentifierSchema.nullable(),
    status: z.enum(["playable", "planned"]),
  })
  .strict();

export const ClassRouteSegmentSchema = z
  .object({
    id: IdentifierSchema,
    label: z.string().min(1),
    /** Unidad de la campaña de la que procede el tramo, o `null` en el cierre compartido. */
    unitId: IdentifierSchema.nullable(),
    minMinutes: z.number().int().min(1),
    maxMinutes: z.number().int().min(1),
    /** Ajuste para parejas descrito en `docs/mapa_campana_m2.md`, apartado 4. */
    pairAdjustment: z.string().min(1),
    /** Conversación didáctica que el tramo busca provocar. */
    conversation: z.string().min(1),
  })
  .strict();

export const CampaignSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: IdentifierSchema,
    title: z.string().min(1),
    /** Intervalo aprobado en el plan maestro para la campaña doméstica. */
    homeMinutes: z.object({ min: z.number().int(), max: z.number().int() }).strict(),
    units: z.array(CampaignUnitSchema).min(1),
    classRoute: z
      .object({
        minMinutes: z.number().int().min(1),
        maxMinutes: z.number().int().min(1),
        segments: z.array(ClassRouteSegmentSchema).min(1),
      })
      .strict(),
  })
  .strict();

export type CampaignUnit = z.infer<typeof CampaignUnitSchema>;
export type ClassRouteSegment = z.infer<typeof ClassRouteSegmentSchema>;
export type Campaign = z.infer<typeof CampaignSchema>;
