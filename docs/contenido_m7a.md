# M7A · contenido histórico

Estado: **completada; puerta de salida superada**. Este documento recoge las cuatro entregas
aprobadas de la fase. Las cuatro tradiciones principales del lote histórico tienen ya unidad propia
—Dalcroze y el concepto Kodály en el caso 2, Orff-Keetman en el tutorial 1 y en el caso 3 con Willems
y Martenot como lentes de revisión, y Suzuki en el caso 4—, y **seis de las nueve unidades de la
campaña tienen contenido**.

La fase se declara cerrada después de que **las cuatro entregas hayan pasado auditoría
independiente**. La cuarta necesitó catorce correcciones bloqueantes repartidas en cuatro rondas de
revisión antes de superar la auditoría de aceptación. Véanse los apartados 4.8 a 4.11 y el 5.4.

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

### 1.8. Qué corrigió la auditoría de la entrega 1

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

## 2. Entrega 2 · Caso 2, «Una frase, dos entradas»

Convierte en contenido jugable la unidad `caso-2` de `docs/mapa_campana_m2.md`, con su función
declarada allí: **comparar dos soluciones defendibles**, sobre el foco «Dalcroze y Kodály: cuerpo y
escucha frente a voz y oído interno; de la experiencia al símbolo».

- Contenido: `src/content/playable/caso-una-frase-dos-entradas.json` (`una-frase-dos-entradas`).
- Reutiliza los sistemas de M6 sin ampliarlos: motor determinista, incidente, revisión,
  justificación por gramática, bitácora, reparto declarado y recorridos.
- La unidad queda anunciada como jugable en `src/content/campaign/campaign.json`; portada, mapa,
  ruta presencial y unidad recomendada se derivan de ahí sin ninguna otra edición.
- El tutorial 1 ya no envía a la campaña: su pantalla de cierre continúa en esta unidad, igual que
  el tutorial 0 continúa en el tutorial 1.
- **No usa el montador.** El reparto de operaciones de `docs/mapa_campana_m2.md`, apartado 6, da a
  C2 comparar dos secuencias y a C3 montar una forma. Montar aquí habría añadido una pantalla y
  habría gastado antes de tiempo la operación nueva del caso siguiente.

### 2.1. Qué enseña y de dónde sale

El objetivo musical es **reconocer dónde cierra una frase de cuatro compases dentro de una canción
conocida y entrar a tiempo justo después, sin que nadie avise**. Es la evidencia de salida que el
mapa pide para la unidad —elegir una secuencia según el objetivo y explicar qué aporta y qué deja
fuera— y tiene la propiedad que el caso necesita: **las dos tradiciones lo sirven de verdad, por
puertas distintas**.

- **Dalcroze:** recorrer la frase con un gesto continuo mientras suena y cambiar de dirección donde
  cierra. El cuerpo no está para desarrollo motriz, sino para representar pulso, metro y frase; y el
  docente **improvisa y adapta la música en tiempo real** a lo que ve.
- **Concepto Kodály:** cantar la frase, cantarla por dentro desde el penúltimo compás y volver a
  entrar en el cierre, con el docente **secuenciando de lo experimentado a lo representado**.

Las dos tensiones que el mapa declara para esta unidad son las dos maneras de perder la evidencia, y
cada una tiene su propia decisión y su propia vuelta atrás:

| Tensión declarada en el mapa | Dónde se resuelve |
| --- | --- |
| La notación aparece antes de que el patrón se haya comprendido. | `c2-entry-score-count`: la frase se ve escrita y se cuentan cuatro compases antes de que suene. El resultado devuelve a la puerta de entrada. |
| La acción corporal queda sin lenguaje musical. | Los cierres de la puerta del cuerpo declaran que nada se ha nombrado ni representado, y el cruce con una frase que nunca cambia lo dice en la prueba. |

Correcciones de `docs/revision_tema_8.md` aplicadas sin convertirlas en pregunta de examen:

- **Émile Jaques-Dalcroze**, con la rítmica como una de sus ramas y no como el todo;
- se habla de **concepto Kodály**, que **integró herramientas anteriores** —sílabas rítmicas,
  signos manuales— y las usa como medios, nunca como finalidad;
- **el piano no es un requisito**: la devolución del indicio falso del material dice que lo que hace
  falta es una música que pueda cambiar en directo, venga del teclado, de la voz o de un altavoz que
  se para y se repite;
- **«activo» no equivale a moverse**: el tercer indicio falso llama pasiva a la versión cantada, y
  la devolución responde que cantar una frase por dentro y volver a entrar en el sitio exacto es de
  las cosas más activas que pueden pedirse;
- **partir de repertorio conocido no es un defecto**, y cantarlo de memoria tampoco es la evidencia
  buscada: el objetivo es la frase que hay dentro.

### 2.2. La comparación es una decisión, no un párrafo final

Comparar dos soluciones defendibles se juega en cuatro sitios distintos, y en ninguno se resuelve
leyendo:

1. **Antes de diseñar**, la pantalla de los dos planes preparados pregunta en qué se diferencian de
   verdad. Los dos indicios falsos son el material y llamar pasiva a una de las dos.
2. **Al diseñar**, la puerta de entrada y el papel docente se deciden en pantallas distintas
   (regla 1 de M5) y el resultado los combina.
3. **Al cerrar**, cada combinación de puerta y revisión afirma lo que consiguió **y nombra lo que la
   otra puerta habría dejado ver**.
4. **En la bitácora**, la alternativa defendible dice qué comprueba cada una y que elegir una deja
   la otra sin comprobar.

### 2.3. El papel docente decide, y por eso se cruza

El resultado de la prueba **combina la puerta de entrada con el papel docente**. Es la primera vez
en la campaña que el jugador tiene que explicar el papel docente, como fija
`docs/matriz_pedagogica_m2.md`, apartado 6, y la única forma de que esa explicación importe es que
cambiarlo cambie el aula.

| Puerta de entrada | Papel docente | Resultado |
| --- | --- | --- |
| Cuerpo y escucha | improvisa y adapta la música | defendible con revisión: el grupo reacciona a lo que suena, pero el cambio no estaba anunciado y el cierre seguía llegando solo por el aire |
| Voz y oído interno | secuencia hacia el símbolo | defendible con revisión: interioriza y al final representa, pero la frase fija puede resolverse de memoria y la referencia es solo sonora |
| Cuerpo y escucha | secuencia hacia el símbolo | defendible con revisión: conserva experiencia antes que símbolo, pero el gesto acaba ilustrando un plan en lugar de escucharlo |
| Voz y oído interno | improvisa y adapta la música | defendible con revisión: conserva escucha viva, pero cantar por dentro se queda sin referencia estable |
| Cualquiera | cuenta y marca la entrada | la evidencia desaparece; vuelve al papel docente |
| Símbolo primero | cualquiera | la representación sustituye la experiencia; vuelve a la entrada |
| Sin decisiones | — | resultado de reserva: declara el hueco y vuelve a la entrada |

**Ninguna de las cuatro combinaciones defendibles cumple todavía todo el encargo.** Las dos parejas
históricamente más características tampoco reciben un aprobado prematuro: antes de la revisión falta
acceso equivalente, previsión del cambio o una prueba que distinga memoria de reconocimiento. Los dos
cruces conservan algo concreto —en uno el orden entre experiencia y símbolo; en el otro la escucha
viva—, de modo que tampoco se castigan como mezclas incoherentes. La revisión reconcilia después el
papel docente: asienta la frase antes de variar y anuncia la posibilidad de cambio.

El resultado de reserva **declara el hueco en lugar de inventarlo**: se alcanza sólo por enlace
directo a la prueba y dice exactamente que no hay microclase que probar.

### 2.4. El incidente

`c2-incident-shared-entry`, familia **experiencia y roles**, en su variante de imitación sin
comprensión. En la última vuelta la frase dura dos compases más: casi toda la clase entra donde
siempre y se corrige mirando a Óscar, que ha sido el único que ha esperado.

Revela **de dónde estaba sacando el grupo la información para entrar**: no de la música, sino de la
entrada de al lado. No es un fallo personal ni una discapacidad como giro sorpresa.

Su relato es **el mismo para las dos puertas**, y una prueba lo vigila: no puede nombrar gestos ni
canto, porque hablaría de una clase que sólo una de las dos ramas produjo. Es la regresión
directa del primer bloqueo de la auditoría de la entrega 1.

### 2.5. Alternativas defendibles y por qué ninguna gana

**Dos puertas defendibles con prioridades distintas.** Ya descritas: reaccionar a lo que suena frente
a interiorizar y representar. Ninguna gana y ninguna queda plenamente coherente hasta que la revisión
repara las condiciones del encargo. Cada cierre nombra la mitad que la otra habría dado.

**Dos revisiones coherentes con prioridades distintas.** Las dos asientan primero la frase, anuncian
que después puede variar y hacen perceptible el cambio rítmico por sonido, señal visual y vibración,
sin convertir ninguna de esas vías en señal de entrada. La primera pide una anticipación individual y
privilegia evidencia persona a persona; la segunda alterna la versión estable y la alargada, registra
primero una elección individual y usa después la pareja para localizar y explicar el cierre. Así
ambas reparan la referencia móvil, la imprevisibilidad, la información solo sonora y la imitación,
pero siguen comprobando cosas distintas.

**Una revisión insuficiente que enseña.** Que Óscar marque la entrada porque es quien mejor la oye:
iguala el resultado sin cambiar la referencia —el grupo sigue entrando por imitación, ahora de una
persona designada— y lo deja de ayudante permanente, que es exactamente la salvaguarda que el
reparto compartido declara para él. Devuelve a la misma pantalla en lugar de dejar pasar.

### 2.6. Reparto y participación

El caso declara cinco personas —Inés, Leo, Mara, Óscar y Julia—, elegidas por lo que la escena hace
visible y no por completar la lista: entrar a tiempo en un sitio que sólo se anuncia por el aire
reparte muy distinto según de dónde venga la información. Amina queda fuera porque esta unidad no
media repertorio ni fuentes. Los **quince** resultados que el juego presenta como consecuencia de un
diseño o de una revisión —siete pruebas, tres revisiones y cinco cierres— declaran el papel de las
cinco.

Tres observaciones que el dato hace visibles y que ninguna imagen podría inventar:

- **El acceso que falta se atribuye al diseño.** Inés queda sin vía en las pruebas iniciales cuya
  referencia es solo sonora; las dos revisiones lo corrigen reproduciendo el cambio rítmico con señal
  visual y vibración, sin rebajar el objetivo ni convertirla en auditora de la accesibilidad.
