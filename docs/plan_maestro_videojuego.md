# Plan maestro del tercer videojuego

Estado: **M6 completada el 14 de agosto de 2026; M7A abierta y en curso**. Este documento fija las
decisiones de alcance y la secuencia de trabajo. Los sistemas centrales funcionan de principio a fin
con la identidad **Aula-laboratorio escénica** aplicada y con seis de las nueve unidades escritas;
no hay arte definitivo.

El nombre de trabajo es **El aula de los dos minutos** y se conserva. La identidad visual quedó
fijada en M5 sin alterar la propuesta pedagógica aprobada.

## Autoridad y fuentes

- `docs/revision_tema_8.md` es la fuente canónica del contenido pedagógico.
- `material/Guia_docente_Tema_8.docx` determina el contexto, la secuencia docente y los posibles
  usos del juego.
- `material/Tema_8_Metodos_activos_actualizado.pptx` representa el contenido que recibirá el
  alumnado antes o durante el tema.
- Este plan registra decisiones de producto. Si una decisión de diseño contradice la revisión
  pedagógica, prevalece `docs/revision_tema_8.md`.
- `Intervalia/` y `Armario/` son proyectos independientes. Se pueden estudiar y adaptar patrones
  genéricos, pero no modificar ni dar por reutilizable uno de sus motores sin una decisión expresa.

## Visión del producto

Se construirá **un solo videojuego**, no dos productos separados. Tendrá dos capas continuas:

1. **Detective de aula**, introducción guiada en la que se observa una situación, se reconocen sus
   rasgos funcionales y se repara una propuesta.
2. **El aula de los dos minutos**, núcleo en el que se diseña una microclase, se afronta un
   incidente y se revisan y defienden las decisiones.

La primera capa enseña el lenguaje de decisión que exige la segunda. La progresión global será:

> observar → reconocer → reparar → diseñar → probar → revisar → justificar

El juego debe ser una culminación de la asignatura y un repaso final del Tema 8. Puede asumir más
ambición técnica, gráfica y sonora que los dos videojuegos anteriores, siempre que esa ambición
refuerce el razonamiento didáctico y no retrase la validación del núcleo jugable.

## Público y modalidades de uso

- Contenido: exclusivamente el **Tema 8**.
- Público: alumnado universitario de primero del Grado en Educación Primaria, normalmente de 18 o
  19 años, con conocimiento musical limitado y poca experiencia tomando decisiones didácticas.
- Uso presencial: partida guiada por parejas, con internet y auriculares disponibles.
- Ruta de clase: entre **20 y 30 minutos**, accesible mediante enlace directo o código QR.
- Uso autónomo: campaña completa de **60 a 90 minutos**, distribuida inicialmente en unos ocho
  casos de 8 a 15 minutos.
- El progreso recomendado orientará al jugador, pero no se impondrá un bloqueo rígido que impida
  continuar si cambia de dispositivo o entra mediante un enlace docente.

## Plataforma y publicación

La opción aprobada es una **aplicación web estática compilada con TypeScript y Vite**:

- Para el alumnado seguirá siendo un enlace que abre el navegador, sin instalación ni cuenta.
- El resultado publicado será HTML, CSS, JavaScript y recursos estáticos.
- No habrá servidor de aplicación, base de datos ni servicio de IA.
- TypeScript protegerá los contratos de casos, decisiones y consecuencias.
- Vite permitirá organizar, comprobar y optimizar una producción audiovisual mayor.
- La interfaz será principalmente HTML semántico, CSS y SVG o imágenes. Canvas solo se usará si
  aporta valor a un efecto o interacción concreta; no será la base de toda la interfaz.

La distribución prevista es:

1. GitHub Pages para la edición pública.
2. PLATEA como acceso docente o copia institucional.
3. Un archivo autónomo podrá estudiarse como respaldo, pero no es requisito del primer
   lanzamiento.

M3 deberá probar pronto la salida compilada y las rutas relativas en ambos destinos. La
experiencia previa de los otros juegos no sustituye esta comprobación porque la cadena de
compilación será distinta.

Quedan descartados por ahora:

- aplicación móvil nativa o publicación en tiendas;
- backend, cuentas y panel docente;
- dependencia de conexión durante una partida ya cargada como requisito explícito;
- motor generalista como Unity o Godot;
- IA generativa o evaluativa dentro del juego.

## Progreso y resultados

El progreso se guardará únicamente en el navegador, mediante almacenamiento local y con una
degradación comprensible si el navegador no permite conservarlo.

No se recogerán resultados centralizados en la primera versión. Un backend ofrecería información
agregada sobre errores y usos, pero añadiría identificadores, privacidad, consentimiento,
seguridad, mantenimiento y limpieza de datos. No resulta proporcionado para el objetivo formativo
actual.

Al terminar, el juego generará una **bitácora de decisiones** local con información como:

- casos completados;
- una decisión que se mantuvo y otra que se revisó;
- principios metodológicos combinados;
- riesgo o tensión detectados;
- adaptación inclusiva elegida;
- evidencia observable de aprendizaje esperada.

