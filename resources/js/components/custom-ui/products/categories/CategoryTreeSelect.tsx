'use client';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { CategorySelect } from '@/types/products/categories';
import { Check, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RootItem } from './CategoryRootItem';

interface Props {
    categories: CategorySelect[];
    value?: string;
    onChange: (id: string) => void;
    placeholder?: string;
    showPrincipal?: boolean;
}

export function CategoryTreeSelect({
    categories,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    showPrincipal = true,
}: Props) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Solo categorías padre (roots). Nunca mostrar subcategorías en este selector.
    const rootCategories = useMemo(
        () => categories.filter((category) => category.parent_id == null),
        [categories],
    );

    const filteredRoots = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return rootCategories;

        return rootCategories.filter((category) =>
            category.name.toLowerCase().includes(term),
        );
    }, [rootCategories, searchTerm]);

    const selectedCategory = rootCategories.find((category) => category.id === value);

    const handleSelect = (id: string) => {
        onChange(id);
        setOpen(false);
    };

    const label =
        showPrincipal && value === ''
            ? 'Principal'
            : (selectedCategory?.name ?? placeholder);

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
                        <CommandEmpty>No se encontraron resultados.</CommandEmpty>

                        <CommandGroup className="p-0">
                            {showPrincipal &&
                                (!searchTerm ||
                                    'principal'
                                        .toLowerCase()
                                        .includes(searchTerm.toLowerCase())) && (
                                    <RootItem
                                        selectedValue={value}
                                        onSelect={handleSelect}
                                    />
                                )}

                            {filteredRoots.map((node) => {
                                const isSelected = value === node.id;
                                return (
                                    <CommandItem
                                        key={node.id}
                                        onSelect={() => handleSelect(node.id)}
                                        className="flex cursor-pointer items-center justify-between"
                                    >
                                        <span>{node.name}</span>
                                        {isSelected && <Check className="h-4 w-4" />}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
