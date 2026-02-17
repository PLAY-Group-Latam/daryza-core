import { Check, ChevronDown } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type MultiSelectOption = {
    label: string;
    value: string;
};

interface MultiSelectProps {
    options: MultiSelectOption[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
}

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export function MultiSelect({
    options,
    value,
    onChange,
    placeholder = 'Seleccionar opciones',
    searchPlaceholder = 'Buscar...',
    emptyMessage = 'No se encontraron resultados',
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const toggleValue = (selectedValue: string) => {
        const updated = value.includes(selectedValue)
            ? value.filter((v) => v !== selectedValue)
            : [...value, selectedValue];

        onChange(updated);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                        'h-auto w-full justify-between rounded-xl',
                        className,
                    )}
                >
                    {value.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {value.map((v) => {
                                const option = options.find(
                                    (o) => o.value === v,
                                );
                                return (
                                    <Badge key={v} variant="secondary">
                                        {option?.label}
                                    </Badge>
                                );
                            })}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">
                            {placeholder}
                        </span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>

                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = value.includes(option.value);

                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() =>
                                            toggleValue(option.value)
                                        }
                                        className="cursor-pointer"
                                    >
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

                                        {option.label}
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