La bitácora se podrá copiar, imprimir o capturar. El profesor podrá pedirla de manera ocasional
para una puesta en común, pero no será un envío automático ni una calificación. Cualquier futura
analítica de investigación constituirá una fase distinta con una decisión ética y técnica propia.

## Modelo pedagógico del juego

El juego no será un trivial de autores, fechas, materiales o eslóganes. Las escenas deberán hacer
razonar sobre varias de las cinco preguntas estables del tema:

1. ¿Cuál es la puerta de entrada al aprendizaje?
2. ¿Qué hace y qué decide realmente el alumnado?
3. ¿Qué función desempeña el docente?
4. ¿Cuándo aparecen notación, teoría, improvisación y creación?
5. ¿Qué condiciones, límites y adaptaciones exige un aula diversa?

La unidad mínima de razonamiento seguirá esta gramática:

> objetivo + principio metodológico + condición o riesgo + adaptación + evidencia observable

La evaluación será determinista y se apoyará en elecciones estructuradas y relaciones escritas por
el equipo de autoría. No interpretará texto libre mediante IA. Cuando un caso admita varias
respuestas defendibles, la retroalimentación explicará:

- qué favorece la decisión;
- qué deja fuera;
- qué tensión nueva introduce;
- qué modificación podría sostenerla mejor.

No habrá un enfoque ganador universal ni una puntuación única que convierta toda decisión en una
jerarquía. Se valorará la coherencia entre objetivo, grupo, recursos, cultura, accesibilidad, papel
docente y evidencia esperada.

## Bucle de juego provisional

El diseño detallado corresponde a M2, pero la dirección aprobada es:

1. Recibir una escena, un objetivo y restricciones observables.
2. Examinar lo que hacen alumnado y docente.
3. Detectar una oportunidad, incoherencia o riesgo.
4. Elegir o combinar principios, acciones y apoyos.
5. Montar una microclase de dos minutos.
6. Ver una consecuencia audiovisual y recibir un incidente.
7. Revisar una decisión.
8. Justificar el resultado mediante la gramática del juego.
9. Incorporar la decisión a la bitácora.

Las consecuencias representarán posibilidades pedagógicas plausibles, no diagnósticos cerrados
sobre el alumnado ni una simulación científica exacta del aula.

## Mapa preliminar de campaña

Este mapa orienta M2 y puede reajustarse si el análisis de cobertura propone una distribución
mejor. No debe convertirse todavía en un contrato de datos.

| Unidad | Foco principal |
| --- | --- |
| Tutorial 0 | Comprender que «activo» no significa simplemente estar ocupado |
| Tutorial 1 | Observar y reparar una microclase corporal y vocal |
| Caso 2 | Dalcroze y Kodály: cuerpo, escucha, voz y secuencia |
| Caso 3 | Orff-Keetman; Willems y Martenot como perspectivas complementarias |
| Caso 4 | Suzuki: entorno, transferencia, práctica y equidad |
| Caso 5 | Campbell/WMP: música situada y mediación cultural |
| Caso 6 | Green/PME: autonomía, elección y apoyos necesarios |
| Caso 7 | Schafer y la escucha; Gordon como ampliación breve sobre secuencia y audiation |
| Final | Combinar dos enfoques, responder a un incidente, revisar y defender |

La ruta de clase seleccionará tres situaciones de la campaña o variantes específicas; no será un
resumen acelerado de todos los casos.

## Identidad, sonido y accesibilidad

La dirección inicial es un **aula-laboratorio escénica estilizada**, inequívocamente lúdica y no
hiperrealista. Se prevén:

- personajes recurrentes con necesidades y formas de participación diversas;
- espacios que reaccionan visual y sonoramente a las decisiones;
- música, efectos, voces breves, paisajes sonoros y animación;
- incidentes y cambios de ritmo que mantengan la atención.

Los personajes representarán condiciones plausibles de participación, no perfiles psicológicos
deterministas ni alumnos puntuados individualmente.

Desde el primer corte jugable se exigirán:

- alternativa visual o textual para toda información sonora;
- subtítulos, repetición, silencio global y control de volumen;
- modo de movimiento reducido;
- interacción por teclado y táctil, con estructura compatible con lectores de pantalla;
- pantallas de acción sin desplazamiento vertical en los tamaños objetivo;
- desplazamiento permitido en referencia, ayuda y bitácora cuando sea necesario.

Todo recurso tendrá procedencia, licencia y créditos registrados desde su incorporación. No se
producirá arte definitivo antes de aprobar la dirección visual y el contrato de recursos en M5.

## Reutilización de los juegos anteriores

La revisión de `Intervalia/` y `Armario/` se realizó en modo de solo lectura. Se reutilizará su
disciplina de producción, no sus motores específicos:

