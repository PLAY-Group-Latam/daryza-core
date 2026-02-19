'use client';

import { CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { CategorySelect } from '@/types/products/categories';
import { Check, CornerDownRight } from 'lucide-react';

interface TreeItemProps {
    node: CategorySelect;
    level: number;
    selectedValue?: string;
    onSelect: (id: string) => void;
}

export function TreeItem({
    node,
    level,
    selectedValue,
    onSelect,
}: TreeItemProps) {
    return (
        <>
            <CommandItem
                value={node.id}
                onSelect={() => onSelect(node.id)}
                className={cn(
                    'flex items-center rounded-none py-1.5 text-sm hover:bg-accent hover:text-accent-foreground',
                    selectedValue === node.id && 'font-medium text-primary',
                )}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
                {level > 0 && (
                    <CornerDownRight className="h-3 w-3 text-muted-foreground/50" />
                )}

                <span className="truncate">{node.name}</span>

                {selectedValue === node.id && (
                    <Check className="ml-auto h-4 w-4" />
                )}
            </CommandItem>

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
