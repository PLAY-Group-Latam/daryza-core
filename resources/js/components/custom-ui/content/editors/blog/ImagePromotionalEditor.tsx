'use client';

import ResponsiveBannerEditor from '@/components/custom-ui/content/ResponsiveBannerEditor';
import { Button } from '@/components/ui/button';
import { ContentSectionProps as Props } from '@/types/content/content';
import { ImagePromotionalContent } from '@/types/content/content-types';
import { useForm } from '@inertiajs/react';
import { ImagePlus, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ImagePromotionalEditor({ section }: Props) {
    const rawContent = section.content?.content as ImagePromotionalContent;

    const { data, setData, put, processing } = useForm<{
        content: ImagePromotionalContent;
    }>({
        content: {
            // Limitamos a 3 items máximo según tu lógica
            items: rawContent?.items?.slice(0, 3) ?? [],
        },
    });

    const items = data.content.items;

    const updateItem = (index: number, updates: any) => {
        const updated = [...items];
        // Solo actualizamos los campos que corresponden a PromotionalItem
        updated[index] = {
            ...updated[index],
            src_desktop: updates.src_desktop,
            src_mobile: updates.src_mobile,
            link_url: updates.link_url,
        };
        setData('content', { items: updated });
    };

    const addItem = () => {
        if (items.length >= 3) return;
        setData('content', {
            items: [
                ...items,
                {
                    id: crypto.randomUUID(),
                    src_desktop: null,
                    src_mobile: null,
                    link_url: '',
                },
            ],
        });
    };

    const removeItem = (index: number) => {
        const updated = items.filter((_, i) => i !== index);
        setData('content', { items: updated });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () =>
                    toast.success('Imágenes promocionales actualizadas'),
                onError: () => toast.error('Error al guardar'),
            },
        );
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-6xl space-y-6 pb-20"
        >
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-slate-100 p-3 text-slate-600 shadow-sm">
                            <ImagePlus size={22} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold tracking-tight text-slate-900">
                                Imágenes Promocionales
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                                {items.length} de 3 promociones configuradas.
                            </p>
                        </div>
                    </div>

                    {items.length < 3 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addItem}
                            className="gap-2 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                        >
                            <Plus size={16} /> Agregar Promo
                        </Button>
                    )}
                </div>

                {/* Lista de Promociones mapeando el componente unificado */}
                <div className="divide-y divide-slate-100 bg-slate-50/20">
                    {items.map((item, index) => (
                        <div key={item.id} className="relative bg-white p-8">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-[11px] font-black tracking-[0.2em] text-slate-300 uppercase">
                                    Promoción #0{index + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="rounded-xl p-2 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Envolvemos en un div con las clases de limpieza 
          para no pasarle 'className' directamente al componente 
        */}
                            <div className="contents-wrapper !border-0 !p-0 !shadow-none">
                                <ResponsiveBannerEditor
                                    // Agregamos title y description para satisfacer a TS
                                    title="Imagen promocional"
                                    description="Imagen promocional para la vista."
                                    data={{
                                        src_desktop: item.src_desktop,
                                        src_mobile: item.src_mobile,
                                        link_url: item.link_url ?? '',
                                        type: 'url',
                                    }}
                                    onChange={(updates) =>
                                        updateItem(index, updates)
                                    }
                                    showTypeTabs={false}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Estado vacío */}
                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-24 text-center">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 text-slate-300">
                                <ImagePlus size={32} strokeWidth={1} />
                            </div>
                            <h4 className="mb-1 font-bold text-slate-900">
                                No hay promociones activas
                            </h4>
                            <Button
                                onClick={addItem}
                                variant="outline"
                                className="mt-4 rounded-xl font-bold"
                            >
                                Crear mi primera promoción
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Guardar */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={processing}
                    className="h-14 gap-3 rounded-2xl bg-primary px-10 text-base font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Save size={20} />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}
