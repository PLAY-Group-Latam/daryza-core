'use client';

import { router } from '@inertiajs/react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { useDebounce } from '@/hooks/use-debounce';
import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { ProductRecommendable } from '@/types/products/productEdit';
import { ProductFormValues } from '../schema';

interface Props {
    initialSelected: ProductRecommendable[];
    searchResults: ProductRecommendable[];
    searchUrl: string;
}

export function RecommendedProductsField({
    initialSelected,
    searchResults,
    searchUrl,
}: Props) {
    const {
        control,
        formState: { errors },
    } = useFormContext<ProductFormValues>();

    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] =
        useState<ProductRecommendable[]>(initialSelected);
    const debouncedQuery = useDebounce(query, 300);

    const selectedIds = useMemo(
        () => selectedProducts.map((item) => item.id),
        [selectedProducts],
    );

    useEffect(() => {
        setSelectedProducts(initialSelected);
    }, [initialSelected]);

    useEffect(() => {
        if (debouncedQuery.trim().length < 3) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        router.get(
            searchUrl,
            {
                recommended_q: debouncedQuery.trim(),
                exclude: selectedIds.join(','),
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['recommendableSearchResults', 'filters'],
                onFinish: () => setIsLoading(false),
            },
        );
    }, [debouncedQuery, selectedIds, searchUrl]);

    return (
        <Controller
            name="recommended_product_ids"
            control={control}
            render={({ field }) => {
                const value = field.value ?? [];

                const removeRecommended = (id: string) => {
                    const nextIds = value.filter((itemId) => itemId !== id);
                    field.onChange(nextIds);
                    setSelectedProducts((prev) =>
                        prev.filter((item) => item.id !== id),
                    );
                };

                const selectRecommended = (item: ProductRecommendable) => {
                    if (value.includes(item.id)) return;

                    field.onChange([...value, item.id]);
                    setSelectedProducts((prev) => [...prev, item]);
                    setQuery('');
                    setShowResults(false);
                };

                return (
                    <div className="relative space-y-2">
                        <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                            ● Productos recomendados
                        </p>

                        <Command
                            shouldFilter={false}
                            className="rounded-lg border shadow-none!"
                        >
                            <CommandInput
                                placeholder="Buscar por nombre o código..."
                                value={query}
                                onValueChange={(value) => {
                                    setQuery(value);
                                    setShowResults(value.length > 0);
                                }}
                                onFocus={() => setShowResults(query.length > 0)}
                                className="flex w-full py-3 text-sm"
                            />

                            {showResults && (
                                <div className="absolute z-50 mt-12 w-[calc(100%-2rem)] overflow-hidden rounded-md border bg-white shadow-md">
                                    <CommandList className="max-h-[200px]">
                                        {isLoading && debouncedQuery.trim().length >= 3 ? (
                                            <CommandEmpty className="p-4 text-sm text-slate-500">
                                                Buscando...
                                            </CommandEmpty>
                                        ) : searchResults.length === 0 ? (
                                            <CommandEmpty className="p-4 text-sm text-slate-500">
                                                No se encontraron productos.
                                            </CommandEmpty>
                                        ) : (
                                            <CommandGroup heading="Productos disponibles">
                                                {searchResults.map((item) => (
                                                    <CommandItem
                                                        key={item.id}
                                                        value={item.id}
                                                        onSelect={() =>
                                                            selectRecommended(
                                                                item,
                                                            )
                                                        }
                                                        className="flex cursor-pointer items-center justify-between border-b p-3 text-left text-sm last:border-b-0 hover:bg-slate-50 aria-selected:bg-slate-100"
                                                    >
                                                        <span className="font-medium">
                                                            {item.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {item.code ||
                                                                item.slug}
                                                        </span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </div>
                            )}
                        </Command>

                        {selectedProducts.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedProducts.map((item) => (
                                    <span
                                        key={item.id}
                                        className="inline-flex items-center gap-2 rounded-full border bg-slate-50 px-3 py-1 text-xs"
                                    >
                                        <span>
                                            {item.name}
                                            {item.code
                                                ? ` (${item.code})`
                                                : ''}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeRecommended(item.id)
                                            }
                                            className="text-gray-500 hover:text-gray-800"
                                            aria-label={`Quitar ${item.name}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {errors.recommended_product_ids && (
                            <p className="text-sm text-red-500">
                                {errors.recommended_product_ids.message as
                                    | string
                                    | undefined}
                            </p>
                        )}
                    </div>
                );
            }}
        />
    );
}
