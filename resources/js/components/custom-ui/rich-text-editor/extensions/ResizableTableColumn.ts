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

function getContainerBounds(tableEl: HTMLElement | null, view: EditorView) {
    const containerEl = (tableEl?.closest('.tableWrapper') ??
        tableEl?.parentElement ??
        view.dom) as HTMLElement;

    const rect = containerEl.getBoundingClientRect();
    const style = window.getComputedStyle(containerEl);
    const padLeft = parseFloat(style.paddingLeft) || 0;
    const padRight = parseFloat(style.paddingRight) || 0;
    const borderLeft = parseFloat(style.borderLeftWidth) || 0;
    const borderRight = parseFloat(style.borderRightWidth) || 0;

    const left = rect.left + borderLeft + padLeft;
    const right = rect.right - borderRight - padRight - 1;
    const width = Math.max(0, Math.floor(right - left));

    return { left, right, width };
}

function getColumnWidths(tableEl: HTMLElement, colCount: number): number[] {
    const cols = Array.from(
        tableEl.querySelectorAll('colgroup > col'),
    ) as HTMLElement[];
    const widths: number[] = [];

    for (let c = 0; c < colCount; c++) {
        const cellEl = tableEl.querySelector(
            `tr:first-child > td:nth-child(${c + 1}), tr:first-child > th:nth-child(${c + 1})`,
        ) as HTMLElement | null;
        if (cellEl) {
            widths.push(cellEl.getBoundingClientRect().width);
            continue;
        }
        const colEl = cols[c];
        const inlineW = colEl?.style.width
            ? parseFloat(colEl.style.width)
            : NaN;
        widths.push(
            !Number.isNaN(inlineW) && inlineW > 0 ? inlineW : MIN_COLUMN_WIDTH,
        );
    }
    return widths;
}

function fitWidthsToContainer(widths: number[], maxTotal: number): number[] {
    if (widths.length === 0 || maxTotal <= 0) return widths;
    const sum = widths.reduce((acc, w) => acc + w, 0);
    if (sum <= maxTotal) return widths;

    const scale = maxTotal / sum;
    const fitted = widths.map((w) =>
        Math.max(MIN_COLUMN_WIDTH, Math.floor(w * scale)),
    );
    let excess = fitted.reduce((acc, w) => acc + w, 0) - maxTotal;

    for (let i = fitted.length - 1; i >= 0 && excess > 0; i--) {
        const reducible = Math.max(0, fitted[i] - MIN_COLUMN_WIDTH);
        const take = Math.min(reducible, excess);
        fitted[i] -= take;
        excess -= take;
    }

    return fitted;
}

function roundWidthsWithinLimit(
    widths: number[],
    maxTotal: number,
    protectedCol?: number,
): number[] {
    const rounded = widths.map((w) =>
        Math.max(MIN_COLUMN_WIDTH, Math.round(w)),
    );
    let overflow = rounded.reduce((acc, w) => acc + w, 0) - maxTotal;

    if (overflow > 0) {
        const order: number[] = [];
        for (let i = rounded.length - 1; i >= 0; i--) {
            if (i !== protectedCol) order.push(i);
        }
        if (protectedCol !== undefined && protectedCol >= 0) {
            order.push(protectedCol);
        }

        for (const i of order) {
            if (overflow <= 0) break;
            const reducible = Math.max(0, rounded[i] - MIN_COLUMN_WIDTH);
            const take = Math.min(reducible, overflow);
            rounded[i] -= take;
            overflow -= take;
        }
    }

    return rounded;
}

function computeBalancedWidths(
    initialWidths: number[],
    targetCol: number,
    desiredWidth: number,
    totalWidth: number,
    maxWidthFromLeft: number,
    isLastColumn: boolean,
): number[] {
    const colCount = initialWidths.length;
    if (colCount <= 1) {
        return [
            Math.min(
                maxWidthFromLeft,
                Math.max(MIN_COLUMN_WIDTH, desiredWidth),
            ),
        ];
    }

    const colsAfterCount = Math.max(0, colCount - 1 - targetCol);
    const reservedAfterWidth = colsAfterCount * MIN_COLUMN_WIDTH;
    const maxAllowedByRight = Math.max(
        MIN_COLUMN_WIDTH,
        totalWidth - reservedAfterWidth,
    );

    const maxPossibleTarget = Math.max(
        MIN_COLUMN_WIDTH,
        Math.min(maxWidthFromLeft, maxAllowedByRight),
    );

    const clampedTarget = Math.min(
        maxPossibleTarget,
        Math.max(MIN_COLUMN_WIDTH, desiredWidth),
    );

    const next = [...initialWidths];
    const delta = clampedTarget - initialWidths[targetCol];
    next[targetCol] = clampedTarget;

    if (isLastColumn && delta < 0) {
        return roundWidthsWithinLimit(next, totalWidth, targetCol);
    }

    if (delta > 0) {
        const currentTotal = next.reduce((acc, w) => acc + w, 0);
        let excessToAbsorb = Math.max(0, currentTotal - totalWidth);

        if (excessToAbsorb > 0.01) {
            // Prioriza columnas posteriores a targetCol primero para no invadir su espacio
            const afterCols: number[] = [];
            const beforeCols: number[] = [];
            for (let c = 0; c < colCount; c++) {
                if (c === targetCol) continue;
                if (c > targetCol) afterCols.push(c);
                else beforeCols.push(c);
            }
            const order = [...afterCols, ...beforeCols];

            for (const c of order) {
                if (excessToAbsorb <= 0.01) break;
                const reducible = Math.max(0, next[c] - MIN_COLUMN_WIDTH);
                const take = Math.min(reducible, excessToAbsorb);
                next[c] -= take;
                excessToAbsorb -= take;
            }

            if (excessToAbsorb > 0.01) {
                next[targetCol] = Math.max(
                    MIN_COLUMN_WIDTH,
                    next[targetCol] - excessToAbsorb,
                );
            }
        }
    } else if (delta < 0) {
        const freed = -delta;
        const neighborCol =
            targetCol + 1 < colCount ? targetCol + 1 : targetCol - 1;
        const currentTotal = next.reduce((acc, w) => acc + w, 0);
        const availableRoom = Math.max(0, totalWidth - currentTotal);
        if (availableRoom > 0) {
            next[neighborCol] += Math.min(freed * 0.5, availableRoom);
        }
    }

    return roundWidthsWithinLimit(next, totalWidth, targetCol);
}