- contratos antes de producir contenido en volumen;
- una fuente de verdad y datos derivados en lugar de duplicados;
- rutas profundas para pruebas, enlaces de clase y QR;
- almacenamiento local con alternativa explícita;
- comprobaciones responsivas medidas, no solo inspección visual;
- acceso directo a estados difíciles para poder probarlos;
- validadores con ejemplos deliberadamente inválidos;
- inventario de recursos, procedencia y licencias;
- publicación comprobada en navegador real.

No se reutilizarán por defecto el motor de rondas de Intervalia, el motor de tableros de Armario ni
sus identidades visuales. Cualquier código genérico que se adapte deberá recibir una justificación,
una revisión y pruebas propias de este proyecto.

## Fuera de alcance de la primera versión

- Otros temas de la asignatura.
- IA dentro del juego.
- Registro de usuarios, cuentas o sincronización entre dispositivos.
- Resultados centralizados, panel docente o analítica de investigación.
- Competición, clasificación pública o calificación automática.
- Simulación hiperrealista de personas o aprendizaje.
- Aplicaciones nativas y tiendas móviles.
- Producción masiva de casos antes de validar un corte vertical.

## Organización por fases y chats

Cada fase se trabajará en un chat específico. El chat debe leer `AGENTS.md`, este plan y las
fuentes obligatorias que correspondan; debe limitarse a su fase y cerrar dejando decisiones,
archivos y comprobaciones suficientes para el siguiente relevo.

Las recomendaciones de modelo son operativas y podrán actualizarse si cambia el catálogo:

- **GPT-5.6 Sol** para decisiones integradoras, arquitectura, núcleo del producto y auditorías
  pedagógicas complejas.
- **GPT-5.6 Terra** para borradores acotados, inventarios, documentación repetitiva y revisiones
  independientes.
- Los subagentes solo trabajarán sobre archivos distintos o en auditorías de solo lectura. No se
  editará el mismo archivo en paralelo.

### M1 — Plan maestro

Modelo: GPT-5.6 Sol, razonamiento alto.

Tareas:

- elegir un único concepto y delimitar alcance;
- decidir modalidad, plataforma, datos, accesibilidad y dirección general;
- organizar fases, modelos y puertas de salida;
- dejar las decisiones en este documento y actualizar el estado del proyecto.

Puerta de salida: plan aprobado y persistente, sin código ni arquitectura inicializada.

Estado: **completado**.

### M2 — Diseño pedagógico y jugable

Modelo: GPT-5.6 Sol, razonamiento xhigh.

Tareas:

- formalizar el bucle, la progresión y las rutas de clase y casa;
- elaborar la matriz de cobertura del Tema 8;
- definir la gramática de decisiones, la retroalimentación y las evidencias;
- diseñar personajes funcionales y restricciones sin convertirlos todavía en arte;
- escribir sobre papel un tutorial y un caso completo con alternativas defendibles;
- especificar qué deberá registrar la bitácora.

Entregables previstos: biblia de juego, matriz pedagógica, mapa de campaña revisado y caso piloto.

Puerta de salida: todo el Tema 8 está trazado, no hay un ganador universal y el caso piloto ha sido
aprobado antes de diseñar contratos técnicos.

Estado: **completado; puerta de salida superada tras auditoría final**. Entregables:

- `docs/biblia_juego_m2.md`;
- `docs/matriz_pedagogica_m2.md`;
- `docs/mapa_campana_m2.md`;
- `docs/caso_piloto_m2.md`.

La matriz traza los diez contenidos de la jerarquía canónica, las cinco preguntas estables y las
cuatro lentes transversales. El piloto combina Orff-Keetman y PME/Green sin declararlos equivalentes
y ofrece más de una revisión defendible. Se ha incorporado como fuente complementaria el artículo de
Vasil y Dockan (2023) depositado en `material/`; su incorporación a la bibliografía de la
presentación y la guía queda anotada para una futura revisión editorial, fuera de M2.

### M3 — Arquitectura, contratos y prueba de publicación

Modelo: GPT-5.6 Sol, razonamiento xhigh.

Tareas:

- inicializar `Metodos/` como repositorio independiente;
- decidir estructura TypeScript/Vite, estado, navegación y almacenamiento;
- definir contratos para casos, escenas, acciones, incidentes, consecuencias y progreso;
- definir inventario y contrato de recursos audiovisuales;
- crear datos válidos e inválidos para probar el validador;
- construir una prueba mínima y verificar GitHub Pages y PLATEA.

Puerta de salida: aplicación mínima reproducible en ambos destinos y contratos comprobados. No se
construye aún el juego completo.

Estado: **completado; puerta de salida superada el 13 de agosto de 2026**. Repositorio,
arquitectura y contratos comprobados; aplicación mínima reproducible verificada en GitHub Pages y
en el paquete cargado por el profesor en PLATEA. Véase `docs/prueba_publicacion_m3.md`.

### M4 — Corte vertical gris

Modelo: GPT-5.6 Sol, razonamiento alto.

Tareas:

- implementar un tutorial de detective y un caso completo sin arte definitivo;
- integrar incidente, revisión, retroalimentación y bitácora;
- probar ratón, teclado, táctil y tamaños objetivo;
- confirmar que el contenido puede cambiar sin reescribir el motor.

