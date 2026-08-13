import { z } from "zod";
import { IdentifierSchema } from "./shared";

export const ResourceSchema = z
  .object({
    id: IdentifierSchema,
    kind: z.enum(["image", "audio", "music", "effect", "voice", "video", "animation"]),
    status: z.enum(["planned", "prototype", "final"]),
    file: z.string().min(1).optional(),
    decorative: z.boolean().default(false),
    containsSpeech: z.boolean().default(false),
    containsEssentialSound: z.boolean().default(false),
    source: z
      .object({
        origin: z.enum(["original", "licensed", "public-domain", "institutional"]),
        creator: z.string().min(1),
        license: z.string().min(1),
        sourceUrl: z.string().url().optional(),
        attribution: z.string().min(1),
      })
      .strict(),
    alternatives: z
      .object({
        altText: z.string().min(1).optional(),
        textEquivalent: z.string().min(1).optional(),
        transcript: z.string().min(1).optional(),
        captionsFile: z.string().min(1).optional(),
        visualEquivalent: z.string().min(1).optional(),
        reducedMotionFallback: z.string().min(1).optional(),
      })
      .strict(),
  })
  .strict();

export const ResourceInventorySchema = z
  .object({
    schemaVersion: z.literal(1),
    resources: z.array(ResourceSchema),
  })
  .strict();

export type Resource = z.infer<typeof ResourceSchema>;
export type ResourceInventory = z.infer<typeof ResourceInventorySchema>;
