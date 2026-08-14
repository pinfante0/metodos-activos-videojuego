# M7A · contenido histórico

Estado: **en curso**. Este documento se amplía con cada entrega parcial y **no declara la fase
cerrada**: la puerta de salida de M7A exige el lote histórico completo —Dalcroze, concepto Kodály,
Orff-Keetman y Suzuki, con Willems y Martenot en su peso complementario— y hoy sólo existe la
primera unidad.

`docs/revision_tema_8.md` sigue siendo la fuente pedagógica canónica. Las ocho reglas de composición
de `docs/decision_producto_m5.md` siguen siendo vinculantes y se han respetado por composición, sin
eliminar rigor ni encoger texto pedagógico.

---

## 1. Entrega 1 · Tutorial 1, «El material intruso»

Convierte en contenido jugable la unidad `tutorial-1` de `docs/mapa_campana_m2.md`, con su función
declarada allí: **reparar una variable y predecir**, sobre el foco «cuerpo, voz y experiencia antes
del símbolo; material y técnica no son enfoques».

- Contenido: `src/content/playable/tutorial-material-intruso.json` (`el-material-intruso`).
- Reutiliza los sistemas de M6 sin ampliarlos: motor determinista con reglas y etiqueta excluida,
  incidente, revisión, justificación por gramática, bitácora, reparto declarado y recorridos.
- La unidad queda anunciada como jugable en `src/content/campaign/campaign.json`; portada, mapa,
  ruta presencial y unidad recomendada se derivan de ahí sin ninguna otra edición.
- El tutorial 0 ya no envía al caso 6: su pantalla de cierre continúa en esta unidad.

### 1.1. Qué enseña y de dónde sale

El objetivo musical de la escena es **reconocer una fórmula rítmica de dos compases dentro de una
canción conocida y transformarla conservando un rasgo**. Es concreto, observable y contiene las dos
mitades que la unidad necesita: reconocimiento y creación.

La escena inicial ya está rota, y lo está de la manera exacta que anuncia el mapa: una secuencia
corporal y vocal termina convertida en copia instrumental. La docente canta y percute, y a los dos
minutos escribe la fórmula, reparte los tres xilófonos que hay y pide que la toquen igual. Dice que
hoy hacen «método Orff» porque han sacado las láminas.

Las tres exigencias del encargo se reparten en decisiones distintas, una por pantalla (regla 1):

| Exigencia | Dónde se resuelve |
| --- | --- |
| Distinguir cuerpo, voz y experiencia antes del símbolo. | Pantalla 1: el indicio que avanza es que el símbolo llega antes de que la fórmula se haya dicho, cantado o reconocido de oído. |
| Que un material o una técnica no pasen por enfoque. | Pantalla 2: qué tendría que ocurrir para que el nombre explique la escena. Cambiar de instrumento no basta, y tampoco tenerlos. |
| Reparar una variable y predecir su efecto. | Pantallas 3 y 4: un solo cambio, y después un compromiso con lo que se espera observar. |

Correcciones de `docs/revision_tema_8.md` aplicadas sin convertirlas en pregunta de examen:

- se habla de **concepto Kodály**, no de método, y sus herramientas —sílabas rítmicas, signos— son
  medios, no finalidad;
- **Orff-Schulwerk aparece con Gunild Keetman** y como proceso de habla, movimiento, juego,
  improvisación y creación: el xilófono es un medio;
- **la notación no es el problema**, sino su lugar en la secuencia. La escena reparada la conserva
  como registro de lo ya sonado, y una de las dos reparaciones defendibles la mantiene visible;
- **partir de repertorio conocido no es un defecto**: uno de los indicios falsos lo propone y la
  devolución explica por qué sostiene el oído interno en lugar de estorbarlo.

### 1.2. La predicción es una decisión, no un adorno

El resultado de la prueba **combina reparación y predicción**, y por eso predecir enseña algo. Si
dependiera sólo de la reparación, la predicción sería decoración y podría acertarse siempre.

