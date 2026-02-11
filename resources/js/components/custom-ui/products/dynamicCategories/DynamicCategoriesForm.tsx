/* eslint-disable @typescript-eslint/no-explicit-any */
import { router, useForm } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import React, { useCallback } from 'react';

export default function DynamicCategoriesForm({ searchResults, filters }: any) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        variant_ids: [], // IDs seleccionados
        is_active: true,
    });

    // Función de búsqueda (Actualiza la URL y recarga las Props)
    const handleSearch = useCallback(
        debounce((q: string) => {
            router.get(
                route('products.dynamic-categories.create'), // Tu ruta actual
                { q: q },
                {
                    preserveState: true, // No borra lo que ya escribiste en el form
                    preserveScroll: true, // No mueve el scroll
                    only: ['searchResults', 'filters'], // Solo pide estos datos al servidor
                },
            );
        }, 300),
        [],
    );

    const toggleVariant = (id: number) => {
        const currentIds = [...data.variant_ids];
        const index = currentIds.indexOf(id);
        if (index > -1) {
            currentIds.splice(index, 1);
        } else {
            currentIds.push(id);
        }
        setData('variant_ids', currentIds);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // post(route('products.dynamic-categories.store'));
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Input Nombre */}
            <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input
                    type="text"
                    className="w-full rounded border p-2"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
            </div>

            {/* --- BUSCADOR --- */}
            <div className="rounded-lg border bg-gray-50 p-4">
                <label className="mb-2 block text-sm font-bold">
                    Buscar Productos
                </label>
                <input
                    type="text"
                    placeholder="Escribe para buscar..."
                    className="mb-4 w-full rounded border p-2"
                    defaultValue={filters?.q}
                    onChange={(e) => handleSearch(e.target.value)}
                />

                {/* Resultados que vienen de las Props */}
                <div className="grid grid-cols-1 gap-2">
                    {searchResults?.map((product: any) => (
                        <div key={product.id} className="border-b pb-2">
                            <p className="text-sm font-bold text-gray-600">
                                {product.name}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2">
                                {product.variants.map((v: any) => (
                                    <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => toggleVariant(v.id)}
                                        className={`rounded-full border px-3 py-1 text-xs ${
                                            data.variant_ids.includes(v.id)
                                                ? 'bg-blue-600 text-white'
                                                : 'border-blue-600 bg-white text-blue-600'
                                        }`}
                                    >
                                        {v.name}{' '}
                                        {data.variant_ids.includes(v.id)
                                            ? '✓'
                                            : '+'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={processing}
                className="rounded bg-black px-6 py-2 font-bold text-white"
            >
                {processing ? 'Guardando...' : 'Crear Categoría'}
            </button>
        </form>
    );
}
