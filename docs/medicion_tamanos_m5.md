# Medición de los cinco tamaños objetivo

Estado: **arnés reproducible en el repositorio y regla de ausencia de desplazamiento cumplida**,
verificado el 14 de agosto de 2026 con la identidad Aula-laboratorio escénica aplicada.

## 1. Qué mide

`scripts/measure-viewports.mjs` sirve la compilación de `dist/`, conduce Chrome sin interfaz por el
protocolo de DevTools y recorre **el tutorial y el caso piloto completos** tomando siempre la misma
ruta de decisiones, en los cinco tamaños objetivo. En cada pantalla mide:

- desbordamiento horizontal del documento;
- desplazamiento vertical de `main` cuando la pantalla es de acción, es decir, cuando hay
  `.game-screen` y no es una página de referencia;
- el menor lado de todo control interactivo visible.

Comprueba la **regla 6** de `docs/decision_producto_m5.md`: ninguna pantalla de acción puede
desplazarse. Si alguna lo hace, el arnés **falla con código de salida 1**; la comprobación no
depende de que alguien lea la salida. `--allow-scroll` informa sin fallar, para poder trabajar
mientras se corrige.

La comprobación que hace fiable al resto es la **aserción de que la identidad esperada está
realmente aplicada**: antes de recorrer nada, el arnés lee `data-identity` y aborta si no coincide.
Sin ella, una navegación que no confirme mide en silencio el documento anterior y los resultados
bailan entre pasadas sin que nada lo delate. Ocurrió durante M5: la primera versión encadenaba un
cambio de hash con un `reload`. Ahora cada navegación es una carga real y se espera a
`Page.loadEventFired`.

## 2. Cómo ejecutarlo

Chrome o Edge son una **dependencia externa deliberada**: no se añade al proyecto un navegador de
pruebas de decenas de megabytes para una comprobación que se ejecuta al cerrar cada fase.

```sh
pnpm build
pnpm measure:viewports                 # tres pasadas, resumen en Markdown
pnpm measure:viewports --runs=1        # una sola pasada
pnpm measure:viewports --allow-scroll  # informa del desplazamiento sin fallar
pnpm measure:viewports --out=docs/x.md # además escribe el resumen a un archivo
```

Busca Chrome y Edge en sus rutas habituales de Windows, macOS y Linux; si no está en ninguna, se
indica con `CHROME_PATH` o `--chrome=<ruta>`. También falla si las pasadas no coinciden entre sí, de
modo que una medición irreproducible no puede publicarse.

## 3. Resultado verificado

Salida literal de `pnpm measure:viewports --runs=3`:

```text
Pasadas ejecutadas: 3.
Resultados idénticos en todas las pasadas: **sí**.

- Desbordamiento horizontal: ninguno.
- Objetivo táctil mínimo: 44 px.
- Desplazamiento vertical en pantallas de acción: **ninguno**, en ningún tamaño.
```

| Comprobación de interacción | Resultado |
| --- | --- |
| Teclado: el atajo numérico toma la decisión | correcto |
| La banda de escena es decorativa | correcto |
| Silencio: el equivalente textual sigue anunciándose | correcto |
| El equivalente textual vive en una región viva persistente | correcto |
| Movimiento reducido: la entrada de la banda queda anulada | correcto |

Cubre 2 recorridos × 5 tamaños = **10 combinaciones**, incluidas las pantallas de justificación y
de bitácora del caso, que eran las que arrastraban el problema desde M4. Las cinco comprobaciones
de interacción no dependen del tamaño y se ejecutan una vez, con pulsaciones de teclado reales
enviadas por el protocolo de DevTools, no simuladas desde la página.

### Un defecto encontrado por el propio arnés

Al automatizar la comprobación de teclado apareció un fallo que la verificación manual de M4 no
había detectado: **el atajo numérico no funcionaba al abrir un caso por enlace directo**. El
detector de teclas estaba en `#app` y, recién cargada la página, el foco está en `body`, que no es
descendiente suyo; la pulsación no llegaba a oírse hasta que la persona interactuaba con algo. Se
comprobaba a mano después de haber hecho clic en algo, y así siempre parecía funcionar. Corregido
moviendo el detector a `document`.

## 4. Historia de esta comprobación

Merece quedar registrada, porque contradijo un documento aprobado.

1. **M4 declaró la regla cumplida.** `docs/corte_vertical_m4.md` afirmaba que ninguna pantalla de
   acción se desplazaba en los cinco tamaños.
2. **La medición instrumentada de M5 lo desmintió.** Sin ninguna dirección aplicada, la pantalla de
   justificación se desplazaba hasta 89 px en 360 × 640 y la de bitácora del caso 81 px en
   1366 × 768. En la justificación el desplazamiento crecía conforme se elegían las cinco piezas de
   la gramática —43, 58, 89—, lo que sugiere que la comprobación original se hizo con la frase aún
   incompleta.
3. **Las tres direcciones candidatas lo empeoraron**, cada una a su modo: la pantalla de primera
   consecuencia pasaba de caber a desplazarse 92, 143 o 222 px según la candidata. Se aceptó como
   coste de comparación, nunca como resultado.
4. **El cierre de M5 lo ha corregido**, con la identidad aplicada y sin encoger ningún texto
   pedagógico: altura acotada y desplazamiento interno en los dos bloques de repaso —la frase de
   justificación y la vista previa de la bitácora—, marco del incidente más ajustado, banda de
   escena limitada por altura de ventana y no por anchura, y la reparación y los observables de la
   consecuencia movidos a un desplegable que también se desplaza por dentro.

## 5. Compromiso que queda

En 360 × 640 la frase de justificación y la vista previa de la bitácora se desplazan **por dentro de
su propio recuadro**. La pantalla no se mueve y ningún texto se ha encogido, pero hay que desplazar
dentro del bloque para leer la frase completa. Es la salida honesta sin tocar el tamaño del texto, y
conviene observarla en el piloto de M10: si allí resulta que nadie llega al final de la frase, el
problema será de longitud del texto y tocará resolverlo en el recorte editorial de M7C.