- **Las dos revisiones defendibles reparten la decisión de manera distinta, pero ninguna deja una
  vía pendiente.** Una registra la anticipación individual; la otra separa la elección individual de
  la explicación posterior en pareja. En los cuatro cierres Inés decide, no sólo propone una futura
  adaptación.
- **Julia y Óscar cambian de sitio según el papel docente.** Cuando la música se adapta en directo,
  Julia propone que el cambio se anuncie; cuando la secuencia es estable, decide sin más. Óscar
  reparte turnos sólo cuando el diseño le deja ser el reloj de la clase, y ninguna de las dos
  revisiones defendibles lo hace.

### 2.7. Recorridos declarados

Siete recorridos nuevos en `src/content/playable/walkthroughs.json`, uno por rama que merece
comprobarse.

| Recorrido | Rama que cubre |
| --- | --- |
| `caso-2-cuerpo-y-musica-viva` | Cuerpo con música que se adapta y revisión por anticipación comprobable. Mide los cinco tamaños. |
| `caso-2-voz-y-secuencia` | La otra puerta coherente y la otra revisión defendible. |
| `caso-2-cuerpo-con-secuencia` | Primer cruce: el gesto ilustra un plan en lugar de escucharlo. |
| `caso-2-voz-con-improvisacion` | Segundo cruce: cantar por dentro sin referencia estable. |
| `caso-2-simbolo-primero` | El símbolo por delante, los dos indicios falsos del encargo y de la comparación, y la revisión que convierte a una persona en el reloj. |
| `caso-2-solo-la-cuenta` | La entrada marcada por el docente, la canción de memoria y llamar pasiva a la versión cantada. |
| `caso-2-enlace-directo-a-la-prueba` | Enlace docente a la pantalla de resultado sin haber decidido nada. |

Entre los siete atraviesan **todas las acciones del caso**, los siete resultados de la prueba, los
tres de la revisión, los cuatro cierres por rama, el incidente, la justificación y la bitácora. La
misma prueba que exige cobertura declarada en el tutorial 1 la exige ahora aquí.

---

## 3. Entrega 3 · Caso 3, «Del modelo a una forma propia»

Convierte en contenido jugable la unidad `caso-3` de `docs/mapa_campana_m2.md`, con su función
declarada allí: **montar tres momentos**, sobre el foco «Orff-Keetman, con Willems y Martenot como
lentes complementarias de audición, gesto y atención».

- Contenido: `src/content/playable/caso-del-modelo-a-una-forma-propia.json`
  (`del-modelo-a-una-forma-propia`).
- Reutiliza los sistemas de M6: **montador de tres huecos**, motor determinista, incidente,
  revisión, justificación por gramática, bitácora, reparto declarado y recorridos. **El motor
  determinista de consecuencias e incidentes no se ha tocado.**
- Sí hay **tres ampliaciones**, todas nacidas de una auditoría y todas acotadas:
  1. **`approachIds` opcional por acción** en `ActionSchema`. La bitácora anotaba como «principios
     combinados» los enfoques del caso entero, y aquí habría anotado siempre Orff-Keetman, Willems y
     Martenot aunque sólo una lente llegue a elegirse. Es opcional: un caso que no la declare
     conserva el comportamiento anterior sin cambio alguno, y por eso el tutorial 1, el caso 2 y el
     caso 6 anotan exactamente lo mismo que antes.
  2. **Validación cruzada de ese campo** en `validateCaseDefinition`, con el código
     `approach-outside-case`: una acción no puede poner en juego una tradición que su caso no
     declara.
  3. **Guardián y renderizado de la pantalla de reflexión.** `canFinishCase` comprueba la entrada
     que se guardaría contra el propio `JournalEntrySchema`, y la pantalla no ofrece «Guardar y
     cerrar» cuando esa entrada no validaría: en su lugar dice qué falta y enlaza al momento que lo
     resuelve. Antes, un enlace directo a la reflexión ofrecía cerrar y `ProgressSchema` lanzaba al
     guardar.
- La unidad queda anunciada como jugable en `src/content/campaign/campaign.json`; portada, mapa,
  ruta presencial y unidad recomendada se derivan de ahí sin ninguna otra edición.
- El caso 2 ya no envía a la campaña: su pantalla de cierre continúa en esta unidad. Es el **único**
  cambio hecho sobre el caso 2, y afecta sólo a `nextLabel` y `nextRoute`; su título y su cuerpo no
  se han tocado, porque la auditoría de la entrega 2 le prohibió expresamente anticipar el caso 3.

### 3.1. Qué enseña y de dónde sale

El objetivo musical es **convertir un motivo de dos compases dicho y percutido en una versión propia
que conserve un rasgo reconocible, y colocarla en una forma donde se oiga dónde entra y dónde sale**.
Es la evidencia de salida que el mapa pide para la unidad —diseñar imitación, exploración y creación,
y observar una variación reconocible— y contiene las dos mitades que el caso necesita: que haya
autoría y que la autoría tenga sitio donde sonar.

Es además deliberadamente distinto de lo ya escrito. El tutorial 1 reconoce una fórmula dentro de una
canción y la transforma; el caso 6 parte de una grabación elegida y reparte agencia en un arreglo.
Aquí lo nuevo es la **forma**: doce parejas y un solo motivo, y el problema de que lo creado llegue a
oírse.

Esta es la primera unidad de la campaña que usa el **montador**. El reparto de operaciones de
`docs/mapa_campana_m2.md`, apartado 6, le asigna «montar una forma», y el caso 2 renunció
expresamente a montar para no gastarla antes de tiempo.

### 3.2. Los tres momentos son una sola decisión en tres pantallas

Cada hueco se decide en su propia pantalla, como exige la regla 1 de M5, y **ninguna de las tres da
retroalimentación por separado**: las tres escenas de diseño son `deferred`, el montaje se lee entero
en `c3-assembly` y la lectura pedagógica llega con la prueba. Es lo que distingue montar de responder
tres preguntas seguidas, y es lo que M6 decidió que hiciera el montador: «enumera, no valora».

| Momento | Hueco | Qué decide |
| --- | --- | --- |
| 1 · el modelo | `entry` | Con qué material entra el motivo y cuánto sitio deja desde el principio. |
| 2 · la exploración | `musical-action` | Qué ocurre entre conocer el motivo y tener una versión propia. |
| 3 · la forma | `evidence` | Dónde se oye lo que ha hecho cada pareja. |

Cada momento ofrece **dos opciones defendibles con prioridades distintas y una incoherente**. En el
momento 2 las dos defendibles conservan un rasgo y se diferencian en **quién elige cuál**: el
docente, con tres maneras nombradas e iguales para todo el grupo, o cada pareja, que declara antes
qué va a conservar y transforma libremente el resto. La primera hace la comparación inmediata; la
segunda lleva la autoría también al criterio, a cambio de doce criterios distintos. La incoherente
de cada momento es una de las tres tensiones que el mapa declara para la unidad:

| Tensión declarada en el mapa | Dónde se resuelve |
| --- | --- |
| Los instrumentos concentran el interés. | `c3-model-instruments-first`: se reparten las láminas antes de que exista ninguna decisión musical. El resultado devuelve al momento 1. |
| El modelo se repite sin exploración. | `c3-explore-teacher-menu`: las variaciones ya vienen hechas y elegir no cambia el material. El resultado devuelve al momento 2. |

**Ninguna rama que el juego permita terminar deja el objetivo sin cumplir.** Una versión de este caso
ofrecía como segunda exploración defendible dejar probar sin ningún límite, y con ella se llegaba a
un cierre coherente cuyas propias consecuencias decían que no existía el rasgo reconocible que el
objetivo exige: el caso se dejaba completar contradiciéndose. La opción se ha sustituido por el
criterio declarado, y una regresión semántica comprueba que ningún cierre ni ninguna de las ocho
pruebas defendibles niega el rasgo.
| La creación pierde claridad auditiva. | `c3-form-all-at-once`: doce versiones a la vez y nada distinguible. El resultado devuelve al momento 3. |

El resultado de la prueba **combina los tres momentos**: hay ocho resultados defendibles, uno por
combinación, y cambiar cualquiera de las tres decisiones cambia el resultado. Una prueba lo exige en
las tres direcciones. Si dos combinaciones compartieran resultado, uno de los momentos habría dejado
de contar y montarlo sería decorado.

Las ocho son **defendibles con revisión necesaria**, y no por prudencia: ninguna ha organizado
todavía la condición que el incidente revela, y las dos condiciones del encargo —que nada viaje solo
por el aire y que se pueda saber de antemano cuándo cambia cada cosa— siguen sin cumplirse en las
ocho. Las interacciones son lo que enseña: asentar el modelo con cuidado sólo sirve si algo lo
conserva después, y una forma bien montada no puede mostrar lo que el momento 2 no dejó existir.

### 3.3. Orff-Keetman es el proceso; Willems y Martenot son lentes

Es el encargo más delicado de la entrega, porque los tres nombres podrían acabar pareciendo tres
métodos equivalentes. La decisión de diseño es **estructural, no de redacción**:

- **los tres momentos del montador son el proceso de Orff-Schulwerk** —imitación a partir de un
  modelo breve, exploración y creación de una forma propia, con habla, cuerpo y voz por delante del
  instrumento—, y ocupan toda la fase de diseño;
- **Willems y Martenot entran sólo al revisar**, como dos maneras distintas de sostener ese mismo
  proceso cuando sus condiciones fallan.

Una prueba lo vuelve inviolable: ninguna acción que aporte una etiqueta de lente puede pertenecer a
una escena del montador. Si alguien intentara convertir una lente en un cuarto momento, la prueba
falla; y si la etiqueta se colara en una acción de diseño, el analizador del motor declara además
tapada la regla del cierre y muerta la consecuencia que quedara sin producir.

Las dos revisiones defendibles conservan el peso complementario acordado y sus salvaguardas:

- **Escucha graduada.** Comparar dos contrastes del motivo hasta que cualquiera pueda decir cuál ha
  sonado, con la diferencia también a la vista y en vibración, y explorar después por turnos. Es una
  progresión auditiva puesta al servicio de un proceso creativo. No aparece su marco
  sensorial-afectivo-mental, ni se la define por materiales, y su tensión declara el riesgo propio:
  una comparación que se alarga acaba clasificando sonidos en lugar de crear ninguna forma.
- **Entradas preparadas.** Un gesto visible y una vibración que abren y cierran cada turno, un
  silencio antes de entrar y dos tandas anunciadas. El gesto, la atención y la alternancia entre
  concentración y distensión están haciendo **trabajo musical**: marcan el comienzo y el final de una
  forma, que es exactamente la evidencia que el encargo pide. Su tensión lo dice: un gesto que no
  abre nada se convierte en una rutina de calma.

