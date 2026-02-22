'use client';

import { useForm } from '@inertiajs/react';
import { Save, Monitor, Smartphone, Link2, ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';

interface PromotionalItem {
  id: string;
  src_desktop: File | string | null;
  src_mobile: File | string | null;
  link_url: string;
}

interface ImagePromotionalContent {
  items: PromotionalItem[];
}

function UploadFixed({
  value,
  onChange,
  className,
}: {
  value: File | string | null;
  onChange: (f: File | string | null) => void;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-dashed border-slate-300 bg-slate-50 overflow-hidden ${className ?? ''}`}>
      <div className="w-full h-full [&>*]:!w-full [&>*]:!h-full [&_img]:!object-cover">
        <Upload
          value={value}
          onFileChange={onChange}
          accept="image/*"
          previewClassName="!w-full !h-full !object-cover !border-0 !bg-transparent"
        />
      </div>
    </div>
  );
}

export default function PageImagePromotionalEditor({ section }: Props) {

  const rawContent = section.content?.content as ImagePromotionalContent;

  const { data, setData, put, processing } = useForm<{ content: ImagePromotionalContent }>({
    content: {
      items: rawContent?.items?.slice(0, 2) ?? [], // ← máximo 2
    },
  });

  const items = data.content.items;

  const updateItem = (index: number, patch: Partial<PromotionalItem>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...patch };
    setData('content', { items: updated });
  };

  const addItem = () => {
    if (items.length >= 2) return; // ← máximo 2

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

    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => toast.success('Imágenes promocionales actualizadas'),
      onError: () => toast.error('Error al guardar'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ImagePlus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Imágenes Promocionales
              </h3>
              <p className="text-sm text-slate-500">
                Máximo 2 promociones con imagen desktop, móvil y enlace.
              </p>
            </div>
          </div>

          {items.length < 2 && ( // ← máximo 2
            <Button type="button" onClick={addItem}>
              Agregar
            </Button>
          )}
        </div>

        <div className="p-6 space-y-10">
          {items.map((item, index) => (
            <div key={item.id} className="border border-slate-200 rounded-xl p-5 space-y-6 relative">

              <button
                type="button"
                onClick={() => removeItem(index)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-xs uppercase text-slate-400">
                    <Monitor size={12} /> Desktop
                  </Label>
                  <UploadFixed
                    value={item.src_desktop}
                    onChange={(file) => updateItem(index, { src_desktop: file })}
                    className="w-full aspect-[3/1]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-xs uppercase text-slate-400">
                    <Smartphone size={12} /> Móvil
                  </Label>
                  <UploadFixed
                    value={item.src_mobile}
                    onChange={(file) => updateItem(index, { src_mobile: file })}
                    className="w-[120px] aspect-[9/16]"
                  />
                </div>

              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs uppercase text-slate-400">
                  <Link2 size={12} /> URL destino
                </Label>
                <Input
                  value={item.link_url}
                  onChange={(e) => updateItem(index, { link_url: e.target.value })}
                  placeholder="https://ejemplo.com"
                />
              </div>

            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={processing} className="px-10 py-6 rounded-xl shadow-md gap-2 text-base font-bold">
          <Save size={20} />
          {processing ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

    </form>
  );
}