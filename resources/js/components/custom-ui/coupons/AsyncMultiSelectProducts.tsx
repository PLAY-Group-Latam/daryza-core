/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AsyncMultiSelectProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    requestPath?: string;
}

export function AsyncMultiSelectProducts({
    value,
    onChange,
    placeholder = 'Buscar producto por nombre',
    requestPath = '/coupon/search-products', // 👈 ruta de Daryza
}: AsyncMultiSelectProps) {
    const [open, setOpen]       = useState(false);
    const [query, setQuery]     = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedFilter       = useDebounce(query, 500);

    useEffect(() => {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            setLoading(true);
            fetch(`${requestPath}?q=${encodeURIComponent(query)}`, { signal: controller.signal })
                .then((res) => res.json())
                .then((data) => setResults(data))
                .finally(() => setLoading(false));
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
    }, [debouncedFilter]);

    useEffect(() => {
        if (value.length === 0) return;

        const controller = new AbortController();
        fetch(`${requestPath}?q=${value.join(',')}`, { signal: controller.signal })
            .then((res) => res.json())
            .then((data: any[]) => {
                setResults((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id));
                    return [...prev, ...data.filter((p) => !existingIds.has(p.id))];
                });
            });

        return () => controller.abort();
    }, [value]);

    const options = results?.map((p) => ({
        id:    p.id,
        value: p.id + '|' + p.sku,
        label: p.name,
        image: p.image,
    }));

    const handleSelect = (valueSelected: string) => {
        const [id] = valueSelected.split('|');
        onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
    };

    const handleRemove = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== id));
    };

    const selectedLabels = value.map((val) => results.find((o) => o.id === val)?.name || val);
    const maxDisplayItems = 3;
    const displayItems    = selectedLabels.slice(0, maxDisplayItems);
    const overflowCount   = selectedLabels.length > maxDisplayItems ? selectedLabels.length - maxDisplayItems : 0;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    role="combobox"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    className="flex min-h-[2.5rem] w-full cursor-pointer items-center justify-between rounded-lg border bg-transparent px-3 py-2 text-sm"
                >
                    <div className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden text-left">
                        {displayItems.length > 0 ? (
                            displayItems.map((label, i) => (
                                <Badge key={value[i]} variant="secondary" className="flex items-center gap-1 pr-1">
                                    {label}
                                    <button
                                        type="button"
                                        onClick={(e) => handleRemove(value[i], e)}
                                        className="rounded-full p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                        {overflowCount > 0 && (
                            <Badge variant="secondary" className="px-2.5">+{overflowCount}</Badge>
                        )}
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </div>
            </PopoverTrigger>

            <PopoverContent className="w-full max-w-lg p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar..." value={query} onValueChange={setQuery} autoFocus />
                    <CommandList>
                        {loading && <div className="text-muted-foreground p-4 text-center text-sm">Buscando...</div>}
                        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => handleSelect(option.value)}
                                    className="cursor-pointer"
                                >
                                    <div className={cn(
                                        'mr-2 flex h-6 w-6 items-center justify-center overflow-hidden rounded-sm',
                                        !option.image && 'bg-gray-200 dark:bg-gray-700',
                                    )}>
                                        {option.image
                                            ? <img src={option.image} alt={option.label} className="h-6 w-6 object-cover" loading="lazy" />
                                            : <div className="h-6 w-6" />
                                        }
                                    </div>
                                    <span className="flex-1">{option.label}</span>
                                    <div className={cn(
                                        'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                                        value.includes(option.id) ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
                                    )}>
                                        <Check className="h-4 w-4" />
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}