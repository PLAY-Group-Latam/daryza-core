'use client';

import { Upload } from '@/components/custom-ui/upload';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { LayoutPanelTop, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    BrandItem,
    ContentSectionProps as Props,
} from '../../../../../types/content/content';

// Extendemos el tipo localmente para manejar un ID único para el renderizado
interface BrandItemWithId extends BrandItem {
    tempId: string;
}

export default function BrandsEditor({ section }: Props) {
    const rawContent = section.content?.content;

    // Inicializamos con IDs únicos para que React no se confunda al eliminar
    const initialContent =
        rawContent && 'brands' in rawContent
            ? (rawContent.brands as BrandItem[]).map((b) => ({
                  ...b,
                  tempId: crypto.randomUUID(),
              }))
            : [];

    const { data, setData, processing, put, transform } = useForm({
        brands: initialContent as BrandItemWithId[],
    });

    const addBrand = () => {
        setData('brands', [
            ...data.brands,
            { tempId: crypto.randomUUID(), image: null, name: '' },
        ]);
    };

    const removeBrand = (tempId: string) => {
        // Filtramos por el ID único, no por index
        setData(
            'brands',
            data.brands.filter((brand) => brand.tempId !== tempId),
        );
    };

    const updateBrand = (tempId: string, file: File | string | null) => {
        const updated = data.brands.map((brand) =>
            brand.tempId === tempId ? { ...brand, image: file } : brand,
        );
        setData('brands', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Ahora 'transform' ya existe porque lo extrajimos del useForm
        transform((data) => ({
            content: {
                // 2. Tipamos rest como 'any' o 'BrandItem' para evitar el error de binding
                brands: data.brands.map(
                    ({ tempId, ...rest }: BrandItemWithId) => rest,
                ),
            },
        }));

        // 3. Enviamos
        put(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => toast.success('¡Marcas guardadas!'),
                onError: () => toast.error('Error de validación.'),
            },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <LayoutPanelTop size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Configuración de {section.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                                Administra los logotipos de las marcas aliadas.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 p-8">
                    {data.brands.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
                            <p className="text-sm font-medium text-slate-400">
                                No hay marcas agregadas aún
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                            {data.brands.map((brand) => (
                                <div
                                    key={brand.tempId} // 🔑 CLAVE: Usar el ID único, no el index
                                    className="group relative flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50/50 p-2 transition-all hover:shadow-md"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeBrand(brand.tempId)
                                        }
                                        className="absolute -top-2 -right-2 z-20 flex size-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:bg-red-600"
                                    >
                                        <Trash2 size={14} />
                                    </button>

                                    <Upload
                                        value={brand.image}
                                        onFileChange={(file) =>
                                            updateBrand(brand.tempId, file)
                                        }
                                        previewClassName="!w-full !aspect-square !rounded-lg !object-contain !border-0 !bg-white p-2"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={addBrand}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm font-semibold text-slate-500 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                    >
                        <Plus size={18} />
                        Agregar nueva marca
                    </button>
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={processing}
                    className="gap-2 rounded-xl px-10 py-6 text-base font-bold shadow-md"
                >
                    <Save size={20} />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}
