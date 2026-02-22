'use client';

import { useForm } from '@inertiajs/react';
import { Save, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ImageFormContent {
  imagen: File | string | null;
}

// ─── Editor principal ─────────────────────────────────────────────────────────

export default function ImageFormEditor({ section }: Props) {
  const rawContent = section.content?.content as ImageFormContent;

  const { data, setData, put, processing } = useForm<{ content: ImageFormContent }>({
    content: {
      imagen: rawContent?.imagen ?? null,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => toast.success('¡Imagen actualizada!'),
      onError:   () => toast.error('Error al guardar los cambios'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Image size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Imagen del formulario</h3>
              <p className="text-sm text-slate-500">Imagen al costado izquierdo del formulario.</p>
            </div>
          </div>
        </div>

        <div className="p-6 flex justify-center">
          <div className="w-full max-w-sm aspect-[3/4] rounded-xl border border-dashed border-slate-300 bg-slate-50 overflow-hidden">
            <div className="w-full h-full [&>*]:!w-full [&>*]:!h-full [&_img]:!w-full [&_img]:!h-full [&_img]:!object-cover [&_img]:!rounded-none">
              <Upload
                value={data.content.imagen}
                onFileChange={(file) => setData('content', { imagen: file })}
                accept="image/*"
                previewClassName="!w-full !h-full !object-cover !rounded-none !border-0 !bg-transparent"
              />
            </div>
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