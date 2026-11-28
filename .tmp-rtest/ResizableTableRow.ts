import { TableRow } from '@tiptap/extension-table';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

const MIN_ROW_HEIGHT = 32;
// px sensibles alrededor del borde inferior de la fila para iniciar el resize.
const ROW_RESIZE_EDGE = 8;
const GUIDE_COLOR = '#3b82f6';

type RowHit = { cell: HTMLElement; row: HTMLElement };

// Resuelve la celda y la fila a partir del elemento bajo el cursor, aunque el
// cursor caiga sobre un `<tr>` o sobre la propia tabla.
function resolveCellAndRow(target: HTMLElement): RowHit | null {
    const cell = target.closest('td, th') as HTMLElement | null;
    if (cell) return { cell, row: cell.parentElement as HTMLElement };

    const row = target.closest('tr') as HTMLElement | null;
    if (row) {
        const rowCell = row.querySelector('td, th') as HTMLElement | null;
        if (rowCell) return { cell: rowCell, row };
    }

    return null;
}

function getRowHit(view: EditorView, event: MouseEvent): RowHit | null {
    if (!view.editable) return null;

    const target = event.target as HTMLElement | null;
    if (!target || !view.dom.contains(target)) return null;

    const hit = resolveCellAndRow(target);
    if (!hit) return null;

    const rect = hit.row.getBoundingClientRect();
    const cellRect = hit.cell.getBoundingClientRect();

    // Cede el control al resize de columnas cuando el cursor está sobre un
    // borde vertical (borde izquierdo o derecho de la celda). Así, al pasar
    // sobre la línea de una columna no se dispara el resize de alto de la fila.
    const nearVerticalBorder =
        cellRect.right - event.clientX <= ROW_RESIZE_EDGE ||
        event.clientX - cellRect.left <= ROW_RESIZE_EDGE;
    if (nearVerticalBorder) return null;

    const fromBottom = rect.bottom - event.clientY; // + dentro, - debajo
    const fromTop = event.clientY - rect.top; // + dentro, - arriba

    // Borde inferior de esta fila (incluso ligeramente por debajo, sobre el
    // borde compartido del modelo `border-collapse: collapse`).
    if (fromBottom >= -ROW_RESIZE_EDGE && fromBottom <= ROW_RESIZE_EDGE) {
        return hit;
    }

    // Borde superior de esta celda = borde inferior de la fila anterior.
    if (fromTop >= 0 && fromTop <= ROW_RESIZE_EDGE) {
        const prevRow = hit.row.previousElementSibling as HTMLElement | null;
        if (prevRow && prevRow.tagName === 'TR') {
            const prevCell = prevRow.querySelector(
                'td, th',
            ) as HTMLElement | null;
            if (prevCell) return { cell: prevCell, row: prevRow };
        }
    }

    return null;
}

// Crea la línea guía horizontal que indica dónde quedará el borde inferior de
// la fila al soltar el mouse. Se ancla al ancho de la tabla completa.
function createGuide(tableEl: HTMLElement | null, rowRect: DOMRect) {
    const tableRect = tableEl ? tableEl.getBoundingClientRect() : rowRect;

    const guide = document.createElement('div');
    guide.className = 'table-row-resize-guide';
    guide.style.position = 'fixed';
    guide.style.left = `${tableRect.left}px`;
    guide.style.width = `${tableRect.width}px`;
    guide.style.height = '2px';
    guide.style.marginTop = '-1px';
    guide.style.backgroundColor = GUIDE_COLOR;
    guide.style.pointerEvents = 'none';
    guide.style.zIndex = '9999';
    guide.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.9)';
    return guide;
}

export const ResizableTableRow = TableRow.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            rowHeight: {
                default: null,
                parseHTML: (element: HTMLElement) => {
                    const h = parseInt(element.style.height, 10);
                    return Number.isFinite(h) ? h : null;
                },
                renderHTML: (attributes: { rowHeight?: number | null }) =>
                    attributes.rowHeight
                        ? { style: `height: ${attributes.rowHeight}px` }
                        : {},
            },
        };
    },

    addProseMirrorPlugins() {
        let hoveredRow: HTMLElement | null = null;

        return [
            new Plugin({
                key: new PluginKey('tableRowResize'),
                props: {
                    handleDOMEvents: {
                        mousemove(view, event) {
                            const hit = getRowHit(view, event as MouseEvent);

                            if (hoveredRow && hoveredRow !== hit?.row) {
                                hoveredRow.classList.remove('row-resize-hover');
                                hoveredRow = null;
                            }
                            if (hit) {
                                hit.row.classList.add('row-resize-hover');
                                hoveredRow = hit.row;
                            }

                            view.dom.classList.toggle(
                                'row-resize-cursor',
                                !!hit,
                            );
                            return false;
                        },
                        mouseleave(view) {
                            if (hoveredRow) {
                                hoveredRow.classList.remove('row-resize-hover');
                                hoveredRow = null;
                            }
                            view.dom.classList.remove('row-resize-cursor');
                            return false;
                        },
                        mousedown(view, event) {
                            const hit = getRowHit(view, event as MouseEvent);
                            if (!hit) return false;

                            const { cell, row } = hit;
                            const $pos = view.state.doc.resolve(
                                view.posAtDOM(cell, 0),
                            );

                            let rowPos = -1;
                            for (let d = $pos.depth; d > 0; d--) {
                                if ($pos.node(d).type.name === 'tableRow') {
                                    rowPos = $pos.before(d);
                                    break;
                                }
                            }
                            if (rowPos < 0) return false;

                            event.preventDefault();

                            const rowRect = row.getBoundingClientRect();
                            const tableEl = row.closest(
                                'table',
                            ) as HTMLElement | null;
                            const guide = createGuide(tableEl, rowRect);
                            document.body.appendChild(guide);

                            row.classList.remove('row-resize-hover');
                            row.classList.add('row-resizing');
                            view.dom.classList.add('row-resizing');

                            let height = rowRect.height;
                            const updateGuide = (clientY: number) => {
                                const minBottom = rowRect.top + MIN_ROW_HEIGHT;
                                const bottom = Math.max(minBottom, clientY);
                                guide.style.top = `${bottom}px`;
                                height = bottom - rowRect.top;
                            };
                            updateGuide(event.clientY);

                            const onMove = (e: MouseEvent) =>
                                updateGuide(e.clientY);
                            const onUp = () => {
                                document.removeEventListener(
                                    'mousemove',
                                    onMove,
                                );
                                document.removeEventListener('mouseup', onUp);
                                document.body.removeChild(guide);
                                row.classList.remove('row-resizing');
                                view.dom.classList.remove('row-resizing');

                                const node = view.state.doc.nodeAt(rowPos);
                                const nextHeight = Math.round(height);
                                if (
                                    node &&
                                    nextHeight !== node.attrs.rowHeight
                                ) {
                                    view.dispatch(
                                        view.state.tr.setNodeMarkup(
                                            rowPos,
                                            undefined,
                                            {
                                                ...node.attrs,
                                                rowHeight: nextHeight,
                                            },
                                        ),
                                    );
                                }
                            };

                            document.addEventListener('mousemove', onMove);
                            document.addEventListener('mouseup', onUp);
                            return true;
                        },
                    },
                },
            }),
        ];
    },
});