Puerta de salida: recorrido jugable de principio a fin en móvil y ordenador, con una duración y una
comprensión iniciales aceptables.

Estado: **completado; puerta de salida superada el 13 de agosto de 2026**. Tutorial y caso piloto
funcionan de principio a fin con incidente, revisión, retroalimentación, justificación y bitácora.
Se han comprobado ratón, teclado, táctil y cinco tamaños objetivo. El contenido jugable reside en
JSON validado y puede cambiar sin reescribir el intérprete. Véase `docs/corte_vertical_m4.md`.

### M5 — Dirección visual, sonora y de experiencia

Modelo: GPT-5.6 Sol, razonamiento alto. Usar ImageGen cuando la dirección requiera recursos
bitmap originales.

Tareas:

- comparar tres direcciones visuales;
- elegir identidad, personajes, composición, movimiento y lenguaje sonoro;
- fijar el contrato de recursos y el registro de procedencia;
- aplicar la dirección elegida al corte vertical;
- verificar subtítulos, reducción de movimiento y legibilidad.

Puerta de salida: identidad aprobada sobre una experiencia funcional, no solo en ilustraciones
aisladas.

Estado: **completada el 14 de agosto de 2026. Puerta de salida superada.**

La identidad aprobada es **Aula-laboratorio escénica**, elegida por el profesor tras comparar tres
direcciones construidas y recorribles sobre el mismo corte funcional. No se adopta tal cual: el
escenario oscuro y cálido se concentra en la zona experiencial y toda superficie con lectura extensa
es clara y de alto contraste; la Consola de decisiones no sobrevive como identidad, pero sí su
claridad funcional para los paneles de razonamiento y su lógica sonora breve; el lenguaje sonoro
cifra el estado en un intervalo con timbre acústico y sin banda sonora continua; y los personajes
quedan condicionados a que el contenido los declare explícitamente. El Cuaderno de campo se retira,
igual que la ruta `#/direcciones` y toda la capa reversible de comparación. Véase
`docs/direcciones_m5.md`.

Se ha fijado el contrato de recursos y el registro de procedencia, con inventario ejecutable de ocho
recursos —todos originales, todos en estado de prototipo— validado al arrancar. Véase
`docs/contrato_recursos_m5.md`.

**Decisión de producto añadida en M5:** el juego no puede acabar siendo una ficha con ilustraciones.
Ocho reglas de composición vinculantes, aplicadas ya al corte por composición y sin eliminar rigor
ni encoger texto pedagógico, con encargos explícitos a M6, M7C y M10. Véase
`docs/decision_producto_m5.md`.

La medición instrumentada de M5 corrigió además una afirmación de M4 —el corte gris ya desplazaba
las pantallas de justificación y de bitácora del caso— y **el cierre de M5 lo ha reparado**: ninguna
pantalla de acción se desplaza en ninguno de los cinco tamaños objetivo, en el tutorial ni en el
caso piloto, y `pnpm measure:viewports` falla con código 1 si la regla vuelve a romperse.

Límites que M5 deja abiertos y no debe dar por resueltos quien continúe:

- **No hay arte definitivo ni personajes.** Todo lo visible es tipografía, color, retícula y una
  silueta trazada; todo lo audible está sintetizado. Corresponde a M8.
- **La promesa de «ver a quién favorece una decisión» sigue sin cumplirse y no se cumplirá con
  arte.** El contenido no declara participación ni reparto, de modo que ninguna imagen puede
  mostrarlo sin inventarlo. Ampliar el contrato de contenido es trabajo de M6 y M7, y es la
  condición previa para que haya personajes.
- En 360 × 640, la frase de justificación y la vista previa de la bitácora se desplazan por dentro
  de su recuadro. Conviene observarlo en el piloto de M10.

Los contratos de M3, el contenido jugable de M4 y `game-session.ts` siguen intactos; `render-app.ts`
y la hoja base se han modificado para aplicar la identidad y las reglas de composición.

### M6 — Sistemas centrales

Modelo: GPT-5.6 Sol, razonamiento alto.

Tareas:

- generalizar campaña, navegación y enlaces directos;
- construir el montador de microclases y el sistema determinista de consecuencias;
- integrar incidentes, revisión, progreso, audio y bitácora;
- crear rutas de prueba para todos los estados difíciles;
- automatizar las comprobaciones estructurales y de estado.

Puerta de salida: todas las mecánicas funcionan con contenido provisional y poseen pruebas antes
de cargar la campaña completa.

Estado: **completada el 14 de agosto de 2026. Puerta de salida superada.** Véase
`docs/sistemas_centrales_m6.md`.

