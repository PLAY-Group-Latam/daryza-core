import { Extension } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { TableMap, cellAround } from '@tiptap/pm/tables';
import type { EditorView } from '@tiptap/pm/view';

const COLUMN_RESIZE_EDGE = 6;
const MIN_COLUMN_WIDTH = 40;
const GUIDE_COLOR = '#3b82f6';

type ColumnHit = {
    cell: HTMLElement;
    col: number;
    tableStart: number;
    map: TableMap;
    table: PMNode;
};

function getColumnHit(view: EditorView, event: MouseEvent): ColumnHit | null {
    try {
        return findColumnHit(view, event);
    } catch {
        return null;
    }
}

function findColumnHit(view: EditorView, event: MouseEvent): ColumnHit | null {
    if (!view.editable) return null;

    const target = event.target as HTMLElement | null;
    if (!target || !view.dom.contains(target)) return null;

    const cell = target.closest('td, th') as HTMLElement | null;
    if (!cell) return null;

    const rect = cell.getBoundingClientRect();
    const nearRight =
        rect.right - event.clientX <= COLUMN_RESIZE_EDGE &&
        rect.right - event.clientX >= -2;
    const nearLeft =
        event.clientX - rect.left <= COLUMN_RESIZE_EDGE &&
        event.clientX - rect.left >= -2;

    let resizeCell: HTMLElement;
    if (nearRight) {
        resizeCell = cell;
    } else if (nearLeft) {
        const prev = cell.previousElementSibling as HTMLElement | null;
        if (!prev || (prev.tagName !== 'TD' && prev.tagName !== 'TH')) {
            return null;
        }
        resizeCell = prev;
    } else {
        return null;
    }

    // Ubica la celda (y su columna) usando `cellAround`, que es robusto aunque
    // la posición del DOM caiga dentro del contenido de la celda.
    const pos = view.posAtDOM(resizeCell, 0);
    const $cell = cellAround(view.state.doc.resolve(pos));
    if (!$cell) return null;

    const table = $cell.node(-1);
    if (!table || table.type.name !== 'table') return null;

    const cellNode = $cell.nodeAfter;
    if (!cellNode) return null;

    const map = TableMap.get(table);
    const tableStart = $cell.start(-1);
    const col =
        map.colCount($cell.pos - tableStart) +
        (cellNode.attrs.colspan ?? 1) -
        1;

    return { cell: resizeCell, col, tableStart, map, table };
}

// Persiste el nuevo ancho de columna en todas las celdas de la columna.
function updateColumnWidth(view: EditorView, hit: ColumnHit, width: number) {
    const { table, tableStart, map, col } = hit;
    if (!table) return;

    const tr = view.state.tr;
    for (let row = 0; row < map.height; row++) {
        const mapIndex = row * map.width + col;
        if (row > 0 && map.map[mapIndex] === map.map[mapIndex - map.width]) {
            continue;
        }
        const pos = map.map[mapIndex];
        const cellNode = table.nodeAt(pos);
        if (!cellNode) continue;

        const attrs = cellNode.attrs;
        const index = attrs.colspan === 1 ? 0 : col - map.colCount(pos);
        if (attrs.colwidth && attrs.colwidth[index] === width) continue;

        const colwidth = attrs.colwidth
            ? attrs.colwidth.slice()
            : new Array(attrs.colspan ?? 1).fill(0);
        colwidth[index] = width;

        tr.setNodeMarkup(tableStart + pos, undefined, { ...attrs, colwidth });
    }
    if (tr.docChanged) view.dispatch(tr);
}

// Aplica en vivo el ancho de la columna mientras se arrastra, para que la
// columna crezca/encaja visualmente durante el drag (sin esperar al mouseup).
function applyColumnWidthToColgroup(hit: ColumnHit, width: number) {
    const tableEl = hit.cell.closest('table');
    if (!tableEl) return;

    const col = tableEl.querySelectorAll('colgroup > col')[
        hit.col
    ] as HTMLElement | undefined;
    if (!col) return;

    col.style.width = `${width}px`;
    col.style.minWidth = '';
}

export const ResizableTableColumn = Extension.create({
    name: 'resizableTableColumn',

    addProseMirrorPlugins() {
        let hoveredCell: HTMLElement | null = null;

        return [
            new Plugin({
                key: new PluginKey('tableColumnResize'),
                props: {
                    handleDOMEvents: {
                        mousemove(view, event) {
                            const hit = getColumnHit(view, event as MouseEvent);

                            if (hoveredCell && hoveredCell !== hit?.cell) {
                                hoveredCell.classList.remove(
                                    'column-resize-hover',
                                );
                                hoveredCell = null;
                            }
                            if (hit) {
                                hit.cell.classList.add('column-resize-hover');
                                hoveredCell = hit.cell;
                            }

                            view.dom.classList.toggle(
                                'column-resize-cursor',
                                !!hit,
                            );
                            return false;
                        },
                        mouseleave(view) {
                            if (hoveredCell) {
                                hoveredCell.classList.remove(
                                    'column-resize-hover',
                                );
                                hoveredCell = null;
                            }
                            view.dom.classList.remove('column-resize-cursor');
                            return false;
                        },
                        mousedown(view, event) {
                            const hit = getColumnHit(view, event as MouseEvent);
                            if (!hit) return false;

                            event.preventDefault();

                            const cellRect = hit.cell.getBoundingClientRect();
                            const tableEl = hit.cell.closest(
                                'table',
                            ) as HTMLElement | null;
                            const tableRect = tableEl
                                ? tableEl.getBoundingClientRect()
                                : cellRect;

                            const startWidth = cellRect.width;
                            const startX = event.clientX;

                            const guide = document.createElement('div');
                            guide.className = 'table-column-resize-guide';
                            guide.style.position = 'fixed';
                            guide.style.top = `${tableRect.top}px`;
                            guide.style.height = `${tableRect.height}px`;
                            guide.style.width = '2px';
                            guide.style.marginLeft = '-1px';
                            guide.style.backgroundColor = GUIDE_COLOR;
                            guide.style.pointerEvents = 'none';
                            guide.style.zIndex = '9999';
                            guide.style.boxShadow =
                                '0 0 0 1px rgba(255,255,255,0.9)';
                            document.body.appendChild(guide);

                            hit.cell.classList.remove('column-resize-hover');
                            view.dom.classList.add('column-resizing');

                            let width = startWidth;
                            const updateGuide = (clientX: number) => {
                                width = Math.max(
                                    MIN_COLUMN_WIDTH,
                                    startWidth + (clientX - startX),
                                );
                                guide.style.left = `${cellRect.left + width}px`;
                                applyColumnWidthToColgroup(hit, width);
                            };
                            updateGuide(event.clientX);

                            const onMove = (e: MouseEvent) =>
                                updateGuide(e.clientX);
                            const onUp = () => {
                                document.removeEventListener(
                                    'mousemove',
                                    onMove,
                                );
                                document.removeEventListener('mouseup', onUp);
                                document.body.removeChild(guide);
                                view.dom.classList.remove('column-resizing');
                                updateColumnWidth(view, hit, Math.round(width));
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
