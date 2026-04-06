'use client';

import { Button } from '@/components/ui/button';
import { ProductLite, TypedSectionProps } from '@/types/content/content';
import { useForm } from '@inertiajs/react';
import { GripVertical, LayoutList, Package, Save, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { BlogProductSearch } from './BlogProductSearch';

// URL indestructible de respaldo
const DEFAULT_IMAGE =
    'https://placehold.co/400x400/f1f5f9/94a3b8?text=Producto';

type Props = TypedSectionProps<'blog_products'> & {
    searchResults?: ProductLite[];
};

export default function ProductListEditor({
    section,
    searchResults = [],
}: Props) {
    const initialItems: ProductLite[] = section.content?.content.items ?? [];

    const { data, setData, put, processing, transform } = useForm({
        items: initialItems,
    });

    useEffect(() => {
        const items = section.content?.content.items;

        if (!items) return;

        setData('items', items);
    }, [section.content, setData]);

    const addProduct = (product: ProductLite) => {
        const exists = data.items.some(
            (item: any) => item.product_id === product.product_id,
        );
        if (exists) return toast.warning('Este producto ya está en la lista');

        const newItems = [...data.items, product] as any;
        setData('items', newItems);
    };

    const removeProduct = (id: string) => {
        setData(
            'items',
            data.items.filter((item: any) => item.product_id !== id) as any,
        );
        toast.info('Producto removido de la lista');
    };

    transform((values) => ({
        content: { items: values.items },
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
            <div className="space-y-6 text-center">
                <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary shadow-sm">
                    <Package size={32} />
                </div>
                <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 italic">
                        Panel de Productos
                    </h2>
                    <p className="text-sm text-slate-500">
                        Agrega nuevos productos o quita los existentes. No se
                        guardarán cambios en la web hasta que hagas clic en el
                        botón inferior.
                    </p>
                </div>

                <BlogProductSearch
                    searchResults={searchResults}
                    onSelect={addProduct}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 px-2 pb-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold tracking-widest text-slate-800 uppercase">
                        <LayoutList size={18} className="text-primary" />
                        Productos en la sección ({data.items.length})
                    </h3>
                </div>

                {data.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-slate-400">
                        <Package size={40} className="mb-3 opacity-20" />
                        <p className="text-sm font-medium italic">
                            La sección está vacía.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {data.items.map((product: any) => (
                            <div
                                key={product.product_id}
                                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-all hover:border-primary/40"
                            >
                                <div className="cursor-default pl-2 text-slate-300 group-hover:text-slate-400">
                                    <GripVertical size={18} />
                                </div>

                                {/* CONTENEDOR DE IMAGEN CON CONDICIONAL Y ONERROR */}
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                    <img
                                        src={
                                            product.image &&
                                            product.image.trim() !== ''
                                                ? product.image
                                                : DEFAULT_IMAGE
                                        }
                                        className="h-full w-full object-cover"
                                        alt={product.product_name}
                                        onError={(e) => {
                                            const target =
                                                e.target as HTMLImageElement;
                                            if (target.src !== DEFAULT_IMAGE) {
                                                target.src = DEFAULT_IMAGE;
                                            }
                                        }}
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h4 className="truncate text-sm leading-tight font-bold text-slate-900">
                                        {product.product_name}
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-[10px] text-slate-400 uppercase">
                                            SKU: {product.sku}
                                        </span>
                                        <span className="text-xs font-bold text-slate-700">
                                            ${product.active_price}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        removeProduct(product.product_id)
                                    }
                                    className="h-9 w-9 rounded-full text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-center pt-6">
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={processing}
                    className="h-14 gap-3 rounded-2xl bg-slate-900 px-12 text-base font-black text-white shadow-xl transition-all hover:bg-black hover:shadow-2xl active:scale-95"
                >
                    {processing ? (
                        'Sincronizando...'
                    ) : (
                        <>
                            <Save size={20} /> GUARDAR CONFIGURACIÓN
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
