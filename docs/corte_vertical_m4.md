# Corte vertical gris M4

Estado: **implementado y comprobado localmente el 13 de agosto de 2026**. Este documento registra
la evidencia de M4 y su parada deliberada. No aprueba dirección visual, campaña completa ni los
sistemas generales previstos para M5-M7.

## Alcance construido

- Tutorial jugable **«Mucho hacer, poco aprender»**: observación, retroalimentación inmediata,
  reparación mínima, revelación funcional de Dalcroze y primera entrada de bitácora.
- Caso completo **«El arreglo que no escucha a todos»**: lectura del aula, tres decisiones de
  diseño, consecuencia compuesta, incidente sobre distribución de autoría, cuatro revisiones —dos
  defendibles y dos insuficientes—, justificación estructurada y bitácora.
- Acceso directo a ambos recorridos, progreso local degradable, repetición, ajustes de silencio,
  volumen y movimiento reducido, copia e impresión de la bitácora.
- Interfaz gris de HTML semántico, controles nativos y CSS provisional. No se han creado imágenes,
  personajes visuales, audio, animación ni identidad definitiva.

La fuente pedagógica canónica continúa siendo `docs/revision_tema_8.md`. La traducción conserva el
caso aprobado en `docs/caso_piloto_m2.md`: la función precede al nombre, no existe puntuación global,
las consecuencias son posibilidades plausibles y Orff-Keetman y PME/Green mantienen aportaciones y
tensiones distintas.

## Separación de contenido y motor

Los recorridos residen en `src/content/playable/tutorial.json` y
`src/content/playable/pilot-case.json`. El intérprete común reside en `src/app/game-session.ts` y
`src/app/render-app.ts`. Títulos, escenas, acciones, retroalimentación, observables, incidentes,
reglas de consecuencia, opciones de gramática, plantillas de bitácora y destinos de cierre proceden
de los JSON validados. El motor no contiene frases pedagógicas del tutorial ni del caso.

La prueba `permite cambiar textos y títulos del contenido sin modificar el motor` crea una variante
de autoría, cambia título, escena y acción, la valida y la abre con el mismo intérprete. Otras pruebas
comprueban que las etiquetas de contenido seleccionan consecuencias distintas y que las plantillas
generan una bitácora sin marcadores pendientes. Esto confirma el requisito de M4 sin anticipar la
generalización de campaña de M6.

## Comprobaciones ejecutadas

### Automatizadas

- `pnpm validate:content`: tutorial, caso, sonda M3 y contraejemplos.
- `pnpm test`: **17 pruebas superadas** en cuatro archivos.
- `pnpm build`: compilación TypeScript y salida Vite con base relativa.
- `pnpm build:platea`: salida portable y paquete
  `release/el-aula-de-los-dos-minutos-m4-platea.zip`.

### Navegador real local

Se recorrió la compilación de producción servida en `http://127.0.0.1:4173/`:

- ratón: recorrido completo de inicio a bitácora por la ruta coherente;
- teclado: foco visible, controles nativos y selección directa de opciones mediante teclas `1`-`9`;
- táctil: activación por coordenadas de una opción en viewport móvil, con cambio de estado correcto;
- almacenamiento: tutorial y caso producen dos entradas; ajustes y bitácora reaparecen al recargar;
- accesibilidad básica: encabezados, regiones, `fieldset`/`legend`, botones, enlaces, `select`,
  progreso etiquetado y regiones vivas de retroalimentación aparecen en el árbol semántico;
- consola: sin errores durante el recorrido comprobado.

Tamaños objetivo comprobados:

| Tamaño CSS | Uso representado | Resultado |
| --- | --- | --- |
| 360 × 640 | móvil pequeño | Sin desbordamiento horizontal; pantallas de acción sin desplazamiento |
| 390 × 844 | móvil habitual | Sin desbordamiento horizontal; pantallas de acción sin desplazamiento |
| 768 × 1024 | tableta vertical | Sin desbordamiento horizontal; pantallas de acción sin desplazamiento |
| 1366 × 768 | portátil | Sin desbordamiento horizontal; pantallas de acción sin desplazamiento |
| 1440 × 900 | escritorio | Sin desbordamiento horizontal; pantallas de acción sin desplazamiento |

Todos los controles visibles medidos alcanzan al menos 44 × 44 píxeles CSS. La bitácora, el
diagnóstico y los detalles desplegables pueden desplazarse porque son pantallas de referencia, no
pantallas de acción.

## Duración y comprensión iniciales

El tutorial conserva la hipótesis de **4-5 minutos** de M2 y el caso la de **11-12 minutos**. Un
recorrido editorial completo confirma que no hay pasos redundantes: el tutorial introduce
objetivo-acción-evidencia; el caso reutiliza ese lenguaje y añade diseño, incidente, revisión y
defensa. Las ayudas aparecen junto a la decisión que las necesita y las dos revisiones defendibles
se comparan sin declarar una ganadora.

Esta es una comprobación inicial de comprensión mediante recorrido cognitivo y lectura de todas las
ramas, no un piloto con alumnado. El cronometraje observacional y la conversación entre parejas se
mantienen para M7C y M10, conforme al plan maestro.

## Puerta de salida y asuntos aplazados

La puerta de M4 se considera superada: existe un recorrido de principio a fin en móvil y ordenador,
la duración prevista sigue dentro del marco aprobado y el lenguaje de decisión es comprensible en
una primera revisión. El contenido puede cambiar sin reescribir el motor.

Se detiene el trabajo aquí. Quedan expresamente fuera de M4:

- comparar o elegir direcciones visuales y sonoras;
- producir arte, audio, animación o personajes definitivos;
- generalizar campaña, montador o rutas de estados difíciles;
- escribir los restantes casos históricos o contemporáneos;
- equilibrar la ruta presencial completa o realizar un piloto con alumnado.
