'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import productsNamespace from '@/routes/products';
import { BusinessLine } from '@/types/products/businessLines';
import { useForm, router } from '@inertiajs/react'; // Importamos router
import { SlugInput } from '../../slug-text';
import { Upload } from '../../upload';

interface Props {
    businessLine?: BusinessLine;
}

export default function BusinessLineForm({ businessLine }: Props) {
    const { data, setData, processing, errors, post } = useForm<{
        name: string;
        slug: string;
        image: File | string | null;
        is_active: boolean;
        _method?: string; 
    }>({
        name: businessLine?.name || '',
        slug: businessLine?.slug || '',
        image: businessLine?.image || null, 
        is_active: businessLine?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isEdit = !!businessLine;
        const action = isEdit
            ? productsNamespace.businessLines.update(businessLine.id).url
            : productsNamespace.businessLines.store().url;

        if (isEdit) {
            // Usamos router.post para evadir el problema de PHP con PUT y archivos
            router.post(action, {
                ...data,
                _method: 'PUT' // Engañamos a Laravel para que lo procese como actualización
            }, {
                preserveScroll: true,
                forceFormData: true, // Forzamos el envío del archivo real
            });
            return;
        }
        
        // El create funciona perfecto con el post tradicional
        post(action, { preserveScroll: true });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl space-y-8">
            {/* GRID PRINCIPAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* COLUMNA IZQUIERDA: Inputs de texto */}
                <div className="md:col-span-2 space-y-6">
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
                                Indica si esta línea será visible para los clientes en el catálogo.
                            </p>
                        </div>
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(val) => setData('is_active', val)}
                        />
                    </div>
                </div>

                {/* COLUMNA DERECHA: Upload y especificaciones */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <Label>Icono / Logo de la Línea *</Label>
                        <div className="max-w-[120px]">
                            <Upload
                                value={data.image}
                                placeholder="Subir SVG"
                                accept="image/svg+xml"
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
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-2">
                        <p className="text-xs font-semibold text-slate-600">
                            Especificaciones recomendadas
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { label: 'Formato', value: 'Solo SVG' },
                                { label: 'Peso máximo', value: '500 KB' },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center text-xs border-b border-slate-100 pb-1">
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
                            Se recomienda fondo transparente para el svg y color negro.
                        </p>
                    </div>
                </div>
            </div>

            {/* BOTÓN DE ACCIÓN */}
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