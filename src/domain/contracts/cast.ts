import { z } from "zod";
import { IdentifierSchema } from "./shared";

/**
 * Ampliación del contrato de contenido decidida en M6: **participación y reparto declarados**.
 *
 * M5 dejó abierta una condición explícita: la promesa de «ver a quién favorece una decisión» no
 * podía cumplirse porque el contenido no declaraba en ninguna parte quién participa, quién decide
 * ni a quién deja fuera un diseño. Un caso sólo enumeraba `characterIds`. Cualquier imagen que
 * mostrara un reparto lo estaría inventando. Véase `docs/direcciones_m5.md`, apartado 3.
 *
 * M6 amplía el contrato. La participación pasa a ser **un dato escrito por la autoría**, nunca
 * deducido de un estado cualitativo, de una etiqueta ni de una puntuación.
 *
 * Tres salvaguardas de M2 se convierten aquí en reglas comprobables, no en buenas intenciones:
 *
 * 1. **Una persona no equivale a una barrera.** Nadie puede quedarse sin vía de participación en
 *    todas las consecuencias declaradas de un caso.
 * 2. **Nadie es decorado.** Toda persona del reparto debe decidir o proponer en alguna
 *    consecuencia declarada del caso.
 * 3. **No se diagnostica a nadie.** El papel describe qué permite el diseño en ese momento
 *    concreto, no una capacidad, una motivación ni un aprendizaje estable. Por eso el esquema no
 *    admite ningún número por persona: no hay dónde escribir una puntuación.
 *
 * `docs/revision_tema_8.md` sigue siendo la fuente pedagógica canónica; los rasgos funcionales del
 * reparto proceden de `docs/biblia_juego_m2.md`, apartado 8.
 */

/**
 * Vías de participación, cerradas y funcionales. Describen la posición musical que **el diseño**
 * hace posible en una consecuencia concreta.
 */
export const ParticipationRoleSchema = z.enum([
  /** Toma una decisión musical que transforma el resultado. */
  "decides",
  /** Propone una idea musical que llega a probarse. */
  "proposes",
  /** Interpreta dentro de la propuesta, sin decidir su forma. */
  "performs",
  /** Sostiene la actividad con un papel de apoyo. */
  "supports",
  /** El diseño no le ofrece todavía una vía equivalente de participación. */
  "no-route",
]);

export const ParticipationEntrySchema = z
  .object({
    characterId: IdentifierSchema,
    role: ParticipationRoleSchema,
    /**
     * Qué decisión de diseño produce ese papel. Obligatoria cuando alguien queda sin vía: la
     * explicación debe señalar al diseño, nunca a la persona. Lo comprueba `validateCaseDefinition`.
     */
    note: z.string().min(1).optional(),
  })
  .strict();

export const ParticipationSchema = z
  .object({
    /** Una entrada por cada persona del reparto del caso. Las omisiones invitan a deducir. */
    roles: z.array(ParticipationEntrySchema).min(1),
  })
  .strict();

export const CharacterSchema = z
  .object({
    id: IdentifierSchema,
    name: z.string().min(1),
    /** Qué aporta a las escenas. Rasgo funcional, no perfil psicológico. */
    contributes: z.string().min(1),
    /** Qué condiciones debe considerar el diseño para que participe. */
    conditions: z.string().min(1),
    /** Salvaguarda explícita contra el uso indebido del personaje. */
    safeguard: z.string().min(1),
  })
  .strict();

export const CastSchema = z
  .object({
    schemaVersion: z.literal(1),
    /** Grupo ficticio de 5.º de Primaria compartido por toda la campaña. */
    characters: z.array(CharacterSchema).min(1),
  })
  .strict();

export type ParticipationRole = z.infer<typeof ParticipationRoleSchema>;
export type ParticipationEntry = z.infer<typeof ParticipationEntrySchema>;
export type Participation = z.infer<typeof ParticipationSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type Cast = z.infer<typeof CastSchema>;

/** Papeles que cuentan como agencia musical para la salvaguarda «nadie es decorado». */
export const AGENCY_ROLES: readonly ParticipationRole[] = ["decides", "proposes"];
