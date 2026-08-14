# Direcciones visuales, sonoras y de experiencia M5

Estado: **tres direcciones construidas y aplicadas al corte funcional; ninguna elegida**. Este
documento se detiene deliberadamente en la comparación. La elección de identidad, el contrato de
recursos y la producción pertenecen al tramo siguiente de M5 y a M8.

Fecha: 14 de agosto de 2026. Segunda iteración incorporada el mismo día.

## 1. Qué hace y qué no hace esta parada

Hace:

- construye tres direcciones distintas de identidad visual, lenguaje sonoro y experiencia;
- las aplica de forma reversible sobre el tutorial y el caso piloto ya aprobados en M4;
- da a cada una una **característica experiencial mínima y provisional sobre la misma pantalla**,
  la primera consecuencia del caso piloto, construida sólo con datos que ya existen;
- permite **escuchar las seis señales de cada candidata** desde la pantalla de comparación, sin
  cambiar la dirección aplicada;
- fija cinco criterios explícitos y los aplica a las tres con la misma vara;
- aporta evidencia medida —contraste y desplazamiento en los cinco tamaños objetivo— y la
  distingue de lo que todavía es juicio.

No hace:

- no elige una dirección ni la insinúa mediante un orden, una puntuación o una recomendación;
- no produce recursos definitivos: no hay imágenes, tipografías con licencia, música ni archivos de
  audio, y el sonido es un boceto sintetizado en el navegador que se descartará en M8;
- no fija el contrato de recursos ni el registro de procedencia, que dependen de la dirección
  elegida;
- no adelanta M6: no generaliza la campaña, ni el montador, ni las rutas de estados difíciles.

## 2. Qué se conserva intacto

La comparación sólo puede ser válida si las tres direcciones se prueban sobre exactamente el mismo
juego. Se conservan sin una sola modificación:

- los contratos de M3: `src/domain/contracts/` y `src/domain/validation.ts`;
- el contenido jugable de M4: `src/content/playable/tutorial.json` y `pilot-case.json`;
- el intérprete: `src/app/game-session.ts`;
- la semántica pedagógica del corte: la función precede al nombre, no hay puntuación global, las
  consecuencias son posibilidades plausibles, existen dos revisiones defendibles y la bitácora
  conserva decisión mantenida, decisión revisada y alternativa.

Ninguna dirección añade, quita ni reordena una decisión, una consecuencia o un texto pedagógico. No
cambian lo que el juego afirma.

**Corrección respecto a la primera iteración.** La primera versión de este documento afirmaba que
las direcciones no modifican espaciados. Era falso ya entonces —`laboratorio` alteraba el relleno
del encabezado de escena y `consola` su espacio entre filas— y lo es mucho más ahora: las tres
añaden elementos y altura a una pantalla de acción. Cambian color, tipografía, ornamento, sonido,
ritmo de lectura **y composición**. Lo que no se toca son las reglas responsivas de la hoja base.
La consecuencia práctica está medida en el apartado 11: cada dirección obliga a repetir la
comprobación de los cinco tamaños objetivo, que no puede heredarse de M4.

## 3. Las tres direcciones

Los nombres son de trabajo y no comprometen el título del juego.

### D1 · Cuaderno de campo

> Observar, anotar y corregir sobre papel.

El jugador trabaja dentro de su propio cuaderno de observación. La escena se lee como una nota
tomada en el aula y la retroalimentación aparece pegada a la decisión que la produce, como una
anotación al margen.

- **Visual:** papel cálido y tinta oscura. Una sola tinta de corrección roja para la marca docente y
  tres tintas de estado para la retroalimentación. Serifa para títulos y etiquetas, sans del sistema
  para el cuerpo. Sin ilustración de personajes: viñetas de línea y marcas de anotación.
- **Sonora:** lenguaje acústico y escaso, cercano al sonido real de un aula. Marca de lápiz al
  registrar una decisión; dos notas de madera para la consecuencia, con el intervalo cambiando según
  el estado; golpe grave y breve para el incidente. Sin música de fondo.
- **Experiencia:** lectura primero, una decisión por pantalla, ritmo tranquilo. Pensada para una
  pareja que discute en voz alta antes de pulsar.