**Decisión explícita que M5 dejó pendiente: el contrato de contenido se amplía para declarar
participación y reparto.** Era la condición previa para que existan personajes. Un reparto compartido
en `src/content/campaign/cast.json` y un bloque `participation` obligatorio en toda consecuencia que
el juego presente como resultado de un diseño o de una revisión. Las tres salvaguardas de M2 dejan de
ser buenas intenciones y pasan a impedir que el contenido valide: nadie puede quedar sin vía en todos
los resultados de un caso, nadie puede quedar reducido a ejecutar en todo el caso, y el esquema no
admite ningún número por persona. La ampliación **no habilita arte**: entrega el dato y su lectura
accesible para que M8 pueda dibujar a quién favorece una decisión sin inventarlo.

La campaña es un dato validado —nueve unidades, de las que M6 dejó dos con contenido y siete
anunciadas como pendientes; hoy son **seis con contenido y tres pendientes**— del que se derivan
portada, mapa `#/campana`, ruta presencial, unidad recomendada y comprobaciones. El progreso orienta y no bloquea: no existe ningún campo de desbloqueo ni ninguna
puntuación en ningún contrato.

Comprobaciones: **161 pruebas en once archivos**, compilación estricta, paquete PLATEA regenerado y
`pnpm measure:viewports --runs=3` con diez recorridos declarados completados hasta su cierre, sin
desbordamiento horizontal, sin ninguna pantalla de acción desplazada en los cinco tamaños objetivo y
con objetivo táctil mínimo de 44 px, idéntico en las tres pasadas. Procedimiento en
`docs/comprobaciones_m6.md` y salida literal en `docs/medicion_tamanos_m6_salida.md`.

Límites que M6 deja abiertos y no debe dar por resueltos quien continúe:

- **Siete de las nueve unidades no tienen contenido.** Son M7A y M7B.
- **No hay arte definitivo ni personajes dibujados.** Sigue siendo M8. La banda de escena continúa
  siendo la silueta constante y decorativa de M5, con sus seis pruebas estructurales intactas.
- **Los tiempos siguen siendo hipótesis de diseño** y el recorte editorial sigue pendiente: M7C.
- En 360 × 640 los cinco bloques de repaso se desplazan por dentro de su recuadro. Ningún texto se
  ha encogido y los cinco son accesibles con teclado. Conviene observarlo en el piloto de M10.

M7A se abrió con la frase siguiente, que queda como registro de lo que se encargó. **La fase sigue
abierta**: lo que le falta no es contenido, sino la auditoría independiente de la cuarta entrega.

> **M7A — Contenido histórico.** Trabaja únicamente en `Metodos/`. Lee `AGENTS.md`,
> `docs/plan_maestro_videojuego.md`, `docs/sistemas_centrales_m6.md`, `docs/decision_producto_m5.md`
> y los entregables M2 pertinentes. Usa `docs/revision_tema_8.md` como fuente pedagógica canónica.
> Produce los casos de Dalcroze, Kodály, Orff-Keetman y Suzuki e integra Willems y Martenot con el
> peso complementario acordado; declara en cada caso el reparto y la participación de cada resultado
> de diseño y de revisión, al menos un incidente que obligue a revisar y un recorrido declarado por
> cada rama que merezca comprobarse. Comprueba rigor, condiciones, límites, adaptaciones y
> alternativas, valida los datos y juega todas las ramas. Respeta las ocho reglas de composición de
> M5. No produzcas arte definitivo de M8, no escribas el contenido contemporáneo de M7B y detente en
> la puerta de salida de M7A.

### M7A — Contenido histórico

Modelo integrador: GPT-5.6 Sol, razonamiento alto. GPT-5.6 Terra, razonamiento alto, podrá elaborar
borradores separados que Sol auditará.

Tareas:

- producir casos de Dalcroze, Kodály, Orff-Keetman y Suzuki;
- integrar Willems y Martenot con el peso complementario acordado;
- declarar en cada caso el reparto y la participación de cada resultado de diseño y de revisión, sin
  lo cual el caso no valida (ampliación de contrato decidida en M6);
- comprobar rigor, condiciones, límites, adaptaciones y alternativas;
- validar los datos y jugar todas las ramas mediante recorridos declarados.

Puerta de salida: lote histórico validado técnica y pedagógicamente, sin recuperar errores de
materiales antiguos.

Estado: **completada; puerta de salida superada**. Hay cuatro entregas aprobadas, y con la cuarta
las cuatro tradiciones principales del lote histórico tienen unidad propia: Dalcroze y el concepto
Kodály en el caso 2, Orff-Keetman en el tutorial 1 y en el caso 3 con Willems y Martenot como lentes
de revisión, y Suzuki en el caso 4. Seis de las nueve unidades de la campaña tienen contenido. La
cuarta entrega superó la auditoría independiente después de necesitar catorce correcciones
bloqueantes en cuatro rondas de revisión.

La primera escribió el **Tutorial 1, «El material intruso»** —reparar una variable, predecir su
efecto y separar material, técnica y principio—, con reparto y participación declarados en sus
catorce resultados, un incidente de recursos que obliga a revisar, dos reparaciones y dos revisiones
defendibles, un cierre distinto por combinación de ambas y seis recorridos declarados que consumen
todas sus acciones. Una auditoría posterior encontró cuatro bloqueos de coherencia entre ramas, ya
corregidos y con regresión propia.

