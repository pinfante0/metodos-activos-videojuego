# Prueba de publicación M3

Estado: **en ejecución; GitHub Pages verificado y PLATEA pendiente de comprobación**. Este
documento se cerrará cuando la misma salida mínima se haya observado también en PLATEA.

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
- La carga la realiza el profesor en el espacio que elija. Codex no accede, edita ni publica
  material del curso.
- Pendiente: URL o ubicación elegida, fecha y resultado observado tras la carga del profesor.