- **Movimiento:** sólo desvanecidos. Ninguna animación transporta información, de modo que el modo
  de movimiento reducido no pierde nada.
- **Característica en la consecuencia:** una **viñeta de tinta** decorativa —marcada como oculta
  para tecnología de apoyo, por lo que no exige texto alternativo— y una **anotación al margen** que
  mantiene a la vista el objetivo del encargo mientras se lee la consecuencia. El objetivo procede
  del propio caso; no aparece en ninguna otra parte de esa pantalla, así que no duplica nada.

### D2 · Aula-laboratorio escénica

> La clase reacciona a la vista antes de leerse.

Es la concreción de la dirección inicial que el plan maestro dejó anotada en M1. El aula ocupa una
banda iluminada en la parte superior y la consola de decisión queda en penumbra debajo; la
consecuencia se ve en la escena antes de leerse en el texto.

- **Visual:** escenario oscuro con luz cálida. Figuras planas y geométricas de silueta clara, sin
  rasgos faciales detallados. Código de color por puerta de entrada —cuerpo, voz, oído, instrumento,
  entorno y repertorio—.
- **Sonora:** pequeño conjunto elemental: percusión corporal, sílaba vocal y láminas. La consecuencia
  se cifra en un motivo de tres notas cuyo modo cambia con el estado. El incidente entra con un
  tambor grave y un cambio de luz.
- **Experiencia:** dos zonas estables, aula arriba y consola abajo. Es la única que cumple
  literalmente la promesa de la biblia de juego: «veo a quién y qué favorece».
- **Movimiento:** entradas cortas con desplazamiento y cambio de luz. El modo de movimiento reducido
  sustituye cada animación por un estado fijo etiquetado, nunca por la ausencia de información.
- **Característica en la consecuencia:** una **banda de aula** con una figura abstracta y sin nombre
  por personaje declarado en el caso, y un **cambio visible de participación** derivado del estado
  cualitativo de la consecuencia: quién aparece decidiendo y quién ejecutando. Una franja marca la
  **barrera del conjunto**, tomada del observable `barrier`. El pie de figura da el equivalente
  textual completo y advierte que las figuras no representan a personas concretas ni un recuento.
  Con movimiento reducido la banda aparece ya formada, sin retardo escalonado, y no pierde
  información. Si un caso declara menos de tres personajes, la banda no se dibuja y queda sólo el
  equivalente textual: una figura sola no representa un grupo.

### D3 · Consola de decisiones

> La gramática de la decisión, siempre a la vista.

Identidad de herramienta profesional. La frase de gramática se construye a la vista y las decisiones
anteriores permanecen consultables, de modo que comparar dos alternativas defendibles es la
operación más barata de la pantalla.

- **Visual:** editorial claro de contraste muy alto con retícula visible. Etiquetas monoespaciadas
  para objetivo, principio, condición, adaptación y evidencia. Las consecuencias se representan como
  diagrama de los cuatro observables, generado desde los datos ya validados y no dibujado.
- **Sonora:** sonificación abstracta y muy breve. El estado de la consecuencia se cifra como
  intervalo —quinta justa, cuarta, segunda menor— y el incidente como pulso grave repetido. Nada
  pretende ser música: son señales de interfaz.
- **Experiencia:** densa y comparativa. Pensada para la ruta presencial de 20 a 30 minutos por
  parejas, donde el tiempo de lectura compite con el tiempo de conversación.
- **Movimiento:** casi nulo; el cambio de estado se marca con un realce de un solo golpe.
- **Característica en la consecuencia:** el **diagrama de los cuatro observables** —aprendizaje,
  agencia, barrera y evidencia a la vez, con el color del estado— y un **historial mínimo de
  decisiones**, una línea por decisión ya tomada en el caso. El diagrama ordena pero no gradúa:
  el contrato de contenido prohíbe puntuar una decisión, así que no hay barras ni escalas. Como el
  diagrama muestra los mismos cuatro observables que el desplegable de la hoja base, esta dirección
  oculta ese desplegable en lugar de repetir el texto.

## 4. Los cinco criterios, definidos antes de comparar

Para que la comparación sea auditable, cada criterio se juzga con indicadores declarados:

| Criterio | Cómo se juzga |
| --- | --- |
| **Legibilidad** | Contraste medido de cada par texto/fondo y borde de control; jerarquía distinguible entre escena, decisión, consecuencia e incidente; comportamiento del texto largo en 360 × 640, donde las pantallas de acción no pueden desplazarse. |
| **Accesibilidad** | Cuántos equivalentes obligatorios genera la dirección; si el color es alguna vez el único canal; si el movimiento transporta información; carga sensorial y de atención; compatibilidad con teclado, táctil y lector de pantalla. |
| **Identidad** | Distinción frente a `Intervalia/` y `Armario/`; adecuación a alumnado de 18 o 19 años; coherencia con «El aula de los dos minutos»; reconocibilidad en una portada o un QR de clase. |
| **Coste de producción** | Número de recursos originales y de variantes de estado; licencias necesarias; peso y tiempo de carga; trabajo de mantenimiento en M8 y M11. |
| **Adecuación pedagógica** | Qué capa refuerza —reconocimiento funcional o decisión crítica—; si hace visible la consecuencia; si evita convertir a una persona en barrera; si sostiene la gramática y la comparación de alternativas defendibles. |

Se añade una fila de **riesgo principal** porque las tres tienen riesgos de naturaleza distinta y
compararlas sin ellos falsearía el resultado.

## 5. Comparación

### Legibilidad

| | D1 Cuaderno | D2 Laboratorio | D3 Consola |
| --- | --- | --- | --- |
| Texto principal | 13,8:1 sobre fondo, 15,2:1 sobre panel | 16,1:1 sobre fondo, 14,2:1 sobre panel | 16,7:1 sobre fondo, 19,0:1 sobre panel |
| Texto secundario | 6,8:1 – 7,5:1 | 8,8:1 – 10,0:1 | 6,7:1 – 7,6:1 |
| Borde de control | 5,1:1 – 5,6:1 | 4,7:1 – 5,3:1 | 3,4:1 – 3,9:1 |
| Riesgo de lectura | bloque uniforme, poca jerarquía | fatiga en párrafos largos sobre fondo oscuro | densidad excesiva en 360 × 640 |
| Desplazamiento añadido en la consecuencia, 360 × 640 | +92 px | +158 px | +222 px |
| Desplazamiento añadido en la consecuencia, 1366 × 768 | +27 px | +108 px | +107 px |
| En 390 × 844, 768 × 1024 y 1440 × 900 | sin desplazamiento | sin desplazamiento | sin desplazamiento |

Las tres superan con holgura el mínimo de 4,5:1 para texto y de 3:1 para bordes de control. La
diferencia real no está en el contraste sino en dos cosas: el tipo de fatiga que produce cada una
—D1 cansa por uniformidad, D2 por fondo oscuro con texto extenso y D3 por densidad— y **cuánta
pantalla cuesta su característica experiencial**.

Ese coste ya está reducido. Las tres características se recortaron tras la primera medición: se
retiraron las notas explicativas que no eran equivalente textual, se limitó la altura de la banda y
se comprimió el panel en pantallas estrechas. Lo que queda no puede bajarse más sin encoger el
cuerpo de texto, es decir, sin pagarlo en la propia legibilidad. Que la consecuencia de D3 cueste
222 px en un móvil pequeño no es un defecto de implementación: es el precio de su tesis, tener las
cuatro dimensiones y el historial siempre a la vista.

### Accesibilidad

| | D1 Cuaderno | D2 Laboratorio | D3 Consola |
| --- | --- | --- | --- |
| Equivalentes obligatorios que genera | pocos: seis señales sonoras | muchos: seis señales, cada reacción del aula y cada animación | pocos: seis señales sonoras |
| Color como único canal | nunca | sí en el código por puerta de entrada; exige una segunda señal | nunca |
| Movimiento informativo | ninguno | sí; necesita estado fijo alternativo | mínimo |
| Carga sensorial | baja | media-alta | media, por densidad |
| Trabajo adicional previsible | bajo | alto y recurrente en cada caso nuevo | bajo, más un modo de espaciado ampliado |

D2 es la única que introduce obligaciones nuevas en cada caso que se escriba, no sólo una vez.

### Identidad

