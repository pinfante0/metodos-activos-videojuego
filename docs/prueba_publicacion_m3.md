# Prueba de publicación M3

Estado: **completado**. La misma salida mínima se ha comprobado en GitHub Pages y PLATEA.

## Artefactos reproducibles

- `pnpm build:pages` crea `dist/` con base relativa y destino visible `github-pages`.
- `pnpm build:platea` crea el mismo sitio con destino visible `platea` y lo empaqueta como IMS
  Content 1.1 en `release/el-aula-de-los-dos-minutos-m3-platea.zip`.
- `pnpm check` valida contenido, ejecuta pruebas, compila y produce el paquete PLATEA.

## Criterios de comprobación en ambos destinos

1. carga `index.html` sin errores de JavaScript ni recursos 404;
2. la pantalla `#/prueba-publicacion` presenta cuatro indicadores correctos;
3. el destino de compilación coincide con el alojamiento;
4. `#/caso/m3-contract-probe` abre directamente y conserva la parada deliberada de M3;
5. el foco por teclado es visible y el enlace de salto llega a `main`;
6. al recargar una ruta con fragmento, la vista se conserva;
7. si existe almacenamiento local, se informa como persistente; si se bloquea, la aplicación sigue
   funcionando y lo identifica como memoria temporal.

## Registro de verificación

### GitHub Pages

- Repositorio público: <https://github.com/pinfante0/metodos-activos-videojuego>.
- URL publicada: <https://pinfante0.github.io/metodos-activos-videojuego/>.
- Fecha de comprobación: 13 de agosto de 2026.
- Revisión desplegada: `c6cabb61124d71bc1898ecb3c9930a3779622605`.
- Ejecución reproducible: `Publicar prueba M3 en GitHub Pages #3`, completada correctamente en
  28 segundos; el propio flujo volvió a validar los datos y ejecutó las 13 pruebas.
- Resultado en navegador real: carga correcta bajo subruta, sin desbordamiento horizontal;
  `#/caso/m3-contract-probe` abre directamente y conserva la vista tras recargar.
- Alcance observado: pantalla técnica de M3, sin tutorial ni caso jugable, conforme a la parada
  deliberada de esta fase.

### PLATEA

- Paquete preparado: `release/el-aula-de-los-dos-minutos-m3-platea.zip`.
- Recurso comprobado: <https://platea.ujaen.es/pluginfile.php/717147/mod_resource/content/1/index.html#/prueba-publicacion>.
- Fecha de comprobación: 13 de agosto de 2026.
- Protocolo: el profesor cargó el paquete en el espacio que eligió; Codex no entró en la edición
  del curso ni modificó materiales y se limitó a observar el recurso ya abierto.
- Resultado: los cuatro indicadores aparecen correctos; el destino es `platea`, la base es `./` y
  el almacenamiento local está disponible.
- Navegación: `#/caso/m3-contract-probe` abre correctamente, no presenta desbordamiento horizontal
  y conserva la misma vista después de una recarga. La pantalla se devolvió a
  `#/prueba-publicacion` al terminar.

Con ambas publicaciones observadas y los contratos comprobados, se supera la puerta de salida de
M3 sin haber construido todavía el tutorial ni el caso jugable.
