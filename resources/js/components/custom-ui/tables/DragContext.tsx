import { useSortable } from '@dnd-kit/sortable';
import { createContext, useContext } from 'react';

// Solo lo que realmente queremos exponer
export type DragContextType = {
    attributes: ReturnType<typeof useSortable>['attributes'];
    listeners: ReturnType<typeof useSortable>['listeners'];
    setNodeRef: ReturnType<typeof useSortable>['setNodeRef'];
};

export const DragContext = createContext<DragContextType | null>(null);

export const useDragHandle = () => {
    const ctx = useContext(DragContext);
    if (!ctx) {
        throw new Error('useDragHandle debe usarse dentro de DraggableRow');
    }
    return ctx;
};
