'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import categories from '@/routes/blogs/categories';
import { BlogCategory } from '@/types/blogs';
import { useForm } from '@inertiajs/react';

interface FormData {
    name: string;
}

export default function CategoryForm({
    category,
}: {
    category?: BlogCategory;
}) {
    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        name: category?.name || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (category?.id) {
            // Editar categoría existente
            const action = categories.update(category.id).url; // URL dinámica de actualización
            put(action, {
                preserveScroll: true, // opcional, para que la página no haga scroll arriba
            });
        } else {
            const action = categories.store().url; // URL dinámica
            post(action);
        }
    };

    return (
        <form onSubmit={submit} className="max-w-md space-y-6">
            {/* Nombre */}
            <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium">Nombre</label>
                <Input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Ej: Tecnología, Moda, Hogar"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
            </div>

            {/* Botón */}
            <div>
                <Button type="submit" disabled={processing}>
                    {category ? 'Actualizar Categoría' : 'Crear Categoría'}
                </Button>
            </div>
        </form>
    );
}
