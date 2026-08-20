# Métodos (nombre provisional)

Tercer videojuego independiente para alumnado de primer curso del Grado en Educación Primaria,
dentro de la asignatura Educación Musical y su Didáctica.

El proyecto parte del Tema 8, dedicado a los enfoques activos y tradiciones pedagógicas de
educación musical. El concepto aprobado integra una introducción de observación y reparación con
un núcleo de diseño, prueba y revisión de microclases de dos minutos.

## Estado actual

- Revisión y contraste del tema: `docs/revision_tema_8.md`.
- Presentación actualizada: 34 diapositivas de contenido y 5 de referencias APA 7 en
  `material/Tema_8_Metodos_activos_actualizado.pptx`.
- Guía docente editable: `material/Guia_docente_Tema_8.docx`.
- Secuencia recomendada: tres sesiones de 50 minutos y una cuarta opcional para taller de casos o
  integración del futuro videojuego.
- Plan maestro aprobado: `docs/plan_maestro_videojuego.md`.
- Biblia de juego: `docs/biblia_juego_m2.md`.
- Cobertura completa del tema: `docs/matriz_pedagogica_m2.md`.
- Campaña de 84 minutos y ruta de clase de 25-28: `docs/mapa_campana_m2.md`.
- Tutorial y caso piloto Orff-Keetman + PME/Green: `docs/caso_piloto_m2.md`.

M4 está completada localmente. El corte gris implementa el tutorial «Mucho hacer, poco aprender» y
el caso «El arreglo que no escucha a todos» de principio a fin, con incidente, revisión,
retroalimentación, justificación y bitácora. Los datos pedagógicos están separados del intérprete de
escenas y se han comprobado ratón, teclado, táctil y cinco tamaños objetivo.

- Evidencia del corte y límites: `docs/corte_vertical_m4.md`.
- Contenido jugable: `src/content/playable/`.
- Intérprete común: `src/app/game-session.ts` y `src/app/render-app.ts`.

M5 está completada. La identidad es **Aula-laboratorio escénica**: escenario oscuro y cálido
concentrado en la banda experiencial, superficies de lectura claras y de alto contraste, paneles de
razonamiento con la claridad funcional de la Consola, y seis señales sonoras breves que cifran el
estado en un intervalo con timbre de cuerpo, madera y láminas.

- Cierre de la dirección y criterios de la comparación: `docs/direcciones_m5.md`.
- Reglas de composición vinculantes: `docs/decision_producto_m5.md`.
- Contrato de recursos y procedencia: `docs/contrato_recursos_m5.md`.
- Identidad aplicada: `src/app/identity/` y `src/styles/identity.css`.

M6 está completada. Los sistemas centrales funcionan de principio a fin: campaña declarada de nueve
unidades, navegación y enlaces directos —incluido el enlace a una escena concreta—, montador de
microclases, motor determinista de consecuencias e incidentes, revisión, progreso, audio, bitácora
con resumen y trece rutas de prueba de estados difíciles.

**El contrato de contenido se ha ampliado para declarar participación y reparto**, que era la
condición previa para que existan personajes: cada resultado de diseño o de revisión declara qué
papel permite a cada persona del aula, y tres salvaguardas de M2 impiden que alguien se convierta en
la barrera permanente de un caso o quede reducido a ejecutar.

**Sigue sin haber arte definitivo ni personajes dibujados** —eso es M8—: la producción audiovisual
no ha empezado.

- Cierre de la fase y encargos a M7 y M8: `docs/sistemas_centrales_m6.md`.
- Qué demuestra cada comprobación: `docs/comprobaciones_m6.md`.
- Campaña y reparto compartido: `src/content/campaign/`.
- Recorridos declarados: `src/content/playable/walkthroughs.json`.
- Medición de los cinco tamaños objetivo: `pnpm measure:viewports`. Requiere Chrome o Edge
  instalados; su salida verificada de M6 está en `docs/medicion_tamanos_m6_salida.md`.

M7A está **en curso**, con tres entregas parciales. La primera escribe el Tutorial 1, «El material
intruso»: reparar una variable, predecir su efecto y comprobar que un material o una técnica aislada
no son un enfoque. La segunda escribe el Caso 2, «Una frase, dos entradas»: comparar dos soluciones
defendibles para un mismo objetivo musical, con Dalcroze y el concepto Kodály como dos puertas a la
misma relación que no se funden. La tercera escribe el Caso 3, «Del modelo a una forma propia»:
montar tres momentos —modelo, exploración y forma— y comprobar que cambiar uno cambia lo que ocurre
en los otros dos. Es la primera unidad de la campaña que usa el montador de microclases; el proceso
es el de Orff-Schulwerk, elaborado con Gunild Keetman, y Willems y Martenot entran sólo al revisar,
como lentes que lo sostienen sin sustituirlo. Con ellas son cinco de las nueve unidades con
contenido, y la ruta presencial tiene sus tres tramos jugables. Falta el caso 4 —Suzuki— y todo M7B.

- Registro de la fase, decisiones y límites: `docs/contenido_m7a.md`.
- Contenido de las unidades: `src/content/playable/tutorial-material-intruso.json`,
  `src/content/playable/caso-una-frase-dos-entradas.json` y
  `src/content/playable/caso-del-modelo-a-una-forma-propia.json`.
- Medición verificada de las tres entregas: `docs/medicion_tamanos_m7a_salida.md`.
- **La tercera entrega está aprobada tras auditoría independiente.** `pnpm check` pasa con 331
  pruebas, TypeScript estricto y paquete PLATEA; los 32 recorridos declarados pasan en tres pasadas
  idénticas y en una pasada exhaustiva de los cinco tamaños —160 combinaciones y 3225 pantallas— sin
  desplazar ninguna pantalla de acción. El arnés mide además 20 rutas de referencia y estados
  difíciles en los cinco tamaños. Tres rondas de auditoría encontraron nueve hallazgos de contenido,
  contrato y cobertura; todos quedaron corregidos, cubiertos por regresiones o comprobaciones de
  navegador y verificados de nuevo antes de aprobar la entrega.

- Repositorio: <https://github.com/pinfante0/metodos-activos-videojuego>.
- Prueba pública: <https://pinfante0.github.io/metodos-activos-videojuego/>.
- Evidencia de publicación: `docs/prueba_publicacion_m3.md`.

El artículo de Vasil y Dockan (2023) disponible en `material/` ya fundamenta el puente del caso
piloto. Queda pendiente incorporarlo a la bibliografía de la presentación y la guía cuando se abra
una revisión editorial de esos materiales.
