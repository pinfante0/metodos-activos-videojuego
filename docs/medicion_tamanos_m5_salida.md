# Salida reproducible de `pnpm measure:viewports --runs=3`

Generada por el propio arnés. **No se edita a mano**: se regenera con
`pnpm measure:viewports --runs=3 --out=docs/medicion_tamanos_m5_salida.md`.
El procedimiento y la interpretación están en `docs/medicion_tamanos_m5.md`.

Pasadas ejecutadas: 3.
Resultados idénticos en todas las pasadas: **sí**.

- Recorridos completados hasta su pantalla de cierre: 2 × 5 = 10.
- Pantallas medidas por pasada: 120, cada una con los desplegables cerrados y abiertos.
- Desbordamiento horizontal: ninguno.
- Objetivo táctil mínimo: 44 px.
- Desplazamiento vertical en pantallas de acción: **ninguno**, en ningún tamaño ni estado.

| Comprobación de interacción | Resultado | Detalle |
| --- | --- | --- |
| Teclado: el atajo numérico toma la decisión | correcto | aparece la retroalimentación sin haber tocado el ratón |
| La banda de escena es decorativa | correcto | oculta a la tecnología de apoyo y sin texto propio |
| Silencio: el equivalente textual sigue anunciándose | correcto | «Sonido silenciado · Consecuencia coherente y defendible. (…» |
| El equivalente textual vive en una región viva persistente | correcto | role=status y fuera del contenedor que se repinta |
| Movimiento reducido: la entrada de la banda queda anulada | correcto | data-reduced-motion=true, animation-duration=1e-05s |

| Bloque con desplazamiento interno · 360 × 640 | Resultado | Detalle |
| --- | --- | --- |
| «reparación y observables»: nombre accesible | correcto | «Reparación y los cuatro observables» |
| «reparación y observables»: alcanzable con el tabulador | correcto | recibe el foco tabulando |
| «reparación y observables»: foco visible | correcto | contorno solid de 3 px |
| «reparación y observables»: se desplaza con el teclado | correcto | las flechas mueven el bloque; recorrido disponible de 154 px |
| «vista previa de la bitácora»: nombre accesible | correcto | «Entrada de bitácora en revisión» |
| «vista previa de la bitácora»: alcanzable con el tabulador | correcto | recibe el foco tabulando |
| «vista previa de la bitácora»: foco visible | correcto | contorno solid de 3 px |
| «vista previa de la bitácora»: se desplaza con el teclado | correcto | las flechas mueven el bloque; recorrido disponible de 678 px |
| «justificación en construcción»: nombre accesible | correcto | «Justificación en construcción» |
| «justificación en construcción»: alcanzable con el tabulador | correcto | recibe el foco tabulando |
| «justificación en construcción»: foco visible | correcto | contorno solid de 3 px |
| «justificación en construcción»: se desplaza con el teclado | correcto | no desborda a este tamaño, no hay nada que desplazar |
