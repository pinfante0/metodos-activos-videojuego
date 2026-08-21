import { z } from "zod";
import { ParticipationSchema } from "./cast";
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

/**
 * Pieza de la gramática de justificación.
 *
 * `requiredTags` ata la pieza a la partida. Sin él, la pantalla de justificación ofrece siempre
 * todas las piezas de cada hueco, y quien juega puede defender una clase que no montó: elegir el
 * principio de una rama, el riesgo de otra y la adaptación de una tercera. Mientras un caso
 * ofrecía una sola formulación por hueco eso no podía ocurrir; en cuanto un caso deriva sus piezas
 * de las decisiones —el hilo recorrido, la dependencia sustituida, la revisión elegida— la
 * justificación tiene que ofrecer sólo las que corresponden a lo que se hizo.
 *
 * Es opcional y no cambia nada donde no se declara: un hueco sin `requiredTags` en ninguna de sus
 * piezas las ofrece todas, que es lo que necesita una elección genuinamente libre como la de la
 * evidencia, y lo que conserva intacto el comportamiento del tutorial 0, los casos 2, 3 y 6 y el
 * banco de mecánicas.
 */
const GrammarOptionSchema = z.union([
  IdentifierSchema,
  z
    .object({
      id: IdentifierSchema,
      label: z.string().min(1),
      /** Etiquetas que la partida debe haber puesto en juego para que esta pieza se ofrezca. */
      requiredTags: z.array(IdentifierSchema).min(1).optional(),
    })
    .strict(),
]);

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
    /**
     * Reparto de la participación que este resultado hace posible. Ampliación de M6: es lo que
     * convierte «ver a quién favorece una decisión» en un dato y no en una ilustración inventada.
     * Es obligatoria en los resultados de prueba y de revisión de un caso con reparto; lo exige
     * `validateCaseDefinition`, no el esquema, porque depende de cómo se use la consecuencia.
     */
    participation: ParticipationSchema.optional(),
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
    /**
     * Tradición que esta decisión pone en juego, cuando el caso necesita distinguirlo.
     *
     * La bitácora registraba como «principios combinados» los enfoques del caso entero, y eso
     * bastaba mientras un caso combinaba dos tradiciones que se recorrían siempre. El caso 3
     * declara tres —un proceso y dos lentes— de las que sólo una lente llega a elegirse: anotar las
     * tres afirmaría una combinación que nadie hizo. Es opcional, y un caso que no la declare
     * conserva el comportamiento anterior intacto.
     */
    approachIds: z.array(ApproachIdSchema).min(1).optional(),
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

/**
 * Selección determinista por etiquetas, compartida por consecuencias e incidentes.
 *
 * Una regla se cumple cuando **todas** sus etiquetas exigidas están presentes y **ninguna** de sus
 * etiquetas excluidas lo está. Gana la primera regla cumplida en orden de declaración, y si no se
 * cumple ninguna se usa el resultado de reserva. El orden de declaración es la prioridad: se lee en
 * el archivo, no depende de cuántas etiquetas tenga cada regla ni de cómo las recorra el motor.
 *
 * `forbiddenTags` es la ampliación de M6. Sin ella, la única forma de distinguir dos combinaciones
 * era añadir etiquetas a las acciones hasta que una regla anterior dejara de cumplirse, lo que
 * hacía que el resultado dependiera del orden en que se escribieran las acciones.
 */
const TagRuleFields = {
  requiredTags: z.array(IdentifierSchema).min(1),
  forbiddenTags: z.array(IdentifierSchema).default([]),
};

export const ConsequenceRuleSchema = z
  .object({ ...TagRuleFields, consequenceId: IdentifierSchema })
  .strict();

export const IncidentRuleSchema = z
  .object({ ...TagRuleFields, incidentId: IdentifierSchema })
  .strict();

const BaseSceneSchema = z.object({
  id: IdentifierSchema,
  title: z.string().min(1),
  introduction: z.string().min(1),
  resourceIds: z.array(IdentifierSchema),
  nextSceneId: IdentifierSchema.nullable().optional(),
});

const ChoiceSceneFields = {
  prompt: z.string().min(1),
  actionIds: z.array(IdentifierSchema).min(1),
  feedbackMode: z.enum(["immediate", "deferred"]).default("immediate"),
};

export const AssemblySlotKindSchema = z.enum([
  "entry",
  "musical-action",
  "mediation-support",
  "evidence",
]);

