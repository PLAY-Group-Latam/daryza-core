'use client';

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
import { filterTree, flattenTree } from '@/lib/utils/category-tree';
import { CategorySelect } from '@/types/products';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RootItem } from './CategoryRootItem';
import { TreeItem } from './CategoryTreeItem';

interface Props {
    categories: CategorySelect[];
    value?: string;
    onChange: (id: string) => void;
    placeholder?: string;
}

export function CategoryTreeSelect({
    categories,
    value,
    onChange,
    placeholder = 'Seleccionar...',
}: Props) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const flattened = useMemo(() => flattenTree(categories), [categories]);

    const filteredTree = useMemo(() => {
        if (!searchTerm) return categories;
        return filterTree(categories, searchTerm);
    }, [categories, searchTerm]);

    const selectedCategory = flattened.find((c) => c.id === value);

    const handleSelect = (id: string) => {
        onChange(id);
        setOpen(false);
    };

    const label =
        value === '' ? 'Principal' : (selectedCategory?.name ?? placeholder);

    return (
        <Popover modal open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                >
                    <span className="truncate">{label}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar categoría..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        className="h-9"
                    />

                    <CommandList className="max-h-[300px]">
                        <CommandEmpty>
                            No se encontraron resultados.
                        </CommandEmpty>

                        <CommandGroup className="p-0">
                            {(!searchTerm ||
                                'Principal'
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase())) && (
                                <RootItem
                                    selectedValue={value}
                                    onSelect={handleSelect}
                                />
                            )}

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
