# Plan maestro del tercer videojuego

Estado: **M2 aprobado tras auditoría final** el 13 de agosto de 2026. Este documento fija las
decisiones de alcance y la secuencia de trabajo. El diseño pedagógico y jugable está documentado;
todavía no se han inicializado arquitectura, contratos ni código.

El nombre de trabajo es **El aula de los dos minutos**. Tanto el nombre como la identidad visual
podrán cambiar durante M5 sin alterar la propuesta pedagógica aprobada.

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

### M7A — Contenido histórico

Modelo integrador: GPT-5.6 Sol, razonamiento alto. GPT-5.6 Terra, razonamiento alto, podrá elaborar
borradores separados que Sol auditará.

Tareas:

- producir casos de Dalcroze, Kodály, Orff-Keetman y Suzuki;
- integrar Willems y Martenot con el peso complementario acordado;
- comprobar rigor, condiciones, límites, adaptaciones y alternativas;
- validar los datos y jugar todas las ramas.

Puerta de salida: lote histórico validado técnica y pedagógicamente, sin recuperar errores de
materiales antiguos.

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