| Reparación | Predicción | Resultado |
| --- | --- | --- |
| Voz y sílabas antes del símbolo | reproducir sin la pizarra | la predicción corresponde al cambio |
| Voz y sílabas antes del símbolo | variaciones reconocibles | el cambio no pedía ninguna versión propia |
| Cuerpo, exploración y transformación | variaciones reconocibles | la predicción corresponde al cambio |
| Cuerpo, exploración y transformación | reproducir sin la pizarra | nadie reprodujo la fórmula tal cual |
| Cualquiera de las dos anteriores | «participarán con más ganas» | una predicción que se cumple siempre no comprueba nada |
| Repartir más material | cualquiera | el objeto ha cambiado; el principio y la evidencia, no |

La sexta fila es el resultado de reserva y **devuelve a la pantalla de reparación**. No bloquea nada
—no existe ningún bloqueo en el juego—, pero tampoco da por reparada una escena en la que sólo ha
cambiado el objeto. La quinta fila se distingue con `forbiddenTags`: una predicción vaga sobre un
diseño coherente enseña algo distinto de una predicción vaga sobre un cambio de material.

`tests/playable-content.test.ts` fija las seis combinaciones, y el analizador exhaustivo del motor
comprueba que ninguna de las cinco reglas queda tapada y que ningún resultado escrito es
inalcanzable.

### 1.3. Alternativas defendibles y por qué ninguna gana

**Dos reparaciones coherentes con prioridades distintas.** Decir y cantar la fórmula con sílabas
rítmicas hasta reconocerla sin apoyo prioriza el reconocimiento y el oído interno, y deja la
creación para después. Hablar, percutir y transformar por parejas prioriza la autoría y el acceso
común, y deja menos comprobado el reconocimiento de la fórmula original. Cada una tensiona lo que la
otra sostiene, y la devolución lo dice en las dos.

**Dos revisiones coherentes con prioridades distintas.** Rotar quién ocupa las láminas dando un
papel musical declarado a cada vía reparte el acceso de inmediato, a riesgo de convertirse en
administración de turnos. Acordar la transformación con voz y cuerpo y elegir el medio sólo al
presentarla impide que el instrumento escaso reparta la autoría, a riesgo de aplazar demasiado el
contacto instrumental y de depender de que la descripción sea fiel.

**Una revisión insuficiente que enseña.** Retirar las láminas iguala quitando: deja el problema
intacto y con una vía menos. Devuelve a la misma pantalla en lugar de dejar pasar.

### 1.4. El incidente

`t1-incident-medium`, familia **recursos**. Cambia una condición que el diseño daba por resuelta:
al llegar el momento de llevar la fórmula a un medio, las tres láminas se ocupan en cuanto se
nombran, Óscar acaba organizando el turno y tocando lo que ha decidido casi todo el mundo, Mara dice
en voz alta qué quiere hacer con la fórmula sin llegar a tocarlo, la entrada vuelve a ser sólo sonora
e Inés sigue el turno mirando las manos de al lado, y la propuesta de percusión corporal de Leo se
lee como que le ha tocado esperar.

Revela una relación de grupo y una escasez, **no un fallo personal ni una discapacidad como giro
sorpresa**. Aparece después de cualquiera de las cinco pruebas que no sean un cambio de material, de
modo que ninguna rama defendible se queda sin revisar.

Su relato es **el mismo para las dos reparaciones defendibles**, y por eso no da por supuesto que
existan versiones propias: en la rama de voz todavía no las hay. Habla de lo que cada persona ha
decidido hacer con la fórmula, que en una rama es reproducirla y en la otra transformarla.

### 1.5. Reparto y participación

