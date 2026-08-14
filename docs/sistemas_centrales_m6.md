# M6 · Sistemas centrales

Estado: **cerrada el 14 de agosto de 2026. Puerta de salida superada.**

Todas las mecánicas funcionan de principio a fin con contenido provisional y tienen pruebas antes
de cargar la campaña completa. `docs/revision_tema_8.md` sigue siendo la fuente pedagógica
canónica; las ocho reglas de composición de `docs/decision_producto_m5.md` siguen siendo
vinculantes y se han respetado por composición, sin eliminar rigor ni encoger texto pedagógico.

---

## 1. La decisión que M5 dejó pendiente

M5 cerró con un límite escrito: la promesa de **«ver a quién favorece una decisión» no se cumplía**,
y no era un problema de arte. El contenido no declaraba en ninguna parte quién participa, quién
decide ni a quién deja fuera un diseño; un caso enumeraba `characterIds` y cuatro observables en
prosa. Cualquier imagen que mostrara un reparto lo estaría inventando. M5 anotó que ampliar el
contrato pertenecía a M6 y M7, y que era **la condición previa para que existan personajes**.

**Decisión de M6: el contrato de contenido se amplía.**

Se amplía porque la alternativa era peor de las dos maneras posibles. Sin ampliarlo, M8 dibujaría
personajes deduciendo participación de un estado cualitativo —exactamente lo que M5 retiró de la
banda de escena por inventar una distribución que el contenido no declara—, o no los dibujaría
nunca y el juego se quedaría sin la única promesa que lo distingue de una ficha razonada. Declararlo
como dato tiene un coste real: hay que escribirlo caso por caso, y M7A y M7B lo pagarán en cada
unidad. Ese coste es el precio de que la imagen pueda decir la verdad.

### 1.1. Qué se declara y dónde

- **`src/content/campaign/cast.json`** — reparto compartido por toda la campaña, con los seis
  personajes funcionales de `docs/biblia_juego_m2.md`, apartado 8. Cada uno declara qué aporta, qué
  condiciones debe considerar el diseño y qué salvaguarda le protege de un uso indebido.
- **`participation` en cada consecuencia** — el reparto de la participación que ese resultado hace
  posible. Una entrada por persona, con una vía de participación de una lista cerrada:
  `decides`, `proposes`, `performs`, `supports` y `no-route`.
- **`note`** — qué decisión de diseño produce ese papel. Obligatoria cuando alguien queda sin vía.

Es obligatoria en las consecuencias que el juego presenta como **resultado de un diseño o de una
revisión**, que son las pantallas donde el juego afirma qué le pasa al aula. No se exige a la
retroalimentación inmediata de una escena de observación: ahí no se ha montado nada todavía, y
pedir un reparto obligaría a inventar una clase que aún no ha ocurrido.

### 1.2. Las salvaguardas de M2, convertidas en comprobaciones

El riesgo de declarar participación es evidente: convierte a personas en variables. Tres reglas de
M2 dejan de ser buenas intenciones y pasan a impedir que el contenido valide.

| Salvaguarda de M2 | Cómo se comprueba |
| --- | --- |
| Una persona no equivale a una barrera. | Nadie puede quedar `no-route` en **todos** los resultados declarados de un caso. |
| El resto del aula no es decorado. | Toda persona debe decidir o proponer en **algún** resultado del caso. |
| No se diagnostica a nadie. | El esquema no admite ningún número por persona: no hay dónde escribir una puntuación. |
| Una omisión invita a deducir. | Todo resultado que declare reparto debe nombrar a **todas** las personas del caso. |
| La exclusión pertenece al diseño. | `no-route` sin nota que explique qué decisión lo produce no valida. |

`tests/cast-participation.test.ts` rompe el contenido real de cinco maneras distintas y comprueba
que cada una falla con su código propio.

### 1.3. Qué **no** habilita esta decisión

**No habilita arte.** M6 no dibuja personajes: eso sigue siendo M8, y este chat no ha producido
arte definitivo. La banda de escena continúa siendo la silueta constante y decorativa de M5, con sus
seis pruebas estructurales intactas, porque hacerla depender del reparto sería empezar la producción
audiovisual dentro de la fase equivocada.

