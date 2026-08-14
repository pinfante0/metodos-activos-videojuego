# Contrato de recursos y registro de procedencia

Estado: **fijado el 14 de agosto de 2026**, con la identidad Aula-laboratorio escénica.

Extiende, sin sustituirlo, el contrato de recursos definido en M3 y validado por
`src/domain/contracts/resources.ts`. Aquel fija qué debe declarar un recurso; éste fija qué
recursos tendrá este juego, con qué presupuesto y bajo qué reglas.

## 1. Qué cuenta como recurso

Cualquier imagen, sonido, música, voz, vídeo o animación que llegue a la persona que juega. Incluye
lo generado por código: la silueta de la banda de escena está trazada en un módulo TypeScript y las
seis señales están sintetizadas en el navegador, y **ambas cosas están en el registro**. No queda
fuera del registro nada que se vea o se oiga.

No cuentan como recurso la tipografía del sistema, el color ni la retícula, que son decisiones de
hoja de estilos sin archivo ni licencia asociados.

## 2. Qué debe declarar cada recurso

Lo exige el esquema y lo comprueba `validateResourceInventory` al arrancar la aplicación:

- `id`, `kind` y `status` —`planned`, `prototype` o `final`—;
- `file` en cuanto deja de ser `planned`;
- `decorative`, `containsSpeech` y `containsEssentialSound`;
- `source` completo: `origin`, `creator`, `license`, `attribution` y, si el origen es `licensed`,
  `sourceUrl` obligatoria;
- `alternatives`, con las reglas del apartado siguiente.

## 3. Reglas de alternativa

Son las de M3 y no se relajan:

- una imagen informativa necesita `altText`; una decorativa no lo necesita, pero entonces debe estar
  realmente oculta a la tecnología de apoyo;
- todo sonido necesita `textEquivalent` o `visualEquivalent`; en este juego se exigen **los dos**,
  porque el equivalente textual sirve a quien no oye y el visual a quien juega en silencio;
- el habla necesita transcripción, y el vídeo con habla, subtítulos;
- toda animación necesita `reducedMotionFallback`.

Regla propia de esta identidad: **ninguna señal sonora puede ser la única portadora de una
información**. El sonido confirma; nunca informa en exclusiva.

## 4. Presupuesto y formatos para M8

- **Imagen:** SVG siempre que sea trazo, retícula o silueta. Mapa de bits sólo si es inevitable, en
  WebP o AVIF, con versión de reserva. Ninguna imagen individual por encima de 120 kB.
- **Sonido:** las seis señales, en OGG Vorbis con reserva en MP3, monoaurales, por debajo de 40 kB
  cada una y de medio segundo de duración.
- **Sin banda sonora continua.** No es un olvido: la fatiga sonora es un riesgo declarado de esta
  identidad y un recorrido de aula se repite muchas veces seguidas.
- **Sin tipografías descargadas.** Se usan las del sistema.
- **Presupuesto total de recursos: 600 kB.** Si algo no cabe, se recorta el recurso, no la
  alternativa accesible.

## 5. Procedencia y licencia

- **Origen preferente: propio.** Los ocho recursos actuales son originales.
- Licencia del material propio: **CC BY-SA 4.0**, coherente con el carácter docente del proyecto.
- Material ajeno: sólo con licencia compatible y `sourceUrl` verificable. Queda **prohibido**
  incorporar material de origen desconocido, «encontrado» o sin licencia explícita, aunque circule
  libremente.
- Toda atribución debe poder mostrarse dentro del juego antes de la publicación de M9.

## 6. Registro vigente

Ejecutable en `src/content/identity/resources.json` y validado al arrancar; el diagnóstico de
`#/prueba-publicacion` lo muestra como comprobación. Ocho recursos, todos en estado `prototype`,
todos de origen propio: **ninguno es definitivo todavía**.

| Recurso | Tipo | Decorativo | Alternativa declarada |
| --- | --- | --- | --- |
| `stage-silhouette` | imagen | sí | ninguna, por decorativa y oculta |
| `stage-light-change` | animación | sí | estado final fijo sin entrada |
| `cue-decision` | efecto | no | textual y visual |
| `cue-consequence-coherent` | efecto | no | textual y visual |
| `cue-consequence-revision` | efecto | no | textual y visual |
| `cue-consequence-incoherent` | efecto | no | textual y visual |
| `cue-incident` | efecto | no | textual y visual |
| `cue-journal` | efecto | no | textual y visual |

## 7. Qué falta para cerrar M8

- Grabar las seis señales con instrumentos reales y sustituir el sintetizador.
- Decidir si habrá personajes. **No es una decisión de arte**: exige que el contrato de contenido
  declare participación y reparto, lo que pertenece a M6. Sin esa ampliación no habrá personajes,
  porque dibujarlos obligaría a inventar quién decide.
- Producir la silueta y los fondos definitivos de la banda de escena.
- Publicar la pantalla de atribuciones antes de M9.