**La revisión incoherente es la caricatura de la segunda**: cambiar los dos minutos por un rato de
relajación para bajar el volumen. Su devolución no ridiculiza la relajación activa —dice que
pertenece a una tradición seria y que prepara de verdad escucha, gesto y entonación—; dice que lo que
la convierte en pedagogía musical es preparar una acción musical, y que separada de ella el encargo
se queda sin hacer. La salvaguarda se aprende por consecuencia, no por pregunta de examen.

Las correcciones históricas —Orff-Schulwerk elaborado **con Gunild Keetman**, y la pedagogía Martenot
desarrollada en familia por **Madeleine, Ginette y Maurice Martenot**— viven en la pantalla de
revelación, que es donde el caso nombra por fin lo que ya se ha jugado. Una prueba comprueba que
**ningún rótulo de decisión ni ninguna pregunta del juego contiene un nombre de autor, una fecha ni
un dato biográfico**: la función precede al nombre, y la cronología corregida no se convierte en
pregunta.

### 3.4. El incidente

`c3-incident-everyone-at-once`, familia **acceso sensorial y carga** —la tercera familia distinta de
las tres unidades de M7A, después de recursos y de experiencia y roles—. Cambia una condición que el
montaje daba por resuelta: que doce parejas pudieran explorar a la vez en la misma sala.

Revela una condición del aula y una relación de grupo, **no un fallo personal ni una discapacidad
como giro sorpresa**: lo que más suena pasa a ser la referencia, tres parejas acaban repitiendo lo
que llega del fondo sin haberlo decidido, y el docente no puede distinguir quién explora de quién
espera.

Su relato es **el mismo para las ocho ramas defendibles**, y una prueba lo vigila: no puede nombrar
el límite de la exploración, el remate abierto del modelo ni el reparto por mitades, porque hablaría
de un aula que sólo algunas de las ocho produjeron. Es la regresión directa del primer bloqueo de la
auditoría de la entrega 1, aplicada aquí a ocho ramas en lugar de a dos.

### 3.5. El cierre nombra lo que la otra lente habría dejado ver

La pantalla de revelación resuelve por regla **la consigna del momento 2 cruzada con la lente
elegida**, con una consecuencia por combinación y una quinta de reserva para el enlace directo.

| Rama | Qué afirma el cierre | Qué deja pendiente |
| --- | --- | --- |
| Terreno común + escucha graduada | El rasgo conservado existe y además puede reconocerse y nombrarse. | Localizar con precisión el principio y el final de cada versión, que es lo que la otra lente deja ver. |
| Terreno común + entradas preparadas | El rasgo conservado existe y se oye dónde entra y sale cada versión. | Que alguien de fuera de la pareja sepa nombrar el rasgo, que es lo que comprueba la otra lente. |
| Criterio declarado + escucha graduada | Cada versión conserva el rasgo que su pareja eligió y el aula sabe nombrarlo. | Lo mismo que la otra lente deja ver: dónde empieza y termina exactamente cada versión. |
| Criterio declarado + entradas preparadas | Cada versión conserva su rasgo y se oye dónde entra y sale. | Que alguien de fuera lo nombre, que es lo que comprueba la otra lente. |

Las cuatro cumplen el objetivo y ninguna gana: las dos primeras compran comparación inmediata a
costa de que el criterio lo pongas tú, y las dos segundas compran autoría plena a costa de doce
criterios distintos. Cada cierre lo declara en su barrera. Una prueba comprueba además que el cierre
es estable frente a los momentos que no le corresponden —si el modelo o la forma lo cambiaran,
estaría afirmando de una clase lo que decidió otra pantalla— y que ninguna revelación sirve a las dos
consignas del momento 2 a la vez.

### 3.6. Reparto y participación

El caso declara cinco personas —Inés, Leo, Mara, Óscar y Julia—, elegidas por lo que esta escena hace
visible y no por completar la lista. Amina queda fuera porque la unidad no media repertorio ni
fuentes: eso es el caso 5. Los **veinte** resultados que el juego presenta como consecuencia de un
diseño o de una revisión —doce pruebas, tres revisiones y cinco cierres— declaran el papel de las
cinco.

Tres observaciones que el dato hace visibles y que ninguna imagen podría inventar:

- **Entrar por el habla y el cuerpo es, por sí mismo, una vía de acceso.** Un motivo que se dice y se
  percute es visible además de sonoro, y por eso Inés decide en las ocho ramas defendibles en lugar
  de quedarse sin vía. Lo que se la quita no es su audición: es el incidente, cuando el motivo deja
  de estar a la vista de nadie, y las dos revisiones se la devuelven de manera explícita.
- **La imitación exacta le da a Óscar un sitio que él no ha pedido.** En las cuatro ramas de modelo
  cerrado propone y el resto se ajusta, y la nota lo atribuye a la consigna de repetir hasta que
  salga igual, no a él. Con el modelo abierto decide como cualquiera. Es su salvaguarda hecha dato.
- **Hay un resultado en el que las cinco personas solo interpretan.** Es el del menú de variaciones
  ya preparadas, y es exactamente lo que significa que el paso a la autoría lo haya dado el docente.
- **Y hay dos en los que nadie tiene vía, porque no hay diseño del que hablar.** Son el enlace
  directo a la prueba y el enlace directo al cierre histórico: los dos declaran cinco `no-route` con
  su nota, en lugar de inventar un aula que no ha ocurrido. El cierre histórico conduce además al
  momento 1, de modo que el caso no puede darse por recorrido sin haber montado nada.

### 3.7. La bitácora registra el proceso más la lente elegida

Desde la segunda auditoría, el contrato lo respalda: `validateCaseDefinition` **rechaza** un
`approachIds` de acción que no pertenezca a los enfoques del caso, con el código
`approach-outside-case`. Sin esa comprobación, una acción podía poner en juego una tradición que la
unidad no cubre y la bitácora la anotaría como recorrida sin que nadie lo viera hasta leer una
entrada guardada.

`combinedApproachIds` anotaba los enfoques declarados por el caso entero. Eso bastaba mientras un
caso combinaba dos tradiciones que se recorrían siempre, pero aquí habría anotado siempre
Orff-Keetman, Willems y Martenot aunque sólo una lente llegue a elegirse: una combinación que el
recorrido no hizo.

La ampliación es la mínima posible. `ActionSchema` admite un `approachIds` **opcional** y
`buildJournalEntry` usa las acciones elegidas **sólo si alguna acción del caso lo declara**; si
ninguna lo hace, el comportamiento anterior queda intacto, y por eso el tutorial 1, el caso 2 y el
caso 6 siguen anotando exactamente lo mismo que antes. En el caso 3 los tres momentos aportan
`orff-keetman` y cada lente la suya, de modo que la bitácora registra el proceso más la lente
realmente elegida, sólo el proceso si no hubo revisión y nada si no hubo ninguna decisión.

### 3.8. Recorridos declarados

Nueve recorridos nuevos en `src/content/playable/walkthroughs.json`. Entre los nueve atraviesan
**todas las acciones del caso**, los **doce resultados de la prueba**, los tres de la revisión, los
cinco cierres, el incidente, la justificación y la bitácora.

| Recorrido | Rama que cubre |
| --- | --- |
| `caso-3-modelo-abierto-y-escucha-graduada` | El camino completo del montador con la primera lente. Mide los cinco tamaños. |
| `caso-3-modelo-cerrado-y-turnos-preparados` | La otra prioridad del momento 1, el cierre por mitades y la segunda lente. |
| `caso-3-rasgo-declarado-con-forma-sostenida` | La segunda exploración defendible: el criterio lo elige cada pareja y la lente auditiva lo hace nombrable. |
| `caso-3-rasgo-declarado-con-mitades` | Modelo común y criterio propio, comprobado por la mitad que escucha con la declaración delante. |
| `caso-3-instrumento-por-delante` | Las láminas primero, el indicio falso del encargo y la revisión que cambia música por calma. |
| `caso-3-variaciones-ya-hechas` | El menú de variaciones del docente y el otro indicio falso del encargo. |
| `caso-3-todas-a-la-vez` | Las doce versiones superpuestas y el reintento que cambia sólo el momento 3. |
| `caso-3-enlace-directo-al-montaje` | Enlace docente a la prueba sin haber montado ningún momento. |
| `caso-3-enlace-directo-a-la-revelacion` | El cierre histórico abierto sin decisiones previas, que declara los huecos y conduce al montaje en lugar de terminar el caso. Mide los cinco tamaños. |

La cobertura declarada de esta unidad va **más allá de la que se exigía a las dos anteriores**: además
de que toda acción tenga recorrido, una prueba exige que **todo resultado de la prueba y del cierre lo
produzca algún recorrido declarado**. Con doce resultados en una sola pantalla, un resultado sin
recorrido es el defecto más fácil de dejar atrás.

Hay además un **estado difícil propio**, `reflexion-sin-montaje`, que abre `c3-reflection` con la
sesión vacía. La pantalla que aparece ahí no la produce ningún recorrido —por definición: es la que
existe cuando no se ha decidido nada—, y la regresión pura sólo demuestra que el guardián dice que
no, no que lo que queda en pantalla se pueda manejar. El arnés la mide en los cinco tamaños y
comprueba en navegador real que no hay «Guardar y cerrar», que aparece el aviso de lo que falta, que
la salida es un objetivo táctil suficiente, que se alcanza con el tabulador y que al activarla con
Intro conduce al momento 1 con sus tres opciones disponibles. Son las rutas de prueba de estados
difíciles las que pasan de diecinueve a **veinte**.

---

## 4. Entrega 4 · Caso 4, «Un entorno que no todos tienen»

Convierte en contenido jugable la unidad `caso-4` de `docs/mapa_campana_m2.md`, con su función
declarada allí: **separar principio y condiciones de transferencia**, sobre el foco «Suzuki:
escucha, imitación y pequeños pasos en su ecosistema; transferencia parcial al aula generalista».

**Estado: aprobada tras auditoría independiente; la puerta de salida de M7A está superada.**
Catorce defectos bloqueantes en cuatro rondas de revisión, y el orden en que aparecieron dice
algo: la primera arregló lo que las pantallas **decían**; la segunda, lo que el juego **hacía** al
recorrerlo; la tercera, lo que el juego **permite hacer a quien lo juega**; la cuarta, lo que el
juego permite hacer **en el estado en que no se ha jugado nada**. Los catorce están corregidos,
cada uno deja regresión y la auditoría de aceptación comprobó después la unidad completa. Los
apartados 4.8 a 4.11 los describen uno a uno.