| | D1 Cuaderno | D2 Laboratorio | D3 Consola |
| --- | --- | --- | --- |
| Distinción del proyecto | baja | alta | media |
| Lectura probable del alumnado | ficha o cuestionario | videojuego | herramienta o simulador serio |
| Coherencia con el título | media | alta | media-alta |

### Coste de producción

| | D1 Cuaderno | D2 Laboratorio | D3 Consola |
| --- | --- | --- | --- |
| Recursos originales | marcas de línea y cuatro efectos | seis personajes con variantes, fondos, iluminación, animación y conjunto sonoro | diagramas generados desde datos |
| Licencias | ninguna previsible | música y timbres | ninguna previsible |
| Coste de un caso nuevo en M7 | bajo | alto | bajo |
| Riesgo sobre el calendario de M8 | bajo | alto | bajo |

### Adecuación pedagógica

| | D1 Cuaderno | D2 Laboratorio | D3 Consola |
| --- | --- | --- | --- |
| Refuerza sobre todo | capa 1: observar, reconocer, reparar | la consecuencia como experiencia | capa 2: decidir, revisar, justificar |
| Hace visible «a quién favorece» | no | sí | parcialmente, mediante datos |
| Sostiene la gramática de decisión | bien | suficiente | muy bien |
| Sirve a la ruta presencial de 20-30 min | media | riesgo de alargarla | alta |
| Riesgo pedagógico propio | la consecuencia nunca se muestra | la animación sustituye al razonamiento; representación fija de personas | el juego se siente clínico y sin música |

## 6. Qué está aplicado y qué sólo está descrito

Esta distinción es la que impide confundir una maqueta con una dirección terminada.

| Dirección | Aplicado hoy sobre el corte | Descrito, no producido |
| --- | --- | --- |
| D1 Cuaderno | paleta, tipografía con serifa, regla de margen, casilla de decisión cuadrada, seis señales sonoras con equivalente textual, **viñeta de tinta y anotación al margen en la consecuencia** | viñetas figurativas de los personajes, marcas de corrección dibujadas a mano, encabezados manuscritos |
| D2 Laboratorio | paleta oscura, banda de escenario iluminada, acento ámbar, entrada animada de retroalimentación e incidente, seis señales sonoras con equivalente textual, **banda de aula con figuras abstractas, reparto visible de decisiones y franja de barrera** | figuras con carácter propio y variantes de estado, código de color por puerta de entrada, iluminación que señala a quién afecta cada decisión, reacción escénica del incidente |
| D3 Consola | paleta clara de alto contraste, etiquetas monoespaciadas, riel de estado, casilla rectangular, seis señales sonoras con equivalente textual, **diagrama de los cuatro observables e historial mínimo de decisiones** | riel permanente con las cinco preguntas estables, historial lateral persistente en todas las pantallas |

La segunda iteración corrige el desequilibrio de la primera: las tres tienen ya una característica
experiencial funcionando sobre la misma pantalla. Aun así **D2 sigue siendo la que más promete y
menos enseña**: su banda es una maqueta de seis figuras geométricas, no el repertorio de personajes
con carácter que sostiene su ventaja pedagógica y su coste. Al comparar conviene recordar que el
salto entre lo que hoy se ve de D2 y lo que D2 sería está mucho menos financiado que en D1 y D3.

## 7. Cómo probarlas

1. `pnpm dev` y abrir `#/direcciones`, que reúne las cuatro fichas —línea base y tres candidatas—
   con estos mismos criterios.
2. **Escuchar primero, sin mirar.** Cada ficha despliega sus seis señales con un botón por señal.
   Suenan sin cambiar la dirección aplicada, de modo que el lenguaje sonoro puede juzgarse
   separado de lo visual. Conviene hacerlo con auriculares y comparar las tres seguidas.
3. Pulsar «Aplicar al corte» y recorrer el caso «El arreglo que no escucha a todos». La dirección
   se mantiene entre pantallas y entre recargas.
4. **Detenerse en la primera consecuencia**, que es donde cada dirección muestra su característica
   experiencial. Para que la comparación sea limpia hay que recorrer el caso tres veces tomando la
   misma ruta de decisiones; si se eligen decisiones distintas, la consecuencia cambia y no se está
   comparando lo mismo.
