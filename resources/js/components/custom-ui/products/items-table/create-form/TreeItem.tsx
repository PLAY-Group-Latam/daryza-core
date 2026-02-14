'use client';

import { CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { CategorySelect } from '@/types/products/categories';
import { Check, CornerDownRight } from 'lucide-react';

interface TreeItemProps {
    node: CategorySelect;
    level: number;
    selectedValue: string[];
    onSelect: (id: string) => void;
}

export function TreeItem({
    node,
    level,
    selectedValue,
    onSelect,
}: TreeItemProps) {
    const isSelected = selectedValue.includes(node.id);

    // Una categoría es seleccionable SOLO si no tiene hijos activos
    const isSelectable = !node.children || node.children.length === 0;

    return (
        <>
            <CommandItem
                value={node.id}
                // Si no es seleccionable, shadcn CommandItem no disparará el onSelect adecuadamente
                // pero por seguridad bloqueamos la ejecución de la función.
                onSelect={() => {
                    if (isSelectable) onSelect(node.id);
                }}
                disabled={false} // Mantener false para que el buscador siempre lo muestre
                className={cn(
                    'flex items-center py-2 transition-colors',
                    isSelectable
                        ? 'cursor-pointer hover:bg-accent/50'
                        : 'cursor-default font-semibold text-muted-foreground/80',
                )}
            >
                {/* Checkbox: Solo para items seleccionables */}
                {isSelectable ? (
                    <div
                        className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded border transition-all',
                            isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-input',
                        )}
                    >
                        {isSelected && (
                            <Check
                                className="size-3 text-gray-200"
                                strokeWidth={3}
                            />
                        )}
                    </div>
                ) : (
                    // Placeholder para padres para mantener la sangría alineada
                    <div className="mr-2 h-4 w-4" />
                )}

                {/* Icono de nivel para hijos */}
                {level > 0 && (
                    <CornerDownRight className="mr-2 h-3 w-3 text-muted-foreground/30" />
                )}

                <span
                    className={cn(
                        'truncate text-sm',
                        isSelected && 'font-medium text-primary',
                        !isSelectable && 'text-[10px] tracking-wider uppercase', // Estilo de "Etiqueta de Grupo"
                    )}
                >
                    {node.name}
                </span>
            </CommandItem>

            {/* Renderizado recursivo de hijos */}
            {node.children?.map((child) => (
                <TreeItem
                    key={child.id}
                    node={child}
                    level={level + 1}
                    selectedValue={selectedValue}
                    onSelect={onSelect}
                />
            ))}
        </>
    );
}
