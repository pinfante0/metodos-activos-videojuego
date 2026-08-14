/**
 * El registro de contenido pasó a `src/content/index.ts` en M6, porque ya no sólo hay casos
 * jugables: hay campaña, reparto compartido y recorridos declarados, y todos se validan
 * cruzadamente. Este archivo se conserva como puerta de entrada estable para lo que ya importaba
 * los casos por esta ruta.
 */
export { findPlayableCase, playableCases } from "../index";