5. También puede cambiarse de dirección sin salir de una escena, desde **Ajustes → Dirección
   aplicada**, lo que permite ver la misma pantalla en las cuatro variantes.
6. El equivalente textual de cada señal sonora aparece abajo a la izquierda, incluso con el sonido
   silenciado.
7. Conviene repetir el recorrido con «Reducir movimiento» activado y con el sonido silenciado: son
   los dos estados donde D2 pierde más y donde D1 y D3 no pierden casi nada.

## 8. Reversibilidad

La dirección en prueba se guarda en `metodos.direccion-m5.v1`, una clave propia que no forma parte
del contrato `Progress` de M3. Borrarla, ignorarla o corromperla devuelve el corte al gris.

Para eliminar por completo la capa de dirección basta con:

1. borrar `src/app/direction/` y `src/styles/directions.css`;
2. quitar la importación de `directions.css` en `src/main.ts`;
3. quitar el caso `directions` de `src/app/router.ts` y de `routeContent`;
4. quitar de `src/app/render-app.ts` el bloque de dirección de `settingsPanel`, la región
   `.sound-caption`, las llamadas a `playCue`, `playCueFor` y `announceState`, y el parámetro
   `direction` que atraviesa `routeContent`, `gameView` y `consequenceScene`, junto con la llamada
   a `consequenceExtras`;
5. borrar `tests/directions.test.ts`.

`src/styles.css` no necesita revertirse: M5 sólo la tokenizó, y cada token conserva como valor de
reserva exactamente el literal de M4, de modo que sin ninguna dirección declarada el resultado es el
gris aprobado. Lo comprueba la medición del apartado 11: con «Gris M4» aplicado, el recorrido se
comporta exactamente como el corte de M4, con sus virtudes y con su defecto.

Lo que sí cambian las direcciones es la composición y la altura de las pantallas, de modo que la
comprobación de «pantallas de acción sin desplazamiento» debe rehacerse para la dirección que se
elija y no puede darse por heredada.

## 9. Lo que la comparación no puede resolver sola

Estas preguntas dependen de una decisión docente, no de una medición:

1. **¿Cuánto vale ver la consecuencia?** Si «ver a quién favorece una decisión» es irrenunciable,
   sólo D2 lo cumple hoy, y hay que aceptar su coste y sus obligaciones de accesibilidad. Si basta
   con leerla bien argumentada, D1 y D3 la sostienen a un coste mucho menor.
2. **¿Qué modalidad manda?** La ruta presencial de 20 a 30 minutos y la campaña doméstica de 60 a 90
   no premian lo mismo: la primera valora densidad y velocidad, la segunda tolera ambientación y
   ritmo.
3. **¿Cuánto presupuesto audiovisual admite M8?** D2 multiplica el coste de cada caso nuevo de M7A y
   M7B, no sólo el de la producción final.
4. **¿Qué riesgo se prefiere correr?** Que el juego se lea como una ficha, que la animación tape el
   razonamiento o que resulte clínico son tres riesgos reales y distintos.

Una combinación de rasgos de dos direcciones es técnicamente posible con esta misma capa, pero
mezclar sin decidir primero qué manda produce una identidad sin criterio; conviene resolver antes
las cuatro preguntas anteriores.

## 10. Qué falta para cerrar la puerta de M5

Después de que el profesor elija —y sólo entonces:

- fijar identidad, personajes, composición, movimiento y lenguaje sonoro definitivos;
- fijar el contrato de recursos y el registro de procedencia, licencia y atribución;
- aplicar la dirección elegida al corte completo y retirar las otras dos;
- verificar en navegador real subtítulos y equivalentes, movimiento reducido y legibilidad, y
  medir de nuevo los cinco tamaños objetivo con la dirección elegida;
- decidir si el nombre de trabajo «El aula de los dos minutos» se conserva.

## 11. Comprobaciones de esta entrega

### Ejecutadas

- Contrastes: calculados sobre la fórmula de luminancia relativa de WCAG 2.2 para todos los pares
  de texto, borde de control, foco y relleno de botón de las tres direcciones. Ninguno baja de 4,5:1
  en texto ni de 3:1 en borde de control.
- `pnpm validate:content`: tutorial, caso piloto, sonda de M3 y contraejemplos siguen validando. La
  capa de dirección no ha tocado ningún dato.