El caso declara cuatro personas del reparto compartido —Inés, Leo, Mara y Óscar—, elegidas porque
son aquellas cuya participación cambia cuando el símbolo y el instrumento se adelantan a la
experiencia. Los **catorce** resultados que el juego presenta como consecuencia de un diseño o de una
revisión —seis pruebas, tres revisiones y cinco cierres— declaran el papel de las cuatro; es lo que
exige el contrato ampliado en M6 y sin lo cual el caso no valida.

Dos observaciones que el dato hace visibles y que ninguna imagen podría inventar:

- **Óscar no es el culpable de nada.** En la escena rota su lectura le da el turno; en las dos
  reparaciones defendibles elige medio como el resto o propone una versión más, y en la revisión por
  rotación sostiene la fórmula y escucha cuando no le toca lámina. La competencia deja de repartir
  turnos sin que nadie le retire nada.
- **Un símbolo visible no es automáticamente acceso.** El único `no-route` del caso es el de Inés
  cuando se reparte material y se toca la parte escrita: la pizarra dice qué tocar, pero el cuándo
  sigue viajando sólo por el aire. La nota atribuye la exclusión a la decisión de diseño, como exige
  la salvaguarda, y otras decisiones le abren vía en el resto de resultados.

### 1.6. Recorridos declarados

Seis recorridos nuevos en `src/content/playable/walkthroughs.json`, uno por rama que merece
comprobarse. Los ejecutan las pruebas sobre la sesión pura y el arnés sobre Chrome real, desde una
sola fuente.

| Recorrido | Rama que cubre |
| --- | --- |
| `tutorial-1-voz-acertada` | Reparación por la voz, predicción que corresponde, revisión por rotación. Mide los cinco tamaños. |
| `tutorial-1-cuerpo-acertada` | La segunda reparación defendible y la segunda revisión defendible. |
| `tutorial-1-prediccion-cruzada` | Predicción que habla de algo que ese cambio no hacía posible. |
| `tutorial-1-prediccion-vaga` | Predicción que se cumple siempre, más la revisión que retira el material y devuelve a la misma escena. |
| `tutorial-1-material-y-reintento` | Dos reintentos, el resultado de reserva que devuelve a reparar y una segunda prueba. |
| `tutorial-1-indicios-alternativos` | Los otros dos indicios falsos: el repertorio conocido y el cambio de instrumento. |

Entre los seis atraviesan **todas las acciones del caso**, los seis resultados de la prueba, los
tres de la revisión, los cuatro cierres por rama, el incidente, la justificación y la bitácora. Una
prueba lo exige: una acción sin recorrido declarado es texto pedagógico que ninguna comprobación
recorre.

### 1.7. El cierre depende de la rama

La pantalla de revelación nombra las dos tradiciones por su función —experimentar antes de nombrar y
representar, con la voz y el oído por delante, en el concepto Kodály; ir de un modelo breve a la
exploración y a una forma propia, con habla, cuerpo, voz e instrumentos, en Orff-Schulwerk elaborado
con Gunild Keetman— y esa parte es la misma siempre, porque es cierta siempre.

Lo que **no** puede ser el mismo es lo que el cierre afirma de la clase. Cada reparación defendible
trabaja una mitad del objetivo y deja la otra pendiente, y cada revisión reparte la participación de
una manera distinta. Por eso el cierre se resuelve por las mismas reglas deterministas que el resto
del caso, con una consecuencia por combinación de reparación y revisión:

| Rama | Qué afirma el cierre | Qué deja pendiente |
| --- | --- | --- |
| Voz + rotación | Reconocen la fórmula sin la pizarra y el turno de medio circula. | Transformar: la consigna que falta, con sitio ya reservado en el turno. |
| Voz + decidir antes de tocar | Reconocen la fórmula y la revisión es donde entra la transformación. | Que lo que suene conserve de verdad lo acordado. |
| Cuerpo + rotación | Hay versiones propias y todas encuentran medio donde sonar. | Reconocer la fórmula original sin apoyo. |
| Cuerpo + decidir antes de tocar | Las versiones se acuerdan donde el acceso es equivalente. | Reconocer la fórmula original sin apoyo. |

