'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import productsNamespace from '@/routes/products';
import { Brand } from '@/types/products/brands';
import { useForm, router } from '@inertiajs/react';
import { SlugInput } from '../../slug-text';
import { Upload } from '../../upload';

interface Props {
    brand?: Brand;
}

export default function BrandForm({ brand }: Props) {
    const { data, setData, processing, errors, post } = useForm<{
        name: string;
        slug: string;
        image: File | string | null;
        is_active: boolean;
        _method?: string;
    }>({
        name: brand?.name || '',
        slug: brand?.slug || '',
        image: brand?.image || null,
        is_active: brand?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isEdit = !!brand;
        const action = isEdit
            ? productsNamespace.brands.update(brand.id).url
            : productsNamespace.brands.store().url;

        if (isEdit) {
            router.post(
                action,
                {
                    ...data,
                    _method: 'PUT',
                },
                {
                    preserveScroll: true,
                    forceFormData: true,
                }
            );
            return;
        }

        post(action, { preserveScroll: true });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* IZQUIERDA */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* NOMBRE */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Nombre de la Marca *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Ej. Daryza"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* SLUG */}
                    <SlugInput
                        id="slug"
                        label="Slug *"
                        source={data.name}
                        value={data.slug}
                        placeholder="ej-daryza"
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
                                Indica si esta marca será visible para los clientes en el catálogo.
                            </p>
                        </div>
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(val) => setData('is_active', val)}
                        />
                    </div>
                </div>

                {/* DERECHA */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <Label>Logo de la Marca *</Label>
                        <div className="max-w-[120px]">
                            <Upload
                                value={data.image}
                                placeholder="Subir imagen"
                                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                                onFileChange={(file) => setData('image', file)}
                                previewClassName="h-24 w-full"
                            />
                        </div>
                        {errors.image && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.image}
                            </p>
                        )}
                    </div>

                    {/* ESPECIFICACIONES */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-2">
                        <p className="text-xs font-semibold text-slate-600">
                            Especificaciones recomendadas
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { label: 'Formato', value: 'JPG, JPEG, PNG, SVG, WEBP' },
                                { label: 'Peso máximo', value: '1 MB' },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    className="flex justify-between items-center text-xs border-b border-slate-100 pb-1"
                                >
                                    <span className="font-semibold uppercase tracking-widest text-slate-400 text-[9px]">
                                        {label}
                                    </span>
                                    <span className="font-medium text-slate-700">
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400">
                            Se recomienda fondo transparente (cuando aplique) y buena resolución.
                        </p>
                    </div>
                </div>
            </div>

            {/* BOTÓN */}
            <div className="flex justify-start gap-4">
                <Button
                    type="submit"
                    disabled={processing}
                    className="min-w-[150px]"
                >
                    {processing
                        ? 'Guardando...'
                        : brand
                        ? 'Actualizar Marca'
                        : 'Crear Marca'}
                </Button>
            </div>
        </form>
    );
}