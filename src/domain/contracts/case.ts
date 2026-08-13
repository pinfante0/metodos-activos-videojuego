import { z } from "zod";
import {
  ApproachIdSchema,
  ContemporaryLensSchema,
  IdentifierSchema,
  StableQuestionSchema,
} from "./shared";

export const DecisionRatingSchema = z.enum([
  "coherent-defensible",
  "defensible-needs-revision",
  "incoherent-with-brief",
]);

const FeedbackSchema = z
  .object({
    supports: z.string().min(1),
    tension: z.string().min(1),
    possibleRepair: z.string().min(1),
    observableEvidence: z.string().min(1),
  })
  .strict();

export const ConsequenceSchema = z
  .object({
    id: IdentifierSchema,
    rating: DecisionRatingSchema,
    observables: z
      .object({
        learning: z.string().min(1),
        agency: z.string().min(1),
        barrier: z.string().min(1),
        evidence: z.string().min(1),
      })
      .strict(),
    feedback: FeedbackSchema,
    nextSceneId: IdentifierSchema.nullable(),
  })
  .strict();

export const ActionSchema = z
  .object({
    id: IdentifierSchema,
    label: z.string().min(1),
    principleIds: z.array(IdentifierSchema).min(1),
    consequenceId: IdentifierSchema,
    tags: z.array(IdentifierSchema).default([]),
  })
  .strict();

export const IncidentSchema = z
  .object({
    id: IdentifierSchema,
    constraintFamily: z.enum([
      "time",
      "space-movement",
      "resources",
      "sensory-access-load",
      "experience-roles",
      "repertoire-culture",
      "teaching",
      "transfer",
    ]),
    reveal: z.string().min(1),
    revisionActionIds: z.array(IdentifierSchema).min(2),
  })
  .strict();

const BaseSceneSchema = z.object({
  id: IdentifierSchema,
  title: z.string().min(1),
  introduction: z.string().min(1),
  resourceIds: z.array(IdentifierSchema),
});

const ChoiceSceneFields = {
  prompt: z.string().min(1),
  actionIds: z.array(IdentifierSchema).min(1),
};

export const SceneSchema = z.discriminatedUnion("kind", [
  BaseSceneSchema.extend({
    kind: z.literal("observation"),
    ...ChoiceSceneFields,
  }).strict(),
  BaseSceneSchema.extend({
    kind: z.literal("design"),
    ...ChoiceSceneFields,
    slots: z
      .array(z.enum(["entry", "musical-action", "mediation-support", "evidence"]))
      .min(1),
  }).strict(),
  BaseSceneSchema.extend({
    kind: z.literal("consequence"),
    consequenceIds: z.array(IdentifierSchema).min(1),
  }).strict(),
  BaseSceneSchema.extend({
    kind: z.literal("incident"),
    incidentId: IdentifierSchema,
  }).strict(),
  BaseSceneSchema.extend({
    kind: z.literal("revision"),
    ...ChoiceSceneFields,
  }).strict(),
  BaseSceneSchema.extend({
    kind: z.literal("justification"),
    grammarOptions: z
      .object({
        objective: z.array(IdentifierSchema).min(1),
        principleAction: z.array(IdentifierSchema).min(1),
        conditionRisk: z.array(IdentifierSchema).min(1),
        adaptation: z.array(IdentifierSchema).min(1),
        evidence: z.array(IdentifierSchema).min(1),
      })
      .strict(),
  }).strict(),
  BaseSceneSchema.extend({
    kind: z.literal("reflection"),
    journalFields: z.array(IdentifierSchema).min(1),
  }).strict(),
]);

export const JournalFieldSchema = z.enum([
  "objective",
  "first-decision",
  "maintained-decision",
  "revised-decision",
  "trigger",
  "condition-risk",
  "adaptation",
  "observable-evidence",
  "defensible-alternative",
  "final-grammar",
]);

export const CaseDefinitionSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: IdentifierSchema,
    slug: IdentifierSchema,
    status: z.enum(["contract-probe", "draft", "reviewed", "published"]),
    title: z.string().min(1),
    durationMinutes: z.number().int().min(1).max(20),
    modes: z.array(z.enum(["class", "home"])).min(1),
    learningObjective: z.string().min(1),
    approachIds: z.array(ApproachIdSchema).min(1),
    stableQuestions: z.array(StableQuestionSchema).min(2),
    lenses: z.array(ContemporaryLensSchema).min(2),
    characterIds: z.array(IdentifierSchema),
    pedagogy: z
      .object({
        allowMultipleDefensible: z.boolean(),
        avoidsUniversalWinner: z.literal(true),
        consequenceClaim: z.literal("plausible-possibility"),
      })
      .strict(),
    entrySceneId: IdentifierSchema,
    scenes: z.array(SceneSchema).min(1),
    actions: z.array(ActionSchema).min(1),
    incidents: z.array(IncidentSchema),
    consequences: z.array(ConsequenceSchema).min(1),
    journalFields: z.array(JournalFieldSchema).min(1),
  })
  .strict();

export type CaseDefinition = z.infer<typeof CaseDefinitionSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Incident = z.infer<typeof IncidentSchema>;
export type Consequence = z.infer<typeof ConsequenceSchema>;
