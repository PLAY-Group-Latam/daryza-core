/* eslint-disable @typescript-eslint/no-explicit-any */
import { TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragContext } from './DragContext';

interface DraggableRowProps {
    row: any;
    children: React.ReactNode;
}

export function DraggableRow({ row, children }: DraggableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: row.original.id,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.9 : 1,
    };

    return (
        <DragContext.Provider value={{ attributes, listeners, setNodeRef }}>
            <TableRow
                ref={setNodeRef} // ✅ No se accede al valor actual, solo se pasa la función
                style={style}
                className={cn(
                    'transition-all hover:bg-gray-100',
                    row.depth > 0 ? 'bg-gray-50' : 'bg-white',
                    isDragging && 'shadow-lg',
                )}
                // {...attributes}
                // {...listeners}
            >
                {children}
            </TableRow>
        </DragContext.Provider>
    );
}