Lo que M6 entrega es **el dato y su lectura accesible**: el panel «Quién participa y cómo», dentro
del desplegable de razonamiento de cada consecuencia. A partir de aquí M8 puede dibujar a quién
favorece una decisión sin inventar nada, porque lo tiene escrito.

---

## 2. Campaña, navegación y enlaces directos

Hasta M5 la aplicación conocía dos casos por su identificador literal, repetido a mano en la
portada, en la ruta de clase y en el arnés de medición.

- **`src/content/campaign/campaign.json`** declara las nueve unidades de `docs/mapa_campana_m2.md`
  con su foco, su operación nueva, sus minutos y su enfoque, más los cuatro tramos de la ruta
  presencial. Suma los 84 minutos previstos, dentro del intervalo aprobado de 60 a 90.
- Dos unidades tienen contenido —`tutorial-0` y `caso-6`—; las otras siete se anuncian **pendientes
  de M7**, nunca se ocultan y nunca fingen ser jugables. El validador rechaza que una unidad se
  anuncie jugable sin caso o pendiente con caso.
- Todo lo demás se deriva: portada, mapa `#/campana`, ruta `#/ruta/clase`, unidad recomendada,
  intentos por unidad y título de cada caso.

**El progreso orienta y no bloquea.** No existe ningún campo de desbloqueo en el contrato ni
ninguna función que impida abrir una unidad; `tests/campaign.test.ts` lo comprueba explícitamente.
Tampoco existe ningún campo numérico de logro: la regla 7 de M5 no depende de que alguien se acuerde
de respetarla.

Rutas nuevas: `#/campana`, `#/caso/<slug>/<escena>` —enlace docente a mitad de un caso—, `#/pruebas`
y `#/prueba/<estado>`. Un enlace directo a una escena se aplica **una sola vez**: el fragmento no
cambia mientras se juega dentro del caso, y volver a leerlo en cada repintado devolvería el recorrido
a la escena del enlace para siempre.

---

## 3. Montador de microclases

Los tres momentos de `docs/biblia_juego_m2.md` dejan de ser tres preguntas sueltas y construyen una
pieza visible que crece.

- El caso declara `assembly` con sus huecos; cada hueco nombra la escena de diseño que lo rellena.
- Cada hueco se decide **en su propia pantalla**, porque la regla 1 de M5 exige una decisión por
  pantalla. Lo que comparten es una tira compacta que marca qué está resuelto y qué falta, sin
  repetir el texto de ninguna decisión (regla 4).
- Una pantalla de montaje muestra la microclase entera con una sola tarea: probarla. El bloque
  encoge al hueco disponible y se desplaza por dentro, con foco, nombre accesible y flechas, porque
  cuatro decisiones con su texto completo no caben en 360 × 640 y encogerlas rompería la regla 5.
- El montaje **enumera, no valora**: dice qué falta, nunca cuánto llevas. La lectura pedagógica
  llega con la prueba.

El caso piloto de M4 pasa ahora por el montador sin que cambie ninguna de sus consecuencias. El
banco de mecánicas usa cuatro huecos para ejercitar el caso más largo posible.

---

## 4. Sistema determinista de consecuencias e incidentes

Extraído a `src/domain/consequence-engine.ts`, con tres consumidores: el juego, el validador y las
pruebas. **Determinista** significa aquí tres cosas exigibles:

1. la misma combinación de decisiones produce siempre el mismo resultado, sin azar y sin reloj;
2. la prioridad es **el orden de declaración en el archivo**, no la regla más específica: un
   desempate implícito obligaría a razonar para saber qué verá el alumnado;
3. siempre hay resultado, y un caso con reglas pero sin resultado de reserva no valida.

