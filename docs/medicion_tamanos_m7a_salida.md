# Salida reproducible de `pnpm measure:viewports --runs=3`

Generada por el propio arnés. **No se edita a mano**: se regenera con
`pnpm measure:viewports --runs=3 --out=docs/medicion_tamanos_m7a_salida.md`.
El procedimiento y la interpretación están en `docs/comprobaciones_m6.md`.

Pasadas ejecutadas: 3.
Resultados idénticos en todas las pasadas: **sí**.

- Recorridos declarados: 32, completados hasta su pantalla de cierre en 68 combinaciones de recorrido y tamaño.
- Pantallas de recorrido medidas por pasada: 1257, cada una con los desplegables cerrados y abiertos.
- Páginas de referencia y estados difíciles: 20 rutas × 5 tamaños = 100 pantallas, medidas una vez.
- Desbordamiento horizontal: ninguno.
- Objetivo táctil mínimo: 44 px.
- Desplazamiento en pantallas de acción · recorridos: **ninguno**, en ningún tamaño ni estado.
- Desplazamiento en pantallas de acción · estados difíciles: **ninguno**, en ningún tamaño ni estado.

| Comprobación de interacción | Resultado | Detalle |
| --- | --- | --- |
| Teclado: el atajo numérico toma la decisión | correcto | aparece la retroalimentación sin haber tocado el ratón |
| La banda de escena es decorativa | correcto | oculta a la tecnología de apoyo y sin texto propio |
| Silencio: el equivalente textual sigue anunciándose | correcto | «Sonido silenciado · Consecuencia defendible con revisión n…» |
| El equivalente textual vive en una región viva persistente | correcto | role=status y fuera del contenedor que se repinta |
| Movimiento reducido: la entrada de la banda queda anulada | correcto | data-reduced-motion=true, animation-duration=1e-05s |
| Reflexión sin montaje: no ofrece cerrar el caso | correcto | no existe ningún control de cierre |
| Reflexión sin montaje: avisa de qué falta | correcto | «La bitácora recoge decisiones, y esta microclase todavía n…» |
| Reflexión sin montaje: la salida es un objetivo táctil suficiente | correcto | lado menor de 48 px |
| Reflexión sin montaje: la salida apunta al momento que falta | correcto | href=#/caso/del-modelo-a-una-forma-propia/c3-model |
| Reflexión sin montaje: la salida se alcanza con el tabulador | correcto | recibe el foco tabulando |
| Reflexión sin montaje: la salida conduce al momento 1 y se puede decidir | correcto | #/caso/del-modelo-a-una-forma-propia/c3-model · «Momento 1 · cómo conoce el grupo el motivo» · 3 opciones |

| Bloque con desplazamiento interno · 360 × 640 | Resultado | Detalle |
| --- | --- | --- |
| «reparación, observables y reparto»: nombre accesible | correcto | «Reparación y los cuatro observables» |
| «reparación, observables y reparto»: alcanzable con el tabulador | correcto | recibe el foco tabulando |
| «reparación, observables y reparto»: foco visible | correcto | contorno solid de 3 px |
| «reparación, observables y reparto»: se desplaza con el teclado | correcto | las flechas mueven el bloque; recorrido disponible de 154 px |
| «marco pedagógico de la consecuencia»: nombre accesible | correcto | «Marco pedagógico de la consecuencia» |
| «marco pedagógico de la consecuencia»: alcanzable con el tabulador | correcto | recibe el foco tabulando |
| «marco pedagógico de la consecuencia»: foco visible | correcto | contorno solid de 3 px |
| «marco pedagógico de la consecuencia»: se desplaza con el teclado | correcto | las flechas mueven el bloque; recorrido disponible de 18 px |
| «vista previa de la bitácora»: nombre accesible | correcto | «Entrada de bitácora en revisión» |
| «vista previa de la bitácora»: alcanzable con el tabulador | correcto | recibe el foco tabulando |
| «vista previa de la bitácora»: foco visible | correcto | contorno solid de 3 px |
| «vista previa de la bitácora»: se desplaza con el teclado | correcto | las flechas mueven el bloque; recorrido disponible de 678 px |
| «relato del incidente»: nombre accesible | correcto | «Qué revela el incidente» |
| «relato del incidente»: alcanzable con el tabulador | correcto | recibe el foco tabulando |
| «relato del incidente»: foco visible | correcto | contorno solid de 3 px |
| «relato del incidente»: se desplaza con el teclado | correcto | las flechas mueven el bloque; recorrido disponible de 124 px |
| «justificación en construcción»: nombre accesible | correcto | «Justificación en construcción» |
| «justificación en construcción»: alcanzable con el tabulador | correcto | recibe el foco tabulando |
| «justificación en construcción»: foco visible | correcto | contorno solid de 3 px |
| «justificación en construcción»: se desplaza con el teclado | correcto | no desborda a este tamaño, no hay nada que desplazar |
| «montaje de la microclase»: nombre accesible | correcto | «Montaje de la microclase» |
| «montaje de la microclase»: alcanzable con el tabulador | correcto | recibe el foco tabulando |
| «montaje de la microclase»: foco visible | correcto | contorno solid de 3 px |
| «montaje de la microclase»: se desplaza con el teclado | correcto | las flechas mueven el bloque; recorrido disponible de 192 px |