- Contenido: `src/content/playable/caso-un-entorno-que-no-todos-tienen.json`
  (`un-entorno-que-no-todos-tienen`).
- Reutiliza los sistemas de M6 y M7A: motor determinista, incidente, revisión, justificación por
  gramática, bitácora, reparto declarado, `approachIds` por acción y recorridos. **Hay dos
  ampliaciones acotadas**: la regla de coherencia `partial-design-participation` del apartado 4.7 y
  la atadura de la gramática a las decisiones mediante `requiredTags`, descrita en 4.10 y 4.11.
- **No usa el montador.** El reparto de operaciones de `docs/mapa_campana_m2.md`, apartado 6, da a
  C3 montar una forma y a C4 separar transferencia y dependencia. Montar aquí habría repetido la
  operación de la unidad anterior en lugar de estrenar la suya.
- La unidad queda anunciada como jugable en `src/content/campaign/campaign.json`; portada, mapa,
  ruta presencial y unidad recomendada se derivan de ahí sin ninguna otra edición.
- El caso 3 ya no envía a la campaña: su pantalla de cierre continúa en esta unidad. Es el **único**
  cambio hecho sobre el caso 3, y afecta sólo a `nextLabel` y `nextRoute`.

### 4.1. Qué enseña y de dónde sale

El objetivo musical es **conseguir que un fragmento de cuatro sonidos suene con el mismo perfil y el
mismo final en todo el grupo al terminar los dos minutos, sin que nadie haya necesitado un
instrumento propio ni tiempo de práctica fuera de clase**. Es la evidencia de salida que el mapa pide
—conservar un principio aprovechable y sustituir una dependencia desigual— y tiene una propiedad que
ninguna unidad anterior tenía: **la condición de equidad forma parte del objetivo**. Una rama que
consiguiera el perfil compartido dependiendo del entorno de cada casa no habría cumplido la mitad del
encargo, y una prueba lo comprueba en los ocho cierres.

Es además deliberadamente distinto de lo ya escrito. El tutorial 1 repara una variable, el caso 2
compara dos puertas y el caso 3 monta una forma con autoría. Aquí la finalidad es el **ajuste** de un
fragmento común mediante modelado y repetición, que es lo propio de esta tradición, y la decisión
real del alumnado no está en inventar sino en **decir contra qué se compara cada vuelta y cuándo ya
está**.

Correcciones de `docs/revision_tema_8.md` aplicadas sin convertirlas en pregunta de examen:

- **no era captación ni educación de alumnado superdotado.** Se corrige donde el jugador lo comete:
  una de las lecturas del plan prestado es «ese plan es para alumnado seleccionado por su talento», y
  su devolución responde que la institución que lo desarrolló lo niega expresamente y que su punto de
  partida es el contrario, que la capacidad se desarrolla en un entorno adecuado. La devolución
  atribuye la diferencia **al entorno disponible y no a quién llena cada aula**;
- **no hay cronología ni anécdota.** No aparecen fechas, ni la escuela de Matsumoto, ni Einstein. Una
  prueba lo vigila sobre todos los rótulos;
- **familias o personas cuidadoras**, nunca «las madres»;
- **repertorio cuidadosamente secuenciado**, no «escuchar a los grandes compositores»;
- **la transferencia es parcial y no da una receta universal**, y ese es el caso entero.

### 4.2. El ecosistema no son técnicas alternativas

Es la corrección pedagógica más importante de la entrega. La primera versión hacía elegir entre «la
escucha del modelo» y «los pasos pequeños» como si fueran dos técnicas rivales de la tradición, y no
lo son: allí escuchar mucho, modelar, imitar, repetir y avanzar por pasos pequeños **se sostienen
unos a otros dentro de un mismo entorno**.

La pantalla que obliga a elegir lo dice antes de que nadie elija: «allí nada de eso son técnicas
sueltas […] separarlos es un efecto del traslado, no una propiedad del enfoque». Y el cierre
histórico conserva el ecosistema entero —escucha frecuente, modelado, imitación, repetición, pasos
pequeños, instrumento propio, clase individual, experiencias de grupo y una familia o persona
cuidadora que acompaña la práctica—, declara que **no son alternativas entre sí** y termina diciendo
que la transferencia es parcial y no da una receta universal.

**Y el ciclo completo no se promete antes de obligar a aislar un hilo.** La respuesta que separa
principio y condiciones enumera las **cinco**: continuidad y práctica diaria, enseñanza instrumental
individual, instrumento propio, tiempo fuera de clase y apoyo de una persona cuidadora. Y termina
diciendo lo que el juego hace treinta segundos después: «sin ellas, hoy solo cabe tirar de un hilo».
La versión anterior nombraba tres y afirmaba que escuchar, modelar, imitar y repetir por pasos
pequeños «sí cabe hoy», justo antes de una pantalla que obliga a elegir uno solo. Tres pruebas lo
vigilan: la enumeración en la respuesta, las cinco condiciones puestas en la escena antes de
preguntar por ellas, y la ausencia de la promesa del ciclo entero.

Tampoco se universaliza la repetición en sentido contrario. La opción que la descarta —«en un aula
ordinaria hay que crear, no copiar»— recibe una devolución que la defiende **acotada**: modelar,
imitar y repetir es como crece un fragmento *en esta tradición y en muchas prácticas musicales*, el
defecto está en repetir sin saber qué hay que conseguir, y **no es la receta de cualquier objetivo**.
Una prueba busca las formulaciones universalizadoras en todas las consecuencias y todos los rótulos.

### 4.3. La separación es una decisión, y las tres tensiones tienen su sitio

Separar principio y condiciones se juega en cuatro sitios y en ninguno se resuelve leyendo: la
pantalla del plan prestado, las dos decisiones de diseño, el cierre y la gramática. Es la primera
ocasión en que el jugador **declara un límite de transferencia**, como fija
`docs/matriz_pedagogica_m2.md`, apartado 6.

| Tensión declarada en el mapa | Dónde se resuelve |
| --- | --- |
| Se presupone tiempo fuera de clase. | `c4-principle-daily-home-listening`. Devuelve a la elección de hilo. |
| Se presupone práctica familiar. | `c4-substitute-ask-families`. Devuelve a la elección de sustitución. |
| Se presupone instrumento propio. | `c4-revision-bring-from-home`. Devuelve a la misma revisión. |

Ninguna de las tres llega al incidente: presuponer una condición que el encargo declara indisponible
no es una rama defendible que revisar, y una prueba comprueba que sus destinos nunca son
`c4-incident`.

### 4.4. Ocho cierres, uno por combinación de las tres decisiones

**Éste era el primer bloqueo.** El cierre se resolvía por hilo y revisión e **ignoraba la
sustitución**, de modo que afirmaba de la clase cosas que la sustitución elegida había hecho
imposibles: prometía repeticiones frecuentes a quien había sustituido el medio y no el tiempo, y
callaba qué dependencia seguía en pie. Ahora hay **ocho cierres, uno por combinación**, más el de
reserva para el enlace directo.

Cada cierre tiene tres huellas obligatorias, y las tres se comprueban semánticamente:

| Decisión | Lo que el cierre afirma | Lo que declara pendiente |
| --- | --- | --- |
| Hilo: escucha del modelo | el fragmento «se instaló de oído» | — |
| Hilo: pasos pequeños | «cada paso salió antes» del siguiente | — |
| Sustitución: repeticiones dentro de clase | «las repeticiones ocurrieron aquí» | «seis flautas no llegan a veinticuatro personas» |
| Sustitución: medio compartido | «las flautas rotando por papel declarado» | «la repetición sostenida sigue cabiendo pocas veces» |
| Revisión: objetivo dicho | cada vuelta tuvo «objetivo dicho» | varias «fuentes» del modelo |
| Revisión: varias fuentes | la vuelta llegó por tres «fuentes» | un «objetivo dicho» en cada vuelta |

Las regresiones no buscan palabras sueltas: comprueban que cada cierre **afirma la huella de sus tres
decisiones y no la de las que no se tomaron**, que su barrera nombra la dependencia que su propia
sustitución dejó en pie **y no la de la otra**, y que su tensión declara pendiente lo que aporta la
otra revisión **y nunca lo que aporta la suya**. Las ocho cumplen el objetivo y ninguna gana.

**Y cumplirlo tiene que ser verdad, no una afirmación.** Éste fue el defecto más grave de la segunda
ronda: las cuatro ramas de pasos pequeños afirmaban que al final el fragmento sonaba entero, y nada
en su cadena lo producía. La consigna troceaba en dos sonidos, ninguna de las dos revisiones devuelve
al conjunto —las dos cambian de dónde sale la referencia, no el alcance— y el propio resultado de la
prueba decía que el fragmento entero podía no llegar a sonar. El cierre afirmaba lo contrario de lo
que su propia rama había dicho.

La corrección es de diseño y no de redacción: **la vuelta al conjunto entra en la consigna del paso
pequeño**, que es además lo fiel a la tradición —el repaso del conjunto es parte del método, no un
añadido—. La consigna pasa a ser «dos sonidos […] y el fragmento entero cada dos pasos», y el precio
del troceo deja de ser «puede no sonar nunca» y pasa a ser el real y observable: **volver al conjunto
cuesta tiempo, así que caben menos pasos**.

La regresión sigue la cadena, no la frase: si un cierre afirma el fragmento entero, la **acción
elegida** tiene que comprometerse a producirlo, y el cierre tiene que decir qué lo produjo —«de oído
entero» en el hilo de la escucha, «el conjunto volvió cada dos pasos» en el del paso pequeño—.
Quitar el compromiso de la consigna hace fallar la prueba con el nombre de la rama y el de la acción.
Una segunda prueba comprueba que **las ocho ramas terminables cumplen el objetivo y siguen a la
defensa**, y que la única que no lo cumple —el enlace directo sin decisiones— es la única que
devuelve a la primera decisión.

### 4.5. El incidente

`c4-incident-uneven-start`, familia **transferencia** —la cuarta familia distinta de las cuatro
unidades de M7A—. Cambia una condición que el diseño daba por resuelta: que todo el grupo llegaba al
mismo punto de partida. Revela **un entorno desigual y una relación de grupo**, no un fallo personal
ni una discapacidad como giro sorpresa: la referencia deja de ser el fragmento y pasa a ser una
persona del grupo. Su relato es el mismo para las cuatro ramas defendibles, y una prueba lo vigila.

Las dos revisiones defendibles conservan la escucha, la imitación y la repetición, y cambian sólo de
dónde sale la referencia. **Cada una declara su propio coste** —el objetivo dicho deja el modelo en
una sola fuente; las varias fuentes dejan sin decir qué hay que conseguir—, y ese coste es
exactamente lo que el cierre de esa rama declara pendiente.

