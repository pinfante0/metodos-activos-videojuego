import type { Consequence } from "../../domain/contracts";

/**
 * Banda de escena de la identidad Aula-laboratorio.
 *
 * Es la única superficie oscura y cálida del juego, y ocupa sólo la zona experiencial de la
 * pantalla de consecuencia e incidente. Todo lo demás permanece claro y de alto contraste.
 *
 * **Qué puede y qué no puede representar.** La silueta es una constante: no depende del estado
 * cualitativo, ni de `characterIds`, ni de ningún otro dato. Se corta en ambos bordes para que el
 * grupo continúe fuera del encuadre y no pueda contarse. No distingue papeles.
 *
 * Una versión anterior dibujaba una figura por personaje y deducía del estado cuántas decidían.
 * Eso inventaba una distribución que el contenido no declara. La identidad admitirá personajes
 * estilizados, geométricos y diversos **cuando el contenido los declare explícitamente**; hasta
 * entonces la banda no representa personas.
 *
 * Lo único que varía es la luz, y la luz cifra el estado cualitativo, que la retroalimentación
 * enuncia en palabras justo debajo. Como la imagen no añade información que el texto no dé ya,
 * es decorativa en el sentido del contrato de recursos: se oculta a la tecnología de apoyo y no
 * lleva texto alternativo ni pie de figura. Así tampoco duplica lo que ya está a la vista.
 */
const SILHOUETTE = `<svg viewBox="0 0 200 56" role="presentation" aria-hidden="true" focusable="false">
  <path class="stage__crowd stage__crowd--back" d="M-20 52 Q -4 32 10 52 Q 20 28 36 52 Q 44 34 56 52 Q 70 26 86 52 Q 94 36 106 52 Q 120 28 136 52 Q 144 34 156 52 Q 170 30 186 52 Q 194 38 220 52 L220 56 L-20 56 Z" />
  <path class="stage__crowd" d="M-14 50 Q -2 22 12 50 Q 20 30 30 50 Q 44 18 60 50 Q 66 34 76 50 Q 88 24 102 50 Q 110 32 120 50 Q 132 20 148 50 Q 154 36 164 50 Q 176 26 190 50 Q 198 34 214 50 L214 56 L-14 56 Z" />
  <rect class="stage__barrier" x="0" y="49" width="200" height="7" />
</svg>`;

/** Estado de luz de la escena. `incidente` no procede de una consecuencia, sino de la escena. */
export type StageLight = Consequence["rating"] | "incident";

export function stageBand(light: StageLight): string {
  return `<div class="stage" data-light="${light}" aria-hidden="true">${SILHOUETTE}</div>`;
}