La segunda escribe el **Caso 2, «Una frase, dos entradas»** —comparar dos soluciones defendibles—,
con Dalcroze y el concepto Kodály como dos puertas a la misma relación musical que no se funden: dos
entradas defendibles cruzadas con tres papeles docentes, las dos maneras de perder la evidencia que
el mapa declara para la unidad, un incidente de imitación sin comprensión cuyo relato sirve por igual
a las dos ramas, dos revisiones defendibles que ofrecen acceso equivalente con prioridades distintas, un cierre por
combinación de puerta y revisión, y siete recorridos declarados que consumen todas sus acciones. Es
además la primera unidad en que el jugador debe explicar el papel docente y comparar alternativas,
como fija la matriz pedagógica. La auditoría corrigió la incoherencia entre papel docente y cierre,
el acceso solo sonoro de dos ramas, el producto libre de la gramática, el adelanto del caso siguiente
y el desbordamiento del cierre histórico. **La entrega está auditada:** `pnpm check` pasa con 259
pruebas, TypeScript estricto, compilación y paquete PLATEA; el arnés completa los 23 recorridos en los
tamaños asignados durante tres pasadas idénticas y, además, en una pasada exhaustiva de los cinco
tamaños sin desplazar ninguna pantalla de acción.

La tercera escribe el **Caso 3, «Del modelo a una forma propia»** —montar tres momentos—, primera
unidad de la campaña que usa el montador de microclases: el modelo, la exploración y la forma se
deciden en tres pantallas sin devolución propia y la prueba las combina en ocho resultados
defendibles, uno por combinación, todos ellos con una versión reconocible. Orff-Schulwerk, elaborado
con Gunild Keetman, es el proceso que ocupa los tres momentos; Willems y Martenot entran sólo al
revisar, como dos lentes que sostienen ese proceso sin sustituirlo, y una prueba impide
estructuralmente que una lente ocupe uno de los tres momentos. Con ella son **cinco de las nueve
unidades con contenido** y **tres las entregas parciales de M7A**. Las tres tensiones que el mapa declara para la unidad son las tres opciones incoherentes,
cada una con vuelta a su propio momento; el incidente es de acceso sensorial y carga, y su relato
sirve por igual a las ocho ramas; y los cuatro cierres distinguen reparar las condiciones de un
proceso de reparar la decisión que lo define. Nueve recorridos declarados consumen todas sus acciones
y **todos** sus resultados.

Tres rondas de auditoría independiente posteriores han encontrado nueve hallazgos. La primera, cinco: una rama
que se dejaba completar contradiciendo el objetivo, una gramática cuyos cruces no se sostenían, un
cierre por enlace directo que inventaba reparto y terminaba el caso sin montar nada, una bitácora que
atribuía lentes no elegidas y documentación desincronizada. La segunda, tres más: cruces de gramática
que los propios cierres negaban, un enlace directo a la reflexión que ofrecía cerrar y hacía lanzar
al contrato de progreso, y un `approachIds` por acción que el validador no comprobaba. Los ocho están
corregidos y cada uno deja su regresión. La tercera detectó que la nueva salida de la reflexión vacía
no estaba incluida en el arnés de navegador; ahora dispone de estado difícil y seis comprobaciones
reales en los cinco tamaños.

**Estado: aprobada tras auditoría independiente.** `pnpm check` pasa con 331 pruebas, TypeScript
estricto, compilación y paquete PLATEA; el arnés completa los 32 recorridos en tres pasadas idénticas,
mide 20 rutas de referencia y estados difíciles en los cinco tamaños y, además, ejecuta una pasada
exhaustiva —160 combinaciones y 3225 pantallas— sin desplazar ninguna pantalla de acción. Los ocho
hallazgos de las tres rondas quedaron corregidos, cubiertos por regresiones o comprobaciones de
navegador y reauditados antes de aprobar la entrega.

La cuarta escribe el **Caso 4, «Un entorno que no todos tienen»** —separar principio y condiciones
de transferencia—, con Suzuki tratado como un ecosistema completo y no como una técnica suelta. El
hilo de ese ecosistema por el que entra la sesión y la dependencia desigual que se sustituye se
deciden en pantallas distintas, y la prueba las combina en cuatro resultados defendibles, cada uno de
los cuales declara qué dependencia sigue en pie: en dos minutos sólo cabe sustituir una. El cierre
resuelve **ocho combinaciones** de hilo, sustitución y revisión, cada una afirmando lo que sus tres
decisiones consiguieron y declarando pendiente lo que las otras habrían dado. Las tres tensiones que
el mapa declara para la unidad —presuponer tiempo fuera de clase, práctica familiar o instrumento
propio— son las tres opciones incoherentes, cada una con vuelta a su propia pantalla, y ninguna llega
al incidente. El error histórico de leer la educación del talento como captación o educación de
alumnado superdotado se corrige **donde el jugador lo comete**, y la pantalla de revelación conserva
el ecosistema entero declarando que sus principios **no son alternativas entre sí** y que la
transferencia es parcial y no da una receta universal. El incidente pertenece a la familia de
transferencia —la cuarta distinta de la fase—. Es además la primera unidad en que el jugador declara
un límite de transferencia y en que la condición de equidad forma parte del objetivo musical. Doce
recorridos declarados consumen todas sus acciones, todos sus resultados de prueba y los nueve
cierres.