La revisión insuficiente es pedir que cada cual traiga un instrumento de casa. Su devolución no
ridiculiza la práctica individual sostenida; dice que el incidente reveló una desigualdad de entorno
y que esta revisión la **traslada** fuera del aula en lugar de repararla.

### 4.6. La gramática habla de la partida, no de cualquier partida

**Éste era el segundo bloqueo.** Las piezas valían para cualquier rama, las dos adaptaciones
reparaban todo —con lo que elegir entre ellas no significaba nada— y alguna evidencia prometía
comprobar justo lo que el cierre declaraba pendiente.

Ahora **cada dimensión corresponde a una decisión real del recorrido**:

| Hueco | Decisión que nombra |
| --- | --- |
| `principleAction` | el hilo del ecosistema por el que entró la sesión, con su límite de transferencia |
| `conditionRisk` | la dependencia que **esa sustitución dejó en pie** |
| `adaptation` | la revisión elegida, **con su coste causal declarado** |
| `evidence` | lo que se comprueba: **la única pieza libre**, y las dos se sostienen en las ocho ramas |
| `evidence` | lo que cualquiera de las ocho ramas hace observable |

Y la comprobación central: **cada una de las dieciséis frases nombra una de las ocho ramas** —hilo,
sustitución y revisión— y se contrasta contra el cierre que esa rama produce de verdad en el motor.
Las dieciséis son ahora **ocho ramas × dos evidencias**: el hilo, el riesgo y la adaptación los fija
la partida, y lo único que queda libre es qué se comprueba.

**Pero eso lo decía el contenido, no el juego.** El defecto que quedaba era que **ningún recorrido
declaraba su gramática**, y el arnés toma la primera opción de cada hueco cuando nadie le dice otra
cosa: las doce bitácoras salían con el hilo de la escucha, el riesgo del medio y el objetivo dicho,
dijeran lo que dijeran las acciones recorridas. La bitácora mezclaba ramas —decía haber montado una
clase y defendía otra— y ninguna prueba lo veía, porque todas miraban el contenido y no la entrada
que el recorrido produce.

Ahora **los doce recorridos declaran su gramática**, la de su propia rama. La regresión ejecuta cada
recorrido de verdad y comprueba que la bitácora resultante **pertenece a una sola rama**: que la
decisión guardada es la recorrida, que el riesgo es el de su sustitución, que la adaptación es la de
su revisión, y que la barrera del cierre que esa rama produjo declara esa misma dependencia. Quitar
el `grammar` de un solo recorrido hace fallar cuatro pruebas.

El validador acompaña: una pieza declarada que no exista en la gramática del caso **ya no valida**.
Sin esa comprobación, una errata dejaba la bitácora escrita con el identificador en crudo y apuntando
a una rama que nadie recorrió, y no se veía hasta leer una entrada guardada.

### 4.7. Reparto y participación, también donde se decide

**Éste era el cuarto bloqueo.** Las seis devoluciones de una decisión de diseño no declaraban
reparto, de modo que el juego mostraba a quién favorece una decisión en unas pantallas y lo callaba
justo en las dos donde se decide el diseño entero. Ahora lo declaran las seis.

El caso declara cinco personas —Inés, Leo, Mara, Óscar y Julia—. Amina queda fuera porque la unidad
no media repertorio ni fuentes: eso es el caso 5. Son **veinticinco resultados con reparto
declarado** —seis devoluciones de diseño, siete pruebas, tres revisiones y nueve cierres— con
**ciento veinticinco notas**.

La ampliación del validador es mínima y de coherencia interna, no de obligación universal: si un caso
declara reparto en **alguna** devolución de diseño, tiene que declararlo en **todas**
(`partial-design-participation`). No exige nada al tutorial 0, al caso 2, al caso piloto ni al banco
de mecánicas, que no lo declaran en ninguna y siguen validando sin tocar una coma; y hace imposible
el caso a medias.

Tres observaciones que el dato hace visibles:

- **El diseño que saca la mejora del aula se la entrega a quien ya tenía el entorno.** Óscar es la
  única persona que decide en la devolución de encargar la escucha en casa, en su resultado, en la
  sustitución que la traslada a las familias y en la revisión que pide traer un instrumento. Una
  prueba comprueba además que **la devolución de la decisión y el resultado que produce reparten la
  agencia igual**: si divergieran, dos pantallas estarían diciendo cosas distintas de la misma
  decisión.
- **Y en las dos revisiones defendibles deja de repartir nada sin que se le retire nada.** Es su
  salvaguarda resuelta por composición del diseño.
- **La vía que falta se atribuye al diseño y se repara al revisar.** Inés queda sin vía en la
  devolución del hilo de la escucha y en la rama que lo combina con las repeticiones dentro de clase,
  y la nota lo dice con precisión: no es su audición, es que esa decisión no ha previsto ninguna vía
  para ver o sentir qué cambia de una toma a la siguiente. Una prueba comprueba que **en los ocho
  cierres no queda nadie sin vía**.

### 4.8. Qué corrigió la primera revisión de la entrega 4

Los cuatro bloqueos, con la regresión que impide que vuelvan:

1. **Los cierres ignoraban la sustitución y contradecían los costes de las ramas.** Ahora son ocho,
   uno por combinación. Tres regresiones semánticas comprueban las huellas de las tres decisiones, la
   dependencia pendiente y el aporte de la otra revisión. Inyectar el defecto —hacer que una rama con
   el medio sustituido declare pendiente el medio— hace fallar tres pruebas a la vez.
2. **La gramática borraba las decisiones, hacía que las dos adaptaciones repararan todo y
   contradecía los cierres.** Ahora cada hueco nombra una decisión, cada adaptación declara un coste
   propio y distinto, y las dieciséis frases se contrastan contra la rama que nombran. Quitar el
   coste de una adaptación hace fallar dos pruebas.
3. **La escucha y los pasos pequeños se presentaban como técnicas excluyentes**, y la defensa de la
   repetición la universalizaba. Corregido en la pantalla de elección, en el cierre histórico y en la
   devolución de la opción que la descarta, con una prueba por cada pieza.
4. **Las seis devoluciones de diseño no declaraban reparto.** Ahora lo declaran, con la regla de
   coherencia en el validador y una regresión por mutación que la comprueba.

Además, tres desincronizaciones que no eran del caso pero mentían sobre él: la portada anunciaba
«dos unidades históricas jugables» con una cifra escrita a mano, el plan maestro seguía contando
«dos con contenido y siete pendientes», y el paquete PLATEA se seguía llamando `m6`. Corregidas las
tres, y la de la portada por composición: la cifra vive en la nota gris, que se deriva, y el
antetítulo dice el estado sin repetirla (regla 4 de M5).

También se corrigió la bitácora: decía «Mantengo la dependencia que sustituí», que afirma justo lo
contrario de lo que ocurre —la dependencia es lo que se quitó de en medio—. Ahora dice «Mantengo la
sustitución que hice», y una prueba impide que vuelva la forma anterior.

### 4.9. Qué corrigió la segunda revisión

Cinco defectos más, de una clase distinta: la primera ronda corrigió lo que las pantallas decían; la
segunda, lo que el juego hacía.

1. **Cuatro ramas afirmaban un objetivo que su propia cadena no producía.** Las de pasos pequeños
   daban por sonado el fragmento entero sin que ninguna acción ni ninguna revisión devolviera al
   conjunto. La vuelta al conjunto entra en la consigna y el precio del troceo pasa a ser el tiempo.
   Véase el apartado 4.4.
2. **La gramática no estaba atada al recorrido.** Ningún recorrido declaraba sus piezas, así que las
   doce bitácoras describían la misma rama. Los doce las declaran ahora, y una regresión ejecuta cada
   uno y comprueba que la entrada pertenece a una sola rama. Véase el apartado 4.6.
3. **Los costes de las dos revisiones eran artificiales.** «A cambio de que el modelo siga saliendo
   de una sola fuente» y «a cambio de que nadie diga qué hay que conseguir» eran carencias afirmadas
   sin causa: nada impedía hacer las dos cosas a la vez. Ahora las dos gastan **el mismo recurso
   escaso** —los dos minutos— en sitios distintos y contables: decir el objetivo y juzgarlo ocupa el
   hueco entre vuelta y vuelta; encadenar las tres fuentes ocupa el arranque de cada una. Las dos
   cobran en **vueltas que dejan de sonar**, y las dos ofrecen contarlas.
4. **La separación de condiciones estaba incompleta y se contradecía.** Nombraba tres de las cinco y
   afirmaba que el ciclo completo cabía, justo antes de obligar a aislar un hilo. Véase el
   apartado 4.2.
5. **Dos recuentos mentían.** El plan maestro seguía diciendo «cuatro de las nueve unidades
   escritas» en su párrafo de estado, y una prueba se llamaba «los quince resultados» mientras
   comprobaba diecinueve.

Los cinco se verificaron **reinsertando el defecto** y comprobando que las pruebas fallan por la
relación semántica rota, no por una palabra ausente: el compromiso con el conjunto que falta en la
acción, la bitácora que describe otra rama, el coste que no dice dónde se va el tiempo y la respuesta
que vuelve a prometer el ciclo entero.

### 4.10. Qué corrigió la tercera revisión

Cuatro defectos más. Los tres primeros comparten raíz: **lo que se había atado era el guion, no el
juego**.

1. **La gramática seguía suelta para quien juega.** La corrección anterior declaró la gramática en
   los doce recorridos, y eso arregló las bitácoras del arnés; pero la pantalla de justificación
   seguía ofreciendo las seis piezas de principio, riesgo y adaptación en todas las ramas. Quien
   jugaba podía montar una clase y defender otra —el principio de una rama, el riesgo de otra, la
   adaptación de una tercera— sin que nada se lo impidiera.

   La corrección amplía de forma acotada el contrato y el intérprete: una pieza de
   gramática puede declarar `requiredTags`, y la pantalla **sólo ofrece las que la partida ha puesto
   en juego**. `selectGrammar` recibe ahora el caso y **no acepta** una pieza que no se ofrezca, de
   modo que forzarla desde fuera tampoco funciona. **Las dos evidencias no declaran etiquetas**:
   siguen siendo una elección genuina, defendible en las ocho ramas, que es lo que el caso pide.

   El campo es opcional y no cambia nada donde no se declara: el tutorial 0, los casos 2, 3 y 6 y el
   banco de mecánicas siguen ofreciendo todas sus piezas y validan sin tocar una coma. Y si el filtro
   dejara un hueco vacío —quien entra por enlace directo sin haber decidido nada— se ofrecen todas:
   sin recorrido no hay rama a la que ser infiel, y bloquear la pantalla contradiría que el progreso
   orienta y no bloquea.

