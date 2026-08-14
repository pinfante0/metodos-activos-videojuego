# Comprobaciones automatizadas

Estado: **vigente desde M6**. Sustituye, para el arnés de navegador, al procedimiento de
`docs/medicion_tamanos_m5.md`, que se conserva como registro de cómo se llegó hasta aquí.

Este documento explica **qué demuestra cada comprobación**, porque una suite que nadie sabe leer
acaba ejecutándose por costumbre y aprobándose por inercia.

## 1. Cómo se ejecuta

```
pnpm check                                   # contenido, pruebas, compilación y paquete PLATEA
pnpm validate:content                        # sólo los contratos y el contenido, con detalle
pnpm test                                    # las once suites
pnpm build                                   # TypeScript estricto y empaquetado
pnpm measure:viewports --runs=3              # el arnés de navegador; requiere Chrome o Edge
pnpm measure:viewports --runs=1              # una pasada, para iterar
pnpm measure:viewports --all-viewports       # los cinco tamaños en todos los recorridos
pnpm measure:viewports --allow-scroll        # informa del desplazamiento sin fallar
pnpm measure:viewports --runs=3 --out=docs/medicion_tamanos_m6_salida.md
```

El arnés necesita una compilación en `dist/`: ejecute antes `pnpm build`. Chrome es una dependencia
externa deliberada; si no está en una ruta habitual, indíquela con `CHROME_PATH` o `--chrome=<ruta>`.

## 2. Las dos automatizaciones y qué demuestra cada una

Comparten **una sola fuente de recorridos**, `src/content/playable/walkthroughs.json`, y demuestran
cosas distintas. Ninguna repite el trabajo de la otra.

| | `tests/walkthroughs.test.ts` | `scripts/measure-viewports.mjs` |
| --- | --- | --- |
| Dónde corre | sesión pura, sin DOM | Chrome real, protocolo de DevTools |
| Qué demuestra | que la lógica del caso lleva a donde el contenido dice | que la pantalla que lo muestra cabe y se puede manejar |
| Coste | ~1 s | ~2 min con tres pasadas |

Un recorrido declara sus acciones **en orden de preferencia, no de escena**: en cada pantalla se
elige la primera disponible que no se haya usado ya. Consumirlas una sola vez es lo que permite
describir un reintento —elegir una opción que devuelve a la misma escena y después otra— sin girar
en vacío. Bloquearse es siempre un fallo con diagnóstico, nunca una salida silenciosa.

## 3. Las once suites

| Suite | Qué impide que ocurra |
| --- | --- |
| `contracts` | que un contrato de M3 acepte datos que no cumplen su forma. |
| `playable-content` | que el contenido jugable deje de validar o que el motor codifique texto. |
| `campaign` | que el mapa mienta: unidad jugable sin caso, pendiente con caso, secuencia con saltos, tramos que no suman lo que declaran. Comprueba además que **ninguna unidad queda bloqueada** por no haber completado las anteriores. |
| `cast-participation` | que una persona se convierta en la barrera permanente de un caso, quede reducida a ejecutar, sea omitida de un resultado o quede sin vía sin explicar qué decisión de diseño lo produce. |
| `consequence-engine` | que una regla quede tapada por otra, que una consecuencia escrita sea inalcanzable, que una etiqueta no la aporte ninguna acción o que una escena con reglas se quede sin resultado de reserva. |
| `assembly` | que un hueco del montador apunte a una escena que no existe, que dos huecos compartan pantalla —rompería la regla 1— o que un montador se quede sin pantalla de montaje. |
| `walkthroughs` | que un recorrido declarado deje de llegar a su cierre, atraviese otras consecuencias o produzca una bitácora con plantillas sin sustituir. |
| `test-states` | que una ruta de prueba apunte a un caso, una escena o una acción que ya no existen. |
| `progress-repository` | que el progreso se pierda o se corrompa, y que la degradación a memoria temporal siga siendo comprensible. |
| `router` | que un enlace docente o un QR dejen de resolver, incluidos los enlaces a una escena concreta. |
| `identity` | que la banda de escena represente a alguien, que aparezca una séptima señal sonora o que un recurso pierda su procedencia. |

## 4. Qué mide el arnés de navegador

En cada pantalla, **con los desplegables cerrados y después abiertos**:

- desbordamiento horizontal del documento;
- desplazamiento vertical de `main`, que es la regla 6 de `docs/decision_producto_m5.md`: ninguna
  pantalla de acción puede desplazarse en ninguno de los cinco tamaños objetivo ni en ningún estado
  de sus desplegables. Las páginas de referencia —campaña, bitácora, diagnóstico— quedan excluidas
  de la regla, pero se miden igual;
- el **lado menor** de todo control interactivo visible. Es el lado menor y no la altura: un enlace
  de 44 px de alto y 39 de ancho sigue siendo un objetivo pequeño, y así se encontró uno.

Además, una vez por ejecución:

- que el atajo numérico toma la decisión con pulsaciones de teclado reales;
- que la banda de escena sigue siendo decorativa y muda para la tecnología de apoyo;
- que con el sonido silenciado el equivalente textual se anuncia en una región viva que sobrevive a
  cada repintado;
- que con «Reducir movimiento» la entrada de la banda queda anulada;
- que **cada bloque con desplazamiento interno** tiene nombre en el árbol de accesibilidad real, se
  alcanza tabulando de verdad, muestra foco visible y responde a las flechas. Hoy son cinco:
  razonamiento y reparto, justificación, bitácora, montaje e incidente.

### Cobertura de tamaños

Medir los cinco tamaños en los diez recorridos multiplicaría el tiempo sin añadir cobertura: lo que
cambia entre recorridos es la lógica, y eso lo prueba la simulación pura. Cada recorrido declara su
`viewportCoverage`; se marcan `all` los que atraviesan pantallas con composición propia. Las páginas
de referencia y los estados difíciles se miden siempre en los cinco.

`--all-viewports` fuerza los cinco en todos los recorridos cuando haga falta una revisión completa.

### Descubrimiento de los estados difíciles

El arnés **lee `#/pruebas`** y mide todo lo que allí se enumere. Añadir un estado difícil lo
incorpora a la medición sin tocar el arnés, y si el índice dejara de publicar rutas, la ejecución
falla en lugar de medir menos en silencio.

## 5. Tres garantías contra el falso éxito

Las tres proceden de defectos reales encontrados en M5 y M6.

1. **El camino es explícito.** Elegir siempre la primera opción hacía que el tutorial volviera a su
   escena de observación y el recorrido girara en vacío hasta agotar los pasos.
2. **Llegar al final es obligatorio.** Agotar el límite de pasos o quedarse sin control que pulsar
   es un fallo. La ejecución también falla si no llegó a inspeccionarse ningún bloque con
   desplazamiento interno: no haber comprobado nada no es haber comprobado bien.
3. **Todo tiene tiempo límite.** Cada orden del protocolo, cada carga y la ejecución completa fallan
   con diagnóstico en lugar de esperar indefinidamente.

Además, las pasadas se comparan entre sí: si dos no coinciden, la medición no es reproducible y se
declara fallo aunque todo lo demás esté limpio.

## 6. Salida

`docs/medicion_tamanos_m6_salida.md` la genera el propio arnés y **no se edita a mano**. Se regenera
con la última orden del apartado 1.
