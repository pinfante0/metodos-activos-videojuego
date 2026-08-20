# M7A · contenido histórico

Estado: **en curso**. Este documento se amplía con cada entrega parcial y **no declara la fase
cerrada**: la puerta de salida de M7A exige el lote histórico completo —Dalcroze, concepto Kodály,
Orff-Keetman y Suzuki, con Willems y Martenot en su peso complementario— y hoy existen dos unidades,
el tutorial 1 y el caso 2. La segunda **no ha pasado todavía las comprobaciones del proyecto**:
véase el apartado 3.2.

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

## 3. Comprobaciones

### 3.1. Entrega 1

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

### 3.2. Entrega 2 · auditoría y comprobaciones reales

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

---

## 4. Qué **no** contiene esta entrega

Ninguna de estas ausencias es un olvido; son el alcance que las entregas no tenían.

- **El caso 3 y el caso 4 no están escritos**, ni por tanto Orff-Keetman con Willems y Martenot como
  lentes complementarias, ni Suzuki con sus condiciones de transferencia. Son el resto de M7A.
- **No hay nada de M7B**: ni Campbell/WMP, ni Green/PME más allá del caso piloto que ya existía, ni
  Schafer, ni Gordon, ni el caso final.
- **No hay arte de M8.** Todo lo visible sigue siendo tipografía, color, retícula y la silueta
  trazada de M5; todo lo audible sigue sintetizado y siguen siendo seis señales.
- **M7A no está completa** y su puerta de salida no se ha superado.

## 5. Límites abiertos que quien continúe no debe dar por resueltos

- **Los tiempos de las dos unidades siguen siendo una hipótesis de diseño.** El tutorial 1 tiene diez
  escenas y catorce pantallas en un recorrido sin reintentos; el caso 2, diez escenas y catorce
  pantallas, con siete minutos y ocho declarados respectivamente. Medirlo de verdad es M7C, igual que
  el recorte editorial.
- **En 360 × 640, el relato del incidente del tutorial 1 se desplaza 124 px por dentro de su
  recuadro** y el marco histórico del Caso 2, 18 px. Ningún texto se ha encogido: ambos bloques
  reciben foco, tienen nombre accesible y responden a las flechas, y la pantalla no se desplaza.
  Conviene observarlos en el piloto de M10.
- **El reparto crece por unidad y no por acumulación:** cuatro personas en el tutorial 1, cinco en el
  caso 2 y seis en el caso 6. Las unidades que faltan deberán decidirlo por lo que la escena hace
  visible, no por completar la lista: cada persona declarada obliga a escribir su papel en todos los
  resultados del caso.
- **La cobertura declarada completa sólo se exige a las dos unidades de M7A.** El tutorial 0, el
  caso piloto y el banco de mecánicas siguen teniendo cinco acciones que ningún recorrido consume:
  `observe-choice` y `repair-more-colours`; `brief-instruments-only` y
  `revision-dictate-equal-parts`; y `probe-action-single-form`. Son contenido de M4 y M6 y siguen
  fuera de estas entregas, pero extender la regla a los tres casos es trabajo pequeño y la campaña ya
  ha crecido dos veces desde que se anotó.
- **La ruta presencial ya tiene sus tres tramos con contenido.** Sus tiempos siguen sin medirse, que
  es el encargo de M7C. El caso 2 no forma parte de ella: declara `modes: ["home"]` porque la ruta de
  clase de `campaign.json` selecciona el tutorial 0, el tutorial 1 y el caso 6.
