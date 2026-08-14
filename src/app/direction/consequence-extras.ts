import type { CaseDefinition, Consequence } from "../../domain/contracts";
import type { GameSession } from "../game-session";
import type { DirectionId } from "./catalogue";

/**
 * Segunda iteración de M5: una característica experiencial mínima y provisional por dirección,
 * aplicada a la misma pantalla de consecuencia para que la comparación ocurra sobre el mismo
 * contenido.
 *
 * Reglas que este módulo respeta:
 *
 * - usa exclusivamente datos que ya existen en el caso, la consecuencia y la sesión;
 * - no introduce puntuación, medición ni diagnóstico de personas;
 * - toda información visual tiene equivalente textual visible;
 * - eliminar este archivo y sus dos llamadas en `render-app.ts` devuelve la pantalla al estado
 *   de la primera iteración.
 *
 * Copia local de la función de escape para no crear una dependencia circular con `render-app.ts`
 * ni obligar a refactorizar la hoja base sólo por una maqueta provisional.
 */
function esc(value: string): string {
  return value.replace(/[&<>'"]/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export interface ConsequenceExtras {
  /** Antes de la tarjeta de retroalimentación. */
  readonly before: string;
  /** Después de la tarjeta de retroalimentación. */
  readonly after: string;
}

const EMPTY: ConsequenceExtras = { before: "", after: "" };

/* ------------------------------------------------------------------ */
/* D1 · Cuaderno de campo: viñeta de línea y anotación al margen       */
/* ------------------------------------------------------------------ */

/**
 * Viñeta de tinta puramente decorativa: no aporta información y por eso va marcada como oculta
 * para tecnología de apoyo, conforme al contrato de recursos de M3.
 */
const INK_VIGNETTE = `<svg class="dir-note__vignette" viewBox="0 0 96 64" role="presentation" aria-hidden="true" focusable="false">
  <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M14 8 C7 8 7 8 7 15 L7 49 C7 56 7 56 14 56" />
    <path d="M24 18 H78" /><path d="M24 30 H86" /><path d="M24 42 H70" />
    <path d="M60 52 C66 46 72 44 78 46" stroke-width="1.1" />
    <path d="M78 46 L83 41 L86 44 L81 49 Z" stroke-width="1.1" />
  </g>
</svg>`;

function cuadernoExtras(caseDefinition: CaseDefinition): ConsequenceExtras {
  return {
    before: "",
    after: `<aside class="dir-note" aria-labelledby="dir-note-title">
      ${INK_VIGNETTE}
      <div>
        <p class="eyebrow" id="dir-note-title">Al margen · el objetivo del encargo</p>
        <p class="dir-note__text">${esc(caseDefinition.learningObjective)}</p>
      </div>
    </aside>`,
  };
}

/* ------------------------------------------------------------------ */
/* D2 · Aula-laboratorio: banda de aula con figuras abstractas         */
/* ------------------------------------------------------------------ */

/** Reparto plausible derivado del estado cualitativo. No es un recuento ni una medición. */
function participationSplit(rating: Consequence["rating"], total: number): number {
  if (rating === "coherent-defensible") return Math.max(1, Math.ceil((total * 5) / 6));
  if (rating === "defensible-needs-revision") return Math.max(1, Math.round(total / 2));
  return Math.max(1, Math.floor(total / 6));
}

const PARTICIPATION_TEXT: Record<Consequence["rating"], string> = {
  "coherent-defensible":
    "la mayor parte del grupo aparece tomando decisiones musicales y una parte menor ejecuta lo que otras deciden",
  "defensible-needs-revision":
    "una parte del grupo decide y otra ejecuta lo que ya está decidido",
  "incoherent-with-brief":
    "las decisiones se concentran en una parte pequeña del grupo",
};

function abstractFigure(index: number, deciding: boolean): string {
  const x = 10 + index * 30;
  const state = deciding ? "decide" : "ejecuta";
  return `<g class="dir-stage__figure" data-state="${state}" style="--dir-figure-index:${index}">
    <circle cx="${x + 9}" cy="14" r="6.5" />
    <path d="M${x} 44 C${x} 30 ${x + 4} 25 ${x + 9} 25 C${x + 14} 25 ${x + 18} 30 ${x + 18} 44 Z" />
  </g>`;
}

function laboratorioExtras(
  caseDefinition: CaseDefinition,
  consequence: Consequence,
): ConsequenceExtras {
  const total = caseDefinition.characterIds.length;
  const deciding = participationSplit(consequence.rating, total);
  // Con menos de tres figuras la banda no representa un grupo: queda sólo el equivalente textual.
  const band = total >= 3
    ? `<svg class="dir-stage__band" viewBox="0 0 ${10 + total * 30} 56" role="presentation" aria-hidden="true" focusable="false">
        ${Array.from({ length: total }, (_, index) => abstractFigure(index, index < deciding)).join("")}
        <rect class="dir-stage__barrier" x="0" y="46" width="${10 + total * 30}" height="8" />
      </svg>`
    : "";
  return {
    before: `<figure class="dir-stage">
      ${band}
      <figcaption>
        <p><strong>Equivalente textual de la banda:</strong> ${esc(PARTICIPATION_TEXT[consequence.rating])}. La franja marca una barrera del conjunto: ${esc(consequence.observables.barrier)}</p>
        <p class="quiet">Figuras abstractas y sin nombre: una posibilidad de reparto, no personas concretas ni un recuento.</p>
      </figcaption>
    </figure>`,
    after: "",
  };
}

/* ------------------------------------------------------------------ */
/* D3 · Consola: diagrama de los cuatro observables e historial        */
/* ------------------------------------------------------------------ */

const RATING_TEXT: Record<Consequence["rating"], string> = {
  "coherent-defensible": "Coherente y defendible",
  "defensible-needs-revision": "Defendible con revisión",
  "incoherent-with-brief": "Incoherente con el encargo",
};

function decisionHistory(caseDefinition: CaseDefinition, session: GameSession): string {
  const rows = caseDefinition.scenes
    .filter((scene) => session.selectedActions[scene.id] !== undefined)
    .map((scene) => {
      const actionId = session.selectedActions[scene.id];
      const action = caseDefinition.actions.find((candidate) => candidate.id === actionId);
      if (!action) return "";
      return `<li><span class="dir-history__step">${esc(scene.title)}</span><span class="dir-history__choice">${esc(action.label)}</span></li>`;
    })
    .join("");
  if (!rows) return "";
  return `<div class="dir-history">
    <p class="eyebrow">Decisiones tomadas hasta aquí</p>
    <ol>${rows}</ol>
  </div>`;
}

function consolaExtras(
  caseDefinition: CaseDefinition,
  consequence: Consequence,
  session: GameSession,
): ConsequenceExtras {
  const cells: Array<[string, string]> = [
    ["Aprendizaje", consequence.observables.learning],
    ["Agencia", consequence.observables.agency],
    ["Barrera", consequence.observables.barrier],
    ["Evidencia", consequence.observables.evidence],
  ];
  return {
    before: "",
    after: `<section class="dir-panel" aria-labelledby="dir-panel-title">
      <p class="eyebrow" id="dir-panel-title">Cuatro observables · ${esc(RATING_TEXT[consequence.rating])} · sin graduar</p>
      <dl class="dir-diagram" data-rating="${consequence.rating}">
        ${cells.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}
      </dl>
      ${decisionHistory(caseDefinition, session)}
    </section>`,
  };
}

/* ------------------------------------------------------------------ */

export function consequenceExtras(
  direction: DirectionId,
  caseDefinition: CaseDefinition,
  consequence: Consequence,
  session: GameSession,
): ConsequenceExtras {
  switch (direction) {
    case "cuaderno": return cuadernoExtras(caseDefinition);
    case "laboratorio": return laboratorioExtras(caseDefinition, consequence);
    case "consola": return consolaExtras(caseDefinition, consequence, session);
    case "gris": return EMPTY;
  }
}