/**
 * Montador de microclases.
 *
 * Los tres momentos del bucle de M2 —apertura, acción musical con decisión real y cierre que
 * produce evidencia— dejan de ser tres preguntas sueltas y pasan a construir una pieza visible que
 * crece. Cada hueco se decide en su propia pantalla, porque la regla 1 de M5 exige una decisión por
 * pantalla; lo que comparten es el montaje, que se muestra encima como una tira compacta y termina
 * en una pantalla de revisión cuya única tarea es probarlo.
 *
 * El montaje no puntúa ni ordena: enumera lo elegido y lo que falta. La consecuencia de la prueba
 * la calcula el motor determinista a partir de las etiquetas, igual que antes.
 */
export const AssemblySchema = z
  .object({
    title: z.string().min(1),
    /** Qué se está montando, en una línea, para la tira compacta. */
    summary: z.string().min(1),
    slots: z
      .array(
        z
          .object({
            id: IdentifierSchema,
            kind: AssemblySlotKindSchema,
            label: z.string().min(1),
            /** Escena de diseño que rellena este hueco. */
            sceneId: IdentifierSchema,
          })
          .strict(),
      )
      .min(2),
  })
  .strict();

export const SceneSchema = z.discriminatedUnion("kind", [
  BaseSceneSchema.extend({
    kind: z.literal("observation"),
    ...ChoiceSceneFields,
  }).strict(),
  BaseSceneSchema.extend({
    kind: z.literal("design"),
    ...ChoiceSceneFields,
    slots: z.array(AssemblySlotKindSchema).min(1),
    /** Hueco del montador que rellena esta escena, si el caso declara montador. */
    assemblySlotId: IdentifierSchema.optional(),
  }).strict(),
  BaseSceneSchema.extend({
    kind: z.literal("assembly-review"),
    /** Única tarea de la pantalla: probar el montaje. */
    testLabel: z.string().min(1),
  }).strict(),
  BaseSceneSchema.extend({
    kind: z.literal("consequence"),
    consequenceIds: z.array(IdentifierSchema).min(1),
    rules: z.array(ConsequenceRuleSchema).optional(),
    fallbackConsequenceId: IdentifierSchema.optional(),
  }).strict(),
  BaseSceneSchema.extend({
    kind: z.literal("incident"),
    /** Incidente único. Alternativa breve a `incidentIds` cuando el caso sólo tiene uno. */
    incidentId: IdentifierSchema.optional(),
    /** Incidentes posibles; cuál aparece lo decide el mismo motor determinista por etiquetas. */
    incidentIds: z.array(IdentifierSchema).min(1).optional(),
    rules: z.array(IncidentRuleSchema).optional(),
    fallbackIncidentId: IdentifierSchema.optional(),
  }).strict(),
  BaseSceneSchema.extend({
    kind: z.literal("revision"),
    ...ChoiceSceneFields,
  }).strict(),
  BaseSceneSchema.extend({
    kind: z.literal("justification"),
    grammarOptions: z
      .object({
        objective: z.array(GrammarOptionSchema).min(1),
        principleAction: z.array(GrammarOptionSchema).min(1),
        conditionRisk: z.array(GrammarOptionSchema).min(1),
        adaptation: z.array(GrammarOptionSchema).min(1),
        evidence: z.array(GrammarOptionSchema).min(1),
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
    experienceType: z.enum(["tutorial", "case", "probe"]).default("case"),
    durationMinutes: z.number().int().min(1).max(20),
    modes: z.array(z.enum(["class", "home"])).min(1),
    learningObjective: z.string().min(1),
    approachIds: z.array(ApproachIdSchema).min(1),
    stableQuestions: z.array(StableQuestionSchema).min(2),
    lenses: z.array(ContemporaryLensSchema).min(2),
    /** Reparto del caso. Cada identificador debe existir en el reparto compartido de la campaña. */
    characterIds: z.array(IdentifierSchema),
    /** Montador de microclases, cuando el caso lo usa. Los tutoriales pueden no tenerlo. */
    assembly: AssemblySchema.optional(),
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
    journalTemplate: z.record(JournalFieldSchema, z.string().min(1)).optional(),
    completion: z
      .object({
        eyebrow: z.string().min(1),
        title: z.string().min(1),
        body: z.string().min(1),
        nextLabel: z.string().min(1),
        nextRoute: z.string().regex(/^#\//),
      })
      .strict()
      .optional(),
  })
  .strict();

export type CaseDefinition = z.infer<typeof CaseDefinitionSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Incident = z.infer<typeof IncidentSchema>;
export type Consequence = z.infer<typeof ConsequenceSchema>;
export type JournalField = z.infer<typeof JournalFieldSchema>;
export type Assembly = z.infer<typeof AssemblySchema>;
export type AssemblySlot = Assembly["slots"][number];
export type ConsequenceRule = z.infer<typeof ConsequenceRuleSchema>;
export type IncidentRule = z.infer<typeof IncidentRuleSchema>;
export type ChoiceScene = Extract<Scene, { kind: "observation" | "design" | "revision" }>;
