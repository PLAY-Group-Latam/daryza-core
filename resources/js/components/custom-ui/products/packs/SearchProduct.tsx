'use client';

import { router } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import * as React from 'react';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { SearchResult } from '@/types/products/packs';

interface PackProductSearchProps {
    searchResults: SearchResult[];
    searchUrl: string;
    onSelect: (variant: SearchResult) => void;
    placeholder?: string;
}

export function PackProductSearch({
    searchResults = [],
    searchUrl,
    onSelect,
    placeholder = 'Buscar por Sku daryza...',
}: PackProductSearchProps) {
    const [showResults, setShowResults] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // console.log(searchResults);
    // Función para parsear la variante (Separa Hex del Texto)
    const parseVariant = (variantName: string) => {
        const hexRegex = /(#[0-9A-F]{3,6})/i;
        const match = variantName.match(hexRegex);

        if (match) {
            const hex = match[0];
            // Quitamos el hex y el guion para que solo quede el texto (ej: "G")
            const label = variantName.replace(hex, '-').replace('-', '').trim();
            return { hex, label };
        }

        return { hex: null, label: variantName };
    };
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

    const handleSearch = React.useMemo(
        () =>
            debounce((value: string) => {
                if (value.length > 0) setShowResults(true);
                router.get(
                    searchUrl,
                    { q: value },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        only: ['searchResults', 'filters'],
                    },
                );
            }, 300),
        [searchUrl],
    );

    return (
        <div className="relative w-full" ref={containerRef}>
            <Command
                shouldFilter={false}
                className="rounded-lg border shadow-none!"
            >
                <CommandInput
                    placeholder={placeholder}
                    onValueChange={handleSearch}
                    onFocus={() => setShowResults(true)}
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
                                        const { hex, label } = parseVariant(
                                            res.variant_name,
                                        );

                                        return (
                                            <CommandItem
                                                key={res.variant_id}
                                                value={res.variant_id}
                                                onSelect={() => {
                                                    onSelect(res);
                                                    setShowResults(false);
                                                }}
                                                className="flex cursor-pointer flex-col items-start gap-3 border-b p-4 last:border-0 hover:bg-slate-50 aria-selected:bg-slate-100"
                                            >
                                                <span className="leading-none font-bold text-slate-900">
                                                    {res.product_name}
                                                </span>

                                                <div className="flex items-center gap-2">
                                                    {/* Círculo de color si existe HEX */}
                                                    {hex && (
                                                        <div
                                                            className="h-3.5 w-3.5 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    hex,
                                                            }}
                                                        />
                                                    )}

                                                    <span className="font-mono text-xs tracking-tight">
                                                        {label}{' '}
                                                        <span className="mx-1">
                                                            |
                                                        </span>{' '}
                                                        Sku daryza: {res.sku}
                                                    </span>

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