**Cuatro revisiones posteriores encontraron catorce bloqueos**, ninguno visible para la suite de
entonces. La primera, cuatro, de contenido y de coherencia entre pantallas: los cierres ignoraban la sustitución y contradecían los costes de las ramas; la gramática
borraba las decisiones, hacía que las dos adaptaciones repararan todo y contradecía los cierres; la
escucha y los pasos pequeños se presentaban como técnicas excluyentes de la tradición; y las seis
devoluciones de decisiones de diseño no declaraban reparto. Los cuatro están corregidos y cada uno
deja regresión, verificada reinyectando el defecto. Se corrigieron además tres desincronizaciones
—la cifra escrita a mano de la portada, el recuento de la campaña en este documento y la fase del
paquete PLATEA— y la fórmula «Mantengo la dependencia que sustituí» de la bitácora, que afirmaba lo
contrario de lo que ocurre.

La segunda encontró **cinco más, de una clase más profunda**: las cuatro ramas de pasos pequeños
afirmaban que el fragmento sonaba entero sin que ninguna acción ni revisión devolviera al conjunto;
ningún recorrido declaraba su gramática, así que las doce bitácoras describían la misma rama
dijeran lo que dijeran las acciones; los costes de las dos revisiones eran carencias afirmadas sin
causa en lugar de gasto real del tiempo disponible; la separación de condiciones nombraba tres de
las cinco y prometía el ciclo completo justo antes de obligar a aislar un hilo; y dos recuentos
—el de este documento y el nombre de una prueba— seguían desfasados. Los cinco están corregidos, con
regresión verificada reinsertando cada defecto, y el validador comprueba además que la gramática
declarada por un recorrido exista de verdad.

La tercera encontró **cuatro más**, y las tres primeras comparten raíz: lo que se había atado era el
guion y no el juego. La pantalla de justificación seguía ofreciendo las piezas de todas las ramas, de
modo que quien jugaba podía montar una clase y defender otra —declarar la gramática en los recorridos
sólo arreglaba las bitácoras del arnés—; la alternativa defendible de la bitácora conservaba los dos
costes derogados; las dos formulaciones del principio nombraban tres condiciones de las cinco; y dos
notas de reparto negaban la vuelta al conjunto que la consigna ya hace. La corrección amplía el
contrato con `requiredTags` en las piezas de gramática y hace que la pantalla ofrezca sólo las de la
partida, dejando las dos evidencias como elección libre; las regresiones **juegan las ocho ramas como
una persona** en lugar de limitarse a ejecutar recorridos.

La cuarta encontró **uno más**, y era la costura que la tercera había dejado suelta: el filtro de la
gramática devolvía **todas** las piezas cuando la rama no casaba, de modo que el enlace directo a la
justificación —donde no hay ninguna clase de la que hablar— era el estado más permisivo del caso.
Ahora un hueco ligado sin rama presente se queda vacío, `selectGrammar` rechaza sus piezas y la
pantalla orienta: dice qué falta y lleva a la primera decisión capaz de abrirlo, derivada del
contenido. La medición encontró que la pantalla nueva desbordaba en tres tamaños y se corrigió por
composición, sin encoger ningún texto.

**Estado de la entrega 4: aprobada tras auditoría independiente.** `pnpm check` pasa con 454 pruebas,
TypeScript estricto, compilación y paquete
PLATEA; el arnés completa los 44 recorridos en tres pasadas idénticas —88 combinaciones y 1677
pantallas de recorrido por pasada—, mide 21 rutas de referencia y estados difíciles en los cinco
tamaños —105 pantallas— y ejecuta una pasada exhaustiva de 220 combinaciones y
4545 pantallas sin desplazar ninguna pantalla de acción.

**Puerta de salida: superada.** El lote histórico está escrito y sus cuatro entregas han pasado
auditoría independiente. La cuarta demostró cuatro veces por qué era necesaria: las cuatro rondas
encontraron defectos con la suite en verde y con las regresiones de la ronda anterior ya escritas;
la auditoría de aceptación comprobó después el conjunto completo.

Véase `docs/contenido_m7a.md`.

### M7B — Contenido contemporáneo y síntesis

Modelo integrador: GPT-5.6 Sol, razonamiento xhigh. GPT-5.6 Terra, razonamiento alto, podrá
elaborar borradores separados que Sol auditará.

Tareas:

- producir Campbell/WMP y Green/PME;
- integrar Schafer como conexión y Gordon como ampliación breve;
- aplicar inclusión, pertinencia cultural, agencia, creatividad y evidencia;
- construir el caso final de combinación, incidente, revisión y defensa.

