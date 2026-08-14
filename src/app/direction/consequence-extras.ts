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
/* D2 · Aula-laboratorio: banda de escena, iluminación y texto          */
/* ------------------------------------------------------------------ */

/*
 * La primera versión de esta banda dibujaba una figura por personaje y decidía cuántas
 * «decidían» a partir del estado cualitativo de la consecuencia. Era un recuento visual: el
 * contenido no declara en ninguna parte cuántas personas deciden, de modo que la imagen
 * afirmaba algo que el caso no dice y que ninguna advertencia al pie podía retirar.
 *
 * La banda es ahora una constante. No depende del rating, ni de `characterIds`, ni de ningún
 * otro dato: es una silueta continua que se sale del encuadre por ambos lados, precisamente
 * para que no pueda contarse ni leerse como un reparto de papeles. Lo único que varía con el
 * estado cualitativo es la iluminación de la escena, que ya es información declarada y que la
 * retroalimentación nombra igualmente.
 *
 * Toda la información la llevan los dos textos exactos del contenido: `agency` y `barrier`.
 */
const STAGE_ARTWORK = `<svg class="dir-stage__band" viewBox="0 0 200 56" role="presentation" aria-hidden="true" focusable="false">
  <path class="dir-stage__crowd dir-stage__crowd--back" d="M-20 52 Q -4 32 10 52 Q 20 28 36 52 Q 44 34 56 52 Q 70 26 86 52 Q 94 36 106 52 Q 120 28 136 52 Q 144 34 156 52 Q 170 30 186 52 Q 194 38 220 52 L220 56 L-20 56 Z" />
  <path class="dir-stage__crowd" d="M-14 50 Q -2 22 12 50 Q 20 30 30 50 Q 44 18 60 50 Q 66 34 76 50 Q 88 24 102 50 Q 110 32 120 50 Q 132 20 148 50 Q 154 36 164 50 Q 176 26 190 50 Q 198 34 214 50 L214 56 L-14 56 Z" />
  <rect class="dir-stage__barrier" x="0" y="49" width="200" height="7" />
</svg>`;

function laboratorioExtras(consequence: Consequence): ConsequenceExtras {
  return {
    before: `<figure class="dir-stage" data-rating="${consequence.rating}">
      ${STAGE_ARTWORK}
      <figcaption>
        <p><strong>Agencia:</strong> ${esc(consequence.observables.agency)}</p>
        <p><strong>Barrera:</strong> ${esc(consequence.observables.barrier)}</p>
        <p class="quiet">La banda es decorativa y no representa a personas ni cuántas participan. Su iluminación sólo refleja el estado cualitativo que devuelve la retroalimentación; toda la información está en este texto.</p>
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
    case "laboratorio": return laboratorioExtras(consequence);
    case "consola": return consolaExtras(caseDefinition, consequence, session);
    case "gris": return EMPTY;
  }
}