- `pnpm test`: **35 pruebas superadas** en cinco archivos, las 17 de M4 más 18 nuevas.
  `tests/directions.test.ts` comprueba que hay exactamente tres candidatas sobre la línea base, que
  cada una declara los cinco criterios, que toda señal sonora tiene equivalente textual, que los
  estados de consecuencia siguen siendo tres, que cualquier valor desconocido devuelve el corte al
  gris sin tocar la clave de progreso y que `#/direcciones` no altera las rutas del contrato M3.
  Sobre la característica experiencial comprueba además que el gris no añade nada, que D1 anota el
  objetivo real del caso y marca la viñeta como decorativa, que D2 acompaña la banda de un
  equivalente textual con la barrera y renuncia a dibujarla cuando el caso no representa un grupo,
  que D3 muestra los cuatro observables y las decisiones ya tomadas, y que ninguna introduce
  puntuación, recuento ni nombres de personajes.
- `pnpm build`: TypeScript estricto sin errores y salida Vite con base relativa.
- `pnpm build:platea`: paquete portable regenerado sin incidencias. La hoja de estilos pasa a
  19,3 kB, 4,7 kB comprimidos, y el JavaScript no aumenta de forma apreciable.

### Medición en navegador real

Chrome sin interfaz, conducido por el protocolo de DevTools sobre la compilación de producción. Se
recorre el caso piloto completo con la misma ruta de decisiones en **cuatro direcciones × cinco
tamaños objetivo = 20 combinaciones**, midiendo en cada pantalla el desbordamiento horizontal, el
desplazamiento vertical y el menor lado de todo control interactivo visible. Los resultados son
estables en tres pasadas consecutivas.

| Comprobación | Resultado |
| --- | --- |
| Desbordamiento horizontal | **Ninguno** en las 20 combinaciones. |
| Objetivo táctil mínimo | **44 px** en las 20 combinaciones; el más ajustado es el enlace de marca del encabezado. |
| Desplazamiento en pantallas de acción | Ver más abajo. |

Desplazamiento vertical máximo en pantalla de acción, en píxeles CSS:

| Pantalla | Gris M4 | D1 Cuaderno | D2 Laboratorio | D3 Consola |
| --- | ---: | ---: | ---: | ---: |
| Primera consecuencia · 360 × 640 | 0 | 92 | 158 | 222 |
| Primera consecuencia · 1366 × 768 | 0 | 27 | 108 | 107 |
| Justificación · 360 × 640 | 89 | 91 | 99 | 97 |
| Bitácora del caso · 1366 × 768 | 81 | 87 | 96 | 87 |

En 390 × 844, 768 × 1024 y 1440 × 900 ninguna dirección desplaza la consecuencia.

### Hallazgo sobre la línea base de M4

La medición contradice una afirmación registrada en `docs/corte_vertical_m4.md`. **El corte gris ya
desplazaba dos pantallas de acción antes de que M5 tocara nada**: la de justificación en 360 × 640 y
1366 × 768, y la de bitácora del caso en 1366 × 768 y 1440 × 900. En la de justificación el
desplazamiento crece a medida que se eligen las cinco piezas de la gramática —43, 58 y hasta 89
píxeles—, lo que sugiere que la comprobación de M4 se hizo con la pantalla aún incompleta.

Esto no lo ha causado M5 y no se corrige aquí: arreglarlo cambia la composición de la hoja base para
todo el juego y es una decisión que corresponde tomar junto con la dirección elegida, no antes. Se
deja registrado en los dos documentos y se propone resolverlo en el mismo tramo que aplique la
dirección. Mientras tanto, conviene leer la tabla anterior en su columna útil: **lo que cada
dirección añade sobre el gris**, que en la justificación y la bitácora es de 2 a 15 píxeles y en la
consecuencia es todo.

### Pendientes

- Escucha de las seis señales de cada dirección con auriculares, que es donde la comparación sonora
  se decide de verdad. Los botones de `#/direcciones` existen precisamente para eso.
- Comprobación con lector de pantalla de la región viva del equivalente textual y del pie de la
  banda de D2.
- Decidir si se corrige el desplazamiento heredado de las pantallas de justificación y bitácora.
