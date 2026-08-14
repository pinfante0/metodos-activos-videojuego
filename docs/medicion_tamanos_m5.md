# Medición de los cinco tamaños objetivo

Estado: **arnés reproducible en el repositorio y resultado verificado el 14 de agosto de 2026**.

Este documento acompaña a `docs/direcciones_m5.md`. Registra cómo se mide y qué salió, para que la
comprobación no dependa de que alguien recuerde cómo la hizo.

## 1. Qué mide

`scripts/measure-viewports.mjs` sirve la compilación de `dist/`, conduce Chrome sin interfaz por el
protocolo de DevTools y recorre el caso piloto completo tomando siempre la misma ruta de decisiones.
Recorre **cuatro direcciones × cinco tamaños objetivo = 20 combinaciones** y en cada pantalla mide:

- desbordamiento horizontal del documento;
- desplazamiento vertical de `main` cuando la pantalla es de acción, es decir, cuando hay
  `.game-screen` y no es una pantalla de referencia;
- el menor lado de todo control interactivo visible.

La comprobación que hace fiable al resto es la **aserción de que la dirección solicitada está
realmente aplicada**: antes de recorrer nada, el arnés lee `data-direction` del documento y aborta si
no coincide con la pedida. Sin esa aserción una navegación que no confirme mide en silencio el
documento anterior, y los resultados bailan entre pasadas sin que nada lo delate. Ocurrió: la primera
versión del arnés encadenaba un cambio de hash con un `reload` y producía cifras que aparecían y
desaparecían. Ahora cada navegación es una carga real de documento y se espera a `Page.loadEventFired`.

## 2. Cómo ejecutarlo

Chrome o Edge son una **dependencia externa deliberada**: no se añade al proyecto un navegador de
pruebas de decenas de megabytes para una comprobación que se ejecuta a mano al cerrar cada fase.

```sh
pnpm build
pnpm measure:viewports              # tres pasadas y resumen en Markdown
pnpm measure:viewports --runs=1     # una sola pasada
pnpm measure:viewports --out=docs/medicion.md
```

El script busca Chrome y Edge en sus rutas habituales de Windows, macOS y Linux. Si no está en
ninguna, se indica con `CHROME_PATH` o con `--chrome=<ruta>`. Termina con código de salida 1 si las
pasadas no coinciden entre sí, de modo que una medición irreproducible falla en vez de publicarse.

## 3. Resultado verificado

Salida literal de `pnpm measure:viewports --runs=3` sobre la compilación del 14 de agosto de 2026,
posterior a la corrección de la banda de D2:

```text
Pasadas ejecutadas: 3.
Resultados idénticos en todas las pasadas: **sí**.

- Desbordamiento horizontal: ninguno.
- Objetivo táctil mínimo: 44 px.
```

| Dirección | Tamaño | Pantalla de acción | Desplazamiento |
| --- | --- | --- | ---: |
| gris | 360 × 640 | Construye una defensa completa | 89 px |
| gris | 1366 × 768 | Construye una defensa completa | 21 px |
| gris | 1366 × 768 | La bitácora conserva lo que mantuviste y lo que cambiaste | 81 px |
| gris | 1440 × 900 | La bitácora conserva lo que mantuviste y lo que cambiaste | 26 px |
| cuaderno | 360 × 640 | Primera prueba · mira el conjunto, no una nota | 92 px |
| cuaderno | 360 × 640 | Construye una defensa completa | 91 px |
| cuaderno | 1366 × 768 | Primera prueba · mira el conjunto, no una nota | 27 px |
| cuaderno | 1366 × 768 | Construye una defensa completa | 39 px |
| cuaderno | 1366 × 768 | La bitácora conserva lo que mantuviste y lo que cambiaste | 87 px |
| cuaderno | 1440 × 900 | La bitácora conserva lo que mantuviste y lo que cambiaste | 32 px |
| laboratorio | 360 × 640 | Primera prueba · mira el conjunto, no una nota | 143 px |
| laboratorio | 360 × 640 | Construye una defensa completa | 99 px |
| laboratorio | 360 × 640 | La bitácora conserva lo que mantuviste y lo que cambiaste | 4 px |
| laboratorio | 1366 × 768 | Primera prueba · mira el conjunto, no una nota | 91 px |
| laboratorio | 1366 × 768 | Construye una defensa completa | 41 px |
| laboratorio | 1366 × 768 | La bitácora conserva lo que mantuviste y lo que cambiaste | 96 px |
| laboratorio | 1440 × 900 | La bitácora conserva lo que mantuviste y lo que cambiaste | 41 px |
| consola | 360 × 640 | Primera prueba · mira el conjunto, no una nota | 222 px |
| consola | 360 × 640 | Construye una defensa completa | 97 px |
| consola | 360 × 640 | La bitácora conserva lo que mantuviste y lo que cambiaste | 2 px |
| consola | 1366 × 768 | Primera prueba · mira el conjunto, no una nota | 107 px |
| consola | 1366 × 768 | Construye una defensa completa | 23 px |
| consola | 1366 × 768 | La bitácora conserva lo que mantuviste y lo que cambiaste | 87 px |
| consola | 1440 × 900 | La bitácora conserva lo que mantuviste y lo que cambiaste | 31 px |

En 390 × 844 y 768 × 1024 ninguna dirección desplaza ninguna pantalla de acción.

## 4. Cómo leer la tabla

Tres lecturas distintas conviven en ella y conviene no mezclarlas.

1. **Lo que arrastra el corte gris.** Las cuatro filas de `gris` son anteriores a M5 y contradicen la
   tabla original de `docs/corte_vertical_m4.md`, ya corregida allí. En la pantalla de justificación
   el desplazamiento crece conforme se eligen las cinco piezas de la gramática —43, 58 y hasta
   89 px—, lo que sugiere que la comprobación de M4 se hizo con la frase aún incompleta.
2. **Lo que añade cada dirección donde el gris ya se desplazaba.** En justificación y bitácora del
   caso, entre 2 y 15 px. Es ruido comparado con el problema heredado.
3. **Lo que añade cada dirección donde el gris no se desplazaba.** La pantalla de primera
   consecuencia es la única donde el gris cabía y las tres candidatas no: 92, 143 y 222 px. Ahí está
   el coste real de cada característica experiencial, y es la columna que importa para decidir.

El desplazamiento es aceptable como coste de comparación, no como resultado final. La dirección
elegida deberá recuperar la regla de pantallas de acción sin desplazamiento en los cinco tamaños,
sin encoger texto pedagógico significativo.
