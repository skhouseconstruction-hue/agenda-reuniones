# Mi Agenda — cambios publicados

Repositorio: `skhouseconstruction-hue/agenda-reuniones`
Rama: `main`

## Estado actual

- Caché de la aplicación: `mi-agenda-v14`.
- El botón «← Volver» del menú de Mi Agenda ahora es compacto y discreto: queda como un control pequeño, redondeado y accesible en la esquina superior izquierda.
- Se conserva la acción existente `returnToAgendaChooser()`; este ajuste cambia únicamente la presentación del botón.
- El service worker precarga `index.html`, `literatura.js` y `manifest.json`, y utiliza la nueva versión de caché para que el navegador reciba el cambio.

## Historial de mejoras identificadas

- Entrada directa a Mi Agenda en el menú lateral.
- Corrección de «Volver» para regresar al menú lateral.
- Actualización de caché para reflejar los cambios de navegación.
- Optimización de la comprobación y descarga de actualizaciones.
- Ajuste compacto del botón «Volver» y publicación de caché v14.

## Archivos relacionados

- `index.html`: interfaz y estilos de Mi Agenda.
- `sw.js`: actualización y caché de la aplicación.
- `literatura.js`: módulo Literatura (se conserva sin cambios en esta publicación).
- `manifest.json`: configuración instalable (se conserva sin cambios en esta publicación).

Este archivo se mantiene como bitácora de cambios para facilitar futuras revisiones y continuaciones del proyecto.
