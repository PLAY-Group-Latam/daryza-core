Especificación Técnica: Componente de Tabla en Editor de Texto Enriquecido (Rich Text Editor)Versión: 1.0Estado: Borrador para revisión técnicaAudiencia: Ingeniería Frontend, Diseño UX/UI, QA, Producto1. Visión General y Alcance1.1 PropósitoDefinir el comportamiento, modelo de datos, interacción mediante teclado y ratón, accesibilidad, serialización y criterios de aceptación para insertar, editar y navegar tablas dentro de un editor de texto enriquecido.1.2 Fuera de alcance (v1)Fórmulas o cálculos tipo hoja de cálculo (ej. =SUM(...)).Ordenamiento dinámico por columna en modo edición.Gráficos incrustados o vinculación a fuentes de datos externas.2. Modelo de Datos y EsquemaEl documento se modela como un árbol jerárquico inmutable o transaccional (compatible con arquitecturas tipo ProseMirror / Slate / TipTap).2.1 Estructura de nodos{
"type": "table",
"attrs": {
"id": "tbl_9f8a7b6c",
"columnWidths": [180, 240, 140],
"alignment": "left",
"headerRow": true,
"headerColumn": false,
"striped": false,
"bordered": true
},
"content": [
{
"type": "tableRow",
"attrs": {
"isHeader": true,
"minHeight": 40
},
"content": [
{
"type": "tableCell",
"attrs": {
"colspan": 1,
"rowspan": 1,
"backgroundColor": null,
"textAlign": "left",
"verticalAlign": "middle"
},
"content": [
{
"type": "paragraph",
"content": [{ "type": "text", "text": "Encabezado 1" }]
}
]
}
]
}
]
}
2.2 Invariantes del modeloToda tabla contiene al menos 1 fila y 1 columna.La suma efectiva de colspan en cada fila debe ser igual al número total de columnas (columnWidths.length).Las celdas combinadas (colspan > 1 o rowspan > 1) no pueden superponerse ni desbordar los límites de la tabla.Toda celda contiene al menos un bloque válido (por defecto un paragraph vacío) para garantizar siempre una posición válida de cursor.3. Funcionalidades y Comportamiento3.1 InserciónDesde toolbar: Selector visual de cuadrícula (ej. hasta $10 \times 10$) con vista previa de filas y columnas, más opción de inserción personalizada.Desde slash command (/table): Inserta una tabla base (por defecto $3 \times 3$, con fila de encabezado activada) y posiciona el cursor en la primera celda.Deshacer/Rehacer: La inserción completa es una única transacción atómica en el historial (Undo/Redo).3.2 Navegación y selecciónTab / Shift + Tab: Avanza o retrocede a la siguiente/anterior celda. Si está en la última celda y se presiona Tab, agrega una nueva fila al final y enfoca su primera celda.Flechas direccionales (↑, ↓, ←, →):Navegan dentro del texto de la celda; al llegar al borde del contenido, saltan a la celda adyacente correspondiente.Selección múltiple:Arrastrar con el puntero entre celdas o usar Shift + Clic / Shift + Flecha selecciona un rango rectangular normalizado de celdas.Acciones permitidas sobre selección múltiple: borrar contenido (Delete/Backspace), aplicar color de fondo, alineación o combinar celdas (si forman un rectángulo válido).3.3 Edición estructuralFilas: Insertar arriba, insertar abajo, duplicar, eliminar fila.Columnas: Insertar a la izquierda, insertar a la derecha, eliminar columna.Combinar y dividir celdas:Merge: habilitado cuando hay $\ge 2$ celdas seleccionadas formando un rectángulo sin conflictos. El contenido no vacío se concatena con salto de párrafo o conserva el primer bloque según regla definida.Split: habilitado en celdas con colspan > 1 o rowspan > 1; restaura celdas individuales vacías en los huecos liberados.Redimensionado:Ancho de columna: arrastrar el asa en el borde derecho de la cabecera/columna (con ancho mínimo, ej. 60px).Tabla completa: contenedor con scroll horizontal si el ancho supera el viewport del editor.Eliminación de tabla: Acción explícita desde menú contextual/toolbar (Eliminar tabla) con confirmación si contiene datos relevantes o con soporte inmediato de Undo.3.4 Contenido interno de celdaSoporta párrafos, texto en negrita/cursiva/código inline, enlaces y listas simples (según políticas del producto).No permite anidar otra table dentro de una celda en v1.Al pegar texto tabular (TSV/CSV desde Excel/Sheets o <table> desde HTML):Si el cursor está dentro de una celda y el portapapeles contiene una matriz, rellena o expande filas/columnas de forma predecible en una sola transacción.4. Interfaz de Usuario (UX/UI)Barra contextual flotante (Bubble Menu): Aparece al tener el foco o selección dentro de la tabla, agrupando acciones frecuentes:Fila (+ Arriba, + Abajo, Eliminar)Columna (+ Izquierda, + Derecha, Eliminar)Celdas (Combinar, Dividir, Color de fondo, Alineación)Tabla (Alternar encabezado, Eliminar tabla)Indicadores visuales:Resaltado sutil del borde de la celda activa y del rango seleccionado.Guías visuales al redimensionar columnas.Responsividad: Scroll horizontal limpio en pantallas estrechas sin romper el layout general de la página.5. Accesibilidad (WCAG 2.1 AA)Usar semántica HTML nativa (<table>, <thead>, <tbody>, <tr>, <th>, <td>) en el renderizado.Asignar scope="col" en encabezados de columna y scope="row" cuando headerColumn: true.Mantener orden de tabulación lógico y contraste suficiente en bordes, selecciones y controles flotantes.Anunciar cambios estructurales relevantes (ej. fila/columna agregada o eliminada) mediante regiones aria-live discretas cuando aplique.6. Serialización y PortabilidadExportación/Importación HTML: Sanitizar etiquetas y atributos peligrosos (XSS), normalizar colspan/rowspan y descartar estilos inline no permitidos.Exportación Markdown (GFM): Convertir tablas simples (sin rowspan/colspan complejos) a sintaxis pipe (| ... |); advertir o degradar de forma controlada si hay celdas combinadas que Markdown estándar no soporta.7. Rendimiento y LímitesMantener fluidez al escribir y navegar en tablas medianas/grandes (ej. hasta $50 \times 20$ celdas).Evitar re-renderizar toda la tabla en cada pulsación de tecla; aislar actualizaciones al nodo/celda modificada.Definir un límite superior configurable (ej. máximo de filas/columnas) para prevenir bloqueos accidentales de UI.8. Criterios de Aceptación (QA)[ ] Insertar una tabla enfoca la primera celda y permite escribir de inmediato.[ ] Tab y Shift + Tab recorren todas las celdas en orden y crean una nueva fila al llegar al final.[ ] Insertar o eliminar filas y columnas preserva las colspan/rowspan válidas y no corrompe el esquema.[ ] Combinar y dividir celdas mantiene la integridad de filas y columnas.[ ] Redimensionar columnas respeta el ancho mínimo y persiste al guardar/recargar el documento.[ ] Pegar datos desde hojas de cálculo o HTML genera la estructura esperada y se deshace en un solo Ctrl/Cmd + Z.[ ] El HTML generado pasa validación de sanitización y cumple roles/etiquetas semánticas de tabla.