La ampliación de M6 es **`forbiddenTags`**. Sin ella, la única forma de distinguir dos combinaciones
era añadir etiquetas hasta que una regla anterior dejara de cumplirse, lo que hacía depender el
resultado del orden en que se escribieran las acciones. El banco de mecánicas declara dos reglas con
**las mismas etiquetas exigidas**, distinguidas sólo por una excluida, y un recorrido comprueba cada
rama.

Los incidentes se seleccionan por la misma vía: una escena puede declarar varios y decidir cuál
aparece según las decisiones ya tomadas.

### 4.1. Lo que el validador encuentra ahora

Recorre **todas** las combinaciones de decisiones que el jugador puede producir —de forma
exhaustiva, no por muestreo, porque un muestreo dejaría pasar exactamente el caso raro que interesa
encontrar— y detecta:

- **reglas tapadas**: ninguna combinación las activa porque otra anterior gana siempre;
- **consecuencias inalcanzables**: retroalimentación escrita que nadie llegaría a leer;
- etiquetas que ninguna acción aporta, reglas que producen resultados no declarados y escenas sin
  reserva.

Con nueve unidades escritas por varias manos, una regla tapada es el defecto silencioso más
probable, y leyendo caso por caso no se ve. El análisis tiene un límite explícito de 20 000
combinaciones: por encima avisa en lugar de tardar indefinidamente.

---

## 5. Integración: incidentes, revisión, progreso, audio y bitácora

- **Incidentes y revisión** funcionan en los tres casos, con selección determinista y con revisiones
  incoherentes que devuelven a la misma escena en lugar de dejar pasar.
- **Progreso**: unidad recomendada derivada de la campaña, intentos por unidad, entradas de bitácora
  y ajustes, con la degradación a memoria temporal ya comprobada como estado difícil propio.
- **Audio**: siguen siendo **seis señales y ninguna más**, con su equivalente textual permanente.
  M6 no ha añadido ninguna; lo que ha hecho es dispararlas también en los estados nuevos. Una prueba
  impide que aparezca una séptima.
- **Bitácora**: la entrada por caso de M4 más el **resumen final** de `docs/biblia_juego_m2.md`,
  apartado 11 —casos recorridos, principios combinados, decisión mantenida y revisada, tensión y
  evidencia—. Selecciona de lo guardado; no puntúa, no ordena y no compara con nadie.

---

## 6. Rutas de prueba de los estados difíciles

`#/pruebas` enumera **trece estados** a los que casi nunca se llega jugando: la bitácora cargada de
entradas largas, la bitácora vacía, el navegador que no deja guardar, el montaje sin rellenar y el
montaje completo, un resultado que deja a alguien sin vía, un incidente elegido por regla, la
justificación por enlace directo sin haber decidido nada, la pantalla de cierre, tres enlaces rotos
distintos y el informe del validador sobre un contenido deliberadamente roto.

Son exactamente los estados donde se rompe la composición y donde nadie mira, porque llegar a ellos
jugando cuesta varios minutos y hay que acertar el camino.

**No son un modo de trampa**: no desbloquean nada, no alteran el progreso guardado —la bitácora de
prueba se construye en memoria ejecutando los recorridos declarados— y no hay ninguna puntuación que
saltarse.

---

## 7. Comprobaciones

El procedimiento completo está en **`docs/comprobaciones_m6.md`**. En resumen:

- **161 pruebas en once archivos**, compilación con TypeScript estricto y paquete PLATEA regenerado.
- **`pnpm measure:viewports --runs=3`**: 10 recorridos declarados completados hasta su pantalla de
  cierre en 30 combinaciones de recorrido y tamaño, 462 pantallas de recorrido por pasada medidas
  con los desplegables cerrados y abiertos, más 19 rutas de referencia y estados difíciles en los
  cinco tamaños. **Ningún desbordamiento horizontal, ninguna pantalla de acción que se desplace y
  objetivo táctil mínimo de 44 px.** Resultados idénticos en las tres pasadas. Salida literal en
  `docs/medicion_tamanos_m6_salida.md`.

### 7.1. Tres defectos que encontró la automatización

Ninguno se había visto revisando a mano, y los tres son de la clase que sólo aparece en un estado
concreto:

