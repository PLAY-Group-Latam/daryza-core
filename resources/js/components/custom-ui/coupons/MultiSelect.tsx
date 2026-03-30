'use client';

import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, X } from 'lucide-react';
import * as React from 'react';

interface MultiSelectProps {
    options: { value: string; label: string }[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    maxDisplayItems?: number;
}

export const MultiSelect = ({
    options,
    value = [],
    onChange,
    placeholder = 'Seleccionar opciones',
    className,
    searchPlaceholder = 'Buscar...',
    emptyText = 'No se encontraron resultados',
    maxDisplayItems = 3,
}: MultiSelectProps) => {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleSelect = (optionValue: string) => {
        const newValue = value.includes(optionValue)
            ? value.filter((v) => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    const handleRemove = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== optionValue));
    };

    const selectedLabels = value.map((val) => options.find((opt) => opt.value === val)?.label || val);
    const displayItems   = selectedLabels.slice(0, maxDisplayItems);
    const overflowCount  = selectedLabels.length > maxDisplayItems ? selectedLabels.length - maxDisplayItems : 0;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        'flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border bg-transparent px-2 text-sm',
                        className,
                    )}
                >
                    <div className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden text-left">
                        {displayItems.map((label, index) => (
                            <Badge key={value[index]} variant="secondary" className="flex items-center gap-1 pr-1">
                                {label}
                                <button
                                    type="button"
                                    onClick={(e) => handleRemove(value[index], e)}
                                    className="rounded-full p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    aria-label={`Remover ${label}`}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                        {overflowCount > 0 && (
                            <Badge variant="secondary" className="px-2.5">+{overflowCount}</Badge>
                        )}
                        {value.length === 0 && (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} value={searchTerm} onValueChange={setSearchTerm} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            <div className="flex items-center justify-between px-2 py-1">
                                <span className="text-muted-foreground text-sm">{value.length} seleccionadas</span>
                                {value.length > 0 && (
                                    <button type="button" onClick={() => onChange([])} className="text-primary text-sm hover:underline">
                                        Limpiar todo
                                    </button>
                                )}
                            </div>
                            {filteredOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => handleSelect(option.value)}
                                    className="cursor-pointer"
                                >
                                    <div className={cn(
                                        'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                                        value.includes(option.value) ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
                                    )}>
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <span className="flex-1">{option.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};