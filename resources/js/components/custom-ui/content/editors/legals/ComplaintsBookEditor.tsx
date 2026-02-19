'use client';

import { useForm } from '@inertiajs/react';
import { Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { RichTextEditor } from '@/components/custom-ui/rich-text-tiptap/RichTextEditor';

interface ComplaintsContent {
  body: string;
}

export default function ComplaintsBookEditor({ section }: Props) {
  const rawContent = section.content?.content as ComplaintsContent;

  const { data, setData, put, processing } = useForm<{ content: ComplaintsContent }>({
    content: { body: rawContent?.body ?? '' },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success('¡Libro de Reclamaciones actualizado!'),
      onError: () => toast.error('Error al guardar'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><FileText size={20} /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Configuración de {section.name}</h3>
              <p className="text-sm text-slate-500">Edita el contenido usando la barra de herramientas para dar formato.</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <RichTextEditor
            value={data.content.body}
            onChange={(val) => setData('content', { body: val })}
          />
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