La quinta consecuencia es la de reserva, y sólo se alcanza entrando por enlace directo a la pantalla
sin decisiones previas. Dice exactamente eso: que habla del principio y no de la clase de quien
entra. **Declarar los huecos en lugar de inventarlos** es la misma regla que ya seguía la
justificación del caso 6 abierta por el medio.

Cada uno de los cinco cierres declara además su propio reparto, porque quién decide al final del
recorrido depende de la revisión elegida y no puede darse por sabido.

---

## 2. Qué corrigió la auditoría de la entrega

La auditoría del primer commit encontró cuatro bloqueos. Los cuatro eran de la misma familia:
**afirmaciones que valían para una rama y se estaban haciendo en todas**. Ninguno se ve leyendo el
archivo seguido, y por eso los cuatro dejan una regresión.

1. **La transformación desaparecía en la rama de voz.** El resultado de la prueba decía con razón
   que reproducir no es transformar, pero el incidente hablaba después de «cada versión» y de «su
   transformación», y el cierre daba el objetivo entero por trabajado. La reparación por la voz
   nunca había pedido transformar nada. Ahora el incidente habla de lo que cada persona ha decidido
   hacer con la fórmula, la revisión que acuerda qué se conserva y qué se cambia es el lugar donde
   esa mitad entra, y el cierre de la rama de voz lo dice: reconocimiento comprobado, transformación
   pendiente y con sitio.
2. **La revelación final era una sola para todas las ramas, con un solo reparto.** Ahora son cinco,
   resueltas por regla, con el reparto propio de cada combinación. La regresión comprueba que
   ninguna revelación puede servir a las dos reparaciones a la vez; si alguien lo intentara, el
   analizador del motor declararía además inalcanzable la que quedara tapada.
3. **`t1-clue-known-song` y `t1-name-swap-percussion` no los recorría nadie.** Eran las dos
   devoluciones que explican que el repertorio conocido no es el defecto de la escena y que cambiar
   de instrumento repite el movimiento que ya hizo la docente: justo las dos que más falta hacen y
   las únicas sin comprobar. Un recorrido nuevo las consume y una prueba exige que **toda** acción
   de la unidad tenga recorrido declarado.
4. **La bitácora no guardaba una decisión mantenida.** Guardaba la lectura previa en su lugar, y la
   revisada mezclaba reparación, predicción y revisión en una línea. Ahora la decisión mantenida es
   la reparación que sobrevive al incidente **con su razón** —el incidente cambió quién ocupaba el
   medio, no el orden entre experiencia y símbolo—, la revisada es la revisión, y la predicción
   viaja con la primera lectura.

Las cuatro regresiones se comprobaron rompiendo el contenido a propósito: sin el recorrido nuevo,
sin la razón en la bitácora y con una revelación compartida entre ramas, cada prueba falla con su
mensaje antes de que nadie tenga que darse cuenta leyendo.

---

## 3. Comprobaciones de esta entrega

- **`pnpm check`**: 208 pruebas en once archivos, compilación con TypeScript estricto y paquete
  PLATEA regenerado. Las nueve pruebas nuevas de `tests/playable-content.test.ts` fijan la
  combinación reparación × predicción, el resultado de reserva, que las dos reparaciones y las dos
  revisiones defendibles conservan su estado sin ganadora, y las cuatro regresiones de la auditoría.
- **`pnpm measure:viewports --runs=3`**: 16 recorridos declarados completados hasta su pantalla de
  cierre en 40 combinaciones de recorrido y tamaño, 676 pantallas de recorrido por pasada medidas
  con los desplegables cerrados y abiertos, más 19 rutas de referencia y estados difíciles en los
  cinco tamaños. **Ningún desbordamiento horizontal, ninguna pantalla de acción que se desplace y
  objetivo táctil mínimo de 44 px.** Resultados idénticos en las tres pasadas. Salida literal en
  `docs/medicion_tamanos_m7a_salida.md`; el procedimiento sigue siendo el de
  `docs/comprobaciones_m6.md`.
