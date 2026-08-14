/**
 * Identidad fijada en M5: **Aula-laboratorio escénica**.
 *
 * Cierra la comparación de tres direcciones. La decisión y sus matices están en
 * `docs/direcciones_m5.md`; aquí sólo vive lo que la aplicación necesita ejecutar.
 *
 * Tres reglas de la identidad condicionan todo este módulo y la hoja `src/styles/identity.css`:
 *
 * 1. **Zonificación.** El escenario oscuro y cálido se concentra en la zona experiencial. Toda
 *    superficie con lectura extensa es clara, cálida y de alto contraste. El juego no tiene fondo
 *    oscuro global.
 * 2. **Claridad funcional heredada de la Consola.** Los paneles de razonamiento —gramática de la
 *    justificación y observables— conservan la retícula y las etiquetas de la dirección D3, que no
 *    sobrevive como identidad pero sí como recurso funcional dentro de este sistema.
 * 3. **Lógica sonora de estados, timbre acústico.** El estado se cifra en un intervalo, como en
 *    D3, pero suena con cuerpo, voz, madera y láminas, como en D2. No hay banda sonora continua.
 *
 * Personajes: podrán ser estilizados, geométricos y diversos **cuando el contenido los declare
 * explícitamente**. Mientras el contrato de contenido no declare participación ni reparto, nada
 * de esta capa puede deducir de un estado cualitativo qué persona decide, participa o queda
 * fuera. Véase `src/app/identity/stage.ts`.
 */

export const IDENTITY_NAME = "Aula-laboratorio escénica";

export type SoundCueId =
  | "decision"
  | "consequence-coherent-defensible"
  | "consequence-defensible-needs-revision"
  | "consequence-incoherent-with-brief"
  | "incident"
  | "journal";

export interface SoundCue {
  readonly id: SoundCueId;
  /** Gesto sonoro previsto. En M5 se sintetiza; M8 producirá el recurso real. */
  readonly sketch: string;
  /** Equivalente textual exigido por el contrato de recursos M3, apartado 5. */
  readonly textEquivalent: string;
}

/**
 * Seis señales y ninguna más. La lógica de estados es la de D3 —quinta justa, cuarta y segunda
 * menor— y el timbre es el de D2. Todas duran menos de medio segundo: nada aquí puede convertirse
 * en música de fondo.
 */
export const SOUND_CUES: readonly SoundCue[] = [
  {
    id: "decision",
    sketch: "Palmada corporal breve.",
    textEquivalent: "Decisión registrada.",
  },
  {
    id: "consequence-coherent-defensible",
    sketch: "Dos láminas en quinta justa ascendente.",
    textEquivalent: "Consecuencia coherente y defendible.",
  },
  {
    id: "consequence-defensible-needs-revision",
    sketch: "Dos láminas en cuarta, sin cerrar.",
    textEquivalent: "Consecuencia defendible con revisión necesaria.",
  },
  {
    id: "consequence-incoherent-with-brief",
    sketch: "Dos láminas en segunda menor, con batido audible.",
    textEquivalent: "Consecuencia incoherente con el encargo.",
  },
  {
    id: "incident",
    sketch: "Un solo golpe grave de parche.",
    textEquivalent: "Cambia una condición del aula.",
  },
  {
    id: "journal",
    sketch: "Dos láminas suaves descendentes.",
    textEquivalent: "Entrada guardada en la bitácora.",
  },
];

export function findCue(id: SoundCueId): SoundCue {
  const cue = SOUND_CUES.find((candidate) => candidate.id === id);
  if (!cue) throw new Error(`Señal sonora desconocida: ${id}`);
  return cue;
}