1. **Las rutas de prueba desplazaban la pantalla justo lo que mide su aviso.** No bastaba con anular
   la altura mínima: `max-height: 100%` se calcula sobre la altura completa de `main`, de modo que
   aviso y pantalla sumaban más que el hueco disponible. Ocho pantallas afectadas en cuatro tamaños.
2. **El relato del incidente desbordaba en 360 × 640.** Se ha convertido en un bloque que encoge y
   se desplaza por dentro, con foco y nombre accesible, como los demás bloques de repaso. No es una
   precaución teórica: los incidentes de M7A y M7B serán más largos que el actual.
3. **El objetivo táctil bajó a 22 px** con los enlaces nuevos —un enlace dentro de un titular, y
   después un enlace de 44 px de alto y 39 de ancho—. El objetivo es el lado menor, no la altura.

---

## 8. Contenido provisional y qué no se ha hecho

`src/content/playable/probe-case.json` es el **banco de mecánicas**: contenido provisional de M6 que
ejercita el sistema entero —montador de cuatro huecos, dos reglas distinguidas por una etiqueta
excluida, dos incidentes seleccionados por regla, reparto declarado en siete resultados—. Reutiliza
el objetivo del tutorial ya aprobado en lugar de inventar pedagogía nueva, **no forma parte de la
campaña** y sólo se alcanza desde las rutas de prueba. M7 no tiene que conservarlo.

Límites de esta parada, que quien continúe no debe dar por resueltos:

- **No hay arte definitivo ni personajes dibujados.** Todo lo visible sigue siendo tipografía,
  color, retícula y la silueta trazada de M5; todo lo audible sigue sintetizado. Eso es M8.
- **Siete de las nueve unidades no tienen contenido.** M6 no las ha escrito y no debía escribirlas:
  son M7A y M7B.
- **Los tiempos siguen siendo hipótesis de diseño.** Medirlos de verdad es M7C, con datos y no con
  estimaciones, y ajustar la ruta presencial de 25 a 28 minutos con ellos.
- **El recorte editorial sigue pendiente.** Los textos actuales se escribieron para leerse, no para
  jugarse. Es el encargo de M7C en `docs/decision_producto_m5.md`.
- En 360 × 640 siguen desplazándose **por dentro de su recuadro** los bloques de repaso, ahora
  cinco: razonamiento y reparto, justificación, bitácora, montaje e incidente. Ningún texto se ha
  encogido y los cinco son alcanzables con el tabulador, tienen nombre propio, muestran foco visible
  y responden a las flechas. Conviene observarlo en el piloto de M10.

---

## 9. Encargos que M6 deja escritos

**A M7A y M7B.** Cada caso nuevo debe declarar su reparto y la participación de cada resultado de
diseño y de revisión. No es trabajo opcional: sin él el caso no valida, y sin él M8 no puede
dibujar a quién favorece una decisión. Cada caso necesita además al menos un incidente que cambie
una condición y obligue a revisar, y un recorrido declarado en `walkthroughs.json` por cada rama que
merezca comprobarse.

**A M7C.** Al ordenar la campaña, actualizar `campaign.json` es la única edición necesaria: la
portada, el mapa, la ruta presencial y la recomendación se derivan de él.

**A M8.** El reparto ya es un dato. La banda de escena puede dejar de ser constante y representar
participación **sólo a partir de lo declarado**, nunca deduciéndolo de un estado cualitativo. Las
seis pruebas estructurales de `tests/identity.test.ts` habrá que sustituirlas por otras que
comprueben la nueva regla, no simplemente borrarlas.

---

## 10. Puerta de salida

> Todas las mecánicas funcionan con contenido provisional y poseen pruebas antes de cargar la
> campaña completa.

**Superada.** Campaña, navegación, enlaces directos, montador, motor determinista de consecuencias
e incidentes, revisión, progreso, audio, bitácora y rutas de prueba funcionan de principio a fin en
tres casos, con 161 pruebas y una medición reproducible en los cinco tamaños objetivo. La campaña
completa no se ha cargado: es M7.
