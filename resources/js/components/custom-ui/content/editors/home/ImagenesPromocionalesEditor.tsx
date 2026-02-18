'use client';

import { useForm } from '@inertiajs/react';
import { Save, Image as ImageIcon, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from '@/components/custom-ui/upload';
import { ContentSectionProps as Props } from '../../../../../types/content/content';

interface PromoItem {
  id: number;
  src: File | string | null;
  alt?: string;
  link?: string;
}

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
    newItems[index] = { ...newItems[index], ...newItem };
    setData('content', { ...data.content, items: newItems });
  };

  const addItem = () => {
    setData('content', {
      ...data.content,
      items: [
        ...data.content.items,
        { id: Date.now(), src: null, alt: '', link: '' },
      ],
    });
  };

  const removeItem = (index: number) => {
    if (data.content.items.length <= 1) {
      toast.error('Debe existir al menos una imagen');
      return;
    }
    const newItems = [...data.content.items];
    newItems.splice(index, 1);
    setData('content', { ...data.content, items: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ─── DEBUG: inspeccionar cada item antes de enviar ───
    console.group('📦 handleSubmit — items a enviar');
    data.content.items.forEach((item, i) => {
      const isFile = item.src instanceof File;
      const isString = typeof item.src === 'string';
      console.log(
        `  [${i}] id=${item.id} | src tipo: ${
          isFile ? `File (${(item.src as File).name}, ${(item.src as File).size}b)` :
          isString ? `string (${(item.src as string).substring(0, 60)}...)` :
          item.src === null ? 'null' : typeof item.src
        }`
      );
    });
    console.groupEnd();

    // ─── DEBUG: inspeccionar el FormData que se enviaría manualmente ───
    const fd = new FormData();
    data.content.items.forEach((item, i) => {
      if (item.src instanceof File) {
        fd.append(`content[items][${i}][src]`, item.src);
        console.log(`✅ FormData[${i}][src] → File adjuntado: ${item.src.name}`);
      } else if (typeof item.src === 'string') {
        fd.append(`content[items][${i}][src]`, item.src);
        console.log(`🔗 FormData[${i}][src] → string URL`);
      } else {
        console.warn(`⚠️ FormData[${i}][src] → NULL/vacío, no se enviará imagen`);
      }
      fd.append(`content[items][${i}][id]`, String(item.id));
      fd.append(`content[items][${i}][alt]`, item.alt ?? '');
      fd.append(`content[items][${i}][link]`, item.link ?? '');
    });

    console.log('📬 Enviando con Inertia put...');

    put(
      `/content/update/${section.page.slug}/${section.type}/${section.id}`,
      {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => {
          console.log('✅ onSuccess — guardado correctamente');
          toast.success('¡Imágenes promocionales actualizadas!');
        },
        onError: (errors) => {
          console.error('❌ onError — errores del servidor:', errors);
          toast.error('Error al guardar las imágenes');
        },
      }
    );
  };

  const items = data.content.items;

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Configuración de {section.name}
              </h3>
              <p className="text-sm text-slate-500">
                Administra las imágenes promocionales.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4 items-stretch">

            {/* ── Columna izquierda (col-span-2) ── */}
            <div className="col-span-2 grid grid-cols-2 gap-2.5 lg:gap-4">
              {items.slice(0, 4).map((item, i) => (
                <div key={item.id} className="relative aspect-square">
                  <Upload
                    value={item.src}
                    onFileChange={(file) => {
                      console.log(`🖼️ Upload[${i}] cambió →`, file instanceof File ? `File: ${file.name}` : file);
                      updateItem(i, { src: file });
                    }}
                    previewClassName="!absolute !inset-0 !h-full !w-full !rounded-lg !object-cover"
                  />
                  <RemoveButton onClick={() => removeItem(i)} />
                </div>
              ))}

              {items[4] && (
                <div className="col-span-2 relative aspect-[16/5]">
                  <Upload
                    value={items[4].src}
                    onFileChange={(file) => {
                      console.log(`🖼️ Upload[4] cambió →`, file instanceof File ? `File: ${file.name}` : file);
                      updateItem(4, { src: file });
                    }}
                    previewClassName="!absolute !inset-0 !h-full !w-full !rounded-lg !object-cover"
                  />
                  <RemoveButton onClick={() => removeItem(4)} />
                </div>
              )}
            </div>

            {/* ── Columna central (col-span-1) ── */}
            <div className="col-span-1 flex flex-col gap-2.5 lg:gap-4">
              {items.slice(5, 7).map((item, i) => {
                const index = i + 5;
                return (
                  <div key={item.id} className="relative aspect-[3/4]">
                    <Upload
                      value={item.src}
                      onFileChange={(file) => {
                        console.log(`🖼️ Upload[${index}] cambió →`, file instanceof File ? `File: ${file.name}` : file);
                        updateItem(index, { src: file });
                      }}
                      previewClassName="!absolute !inset-0 !h-full !w-full !rounded-lg !object-cover"
                    />
                    <RemoveButton onClick={() => removeItem(index)} />
                  </div>
                );
              })}
            </div>

            {/* ── Columna derecha (col-span-1) ── */}
            {items[7] && (
              <div className="col-span-1 self-stretch">
                <div className="relative h-full w-full">
                  <Upload
                    value={items[7].src}
                    onFileChange={(file) => {
                      console.log(`🖼️ Upload[7] cambió →`, file instanceof File ? `File: ${file.name}` : file);
                      updateItem(7, { src: file });
                    }}
                    previewClassName="!absolute !inset-0 !h-full !w-full !rounded-lg !object-cover"
                  />
                  <RemoveButton onClick={() => removeItem(7)} />
                </div>
              </div>
            )}

          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="gap-2"
            >
              <Plus size={16} />
              Agregar Imagen
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={processing}
          className="px-10 py-6 rounded-xl shadow-md gap-2 text-base font-bold"
        >
          <Save size={20} />
          {processing ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-2 right-2 z-10 bg-red-500 text-white p-1 rounded-full shadow"
    >
      <Trash size={14} />
    </button>
  );
}