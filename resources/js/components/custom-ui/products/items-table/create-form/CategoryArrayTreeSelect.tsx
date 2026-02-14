'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { filterTree, flattenTree } from '@/lib/utils/category-tree';
import { CategorySelect } from '@/types/products/categories';
import { ChevronDown, X } from 'lucide-react';
import * as React from 'react';
import { TreeItem } from './TreeItem';

interface Props {
    categories: CategorySelect[];
    value: string[];
    onChange: (ids: string[]) => void;
    placeholder?: string;
}

export function CategoryTreeSelect({
    categories,
    value = [],
    onChange,
    placeholder = 'Seleccionar categorías...',
}: Props) {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    const flattened = React.useMemo(
        () => flattenTree(categories),
        [categories],
    );

    const filteredTree = React.useMemo(() => {
        if (!searchTerm) return categories;
        return filterTree(categories, searchTerm);
    }, [categories, searchTerm]);

    const handleSelect = (id: string) => {
        const isSelected = value.includes(id);
        const updated = isSelected
            ? value.filter((v) => v !== id)
            : [...value, id];
        onChange(updated);
    };

    const removeCategory = (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Añadir esto
        e.stopPropagation();
        onChange(value.filter((v) => v !== id));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                        'h-auto min-h-10 w-full justify-between px-3 py-2 text-left',
                        value.length > 0 ? 'bg-background' : '',
                    )}
                >
                    <div className="flex flex-wrap gap-1">
                        {value.length > 0 ? (
                            value.map((id) => {
                                const cat = flattened.find((c) => c.id === id);
                                return (
                                    <Badge
                                        key={id}
                                        variant="secondary"
                                        className="flex items-center gap-1 font-normal"
                                    >
                                        {cat?.name}
                                        <span // Cambia el icono por un span o botón pequeño para mejor control de eventos
                                            role="button"
                                            onClick={(e) =>
                                                removeCategory(id, e)
                                            }
                                            className="rounded-full p-0.5 outline-none hover:bg-muted-foreground/20"
                                        >
                                            <X className="h-3 w-3" />
                                        </span>
                                    </Badge>
                                );
                            })
                        ) : (
                            <span className="text-muted-foreground">
                                {placeholder}
                            </span>
                        )}
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList className="max-h-[350px] overflow-y-auto">
                        {filteredTree.length === 0 && (
                            <CommandEmpty>No hay resultados.</CommandEmpty>
                        )}
                        <CommandGroup className="p-0">
                            {filteredTree.map((node) => (
                                <TreeItem
                                    key={node.id}
                                    node={node}
                                    level={0}
                                    selectedValue={value}
                                    onSelect={handleSelect}
                                />
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
