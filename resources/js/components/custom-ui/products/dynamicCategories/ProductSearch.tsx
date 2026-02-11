/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Badge } from '@/components/ui/badge';
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
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import products from '@/routes/products';
import { Check, ChevronDown, Loader2, Package, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AsyncProductVariantSearchProps {
    value: string[];
    onChange: (value: string[]) => void;
    error?: string;
    placeholder?: string;
}

export function ProductSearch({
    value,
    onChange,
    error,
    placeholder = 'Buscar producto o variante...',
}: AsyncProductVariantSearchProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);

    // Usamos useTransition o un estado simple controlado para evitar el error de ESLint
    const [isPending, setIsPending] = useState(false);
    const debouncedQuery = useDebounce(query, 400);

    useEffect(() => {
        // Solo buscamos si hay texto suficiente
        if (debouncedQuery.length < 2) {
            setResults([]);
            return;
        }

        const controller = new AbortController();

        // La lógica asíncrona
        const fetchProducts = async () => {
            setIsPending(true); // Esto ahora es parte del flujo de la función asíncrona
            try {
                const { url } = products.dynamicCategories.searchProducts({
                    query: { q: debouncedQuery },
                });

                const res = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                    console.log('sdsds', data);
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') console.error(err);
            } finally {
                setIsPending(false);
            }
        };

        fetchProducts();

        return () => controller.abort();
    }, [debouncedQuery]);

    const handleSelect = (variantId: string) => {
        const newValue = value.includes(variantId)
            ? value.filter((id) => id !== variantId)
            : [...value, variantId];
        onChange(newValue);
    };

    const getVariantDisplay = (id: string) => {
        for (const product of results) {
            const variant = product.variants?.find((v: any) => v.id === id);
            if (variant) return { name: variant.name, product: product.name };
        }
        return { name: 'Seleccionado', product: '' };
    };

    return (
        <div className="flex flex-col gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div
                        role="combobox"
                        className={cn(
                            'flex w-full cursor-pointer items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm transition-all hover:border-primary/50',
                            error ? 'border-red-500' : 'border-input',
                        )}
                    >
                        <div className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden text-left">
                            {value.length > 0 ? (
                                value.slice(0, 3).map((id) => {
                                    const display = getVariantDisplay(id);
                                    return (
                                        <Badge
                                            key={id}
                                            variant="secondary"
                                            className="flex items-center gap-1 pr-1"
                                        >
                                            <span className="mr-1 text-[10px] font-bold uppercase opacity-60">
                                                {display.product}
                                            </span>
                                            {display.name}
                                            <X
                                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelect(id);
                                                }}
                                            />
                                        </Badge>
                                    );
                                })
                            ) : (
                                <span className="text-muted-foreground">
                                    {placeholder}
                                </span>
                            )}
                            {value.length > 3 && (
                                <Badge variant="secondary">
                                    +{value.length - 3}
                                </Badge>
                            )}
                        </div>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </PopoverTrigger>

                <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                >
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Ej. Detergente Liquido..."
                            value={query}
                            onValueChange={setQuery}
                        />
                        <CommandList className="max-h-[300px]">
                            {isPending && (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span className="text-sm">Buscando...</span>
                                </div>
                            )}
                            <CommandEmpty>
                                No se encontraron resultados.
                            </CommandEmpty>

                            {results.map((product) => (
                                <CommandGroup
                                    key={product.id}
                                    // CORRECCIÓN TYPESCRIPT: Usar 'heading' en lugar de 'label'
                                    heading={
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary/70 uppercase">
                                            <Package className="h-3 w-3" />
                                            {product.name}
                                        </div>
                                    }
                                >
                                    {product.variants?.map((variant: any) => (
                                        <CommandItem
                                            key={variant.id}
                                            value={`${product.name} ${variant.name}`} // Ayuda al filtrado interno si fuera necesario
                                            onSelect={() =>
                                                handleSelect(variant.id)
                                            }
                                            className="ml-2 flex cursor-pointer items-center justify-between"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {variant.name}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground uppercase">
                                                    {variant.sku}
                                                </span>
                                            </div>
                                            <div
                                                className={cn(
                                                    'flex h-4 w-4 items-center justify-center rounded-sm border transition-colors',
                                                    value.includes(variant.id)
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-input',
                                                )}
                                            >
                                                {value.includes(variant.id) && (
                                                    <Check className="h-3 w-3" />
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && (
                <p className="text-xs font-medium text-red-500">{error}</p>
            )}
        </div>
    );
}