- Las salvaguardas del reparto, el análisis exhaustivo del motor y la coherencia de la campaña se
  comprueban solas sobre el contenido nuevo: las tres suites recorren todos los casos publicados.

### 3.1. Lo que encontró la medición

**Cuatro caracteres de más en el pie rompieron la regla 6 en todas las pantallas de acción.** Al
cambiar la etiqueta del pie de «M6» a «M7A en curso», el texto pasaba a ocupar una línea más en
360 × 640 y 390 × 844, y `main` perdía 12 px. El resultado: **todas** las pantallas de acción de los
tres casos y del banco de mecánicas se desplazaban 12 px, y la justificación del caso 6 abierta por
enlace directo, 23 px. Ninguna tenía nada que ver con el contenido nuevo.

Es exactamente el defecto que el arnés existe para encontrar: no se ve leyendo el cambio, no se ve
en un tamaño de escritorio y aparece en todas partes a la vez. La etiqueta se acortó a «M7A» y la
medición volvió a quedar limpia. Conviene recordarlo antes de tocar cualquier texto del encabezado
o del pie: son las dos únicas piezas que restan altura a todas las pantallas del juego.

---

## 4. Qué **no** contiene esta entrega

Ninguna de estas ausencias es un olvido; son el alcance que la entrega no tenía.

- **El caso 2, el caso 3 y el caso 4 no están escritos**, ni por tanto Dalcroze y Kodály comparados
  como dos entradas, Orff-Keetman con Willems y Martenot como lentes complementarias, ni Suzuki con
  sus condiciones de transferencia. Son el resto de M7A.
- **No hay nada de M7B**: ni Campbell/WMP, ni Green/PME más allá del caso piloto que ya existía, ni
  Schafer, ni Gordon, ni el caso final.
- **No hay arte de M8.** Todo lo visible sigue siendo tipografía, color, retícula y la silueta
  trazada de M5; todo lo audible sigue sintetizado y siguen siendo seis señales.
- **M7A no está completa** y su puerta de salida no se ha superado.

## 5. Límites abiertos que quien continúe no debe dar por resueltos

- **Los siete minutos de la unidad siguen siendo una hipótesis de diseño.** El tutorial tiene diez
  escenas y, en un recorrido sin reintentos, catorce pantallas contando las de retroalimentación.
  Medirlo de verdad es M7C, igual que el recorte editorial.
- **En 360 × 640, el relato del incidente se desplaza 124 px por dentro de su recuadro**, frente a
  los 2 px del incidente de M6. Ningún texto se ha encogido, el bloque recibe foco, tiene nombre
  accesible y responde a las flechas, y la pantalla no se desplaza. Conviene observarlo en el piloto
  de M10: es el primer texto de incidente escrito por M7 y los siguientes no serán más cortos.
- **El reparto de este caso son cuatro personas y el del caso 6, seis.** Las unidades que faltan
  deberán decidir su reparto por lo que la escena hace visible, no por completar la lista: cada
  persona declarada obliga a escribir su papel en todos los resultados del caso.
- **La cobertura declarada completa sólo se exige, por ahora, a esta unidad.** El tutorial 0, el
  caso piloto y el banco de mecánicas tienen cinco acciones que ningún recorrido consume:
  `observe-choice` y `repair-more-colours`; `brief-instruments-only` y
  `revision-dictate-equal-parts`; y `probe-action-single-form`. Son contenido de M4 y M6 y quedan
  fuera de esta corrección, pero extender la regla a los tres casos es trabajo pequeño y conviene
  hacerlo antes de que la campaña crezca.
- **La ruta presencial ya tiene sus tres tramos con contenido.** Sus tiempos siguen sin medirse, que
  es el encargo de M7C.
