'use client';

import { router } from '@inertiajs/react';
import * as React from 'react';
import { useDebounce } from '@/hooks/use-debounce';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { VariantSearchResult } from '@/types/products/search';
import { VariantIdentity } from '../shared/VariantIdentity';

interface PackProductSearchProps {
    searchResults: VariantSearchResult[];
    searchUrl: string;
    onSelect: (variant: VariantSearchResult) => void;
    placeholder?: string;
}

export function PackProductSearch({
    searchResults = [],
    searchUrl,
    onSelect,
    placeholder = 'Buscar por Sku daryza...',
}: PackProductSearchProps) {
    const [showResults, setShowResults] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);
    const debouncedQuery = useDebounce(query, 300);

    // Cerrar resultados al hacer clic fuera
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        if (debouncedQuery.length < 3) return;

        router.get(
            searchUrl,
            { q: debouncedQuery },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['searchResults', 'filters'],
            },
        );
    }, [debouncedQuery, searchUrl]);

    return (
        <div className="relative w-full" ref={containerRef}>
            <Command
                shouldFilter={false}
                className="rounded-lg border shadow-none!"
            >
                <CommandInput
                    placeholder={placeholder}
                    value={query}
                    onValueChange={(value) => {
                        setQuery(value);
                        setShowResults(value.length > 0);
                    }}
                    onFocus={() => setShowResults(query.length > 0)}
                    className="flex w-full py-3 text-sm"
                />

                {showResults && (searchResults.length > 0 || placeholder) && (
                    <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-md border bg-white shadow-md">
                        <CommandList className="max-h-[200px]">
                            {searchResults.length === 0 ? (
                                <CommandEmpty className="p-4 text-sm text-slate-500">
                                    No se encontraron productos.
                                </CommandEmpty>
                            ) : (
                                <CommandGroup heading="Productos disponibles">
                                    {searchResults.map((res) => {
                                        return (
                                            <CommandItem
                                                key={res.variant_id}
                                                value={res.variant_id}
                                                onSelect={() => {
                                                    onSelect(res);
                                                    setShowResults(false);
                                                }}
                                                className="flex cursor-pointer items-start gap-3 border-b p-4 last:border-0 hover:bg-slate-50 aria-selected:bg-slate-100"
                                            >
                                                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                                                    <VariantIdentity
                                                        productName={
                                                            res.product_name
                                                        }
                                                        variantName={
                                                            res.variant_name
                                                        }
                                                        sku={res.sku}
                                                        image={res.image}
                                                        nameClassName="leading-none font-bold text-slate-900"
                                                        skuClassName="font-mono text-xs tracking-tight"
                                                    />
                                                    {res.is_on_promo && (
                                                        <span className="ml-1 rounded-full bg-green-100 px-1.5 py-0.5 text-[8px] font-bold text-green-700">
                                                            PROMO
                                                        </span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </div>
                )}
            </Command>
        </div>
    );
}
