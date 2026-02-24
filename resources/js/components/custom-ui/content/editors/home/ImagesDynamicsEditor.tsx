'use client';

import { useForm } from '@inertiajs/react';
import { Save, Image as ImageIcon, Trash, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from '@/components/custom-ui/upload';
import { ContentSectionProps as Props } from '../../../../../types/content/content';
import { PromoItem } from '@/types/content/content-types';

interface ImagenesPromocionalesContent {
  items: PromoItem[];
}

export default function ImagenesPromocionalesEditor({ section }: Props) {
  const rawContent = section.content?.content;

  const isImagenesPromocionalesContent = (
    content: any
  ): content is ImagenesPromocionalesContent => {
    return content && Array.isArray(content.items);
  };

  const initialContent: ImagenesPromocionalesContent =
    isImagenesPromocionalesContent(rawContent)
      ? rawContent
      : {
          items: Array.from({ length: 8 }).map((_, i) => ({
            id: i + 1,
            src: null,
            alt: '',
            link: '',
          })),
        };

  const { data, setData, put, processing } = useForm<{
    content: ImagenesPromocionalesContent;
  }>({
    content: initialContent,
  });

  const updateItem = (index: number, newItem: Partial<PromoItem>) => {
    const newItems = [...data.content.items];
    
    newItems[index] = { 
      ...newItems[index], 
      ...newItem,
      // Si el usuario borra el link, enviamos '#' para forzar al servidor a actualizar.
      // Laravel no convertirá '#' en NULL, por lo que se guardará correctamente.
      link: newItem.link === "" ? "#" : (newItem.link ?? newItems[index].link)
    };

    setData('content', {
      ...data.content,
      items: newItems
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('¡Configuración guardada!');
      },
      onError: (errors) => {
        console.error('Errores:', errors);
        toast.error('Error al guardar');
      },
    });
  };

  const items = data.content.items;

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Configuración de {section.name}</h3>
              <p className="text-sm text-slate-500">Gestiona imágenes y enlaces.</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 items-stretch">
            {/* 1. Grid Principal (0-3) */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
              {items.slice(0, 4).map((item, i) => (
                <div key={item.id} className="flex flex-col gap-2">
                  <div className="relative aspect-square">
                    <Upload
                      value={item.src}
                      onFileChange={(file) => updateItem(i, { src: file })}
                      previewClassName="!absolute !inset-0 !h-full !w-full !rounded-lg !object-cover shadow-inner"
                    />
                  </div>
                  <URLInput 
                    value={item.link} 
                    onChange={(val) => updateItem(i, { link: val })} 
                  />
                </div>
              ))}

              {/* 2. Banner Horizontal (4) */}
              {items[4] && (
                <div className="col-span-2 flex flex-col gap-2">
                  <div className="relative aspect-[16/5]">
                    <Upload
                      value={items[4].src}
                      onFileChange={(file) => updateItem(4, { src: file })}
                      previewClassName="!absolute !inset-0 !h-full !w-full !rounded-lg !object-cover shadow-inner"
                    />
                  </div>
                  <URLInput 
                    value={items[4].link} 
                    onChange={(val) => updateItem(4, { link: val })} 
                  />
                </div>
              )}
            </div>

            {/* 3. Columna Vertical (5, 6) */}
            <div className="col-span-1 flex flex-col gap-4">
              {items.slice(5, 7).map((item, i) => {
                const index = i + 5;
                return (
                  <div key={item.id} className="flex flex-col gap-2 flex-1">
                    <div className="relative aspect-[3/4] flex-1">
                      <Upload
                        value={item.src}
                        onFileChange={(file) => updateItem(index, { src: file })}
                        previewClassName="!absolute !inset-0 !h-full !w-full !rounded-lg !object-cover shadow-inner"
                      />
                    </div>
                    <URLInput 
                      value={item.link} 
                      onChange={(val) => updateItem(index, { link: val })} 
                    />
                  </div>
                );
              })}
            </div>

            {/* 4. Columna Derecha Larga (7) */}
            {items[7] && (
              <div className="col-span-1 flex flex-col gap-2">
                <div className="relative flex-1 min-h-[300px]">
                  <Upload
                    value={items[7].src}
                    onFileChange={(file) => updateItem(7, { src: file })}
                    previewClassName="!absolute !inset-0 !h-full !w-full !rounded-lg !object-cover shadow-inner"
                  />
                </div>
                <URLInput 
                  value={items[7].link} 
                  onChange={(val) => updateItem(7, { link: val })} 
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={processing}
          className="px-10 py-6 rounded-xl shadow-lg gap-2 text-base font-bold"
        >
          <Save size={20} />
          {processing ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </form>
  );
}

function URLInput({ value, onChange }: { value: string | null | undefined, onChange: (val: string) => void }) {
  // Limpiamos el valor para que si es '#' en el estado, se vea vacío en el input
  const displayValue = (value === '#' || !value) ? '' : value;

  return (
    <div className="group relative flex items-center">
      <Link2 size={12} className="absolute left-2 text-slate-400" />
      <input
        type="text"
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Sin enlace"
        className="w-full text-[10px] border border-slate-200 rounded-md pl-7 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50/30"
      />
      {displayValue && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-1.5 p-1 text-slate-300 hover:text-red-500"
        >
          <Trash size={10} />
        </button>
      )}
    </div>
  );
}