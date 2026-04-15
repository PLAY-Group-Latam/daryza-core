import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Customer {
    id: string;
    name: string;
    email: string;
    photo?: string;
}

interface AsyncMultiSelectCustomersProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    requestPath?: string;
}

const getInitials = (name: string) =>
    name?.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || '';

export function AsyncMultiSelectCustomers({
    value,
    onChange,
    placeholder = 'Buscar cliente por nombre',
    requestPath = '/coupon/search-customers'
}: AsyncMultiSelectCustomersProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedFilter = useDebounce(query, 500);

    useEffect(() => {
        if (!debouncedFilter) return; 

        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${requestPath}?q=${encodeURIComponent(debouncedFilter)}`,
                    { signal: controller.signal }
                );
                if (!res.ok) throw new Error(`Error ${res.status}`);
                const data: Customer[] = await res.json();
                setResults((prev) => {
                    const map = new Map(prev.map((c) => [c.id, c]));
                    data.forEach((c) => map.set(c.id, c));
                    return Array.from(map.values());
                });
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    console.error('Error buscando clientes:', err);
                   
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [debouncedFilter, requestPath]); 

    useEffect(() => {
        if (value.length === 0) return;

        const controller = new AbortController();
        fetch(`${requestPath}?q=${value.join(',')}`, { signal: controller.signal })
            .then((res) => res.json())
            .then((data: Customer[]) => {
                setResults((prev) => {
                    const existing = new Set(prev.map((p) => p.id));
                    return [...prev, ...data.filter((p) => !existing.has(p.id))];
                });
            });

        return () => controller.abort();
    }, [value, requestPath]);

    const options = results?.map((c) => ({
        id: c.id,
        value: c.id,
        name: c.name,
        email: c.email,
        photo: c.photo,
        label: `${c.name} (${c.email})`,
    }));

    const handleSelect = (customerId: string) => {
        onChange(value.includes(customerId) ? value.filter((v) => v !== customerId) : [...value, customerId]);
    };

    const handleRemove = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== id));
    };

    const selectedItems = value.map((id) => ({
        id,
        label: results.find((c) => c.id === id)?.name ?? 'Cargando...',
    }));
    const maxDisplayItems = 3;
    const displayItems = selectedItems.slice(0, maxDisplayItems);
    const overflowCount = selectedItems.length > maxDisplayItems ? selectedItems.length - maxDisplayItems : 0;

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
                            displayItems.map((item) => (
                                <Badge key={item.id} variant="secondary" className="flex items-center gap-1 pr-1">
                                    {item.label}
                                    <button
                                        type="button"
                                        onClick={(e) => handleRemove(item.id, e)}
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
                        <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.id}
                                    value={option.label}
                                    onSelect={() => handleSelect(option.id)}
                                    className="flex cursor-pointer flex-row items-center gap-3"
                                >
                                    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                        {option.photo
                                            ? <img src={option.photo} alt={option.name} className="h-7 w-7 object-cover" />
                                            : <span>{getInitials(option.name)}</span>
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
