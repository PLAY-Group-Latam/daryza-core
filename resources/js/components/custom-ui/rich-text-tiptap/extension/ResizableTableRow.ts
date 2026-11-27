import { TableRow } from '@tiptap/extension-table';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

const MIN_ROW_HEIGHT = 28;
const EDGE = 5; // px sensibles en el borde inferior de la celda

const getRowHit = (view: EditorView, event: MouseEvent) => {
    if (!view.editable) return null;

    const cell = (event.target as HTMLElement | null)?.closest(
        'td, th',
    ) as HTMLElement | null;
    if (!cell || !view.dom.contains(cell)) return null;

    const rect = cell.getBoundingClientRect();
    const fromBottom = rect.bottom - event.clientY;
    const nearBottom = fromBottom >= 0 && fromBottom <= EDGE;
    const nearRight = rect.right - event.clientX <= EDGE; // lo usa el resize de columnas

    if (!nearBottom || nearRight) return null;

    return { cell, row: cell.parentElement as HTMLElement };
};

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
        return [
            new Plugin({
                key: new PluginKey('tableRowResize'),
                props: {
                    handleDOMEvents: {
                        mousemove(view, event) {
                            view.dom.classList.toggle(
                                'row-resize-cursor',
                                !!getRowHit(view, event as MouseEvent),
                            );
                            return false;
                        },
                        mouseleave(view) {
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

                            const startY = (event as MouseEvent).clientY;
                            const startHeight = row.getBoundingClientRect().height;
                            let height = startHeight;

                            const onMove = (e: MouseEvent) => {
                                height = Math.max(
                                    MIN_ROW_HEIGHT,
                                    startHeight + e.clientY - startY,
                                );
                                row.style.height = `${height}px`;
                            };

                            const onUp = () => {
                                document.removeEventListener('mousemove', onMove);
                                document.removeEventListener('mouseup', onUp);

                                const node = view.state.doc.nodeAt(rowPos);
                                if (!node) return;

                                view.dispatch(
                                    view.state.tr.setNodeMarkup(rowPos, undefined, {
                                        ...node.attrs,
                                        rowHeight: Math.round(height),
                                    }),
                                );
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