2. **La alternativa defendible de la bitácora conservaba los costes derogados.** Seguía comparando
   «a cambio de que el modelo siga saliendo de una sola fuente» con «a cambio de que nadie diga qué
   se busca», que son exactamente las dos carencias sin causa que la segunda ronda había sustituido.
   Ahora compara lo que de verdad se paga: las dos revisiones gastan los mismos dos minutos en
   sitios distintos y las dos dejan menos vueltas sonando, y cuál compensa se decide contándolas.

3. **Las dos formulaciones del principio nombraban tres condiciones de cinco.** Decían «casa,
   instrumento y acompañamiento» cuando el caso ya había separado cinco. Ahora las dos las mantienen
   enteras: continuidad y práctica diaria, enseñanza individual, instrumento, tiempo fuera de clase y
   apoyo cuidador.

4. **Dos notas de reparto contradecían la consigna.** Las de Mara decían que proponía probar el
   fragmento entero «y el diseño no ha reservado sitio para eso», escritas cuando el paso pequeño no
   volvía nunca al conjunto. Desde la segunda ronda la consigna vuelve al conjunto cada dos pasos, de
   modo que la nota negaba algo que el propio diseño hace. Ahora dicen dónde cuenta su oído —en la
   vuelta al conjunto— y qué propone: adelantarla.

Las regresiones de esta ronda **juegan las ocho ramas como las jugaría una persona**, escena a
escena, y no sólo ejecutan recorridos: comprueban qué ofrece la pantalla en cada rama, que una pieza
válida de otra rama se rechaza, que las dos evidencias siguen disponibles en las ocho, y que las
dieciséis defensas resultantes producen una bitácora completa —**todos** sus campos, sin plantillas
sin sustituir, sin huecos pendientes y sin una sola palabra de otra rama—. El validador rechaza
además un hueco atado a medias y una pieza que exija una etiqueta que ninguna acción pone en juego.

### 4.11. Qué corrigió la cuarta revisión

Un defecto sustancial, y era la costura que la tercera ronda había dejado sin coser.

`grammarChoices` filtraba las piezas por la rama, pero **si el filtro dejaba un hueco vacío devolvía
todas**. La reserva parecía prudente y era justo lo contrario: convertía el enlace directo a la
justificación —el estado donde no hay ninguna clase de la que hablar— en el más permisivo del caso.
Cualquiera podía abrir `#/caso/un-entorno-que-no-todos-tienen/c4-justification` y construir la
defensa completa de una rama que nadie había jugado. Lo mismo con un recorrido a medias: los tres
huecos ligados se abrían de golpe en cuanto faltaba una sola decisión.

Ahora la regla es sencilla y no tiene reserva: **un hueco que no usa `requiredTags` ofrece siempre
todas sus piezas; un hueco ligado ofrece sólo las de la rama presente, y si no hay ninguna se queda
vacío.** `selectGrammar` rechaza en consecuencia todas las piezas de un hueco vacío.

Y la pantalla que queda **orienta en lugar de bloquear**. Cuando falta alguna decisión, la
justificación no pinta el formulario —tres desplegables vacíos son una tarea imposible—: dice qué
huecos dependen de qué falta y lleva a la primera pantalla capaz de abrirlo. Esa pantalla **se
deriva del contenido**: de las etiquetas que pide el hueco, de las acciones que las aportan y de la
escena a la que esas acciones pertenecen, en el orden en que el caso las declara. No hay ninguna
escena escrita a mano, de modo que un caso futuro que ate su gramática obtiene la orientación sin
tocar el intérprete. Y no se habla de «montaje»: es la operación del caso 3, no la de éste.

Se corrigieron además los recuentos de este documento y del plan maestro, que seguían diciendo
«cuatro correcciones» y «dos revisiones» al lado de tres rondas y trece hallazgos.

**Un arreglo más, del mismo mecanismo y sin efecto en el contenido publicado.** La orientación de un
hueco vacío buscaba dónde se consiguen las etiquetas que sus piezas **exigen**, no las que
**faltan**. Con las piezas de una sola etiqueta que usa el caso 4 las dos cuentas coinciden, así que
el defecto era latente; pero el contrato admite piezas con varias, y ahí manda de vuelta a una
pantalla ya resuelta: si una pieza pide `a` y `b` y la partida ya tiene `a`, la salida apuntaba a
`a` y quien juega daría vueltas en la decisión que ya tomó. Ahora se descuentan las etiquetas
activas antes de buscar. La regresión monta una variante sintética del caso con dos piezas de dos
etiquetas —el contenido publicado no se toca— y comprueba las tres cosas: que sin decisiones orienta
al primer momento, que con la primera etiqueta ya conseguida la orientación **se mueve** a la que
falta, y que al obtenerla el hueco se abre con la pieza correcta y sigue rechazando la otra.

**Y la medición encontró lo suyo.** La primera versión de la pantalla de orientación ponía el aviso
**encima** del formulario, y eso la hizo desbordar 283 px en 360 × 640, 94 en 1366 × 768 y 39 en
390 × 844. Sustituir el formulario por la orientación lo dejó en 30 px, sólo en 360 × 640; los
últimos 30 se fueron al quitar la introducción de la escena, que en esa pantalla explicaba cómo
elegir entre piezas que no están y duplicaba lo que el aviso ya dice (regla 4). Ningún texto se ha
encogido: lo que cambió fue qué se muestra a la vez.

El nuevo estado difícil `defensa-sin-decisiones` lo mide el arnés en los cinco tamaños, con nueve
comprobaciones en Chrome real: que no queda ninguna pieza en pantalla, que el aviso explica qué
falta sin hablar de montaje, que no se ofrece llevar nada a la bitácora, que la salida es objetivo
táctil suficiente, que apunta a la primera decisión, que se alcanza con el tabulador, que muestra
foco visible y que al activarla con Intro conduce a esa pantalla con sus tres opciones disponibles.
Las rutas de prueba pasan de veinte a **veintiuna**.

### 4.12. Recorridos declarados

Doce recorridos nuevos en `src/content/playable/walkthroughs.json`, ocho de ellos uno por rama, de
modo que **cada uno de los ocho cierres lo produce un recorrido declarado**. Los doce **declaran su
gramática**, de manera que la bitácora que producen es la de su propia rama y las dos evidencias
quedan repartidas entre ellos. Entre los doce
atraviesan todas las acciones del caso, los siete resultados de la prueba, los tres de la revisión,
los nueve cierres, el incidente, la justificación y la bitácora.

| Recorrido | Rama que cubre |
| --- | --- |
| `caso-4-escucha-tiempo-objetivo` | Escucha del modelo, repeticiones dentro de clase y objetivo dicho. Mide los cinco tamaños. |
| `caso-4-escucha-tiempo-fuentes` | El mismo diseño con la otra revisión: el cierre tiene que cambiar. |
| `caso-4-escucha-medio-objetivo` | El mismo hilo y revisión con la otra sustitución: cambia la dependencia pendiente. |
| `caso-4-escucha-medio-fuentes` | Escucha del modelo sin instrumento propio y con el modelo repartido. |
| `caso-4-pasos-tiempo-objetivo` | El otro hilo con las repeticiones dentro de clase y el criterio público. |
| `caso-4-pasos-tiempo-fuentes` | Pasos pequeños repetidos aquí dentro, sin criterio dicho. |
| `caso-4-pasos-medio-objetivo` | Pasos pequeños sin instrumento propio y con objetivo dicho. |
| `caso-4-pasos-medio-fuentes` | La combinación que menos condiciones supone de las ocho. |
| `caso-4-deberes-en-casa` | La evidencia aplazada, la lectura por selección de talento, el hilo encargado en casa y la revisión que traslada la desigualdad. |
| `caso-4-acompanamiento-en-casa` | Medir a quien ya tocaba, culpar a la repetición y el acompañamiento convertido en requisito. |
| `caso-4-enlace-directo-a-la-prueba` | Enlace docente a la prueba sin haber separado nada. |
| `caso-4-enlace-directo-a-la-revelacion` | El cierre histórico sin decisiones previas. Mide los cinco tamaños. |

---

## 5. Comprobaciones

### 5.1. Entrega 1

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

#### Lo que encontró la medición

**Cuatro caracteres de más en el pie rompieron la regla 6 en todas las pantallas de acción.** Al
cambiar la etiqueta del pie de «M6» a «M7A en curso», el texto pasaba a ocupar una línea más en
360 × 640 y 390 × 844, y `main` perdía 12 px. El resultado: **todas** las pantallas de acción de los
tres casos y del banco de mecánicas se desplazaban 12 px, y la justificación del caso 6 abierta por
enlace directo, 23 px. Ninguna tenía nada que ver con el contenido nuevo.

Es exactamente el defecto que el arnés existe para encontrar: no se ve leyendo el cambio, no se ve
en un tamaño de escritorio y aparece en todas partes a la vez. La etiqueta se acortó a «M7A» y la
medición volvió a quedar limpia. Conviene recordarlo antes de tocar cualquier texto del encabezado
o del pie: son las dos únicas piezas que restan altura a todas las pantallas del juego.

### 5.2. Entrega 2 · auditoría y comprobaciones reales

La auditoría se ejecutó contra la base aprobada `60a0518` y encontró cinco defectos bloqueantes: dos
cierres contradecían el papel docente elegido; dos ramas aprobadas seguían dependiendo del oído; la
gramática permitía cruzar riesgo, adaptación y evidencia sin relación; el cierre anticipaba el Caso 3;
y las siete rutas del caso desplazaban la pantalla final en 360 × 640. Se corrigieron sin recortar
texto pedagógico ni anticipar unidades pendientes.

- **`pnpm check`: 259 pruebas en once archivos**, validación real de los cinco casos, análisis
  exhaustivo de reglas, salvaguardas de participación, campaña, recorridos, TypeScript estricto,
  compilación Vite y paquete PLATEA regenerado.
- Las regresiones del caso recorren las **ocho combinaciones** de puerta × papel docente × revisión,
  exigen que las cuatro pruebas iniciales pidan revisión, que los cuatro cierres sean coherentes y que
  nadie quede sin vía en ellos. También fijan las dieciséis combinaciones de principio × riesgo ×
  adaptación × evidencia que ofrece la gramática y prohíben adelantar unidades pendientes en el
  cierre.
- **Los 23 recorridos declarados llegan a su pantalla de cierre**, producen bitácora completa y
  atraviesan todas las acciones de las dos unidades de M7A.
