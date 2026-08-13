import { z } from "zod";
import { ApproachIdSchema, IdentifierSchema } from "./shared";

export const JournalEntrySchema = z
  .object({
    caseId: IdentifierSchema,
    attemptId: z.string().uuid(),
    completedAt: z.string().datetime(),
    objective: z.string().min(1),
    firstDecision: z.string().min(1),
    maintainedDecision: z.string().min(1),
    revisedDecision: z.string().min(1),
    trigger: z.string().min(1),
    conditionRisk: z.string().min(1),
    adaptation: z.string().min(1),
    observableEvidence: z.string().min(1),
    defensibleAlternative: z.string().min(1),
    finalGrammar: z.string().min(1),
    combinedApproachIds: z.array(ApproachIdSchema).min(1),
  })
  .strict();

export const ProgressSchema = z
  .object({
    schemaVersion: z.literal(1),
    updatedAt: z.string().datetime(),
    recommendedNextCaseId: IdentifierSchema.nullable(),
    completedCaseIds: z.array(IdentifierSchema),
    attemptsByCase: z.record(IdentifierSchema, z.number().int().nonnegative()),
    journal: z.array(JournalEntrySchema),
    settings: z
      .object({
        muted: z.boolean(),
        volume: z.number().min(0).max(1),
        reducedMotion: z.boolean(),
      })
      .strict(),
  })
  .strict();

export type Progress = z.infer<typeof ProgressSchema>;

export function createEmptyProgress(now: string): Progress {
  return {
    schemaVersion: 1,
    updatedAt: now,
    recommendedNextCaseId: null,
    completedCaseIds: [],
    attemptsByCase: {},
    journal: [],
    settings: {
      muted: false,
      volume: 0.8,
      reducedMotion: false,
    },
  };
}
