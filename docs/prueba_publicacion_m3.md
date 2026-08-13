# Prueba de publicación M3

Estado: **en ejecución**. Este documento se cerrará con URL, fecha, revisión y resultado observado
en navegador real para GitHub Pages y PLATEA.

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

Pendiente de completar después de las publicaciones reales.