- **`pnpm measure:viewports --runs=3`:** los 23 recorridos se completan en 51 combinaciones de
  recorrido y tamaño, 922 pantallas de recorrido por pasada con desplegables cerrados y abiertos,
  más 95 pantallas de referencia y estados difíciles. Las tres pasadas son idénticas.
- Una comprobación independiente más exigente, **`--runs=1 --all-viewports`**, completa los 23
  recorridos en los cinco tamaños: 115 combinaciones y 2.290 pantallas de recorrido. En ambas
  mediciones no hay desbordamiento horizontal, ninguna pantalla de acción se desplaza y el objetivo
  táctil mínimo es 44 px.
- El cierre histórico conserva su explicación completa dentro de un marco accesible que cede 18 px
  en 360 × 640: recibe foco, tiene nombre y se desplaza con flechas. La salida literal queda en
  `docs/medicion_tamanos_m7a_salida.md`.

### 5.3. Entrega 3 · comprobaciones reales

Ejecutadas con las herramientas del proyecto sobre la base aprobada `f1d6e7e`, con Node 24.19.0 y
pnpm 11.19.0, y con Chrome real para el arnés.

- **`pnpm check`: 331 pruebas en once archivos**, código de salida 0. Incluye la validación real de
  los seis casos publicados, el análisis exhaustivo de reglas alcanzables, las salvaguardas de
  participación, la campaña, los recorridos, TypeScript estricto, la compilación con Vite y el
  paquete PLATEA regenerado. Las **veintiséis** pruebas del caso 3 son las descritas arriba.
- **`pnpm measure:viewports --runs=3`:** los 32 recorridos declarados se completan en 68
  combinaciones de recorrido y tamaño, 1257 pantallas de recorrido por pasada con los desplegables
  cerrados y abiertos, más **20 rutas de referencia y estados difíciles en los cinco tamaños, 100
  pantallas**. Las tres pasadas son idénticas y el código de salida es 0.
- **`pnpm measure:viewports --runs=1 --all-viewports`,** comprobación independiente más exigente:
  los 32 recorridos en los cinco tamaños, **160 combinaciones y 3225 pantallas de recorrido**. En las
  dos mediciones no hay desbordamiento horizontal, **ninguna pantalla de acción se desplaza** en
  ningún tamaño ni estado, y el objetivo táctil mínimo es 44 px.
- Salida literal en `docs/medicion_tamanos_m7a_salida.md`, regenerada por el propio arnés.
- **Un aviso sobre el arnés, no sobre el contenido:** de las tres ejecuciones de `--all-viewports`,
  una salió con código 1 **sin llegar a imprimir resumen**, y las otras dos dieron resultados
  idénticos y limpios. El fallo estuvo en el arranque de Chrome, no en una medición: cuando el arnés
  encuentra un desbordamiento lo dice y lo localiza. Conviene tenerlo en cuenta para no leer un
  código 1 sin resumen como un fallo de composición, y para volver a ejecutarlo antes de concluir
  nada.
- El caso contiene **32 consecuencias, 20 de ellas con reparto declarado**: doce resultados de
  prueba, tres de revisión, cinco cierres y las doce que el montador no llega a mostrar.

**Estado de la entrega 3: aprobada tras auditoría independiente.** Los nueve hallazgos encontrados en
tres rondas quedaron corregidos, cubiertos por regresiones o comprobaciones de navegador y
comprobados de nuevo; la cobertura final incluye el enlace directo a la reflexión vacía en Chrome
real y en los cinco tamaños.

#### Las regresiones se comprobaron rompiendo el contenido a propósito

Ninguna se ve leyendo el archivo seguido, y todas son la clase de defecto que aparece cuando un caso
crece a veinte resultados declarados. Las catorce de esta lista cubren el contenido y el contrato:
las cuatro primeras acompañan a la entrega y las diez restantes fijan los defectos y las debilidades
de sus primeras correcciones. La laguna final de cobertura se comprueba mediante las seis aserciones
de navegador que recoge la medición.

1. **Un cierre compartido entre ramas incompatibles.** Al apuntar la regla de «terreno común +
   escucha graduada» al cierre de la otra exploración, el contenido deja de validar antes de que
   ninguna prueba llegue a ejecutarse: `scenes.c3-reveal.consequenceIds: Ningún recorrido válido
   produce c3-reveal-limit-listening`.
2. **Una lente ocupando uno de los tres momentos.** Al añadir la etiqueta `revision-listening` a una
   acción del momento 2, el analizador declara **tapada** la regla del cierre con entradas preparadas
   y **muerta** su consecuencia. La prueba estructural falla además por su cuenta.
3. **Una vía de participación perdida tras revisar.** Al cambiar un `decides` por `no-route` en el
   cierre de «terreno común + entradas preparadas», falla con el nombre propio:
   `c3-reveal-limit-entries: ines: expected 'no-route' not to be 'no-route'`.
4. **Una gramática que permite una combinación incoherente.** Al quitar la vía visual y vibratoria de
   una de las dos adaptaciones, las dieciséis combinaciones dejan de ser defendibles y la prueba lo
   dice sobre la pieza concreta.
5. **Un cierre que niega el rasgo que el objetivo exige.** Reescribir el aprendizaje de un cierre
   para que diga que las versiones no conservan nada falla con
   `c3-reveal-declared-listening niega el rasgo que el objetivo exige`.
6. **Un riesgo de la gramática que ninguna adaptación repara.** Sustituir el riesgo del aire y el
   cambio sin anunciar por el del modelo y el instrumento falla con
   `c3-risk-air-and-surprise no nombra la condición que dice reparar`. La comprobación es de ida y
   vuelta a propósito: mirar sólo si el caso pone la condición encima dejaba pasar que alguien
   reescribiera el riesgo y hablara de otra cosa, y así se coló la primera vez.
7. **Un cierre compartido que inventa reparto.** Poner `decides` a las cinco personas en el cierre
   por enlace directo falla con `ines: expected 'decides' to be 'no-route'`.
8. **Un cierre compartido que termina el caso sin montar nada.** Devolverlo a la justificación falla
   por tres sitios: la regresión de destino, y los dos recorridos declarados que dejan de recorrer lo
   que dicen recorrer.
9. **Una bitácora que atribuye una lente que nadie eligió.** Declarar `willems` en una acción del
   momento 3 falla con `expected [ 'orff-keetman', 'willems', 'martenot' ] to deeply equal
   [ 'orff-keetman', 'martenot' ]`.
10. **La atribución histórica duplicada fuera de la revelación.** Devolver «Orff-Schulwerk se elaboró
    con Gunild Keetman» a la consecuencia del instrumento falla con
    `c3-outcome-instruments-first repite la atribución`.
11. **Una evidencia respaldada sólo por lo que falta.** Quitar del cierre de la lente auditiva la
    frase que afirma el turno falla con `«c3-evidence-turn-in-form» no está respaldada en positivo
    por c3-reveal-limit-listening`.
12. **Una evidencia que vuelve a prometer lo que su rama declara pendiente.** Devolver a la opción el
    texto de los cortes percibidos sin aviso falla con `c3-evidence-turn-in-form habla de otra cosa`.
    La tabla de relaciones se comprueba **contra la opción y contra el cierre**: anclarla sólo en el
    identificador dejaba reescribir la evidencia sin que nada fallara, y así se coló la primera vez.
13. **Una reflexión vacía que vuelve a poder cerrar el caso.** Neutralizar `canFinishCase` falla en
    la regresión que comprueba, además, que la entrada resultante no pasa `ProgressSchema`.
14. **Un enfoque de acción ajeno al caso que el contrato acepta.** Neutralizar la comprobación falla
    en la regresión por mutación, que declara `suzuki` en una acción del caso 3.

#### Lo que corrigió la segunda auditoría

Tres defectos que las comprobaciones anteriores no veían:

1. **La gramática seguía permitiendo cruces que los propios cierres negaban.** «Escucha graduada +
   oír los cortes» y «entradas preparadas + nombrar el rasgo» prometían comprobar exactamente lo que
   esa rama declara pendiente: ocho de las dieciséis frases. Las dos evidencias pasan a decir lo que
   el montaje garantiza en las cuatro ramas —que cada pareja pueda decir qué rasgo conserva su
   versión, y que cada versión ocupe su turno dentro de la forma—, y las cuatro revelaciones lo
   afirman en positivo. Lo que cada lente añade por encima de eso, y lo que la otra deja pendiente,
   sigue estando donde estaba: en el cierre. **Las lentes no se funden ni pierden su coste.**
2. **El enlace directo a la reflexión ofrecía cerrar el caso sin decisiones.** La bitácora salía sin
   ningún enfoque recorrido y `ProgressSchema` lanzaba al guardar. Ahora la pantalla no ofrece el
   cierre y orienta al momento que falta. El criterio no es una regla aparte: `canFinishCase`
   comprueba la entrada **contra el propio contrato de progreso**, de modo que no puede divergir de
   él.
3. **El contrato no comprobaba `approachIds` por acción.** Ya lo rechaza, con regresión por mutación.

#### Lo que encontró la medición

**La pantalla de revisión del caso 3 se desplazaba 33 px en 360 × 640, y la causa no era donde
parecía.** El primer intento —recomponer la introducción y apretar los rótulos de las tres opciones,
sin perder ninguna proposición— bajó el desbordamiento a 23 px y **ahí se quedó**: quitar 130
caracteres más de los rótulos no movió la cifra ni un píxel.