function applyWidthsToColgroup(
    tableEl: HTMLElement,
    widths: number[],
    maxWidth: number,
) {
    const cols = Array.from(
        tableEl.querySelectorAll('colgroup > col'),
    ) as HTMLElement[];
    const total = Math.min(
        maxWidth,
        widths.reduce((acc, w) => acc + w, 0),
    );
    tableEl.style.width = `${total}px`;

    widths.forEach((w, idx) => {
        const colEl = cols[idx];
        if (!colEl) return;
        colEl.style.width = `${w}px`;
        colEl.style.minWidth = `${MIN_COLUMN_WIDTH}px`;
    });
}

function persistColumnWidths(
    view: EditorView,
    hit: ColumnHit,
    widths: number[],
) {
    const { table, tableStart, map } = hit;
    if (!table) return;

    const tr = view.state.tr;
    for (let col = 0; col < map.width; col++) {
        const width = widths[col];
        for (let row = 0; row < map.height; row++) {
            const mapIndex = row * map.width + col;
            if (
                row > 0 &&
                map.map[mapIndex] === map.map[mapIndex - map.width]
            ) {
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

            tr.setNodeMarkup(tableStart + pos, undefined, {
                ...attrs,
                colwidth,
            });
        }
    }

    if (tr.docChanged) view.dispatch(tr);
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

                            const tableEl = hit.cell.closest(
                                'table',
                            ) as HTMLElement | null;
                            const bounds = getContainerBounds(tableEl, view);
                            const tableRect = tableEl
                                ? tableEl.getBoundingClientRect()
                                : hit.cell.getBoundingClientRect();

                            const maxTotalWidth = bounds.width;
                            const rawInitialWidths = tableEl
                                ? getColumnWidths(tableEl, hit.map.width)
                                : [hit.cell.getBoundingClientRect().width];
                            const initialWidths = fitWidthsToContainer(
                                rawInitialWidths,
                                maxTotalWidth,
                            );

                            const startWidth =
                                initialWidths[hit.col] ??
                                hit.cell.getBoundingClientRect().width;
                            const cellLeft =
                                hit.cell.getBoundingClientRect().left;
                            const startX = event.clientX;
                            const isLastColumn = hit.col === hit.map.width - 1;

                            const colsAfterCount = Math.max(
                                0,
                                hit.map.width - 1 - hit.col,
                            );
                            const reservedRightWidth =
                                colsAfterCount * MIN_COLUMN_WIDTH;
                            const maxGuideX = bounds.right - reservedRightWidth;
                            const minGuideX = cellLeft + MIN_COLUMN_WIDTH;
                            const maxWidthFromLeft = Math.max(
                                MIN_COLUMN_WIDTH,
                                maxGuideX - cellLeft,
                            );

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

                            let currentWidths = [...initialWidths];

                            const updateGuide = (clientX: number) => {
                                const clampedX = Math.min(
                                    maxGuideX,
                                    Math.max(minGuideX, clientX),
                                );
                                const rawDesiredWidth =
                                    startWidth + (clampedX - startX);
                                const desiredWidth = Math.min(
                                    maxWidthFromLeft,
                                    Math.max(MIN_COLUMN_WIDTH, rawDesiredWidth),
                                );

                                currentWidths = computeBalancedWidths(
                                    initialWidths,
                                    hit.col,
                                    desiredWidth,
                                    maxTotalWidth,
                                    maxWidthFromLeft,
                                    isLastColumn,
                                );

                                const appliedWidth = currentWidths[hit.col];
                                const guideX = Math.min(
                                    maxGuideX,
                                    Math.max(
                                        minGuideX,
                                        cellLeft + appliedWidth,
                                    ),
                                );
                                guide.style.left = `${guideX}px`;

                                if (tableEl) {
                                    applyWidthsToColgroup(
                                        tableEl,
                                        currentWidths,
                                        maxTotalWidth,
                                    );
                                }
                            };

                            const initialGuideX = Math.min(
                                maxGuideX,
                                Math.max(minGuideX, cellLeft + startWidth),
                            );
                            guide.style.left = `${initialGuideX}px`;

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
                                persistColumnWidths(view, hit, currentWidths);
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
