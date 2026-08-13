# Arquitectura M3

Estado: **decisión técnica de M3**. Esta arquitectura sostiene la prueba mínima y prepara el corte
gris; no autoriza a construir el juego completo antes de M4.

## 1. Decisión de plataforma

Se adopta una aplicación web estática con **TypeScript estricto, Vite y HTML semántico**, sin
framework de interfaz en M3. La prueba no necesita un árbol de componentes complejo y la capa de
dominio queda independiente del renderizado. Si M4 demuestra que la complejidad de estados exige un
framework, la decisión podrá revisarse sin cambiar los contratos de contenido, progreso ni recursos.

Dependencias de producción:

- `zod`, para validar en ejecución los datos que TypeScript no puede proteger al cargar JSON.

Dependencias de desarrollo:

- `vite` y `typescript`, para compilar la aplicación;
- `vitest`, para ejecutar el validador y probar contratos, rutas y almacenamiento;
- `fflate`, para producir el paquete IMS de PLATEA;
- `cross-env`, para identificar el destino de una compilación de forma reproducible.

No se incorporan motor de juego, backend, base de datos, cuentas, analítica ni IA.

## 2. Capas y dependencias

```text
src/content/*.json
        │
        ▼
src/domain/contracts ──► src/domain/validation
        │                        │
        └──────────────┬─────────┘
                       ▼
             src/app + infraestructura
                       │
                       ▼
                HTML semántico
```

- `domain/contracts`: vocabulario estable de caso, escena, acción, incidente, consecuencia,
  recurso y progreso. No conoce el navegador.
- `domain/validation`: reglas estructurales y relaciones entre identificadores. Rechaza referencias
  rotas, alternativas insuficientes y recursos inaccesibles.
- `content`: datos de autoría. M3 contiene solo una sonda técnica explícitamente marcada como no
  jugable y contraejemplos inválidos.
- `infrastructure`: adaptadores del entorno, empezando por persistencia local degradable.
- `app`: navegación y presentación. Depende del dominio; el dominio no depende de la interfaz.
- `scripts` y `tests`: comprobaciones de autoría, empaquetado y regresión.

## 3. Estado

Se separan tres clases de estado:

1. **Contenido inmutable validado:** casos e inventario cargados desde JSON. La compilación falla si
   las pruebas o el validador detectan un contrato roto.
2. **Estado efímero de sesión:** ruta actual y futura selección en curso. No se persiste cada gesto
   de interfaz.
3. **Progreso versionado:** casos completados, intentos, bitácora y preferencias. El adaptador usa
   `localStorage` con la clave `metodos.progress.v1`; si el navegador lo bloquea, cambia a memoria y
   lo explica en pantalla.

No se almacenan nombre, correo, identificador institucional, calificación ni telemetría. Una futura
migración deberá reconocer `schemaVersion`; M3 descarta de forma segura datos desconocidos.

## 4. Navegación

Se adopta enrutado por fragmento (`#/...`) porque GitHub Pages y los paquetes de contenido de
PLATEA sirven archivos estáticos desde subrutas que no controlan las reglas de reescritura.

Rutas reservadas:

| Ruta | Contrato |
| --- | --- |
| `#/` | Portada o reentrada. |
| `#/prueba-publicacion` | Diagnóstico visible de M3. |
| `#/caso/:slug` | Acceso docente directo a un caso, sin bloqueo rígido. |
| `#/ruta/clase` | Entrada futura a la ruta presencial compartida. |
| `#/bitacora` | Bitácora local futura. |

Vite usa `base: "./"`. Por ello, HTML, JavaScript y CSS no presuponen raíz de dominio ni nombre de
repositorio. Una ruta desconocida devuelve una pantalla comprensible sin petición adicional al
servidor.

## 5. Publicación

La misma base produce dos artefactos:

- **GitHub Pages:** `dist/`, desplegado por `.github/workflows/pages.yml`. La acción ejecuta primero
  validador y pruebas.
- **PLATEA:** `release/el-aula-de-los-dos-minutos-m3-platea.zip`, paquete IMS Content 1.1 con
  `imsmanifest.xml` e `index.html` en su raíz. Se genera con `pnpm build:platea` y no se versiona el
  binario; sí se versionan el generador y el bloqueo de dependencias.

La pantalla técnica expone el destino de compilación, el identificador de build y la revisión para
que una comprobación en navegador distinga una publicación real de una copia antigua.

## 6. Accesibilidad desde el primer corte

- estructura con encabezado, navegación por enlaces, `main`, foco visible y enlace de salto;
- teclado y táctil mediante controles nativos;
- contraste medido en una paleta provisional, no identidad visual final;
- consulta `prefers-reduced-motion` y contrato obligatorio de alternativa para animaciones;
- contrato de texto o señal visual para información sonora, transcripción para habla y subtítulos
  para vídeo con habla;
- la ausencia de almacenamiento persistente se comunica y no impide continuar.

La dirección visual, los personajes y los recursos definitivos pertenecen a M5 y M8.

## 7. Límites deliberados

M3 no implementa el tutorial, el montador de tres momentos, el incidente jugable, la revisión, la
bitácora visible ni el caso piloto. Tampoco mide tiempos de juego. La sonda JSON usa textos técnicos
para comprobar todas las referencias sin convertirse en contenido de campaña.
