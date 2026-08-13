import { z } from "zod";

export const IdentifierSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Debe ser un identificador kebab-case");

export const ApproachIdSchema = z.enum([
  "dalcroze",
  "kodaly",
  "orff-keetman",
  "suzuki",
  "willems",
  "martenot",
  "campbell-wmp",
  "green-pme",
  "schafer",
  "gordon",
]);

export const StableQuestionSchema = z.enum([
  "entry-point",
  "student-action-agency",
  "teacher-role",
  "notation-theory-improvisation-creation",
  "conditions-limits-adaptations",
]);

export const ContemporaryLensSchema = z.enum([
  "inclusion-accessibility",
  "cultural-relevance",
  "agency-creativity",
  "evidence-context",
]);

export type Identifier = z.infer<typeof IdentifierSchema>;
export type ApproachId = z.infer<typeof ApproachIdSchema>;
export type StableQuestion = z.infer<typeof StableQuestionSchema>;
export type ContemporaryLens = z.infer<typeof ContemporaryLensSchema>;
