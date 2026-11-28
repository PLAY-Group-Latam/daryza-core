'use client';

import type { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
    ArrowDownToLine,
    ArrowLeftToLine,
    ArrowRightToLine,
    ArrowUpToLine,
    Heading1,
    Table as TableIcon,
    Trash2,
} from 'lucide-react';
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function MenuItem({
    icon,
    label,
    destructive = false,
    onClick,
}: {
    icon: ReactNode;
    label: string;
    destructive?: boolean;
    onClick: () => void;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            className={
                destructive
                    ? 'justify-start gap-2 text-xs text-destructive hover:text-destructive'
                    : 'justify-start gap-2 text-xs'
            }
            onClick={onClick}
        >
            {icon}
            {label}
        </Button>
    );
}

function SectionLabel({ children }: { children: ReactNode }) {
    return (
        <span className="px-2 pt-1 text-[10px] font-semibold tracking-wide text-neutral-400 uppercase">
            {children}
        </span>
    );
}

export function TableBubbleMenu({ editor }: { editor: Editor }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const getTableNode = () => {
        const { $anchor } = editor.state.selection;
        for (let depth = $anchor.depth; depth > 0; depth--) {
            if ($anchor.node(depth).type.name === 'table') {
                return $anchor.node(depth);
            }
        }
        return null;
    };

    const getTableRowCount = (): number => getTableNode()?.childCount ?? 0;

    const run = (command: () => boolean) => {
        const success = command();
        setOpen(false);
        if (success) {
            editor.commands.focus();
        }
    };

    const handleDeleteRow = () => {
        if (getTableRowCount() <= 1) {
            run(() => editor.commands.deleteTable());
        } else {
            run(() => editor.commands.deleteRow());
        }
    };

    const hasHeaderRow = (() => {
        const table = getTableNode();
        if (!table || table.childCount === 0) return false;
        const firstRow = table.child(0);
        if (firstRow.childCount === 0) return false;
        return firstRow.child(0).type.name === 'tableHeader';
    })();

    // Cierra el menú al hacer click fuera de él (en el editor o fuera).
    useEffect(() => {
        if (!open) return;

        const onMouseDown = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (menuRef.current && !menuRef.current.contains(target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, [open]);

    // Ancla el menú al borde superior izquierdo de la tabla en lugar de al cursor.
    const getReferencedVirtualElement = useCallback(() => {
        const { $anchor } = editor.state.selection;
        let tablePos = -1;
        for (let depth = $anchor.depth; depth > 0; depth--) {
            if ($anchor.node(depth).type.name === 'table') {
                tablePos = $anchor.before(depth);
                break;
            }
        }
        if (tablePos < 0) return null;

        const rect = () => {
            const dom = editor.view.nodeDOM(tablePos) as HTMLElement | null;
            return dom ? dom.getBoundingClientRect() : new DOMRect(0, 0, 0, 0);
        };

        return {
            getBoundingClientRect: rect,
            getClientRects: () => [rect()],
        };
    }, [editor]);

    // Al ocultarse el menú (blur, salir de la tabla, etc.) vuelve al icono.
    const options = useMemo(
        () => ({
            placement: 'top-start' as const,
            onHide: () => setOpen(false),
        }),
        [],
    );

    return (
        <BubbleMenu
            editor={editor}
            shouldShow={({ editor: e }) => e.isActive('table')}
            getReferencedVirtualElement={getReferencedVirtualElement}
            options={options}
        >
            {open ? (
                <div
                    ref={menuRef}
                    className="flex w-64 flex-col gap-0.5 rounded-lg border border-input bg-background p-2 shadow-lg"
                >
                    <SectionLabel>Filas</SectionLabel>
                    <MenuItem
                        icon={<ArrowUpToLine className="h-3.5 w-3.5" />}
                        label="Agregar fila arriba"
                        onClick={() =>
                            run(() => editor.commands.addRowBefore())
                        }
                    />
                    <MenuItem
                        icon={<ArrowDownToLine className="h-3.5 w-3.5" />}
                        label="Agregar fila abajo"
                        onClick={() => run(() => editor.commands.addRowAfter())}
                    />
                    <MenuItem
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                        label="Eliminar fila"
                        destructive
                        onClick={handleDeleteRow}
                    />

                    <Separator className="my-1" />

                    <SectionLabel>Columnas</SectionLabel>
                    <MenuItem
                        icon={<ArrowLeftToLine className="h-3.5 w-3.5" />}
                        label="Agregar columna izquierda"
                        onClick={() =>
                            run(() => editor.commands.addColumnBefore())
                        }
                    />
                    <MenuItem
                        icon={<ArrowRightToLine className="h-3.5 w-3.5" />}
                        label="Agregar columna derecha"
                        onClick={() =>
                            run(() => editor.commands.addColumnAfter())
                        }
                    />
                    <MenuItem
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                        label="Eliminar columna"
                        destructive
                        onClick={() =>
                            run(() => editor.commands.deleteColumn())
                        }
                    />

                    <Separator className="my-1" />

                    <SectionLabel>Tabla</SectionLabel>
                    <MenuItem
                        icon={<Heading1 className="h-3.5 w-3.5" />}
                        label={
                            hasHeaderRow
                                ? 'Quitar fila de encabezado'
                                : 'Fila de encabezado'
                        }
                        onClick={() =>
                            run(() => editor.commands.toggleHeaderRow())
                        }
                    />
                    <MenuItem
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                        label="Eliminar tabla"
                        destructive
                        onClick={() => run(() => editor.commands.deleteTable())}
                    />
                </div>
            ) : (
                <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    className="shadow-md"
                    onClick={() => setOpen(true)}
                >
                    <TableIcon className="h-4 w-4" />
                </Button>
            )}
        </BubbleMenu>
    );
}
