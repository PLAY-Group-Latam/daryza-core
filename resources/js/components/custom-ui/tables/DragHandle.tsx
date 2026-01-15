// DragCell.tsx
import { GripVertical } from 'lucide-react';
import { useDragHandle } from './DragContext';

export function DragCell() {
    const { attributes, listeners, setNodeRef } = useDragHandle();

    return (
        <button
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="cursor-grab text-muted-foreground"
        >
            <GripVertical className="h-4 w-4" />
        </button>
    );
}
