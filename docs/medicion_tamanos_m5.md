# Medición de los cinco tamaños objetivo

Estado: **arnés reproducible en el repositorio, regla de ausencia de desplazamiento cumplida en
ambos estados y bloques desplazables accesibles**, verificado el 14 de agosto de 2026 tras la
auditoría final de M5.

La salida literal está en `docs/medicion_tamanos_m5_salida.md`, generada por el propio arnés.

## 1. Qué mide

`scripts/measure-viewports.mjs` sirve la compilación de `dist/`, conduce Chrome sin interfaz por el
protocolo de DevTools y recorre **el tutorial y el caso piloto hasta su pantalla de cierre**, por un
camino explícito, en los cinco tamaños objetivo. En cada pantalla mide, **con los desplegables
cerrados y abiertos**:

- desbordamiento horizontal del documento;
- desplazamiento vertical de `main` cuando la pantalla es de acción, es decir, cuando hay
  `.game-screen` y no es una página de referencia;
- el menor lado de todo control interactivo visible.

Comprueba la **regla 6** de `docs/decision_producto_m5.md`: ninguna pantalla de acción puede
desplazarse, en ningún estado. Si alguna lo hace, el arnés **falla con código de salida 1**.
`--allow-scroll` informa sin fallar, para poder trabajar mientras se corrige.

Además comprueba, en 360 × 640, que todo bloque con desplazamiento interno real:

- es alcanzable con el tabulador, pulsando teclas de verdad y no llamando a `focus()`;
- tiene nombre accesible, leído del árbol de accesibilidad y no del atributo;
- muestra foco visible, con el contorno medido;
- se desplaza con las flechas del teclado.

## 2. Tres garantías contra el falso éxito

La primera versión de este arnés daba por buenas cosas que no lo eran. La auditoría final lo
encontró y están corregidas.

1. **El camino es explícito.** Elegía siempre la primera opción. En el tutorial esa opción,
   `observe-movement`, devuelve a la propia escena de observación: el recorrido giraba en vacío
   hasta agotar los pasos y continuaba sin comprobar nada. Ahora cada ruta declara sus acciones y,
   si ninguna estuviera disponible, falla indicando la pantalla y las opciones ofrecidas.
2. **Llegar al final es obligatorio.** Alcanzar el límite de pasos, o quedarse sin control que
   pulsar, es un fallo con diagnóstico. Antes era una salida silenciosa.
3. **Todo tiene tiempo límite.** Cada orden del protocolo caduca a los 15 s, cada carga a los 30 s y
   la ejecución completa a los 15 minutos. Un bloqueo falla en lugar de esperar indefinidamente.

Se conserva la aserción de que la identidad esperada está realmente aplicada: antes de recorrer
nada, el arnés lee `data-identity` y aborta si no coincide. Sin ella, una navegación que no confirme
mide en silencio el documento anterior.

## 3. Cómo ejecutarlo

Chrome o Edge son una **dependencia externa deliberada**: no se añade al proyecto un navegador de
pruebas de decenas de megabytes para una comprobación que se ejecuta al cerrar cada fase.

```sh
pnpm build
pnpm measure:viewports                 # tres pasadas, resumen en Markdown
pnpm measure:viewports --runs=1        # una sola pasada
pnpm measure:viewports --allow-scroll  # informa del desplazamiento sin fallar
pnpm measure:viewports --out=docs/medicion_tamanos_m5_salida.md
```

Busca Chrome y Edge en sus rutas habituales de Windows, macOS y Linux; si no está en ninguna, se
indica con `CHROME_PATH` o `--chrome=<ruta>`. Falla también si las pasadas no coinciden entre sí.

## 4. Resultado verificado

Diez recorridos completados hasta su pantalla de cierre, 120 pantallas medidas por pasada en dos
estados cada una, idéntico en tres pasadas: **sin desbordamiento horizontal, objetivo táctil mínimo
de 44 px y ningún desplazamiento vertical en pantalla de acción, ni cerrada ni abierta**. Las cinco
comprobaciones de interacción y las doce de bloques desplazables pasan. Salida literal en
`docs/medicion_tamanos_m5_salida.md`.

## 5. Historia de esta comprobación

Merece quedar registrada, porque contradijo dos veces lo que se daba por hecho.

1. **M4 declaró la regla cumplida.** `docs/corte_vertical_m4.md` afirmaba que ninguna pantalla de
   acción se desplazaba en los cinco tamaños.
2. **La medición instrumentada de M5 lo desmintió.** Sin ninguna dirección aplicada, la pantalla de
   justificación se desplazaba hasta 89 px en 360 × 640 y la de bitácora del caso 81 px en
   1366 × 768, y crecía conforme se elegían las piezas de la gramática: la comprobación original se
   hizo con la frase aún incompleta.
3. **El cierre de M5 lo corrigió en estado cerrado**, sin encoger ningún texto pedagógico.
4. **La auditoría final encontró que faltaba el estado abierto.** Desplegar el razonamiento empujaba
   la página entre 14 y 85 px según la pantalla. La causa no era la altura elegida sino la
   estructura: `<details>` envuelve su contenido en una caja propia que no es un elemento flexible,
   de modo que el panel interior nunca podía encoger para caber. Sustituido por un botón con
   `aria-expanded` y una región asociada, que sí encoge al hueco disponible.
5. **La misma auditoría encontró que el arnés no llegaba al final del tutorial.** Corregido según el
   apartado 2.

## 6. Compromiso que queda

En 360 × 640 los tres bloques de repaso —razonamiento, frase de justificación y vista previa de la
bitácora— se desplazan **por dentro de su propio recuadro**. La pantalla no se mueve y ningún texto
se ha encogido. Los tres son ahora alcanzables con el tabulador, se anuncian con nombre propio,
muestran foco visible y se desplazan con las flechas, de modo que el compromiso ya no penaliza a
quien navega con teclado. Conviene observar en el piloto de M10 si alguien llega al final de esos
bloques; si no, el problema será de longitud del texto y tocará resolverlo en el recorte editorial
de M7C.