La causa estaba en la otra mitad de la pantalla. `feedbackCard` dibuja «Sostiene» y «Tensiona`
**fuera** del panel de razonamiento, que es el bloque que encoge y se desplaza por dentro; y el
«Sostiene» de las dos revisiones con lente era el texto más largo escrito hasta ahora en el proyecto,
porque incluía la atribución histórica completa de Willems y de Martenot. Esa atribución **ya estaba
entera en la pantalla de revelación**, que es su sitio: repetirla en la consecuencia no añadía nada
que el recorrido no fuera a leer treinta segundos después. Al dejarla sólo allí, la regla 6 vuelve a
cumplirse con margen en los cinco tamaños, y la introducción de la pantalla de revisión se ha
restaurado entera.

Es el defecto que el arnés existe para encontrar, y con una lección nueva: **el desbordamiento de una
pantalla de acción no siempre está en el texto que se acaba de escribir**. Antes de recortar un
rótulo conviene mirar qué partes de la consecuencia quedan fuera del bloque que encoge.

**La pasada de corrección volvió a romper la regla 6, y por la razón contraria.** Al sustituir la
exploración sin límite por el criterio declarado, la pantalla del momento 2 pasó a desplazarse 11 px
en 360 × 640: el rótulo nuevo tenía siete caracteres más que el viejo y eso bastó para cruzar a una
cuarta línea. Acortar la introducción no movió la cifra —seguía ocupando las mismas cuatro líneas—,
y sólo se arregló cuando los dos textos bajaron **por debajo de su límite de línea**, no cuando
adelgazaron.

La lección práctica es medir en líneas y no en caracteres: **entre 133 y 140 caracteres hay una línea
entera de diferencia, y entre 140 y 170 puede no haber ninguna.** Quien escriba las unidades que
faltan hará bien en comprobar el arnés después de cambiar cualquier rótulo de una pantalla de acción,
por pequeño que parezca el cambio.

### 5.4. Entrega 4 · comprobaciones reales

Ejecutadas con las herramientas del proyecto sobre la base aprobada `21a9dac`, con Node 24.19.0 y
pnpm 11.19.0, y con Chrome real para el arnés. Son las de **después** de corregir los cuatro
bloqueos del apartado 4.8.

- **`pnpm check`: 454 pruebas en once archivos**, código de salida 0. Incluye la validación real de
  los siete casos publicados, el análisis exhaustivo de reglas alcanzables, las salvaguardas de
  participación, la campaña, los recorridos, TypeScript estricto, la compilación con Vite y el
  paquete PLATEA regenerado, que ahora se llama `m7a` y no `m6`.
- **`pnpm measure:viewports --runs=3`:** los 44 recorridos declarados se completan en 88
  combinaciones de recorrido y tamaño, **1677 pantallas de recorrido por pasada** con los
  desplegables cerrados y abiertos, más **21 rutas de referencia y estados difíciles en los cinco
  tamaños, 105 pantallas**. Las tres pasadas son idénticas y el código de salida es 0.
- **`pnpm measure:viewports --runs=1 --all-viewports`:** los 44 recorridos en los cinco tamaños,
  **220 combinaciones y 4545 pantallas de recorrido**. En las dos mediciones no hay desbordamiento
  horizontal, **ninguna pantalla de acción se desplaza** en ningún tamaño ni estado, y el objetivo
  táctil mínimo es 44 px.
- Salida literal en `docs/medicion_tamanos_m7a_salida.md`, regenerada por el propio arnés.
- El caso contiene **31 consecuencias, 25 de ellas con reparto declarado**: seis devoluciones de
  diseño, siete resultados de prueba, tres de revisión y nueve cierres, con 125 notas de reparto.

#### Las regresiones se comprobaron rompiendo el contenido a propósito

Las tres correcciones de contenido se verificaron **reinyectando el defecto** y comprobando que la
prueba falla con su mensaje, no sólo que pasa con el contenido bueno:

1. **Un cierre que vuelve a ignorar la sustitución.** Apuntar la regla de una rama con el medio
   sustituido al cierre de la rama con el tiempo sustituido rompe el contenido antes de que ninguna
   prueba llegue a ejecutarse: `scenes.c4-reveal.consequenceIds: Ningún recorrido válido produce
   c4-reveal-listening-medium-target`.
2. **Un cierre que declara pendiente la dependencia equivocada.** La variante sutil —dejar el cierre
   alcanzable y cambiarle sólo la barrera— falla en **tres** pruebas a la vez, incluida la de la
   gramática: `c4-reveal-listening-medium-target: la barrera no nombra la dependencia que queda`.
3. **Una adaptación que vuelve a repararlo todo.** Quitarle el coste declarado falla en dos:
   `c4-adapt-several-sources no declara ningún coste` y la comprobación de las dieciséis frases.
4. **Los hilos presentados como técnicas alternativas.** Reescribir la pantalla de elección como «el
   enfoque ofrece dos técnicas distintas […] elige una u otra» falla con `expected 'el enfoque ofrece
   dos técnicas distin…' to contain 'se sostienen unos a otros'`.
5. **Una devolución de diseño sin reparto.** Quitarle `participation` a una de las seis falla en el
   validador con `partial-design-participation`, y la regresión por mutación lo fija.

#### Lo que no encontró la medición, y por qué conviene decirlo

La medición salió limpia en las dos pasadas, igual que en las dos versiones anteriores de esta
entrega. Eso **no** significa que la entrega estuviera bien: los catorce bloqueos de los apartados
4.8 a 4.11 eran de contenido, de coherencia causal y de lo que el juego deja hacer, y el arnés mide
composición y accesibilidad. La cuarta ronda es la excepción parcial que confirma para qué sirve:
la pantalla nueva que resolvía su defecto desbordaba en tres tamaños, y eso **sí** lo vio el arnés.

Y hay algo más incómodo que conviene dejar escrito, porque ha pasado **cuatro veces seguidas**: cada
ronda encontró sus defectos con la suite en verde y con las regresiones de la ronda anterior ya
escritas. La progresión es la lección:

1. la primera comprobaba que **cada pantalla decía lo suyo**, y no que las pantallas se dijeran lo
   mismo entre sí;
2. la segunda comprobó eso, y no que **la cadena de decisiones produjera** lo que el cierre afirma;
3. la tercera comprobó eso, y no que **el juego impidiera a quien lo juega** hacer lo que el
   contenido daba por imposible;
4. la cuarta comprobó eso para las ocho ramas, y no para **el estado en que no hay ninguna rama**,
   donde una reserva bienintencionada volvía a abrirlo todo.

Las cuatro veces el contenido estaba bien redactado y las cuatro veces faltaba una capa. La cuarta
añade un aviso concreto: **desconfíe de los caminos de reserva.** «Si no hay nada que ofrecer,
ofrécelo todo» parecía la opción amable y era la puerta trasera de la regla entera. La lección
práctica para quien escriba las unidades que faltan: **una prueba que sólo lee el contenido no
comprueba el juego.** Después de leer, recorra la rama y pregunte qué acción produjo cada cosa que
se afirma; y después de recorrerla, siéntese en la pantalla y pregunte qué **más** le deja hacer el
juego a alguien que no siga el guion.

---

## 6. Qué **no** contiene esta entrega

Ninguna de estas ausencias es un olvido; son el alcance que las entregas no tenían.

- **No hay sistemas nuevos fuera de dos ampliaciones acotadas.** La entrega 4 añadió la regla de
  coherencia `partial-design-participation` al validador y `requiredTags` a las piezas de gramática,
  con su filtrado, orientación y estado difícil. No modificó el motor determinista ni el montador.
- **No hay nada de M7B**: ni Campbell/WMP, ni Green/PME más allá del caso piloto que ya existía, ni
  Schafer, ni Gordon, ni el caso final.
- **No hay arte de M8.** Todo lo visible sigue siendo tipografía, color, retícula y la silueta
  trazada de M5; todo lo audible sigue sintetizado y siguen siendo seis señales.
- **M7A está completa y su puerta de salida se ha superado.** El lote histórico tiene sus cuatro
  tradiciones escritas y las cuatro entregas han pasado auditoría independiente. La cuarta necesitó
  catorce correcciones bloqueantes antes de que la auditoría de aceptación comprobara el conjunto.

## 7. Límites abiertos que quien continúe no debe dar por resueltos

- **Los tiempos de las cuatro unidades siguen siendo una hipótesis de diseño.** El tutorial 1 tiene
  diez escenas y catorce pantallas en un recorrido sin reintentos; el caso 2, diez escenas y catorce
  pantallas; el caso 3, once escenas y trece pantallas; el caso 4, diez escenas y quince pantallas,
  con siete, ocho, diez y nueve minutos declarados respectivamente. El caso 4 es el que más
  pantallas encadena en total, y el tutorial 1 el que más pantallas por minuto declarado; son los dos
  primeros sitios donde mirar al medir de verdad. Medirlo de verdad es
  M7C, igual que el recorte editorial.
- **El caso 3 es la unidad con más resultados declarados de la campaña**: veinte con reparto, doce de
  ellos en una sola pantalla de prueba. La combinación de tres momentos crece de forma multiplicativa,
  y conviene tenerlo en cuenta antes de añadir un cuarto hueco a cualquier caso futuro: con seis
  escenas de elección, el análisis exhaustivo del motor se acercaría a su límite de 20 000 estados.
- **En 360 × 640, el relato del incidente del tutorial 1 se desplaza 124 px por dentro de su
  recuadro** y el marco histórico del Caso 2, 18 px. Ningún texto se ha encogido: ambos bloques
  reciben foco, tienen nombre accesible y responden a las flechas, y la pantalla no se desplaza.
  Conviene observarlos en el piloto de M10.
- **El reparto crece por unidad y no por acumulación:** cuatro personas en el tutorial 1, cinco en el
  caso 2, cinco en el caso 3, cinco en el caso 4 —con 25 resultados declarados, la unidad con más de
  la campaña— y seis en el caso 6. Amina sigue sin aparecer en
  ninguna unidad de M7A, y no por olvido: media repertorio, fuentes y contexto cultural, que es el
  caso 5. **M7B tendrá que darle una unidad donde lo que aporta sea el asunto**, o el reparto
  compartido habrá declarado a alguien que el juego nunca usa.
- **La regla de reparto en las devoluciones de diseño sólo obliga al caso 4.** El validador exige
  coherencia interna —o todas, o ninguna—, y el tutorial 0, el caso 2, el caso piloto y el banco de
  mecánicas no lo declaran en ninguna. Extenderla a esas unidades es trabajo editorial sobre
  contenido aprobado y no pertenecía a esta entrega, pero es el siguiente paso natural de la
  ampliación de M6.
- **La cobertura declarada completa sólo se exige a las cuatro unidades de M7A.** El tutorial 0, el
  caso piloto y el banco de mecánicas siguen teniendo cinco acciones que ningún recorrido consume:
  `observe-choice` y `repair-more-colours`; `brief-instruments-only` y
  `revision-dictate-equal-parts`; y `probe-action-single-form`. Son contenido de M4 y M6 y siguen
  fuera de estas entregas, pero extender la regla a los tres casos es trabajo pequeño y la campaña ya
  ha crecido dos veces desde que se anotó.
- **La ruta presencial ya tiene sus tres tramos con contenido.** Sus tiempos siguen sin medirse, que
  es el encargo de M7C. Ni el caso 2, ni el 3, ni el 4 forman parte de ella: los tres declaran
  `modes: ["home"]` porque la ruta de clase de `campaign.json` selecciona el tutorial 0, el tutorial
  1 y el caso 6. Reequilibrarla con las unidades nuevas es trabajo de M7C, no de M7A.
- **El enlace directo del caso 6 conserva su comportamiento heredado.** Es deuda anterior a M7A,
  sigue documentada como tal y esta entrega no la ha tocado ni debía tocarla.
