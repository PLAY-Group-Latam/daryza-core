'use client';

import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { BlogProductSearch } from "./BlogProductSearch";
import { Save, Trash2, Package, LayoutList, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductLite } from  "@/types/content/content";
interface Props {
    section: any;
    searchResults?: ProductLite[];
}

export default function ProductListEditor({ section, searchResults = [] }: Props) {
    
    const initialItems: ProductLite[] = section.content?.content.items ?? [];

    const { data, setData, put, processing, transform } = useForm({
        items: initialItems, 
    });


    useEffect(() => {
        if (section.content?.items) {
            setData("items", section.content.content.items);
        }
    }, [section.content]);

    const addProduct = (product: ProductLite) => {

        const exists = data.items.some((item: any) => item.product_id === product.product_id);
        if (exists) return toast.warning("Este producto ya está en la lista");
        
  
        const newItems = [...data.items, product] as any;
        setData("items", newItems);
      
    };

    const removeProduct = (id: string) => {
       
        setData("items", data.items.filter((item: any) => item.product_id !== id) as any);
        toast.info("Producto removido de la lista");
    };

   
    transform((values) => ({
        content: { items: values.items },
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        

        put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
            preserveScroll: true,
          
        });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-10 py-12 px-4">
            <div className="text-center space-y-6">
                <div className="inline-flex p-3 bg-primary/10 rounded-2xl text-primary shadow-sm">
                    <Package size={32} />
                </div>
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Panel de Productos</h2>
                    <p className="text-slate-500 text-sm">
                        Agrega nuevos productos o quita los existentes. 
                        No se guardarán cambios en la web hasta que hagas clic en el botón inferior.
                    </p>
                </div>

                <BlogProductSearch 
                    searchResults={searchResults} 
                    onSelect={addProduct} 
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 px-2">
                    <h3 className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-widest">
                        <LayoutList size={18} className="text-primary" />
                        Productos en la sección ({data.items.length})
                    </h3>
                </div>

                {data.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400">
                        <Package size={40} className="mb-3 opacity-20" />
                        <p className="text-sm italic font-medium">La sección está vacía.</p>
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {data.items.map((product: any) => (
                            <div 
                                key={product.product_id}
                                className="group flex items-center gap-4 p-2 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all hover:border-primary/40"
                            >
                                <div className="pl-2 text-slate-300 group-hover:text-slate-400 cursor-default">
                                    <GripVertical size={18} />
                                </div>
                                
                                <div className="h-12 w-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                                    <img 
                                        src={product.image || '/images/placeholder.png'} 
                                        className="h-full w-full object-cover" 
                                        alt=""
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 truncate text-sm leading-tight">
                                        {product.product_name}
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-slate-400 uppercase">SKU: {product.sku}</span>
                                        <span className="text-xs font-bold text-slate-700">${product.active_price}</span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeProduct(product.product_id)}
                                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full h-9 w-9 transition-colors"
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
                    className="h-14 px-12 rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl hover:shadow-2xl transition-all gap-3 font-black text-base active:scale-95"
                >
                    {processing ? "Sincronizando..." : <><Save size={20} /> GUARDAR CONFIGURACIÓN</>}
                </Button>
            </div>
        </div>
    );
}