# Contratos de contenido M3

Estado: **contratos comprobados en M3**. La fuente pedagógica continúa siendo
`docs/revision_tema_8.md`; estos esquemas describen cómo representar decisiones ya aprobadas, no
crean contenido pedagógico nuevo.

## 1. Principios que el modelo hace exigibles

- la función precede al nombre del enfoque;
- toda decisión enlaza con una consecuencia escrita y una evidencia observable;
- las consecuencias declaran posibilidades plausibles, no diagnósticos;
- no existe puntuación global ni un enfoque ganador universal;
- cuando el caso lo declara, deben existir al menos dos alternativas defendibles;
- inclusión y accesibilidad, así como evidencia y contexto, atraviesan todos los casos;
- la bitácora conserva objetivo, decisión inicial, mantenimiento, revisión, detonante, riesgo,
  adaptación, evidencia, alternativa y gramática final;
- todo recurso lleva procedencia, licencia, atribución y alternativa accesible pertinente.

Los objetos son estrictos: un campo desconocido como `globalScore` invalida los datos.

## 2. Contrato de caso

`CaseDefinition` agrega:

| Campo | Responsabilidad |
| --- | --- |
| `schemaVersion` | Permitir migraciones explícitas. |
| `status` | Distinguir sonda, borrador, revisión y publicación. |
| `modes` | Compartir contenido entre clase y casa sin duplicarlo. |
| `approachIds` | Referenciar los diez contenidos canónicos con peso decidido fuera del esquema. |
| `stableQuestions` y `lenses` | Hacer visible la cobertura pedagógica. |
| `pedagogy` | Prohibir ganador universal y acotar el estatuto de las consecuencias. |
| `entrySceneId` | Abrir una ruta directa sin depender del progreso. |
| `scenes`, `actions`, `incidents`, `consequences` | Separar presentación, decisión y resultado. |
| `journalFields` | Garantizar una bitácora comparable entre casos. |

El validador comprueba unicidad y existencia de todas las referencias, incluida la siguiente escena,
los recursos audiovisuales y las acciones de revisión de un incidente.

## 3. Escenas y flujo

La unión discriminada `Scene` admite siete funciones:

1. `observation`: marcar o elegir indicios;
2. `design`: seleccionar entre las ranuras entrada, acción musical, mediación/apoyo y evidencia;
3. `consequence`: mostrar observables y retroalimentación;
4. `incident`: revelar una restricción de una de las ocho familias aprobadas;
5. `revision`: mantener una decisión y cambiar otra;
6. `justification`: construir la gramática estructurada;
7. `reflection`: trasladar el resultado a la bitácora.

Esta taxonomía no prescribe pantallas ni minijuegos. M4 podrá agrupar o repartir funciones visuales
sin cambiar su significado.

## 4. Acciones, consecuencias e incidentes

Una `Action` contiene etiqueta, principios funcionales y la consecuencia a la que conduce. Una
`Consequence` tiene uno de tres estados cualitativos:

- `coherent-defensible`;
- `defensible-needs-revision`;
- `incoherent-with-brief`.

Su devolución conserva cuatro piezas: qué sostiene, qué tensiona, una reparación posible y qué
evidencia mirar. Los observables separan aprendizaje, agencia, barrera y evidencia para evitar
inferencias psicológicas sobre los personajes.

Un `Incident` pertenece a tiempo, espacio/movimiento, recursos, acceso/carga, experiencia/roles,
repertorio/cultura, docencia o transferencia. Debe ofrecer al menos dos acciones de revisión; la
discapacidad, el origen o la dificultad no funcionan como sorpresa.

## 5. Recursos audiovisuales

`ResourceInventory` registra estado (`planned`, `prototype`, `final`), archivo cuando ya existe,
procedencia, autoría, licencia, atribución y alternativas. Las reglas semánticas exigen:

- texto alternativo en imágenes informativas;
- equivalente textual o visual para audio, música, efectos, voz y sonido esencial de vídeo;
- transcripción para habla;
- archivo de subtítulos en vídeo con habla;
- alternativa de movimiento reducido para animación;
- URL de procedencia para material licenciado;
- archivo real para recursos en estado prototipo o final.

M3 registra únicamente recursos planeados de la sonda. La selección, licencia y producción reales
se aplazan a M5 y M8.

## 6. Progreso y bitácora

`Progress` tiene versión, fecha, recomendación no bloqueante, casos completados, número de intentos,
bitácora y preferencias de sonido/movimiento. Cada `JournalEntry` registra un intento mediante un UUID
local, no una identidad del alumno. No existe contrato de envío ni calificación.

## 7. Datos de prueba

- `src/content/fixtures/case.valid.json`: sonda que atraviesa los siete tipos de escena y resuelve
  referencias de acciones, incidente, consecuencias, recursos y bitácora.
- `src/content/fixtures/resources.valid.json`: sonido y animación planeados con alternativas.
- `src/content/fixtures/case.invalid.json`: intenta introducir `globalScore` y omite colecciones
  obligatorias.
- `src/content/fixtures/resources.invalid.json`: voz sin alternativa, transcripción ni URL de
  procedencia.
- las pruebas generan además una copia estructuralmente correcta con una referencia rota.

`pnpm validate:content` debe aceptar las dos fuentes válidas y rechazar deliberadamente las dos
inválidas. `pnpm test` comprueba además referencias semánticas, rutas y degradación del almacenamiento.
