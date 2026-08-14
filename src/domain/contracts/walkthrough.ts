import { z } from "zod";
import { IdentifierSchema } from "./shared";

/**
 * Recorridos declarados: la ruta de prueba de cada estado difícil.
 *
 * En M5 el arnés de medición llevaba escritos a mano los identificadores de acción de los dos
 * únicos casos. Bastó que el tutorial devolviera a su propia escena de observación para que el
 * recorrido girara en vacío sin avisar, y hubo que arreglarlo dentro del arnés. Con una campaña de
 * nueve unidades eso no se sostiene.
 *
 * A partir de M6 los recorridos son un dato, con dos consumidores y una sola fuente:
 *
 * 1. `tests/walkthroughs.test.ts` los ejecuta sobre la sesión pura, sin navegador: comprueba que
 *    cada uno llega al final, que produce las consecuencias declaradas y que el incidente esperado
 *    es el que aparece.
 * 2. `scripts/measure-viewports.mjs` los conduce en Chrome real para medir composición y
 *    accesibilidad en los cinco tamaños objetivo.
 *
 * Lo que uno demuestra no lo repite el otro: el primero prueba la lógica y el segundo, la pantalla.
 * Ninguno improvisa una elección, de modo que un recorrido que dejara de existir falla en lugar de
 * pasar por un camino distinto.
 */
export const WalkthroughSchema = z
  .object({
    id: IdentifierSchema,
    caseSlug: IdentifierSchema,
    name: z.string().min(1),
    /** Qué estado difícil cubre este recorrido y por qué merece medirse. */
    purpose: z.string().min(1),
    /** Escena inicial, cuando el recorrido comprueba un enlace directo a mitad del caso. */
    startSceneId: IdentifierSchema.optional(),
    /**
     * Acciones en orden de preferencia, no de escena: en cada pantalla se elige la primera de esta
     * lista que esté disponible y **no se haya usado ya**. Consumirlas una sola vez es lo que
     * permite describir un reintento —elegir una opción que devuelve a la misma escena y después
     * otra— sin que el recorrido gire en vacío, que fue el tercer defecto encontrado en M5.
     *
     * Puede quedar vacía cuando el recorrido entra por enlace directo a una escena que no exige
     * ninguna decisión previa.
     */
    actions: z.array(IdentifierSchema).default([]),
    /**
     * Cuántos tamaños objetivo mide el arnés de navegador. Medir los cinco en todos los recorridos
     * multiplicaría el tiempo de la comprobación sin añadir cobertura: lo que cambia entre
     * recorridos es la lógica, y eso lo prueba la simulación pura. Se marcan `all` los que
     * atraviesan pantallas con composición propia.
     */
    viewportCoverage: z.enum(["all", "reference"]).default("reference"),
    /** Piezas de la gramática de justificación, cuando el recorrido no debe tomar la primera. */
    grammar: z.record(z.string(), IdentifierSchema).optional(),
    expect: z
      .object({
        /** Consecuencias que el recorrido debe atravesar, en cualquier orden. */
        consequenceIds: z.array(IdentifierSchema).default([]),
        /** Incidente que debe aparecer, cuando el recorrido comprueba la selección determinista. */
        incidentIds: z.array(IdentifierSchema).default([]),
        /** Un recorrido que no llega a su pantalla de cierre es un fallo, nunca una salida. */
        completes: z.boolean().default(true),
      })
      .strict(),
  })
  .strict();

export const WalkthroughCatalogueSchema = z
  .object({
    schemaVersion: z.literal(1),
    walkthroughs: z.array(WalkthroughSchema).min(1),
  })
  .strict();

export type Walkthrough = z.infer<typeof WalkthroughSchema>;
export type WalkthroughCatalogue = z.infer<typeof WalkthroughCatalogueSchema>;