Puerta de salida: existen varias rutas defendibles y no se exotiza repertorio, no desaparece el
docente y no se presenta ninguna tradición como receta universal.

### M7C — Campaña y ruta de clase

Modelo: GPT-5.6 Sol, razonamiento alto.

Tareas:

- ordenar y equilibrar los ocho casos;
- ensamblar la ruta de 20 a 30 minutos para parejas;
- ajustar ayudas, dificultad, repetición y tiempos;
- comprobar que la ruta de clase y la campaña doméstica comparten sistema sin duplicar contenido.

Puerta de salida: ambas modalidades tienen progresión coherente y duración verificable.

### M8 — Producción audiovisual

Modelo: GPT-5.6 Sol, razonamiento alto. Usar ImageGen para los recursos originales que se hayan
definido; Terra podrá auditar inventario y metadatos.

Tareas:

- producir personajes, fondos, estados, animaciones y elementos de interfaz;
- preparar música, efectos, voces o paisajes sonoros y sus alternativas textuales;
- optimizar formatos, dimensiones, peso y carga;
- completar créditos, procedencia y licencias.

Puerta de salida: inventario completo, accesible, trazable y dentro del presupuesto de
rendimiento.

### M9 — Control de calidad integral

Modelo integrador: GPT-5.6 Sol, razonamiento xhigh. Terra, razonamiento alto, podrá realizar
auditorías independientes de solo lectura.

Tareas:

- probar estados, rutas, almacenamiento, recuperación y casos inválidos;
- auditar contenido, retroalimentación y cobertura pedagógica;
- comprobar escritorio, móvil, teclado, táctil y lectores de pantalla;
- comprobar subtítulos, silencio, reducción de movimiento y contraste;
- medir desbordamientos y rendimiento en navegadores reales.

Puerta de salida: sin fallos críticos, sin rutas inaccesibles y sin pantallas de acción desbordadas
en los tamaños objetivo.

### M10 — Publicación candidata y piloto de aula

Modelo: GPT-5.6 Sol, razonamiento alto.

Tareas:

- publicar una candidata reproducible;
- preparar enlaces, QR y protocolo de parejas;
- probarla en condiciones reales de aula;
- registrar tiempos, dudas, errores y calidad de la conversación entre parejas;
- priorizar correcciones sin ampliar el alcance por inercia.

Puerta de salida: la ruta presencial funciona en el tiempo disponible y produce el tipo de debate
didáctico buscado.

### M11 — Revisión final y lanzamiento

Modelo integrador: GPT-5.6 Sol, razonamiento alto. Terra, razonamiento medio, podrá apoyar la
documentación final.

Tareas:

- corregir lo observado en el piloto;
- repetir las comprobaciones proporcionadas al riesgo;
- publicar la versión final;
- preparar guía docente, instrucciones de alumnado, QR, créditos y mantenimiento;
- etiquetar y documentar la versión reproducible.

Puerta de salida: edición final utilizable en clase y en casa, con documentación y mantenimiento
suficientes.

## Regla de inicio y cierre de chats

La frase exacta para abrir M2 es:

> **M2 — Diseño pedagógico.** Trabaja únicamente en `Metodos/`. Lee `AGENTS.md`,
> `docs/plan_maestro_videojuego.md` y todos los documentos que declaran obligatorios. Usa
> `docs/revision_tema_8.md` como fuente canónica. Ejecuta solo la fase M2 del plan maestro, sin
> implementar código, y detente en su puerta de salida.

La frase exacta para abrir M3 es:

Modelo recomendado para M3: **GPT-5.6 Sol, razonamiento xhigh**.

> **M3 — Arquitectura, contratos y prueba de publicación.** Trabaja únicamente en `Metodos/`.
> Lee `AGENTS.md`, `docs/plan_maestro_videojuego.md`, los cuatro entregables de M2 y todos los
> documentos que declaran obligatorios. Usa `docs/revision_tema_8.md` como fuente pedagógica
> canónica. Ejecuta solo la fase M3 del plan maestro: inicializa el repositorio independiente,
> define y comprueba arquitectura y contratos, y verifica una publicación mínima en GitHub Pages y
> PLATEA. No construyas todavía el juego completo y detente en la puerta de salida de M3.

Para M3 y fases posteriores se sustituirán el número, el título y la restricción final por los de
la fase correspondiente. Antes de recomendar un chat nuevo, el chat actual deberá:

1. dejar decisiones y estado en los documentos del proyecto;
2. ejecutar las comprobaciones exigidas por su fase;
3. indicar cambios, límites y asuntos aplazados;
4. recordar el modelo y el nivel de razonamiento recomendados para la fase siguiente;
5. proporcionar la frase exacta del siguiente chat.

No se anticiparán tareas de una fase posterior para «aprovechar» el chat. Si una puerta de salida
no se supera, se continuará en el mismo chat hasta resolverla o documentar un bloqueo real.
