# Decisión de producto · el juego no puede acabar siendo una ficha con ilustraciones

Estado: **vinculante desde el 14 de agosto de 2026**. Afecta a M5, M6, M7C, M8 y M10.

## 1. El riesgo

El corte actual es demasiado textual. Tal como está, alguien podría leerlo como un cuestionario
razonado y no como un juego: se lee mucho antes de decidir algo, y la consecuencia llega como
párrafo antes que como experiencia.

El riesgo no es estético. Si el corte se percibe como una ficha, el alumnado de 18 o 19 años baja
la implicación, y entonces la calidad del razonamiento pedagógico deja de importar porque nadie
llega hasta él. Un buen contenido que no se recorre no enseña.

## 2. La decisión

Se corrige **por composición, no eliminando rigor**. Ni un texto pedagógico se elimina, se acorta ni
se encoge para hacer sitio. Lo que cambia es qué se muestra a la vez, en qué orden y a qué distancia
de la mano.

Ocho reglas, vinculantes para todo lo que se construya a partir de aquí.

1. **Una tarea o decisión principal por pantalla.** Si una pantalla pide dos cosas, son dos
   pantallas.
2. **Lo imprescindible se entiende en la primera vista**, sin desplazar ni desplegar nada.
3. **La explicación pedagógica completa puede aparecer mediante revelado progresivo**, detalles
   solicitables o bitácora. Completa quiere decir completa: no se recorta, se pide.
4. **Nada se duplica dentro de una misma pantalla.** Si un dato ya está a la vista, ni la imagen ni
   el pie de figura ni un segundo panel lo repiten.
5. **No se reduce el tamaño del texto pedagógico para hacerlo caber.** Si no cabe, el problema es la
   composición, no el texto.
6. **Ninguna pantalla de acción se desplaza**, en ninguno de los cinco tamaños objetivo y en ningún
   estado de sus desplegables. Las páginas de referencia —bitácora general, diagnóstico— sí pueden
   hacerlo. Un bloque puede desplazarse por dentro, siempre que reciba foco por teclado, tenga
   nombre accesible, muestre foco visible y responda a las flechas.
7. **No hay puntos, recompensas arbitrarias ni gamificación decorativa.** Ni insignias, ni niveles,
   ni marcadores. El realce marca estado, nunca premio. Esta regla es coherente con el contrato de
   contenido, que ya prohíbe puntuar una decisión docente.
8. **El interés proviene de decidir, observar una reacción, afrontar un incidente y repararlo.** No
   de adornar la espera entre dos párrafos.

## 3. Qué se ha aplicado ya en M5

- La pantalla de consecuencia muestra el estado, la banda de escena y el contraste entre lo que la
  decisión sostiene y lo que tensiona. La reparación y los cuatro observables bajan a un desplegable
  (reglas 2 y 3).
- La banda de escena perdió su pie de figura: repetía los observables que ya estaban en la pantalla
  (regla 4).
- La regla 6 se cumple hoy en el tutorial y en el caso piloto, **con los desplegables cerrados y
  abiertos**, incluidas las pantallas de justificación y de bitácora del caso, que ya se desplazaban
  en M4 antes de que M5 tocara nada. Se consiguió con composición —los bloques de repaso encogen al
  hueco disponible y se desplazan por dentro—, sin encoger ni un texto.
- Todo bloque con desplazamiento interno es alcanzable con el tabulador, tiene nombre accesible,
  muestra foco visible y responde a las flechas. La regla 3 no puede pagarse dejando fuera a quien
  navega con teclado.
- El arnés `pnpm measure:viewports` **falla con código de salida 1** si la regla 6 se rompe en
  cualquiera de los dos estados, si un recorrido no llega a su pantalla de cierre o si alguna
  operación se bloquea, de modo que deja de depender de que alguien se acuerde de mirar.

## 4. Encargos a fases posteriores

### M6 · Sistema y campaña

El interés debe provenir de **decidir, observar una reacción, afrontar un incidente y reparar**. Ese
es el bucle, y es lo que hay que hacer crecer: no la cantidad de texto por pantalla ni la
decoración entre pantallas.

Consecuencias concretas para M6:

- cada caso necesita al menos un incidente que cambie una condición y obligue a revisar;
- la reacción debe poder percibirse antes de leerse, lo que exige decidir si el contrato de
  contenido se amplía para declarar participación y reparto —hoy no lo declara, y sin eso la
  identidad no puede mostrar a quién afecta una decisión sin inventarlo;
- ninguna pantalla nueva puede incumplir las ocho reglas del apartado 2.

### M7C · Recorte editorial, equilibrio y tiempos

Habrá **recorte editorial**: los textos actuales se escribieron para leerse, no para jugarse, y hay
que equilibrarlos contra el ritmo. Hay que **medir tiempos reales** por escena y por recorrido
completo, y ajustar la ruta presencial de 25 a 28 minutos con datos, no con estimaciones.

### M10 · Piloto

El piloto no puede comprobar sólo comprensión. Debe comprobar también **aburrimiento, abandono,
ritmo y deseo de continuar**. Un recorrido que se entiende pero se abandona a la mitad es un
fracaso de este proyecto, no un éxito parcial.

Instrumentos mínimos que M10 tendrá que prever: dónde se abandona, cuánto se tarda por escena, qué
pantallas se saltan sin leer, y si alguien pide seguir cuando el recorrido termina.
