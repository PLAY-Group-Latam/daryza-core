import { useForm } from '@inertiajs/react';
import { Save, Upload, Calendar, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Props {
    section: {
        id: number;
        name: string;
        type: string;
        page: {
            slug: string;
        };
        content: {
            content: {
                image?: string;
                start_date?: string;
                end_date?: string;
                is_visible?: boolean;
            };
        };
    };
}

export default function ModalEditor({ section }: Props) {

    const { data, setData, post, processing } = useForm<{
        content: {
            image: File | string | null;
            start_date: string;
            end_date: string;
            is_visible: boolean;
        };
    }>({
        content: {
            image: section.content?.content?.image ?? null,
            start_date: section.content?.content?.start_date ?? '',
            end_date: section.content?.content?.end_date ?? '',
            is_visible: section.content?.content?.is_visible ?? true,
        },
    });

    const [previewImage, setPreviewImage] = useState<string>(
        typeof data.content.image === 'string' ? data.content.image : ''
    );

    // ✅ Manejar subida SIN Base64
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const previewUrl = URL.createObjectURL(file);

        setPreviewImage(previewUrl);

        setData('content', {
            ...data.content,
            image: file,
        });
    };

    const updateField = (key: keyof typeof data.content, value: any) => {
        setData('content', {
            ...data.content,
            [key]: value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
            forceFormData: true, // 🔥 NECESARIO para enviar File
            preserveScroll: true,
            onSuccess: () => {
                console.log("Guardado con éxito");
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-semibold text-foreground">
                    Configuración del Modal (Home Modal)
                </h3>

                <div className="space-y-6">

                    {/* Imagen */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">
                            Imagen del Modal
                        </label>

                        {previewImage && (
                            <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('image-upload')?.click()}
                                className="gap-2"
                            >
                                <Upload size={16} />
                                {previewImage ? 'Cambiar Imagen' : 'Subir Imagen'}
                            </Button>

                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Formatos permitidos: JPG, PNG, WebP.
                        </p>
                    </div>

                    {/* Fechas */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Calendar size={16} className="text-muted-foreground" />
                                Fecha de Inicio
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={data.content.start_date}
                                onChange={(e) => updateField('start_date', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Calendar size={16} className="text-muted-foreground" />
                                Fecha de Fin
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={data.content.end_date}
                                onChange={(e) => updateField('end_date', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Visibilidad */}
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                        <div className="flex items-center gap-3">
                            {data.content.is_visible ? (
                                <Eye size={20} className="text-primary" />
                            ) : (
                                <EyeOff size={20} className="text-muted-foreground" />
                            )}
                            <div>
                                <p className="font-medium text-foreground">Visibilidad</p>
                                <p className="text-xs text-muted-foreground">
                                    {data.content.is_visible ? 'El modal está activo' : 'El modal está oculto'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => updateField('is_visible', !data.content.is_visible)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                data.content.is_visible ? 'bg-primary' : 'bg-muted-foreground'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    data.content.is_visible ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={processing} className="gap-2">
                    <Save size={16} />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}
