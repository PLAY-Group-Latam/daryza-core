'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import productsNamespace from '@/routes/products';
import { BusinessLine } from '@/types/products/businessLines';
import { useForm } from '@inertiajs/react';
import { SlugInput } from '../../slug-text';

interface Props {
    businessLine?: BusinessLine;
}

export default function BusinessLineForm({ businessLine }: Props) {
    const { data, setData, processing, errors, post, put } = useForm({
        name: businessLine?.name || '',
        slug: businessLine?.slug || '',
        is_active: businessLine?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isEdit = !!businessLine;
        const action = isEdit
            ? productsNamespace.businessLines.update(businessLine.id).url
            : productsNamespace.businessLines.store().url;

        if (isEdit) {
            put(action, { preserveScroll: true });
            return;
        }
        post(action, { preserveScroll: true });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
            <div className="space-y-6">
                {/* NOMBRE */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Nombre de la Línea *</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ej. Salud e Higiene"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* SLUG AUTO-GENERADO */}
                <SlugInput
                    id="slug"
                    label="Slug *"
                    source={data.name}
                    value={data.slug}
                    placeholder="ej-salud-e-higiene"
                    onChange={(val) => setData('slug', val)}
                    error={errors.slug}
                />

                {/* ESTADO */}
                <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="is_active" className="text-base">
                            Estado
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Indica si esta línea será visible para los clientes
                            en el catálogo.
                        </p>
                    </div>
                    <Switch
                        id="is_active"
                        checked={data.is_active}
                        onCheckedChange={(val) => setData('is_active', val)}
                    />
                </div>
            </div>

            <div className="flex justify-start gap-4">
                <Button
                    type="submit"
                    disabled={processing}
                    className="min-w-[150px]"
                >
                    {processing
                        ? 'Guardando...'
                        : businessLine
                          ? 'Actualizar Línea'
                          : 'Crear Línea'}
                </Button>
            </div>
        </form>
    );
}
