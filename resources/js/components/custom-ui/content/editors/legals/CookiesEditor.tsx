'use client';

import { useForm } from '@inertiajs/react';
import { Save, FileText, ExternalLink, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { RichTextEditor } from '@/components/custom-ui/rich-text-tiptap/RichTextEditor';
import { PrivacyContent } from '@/types/content/content-types';

export default function CookiesEditor({ section }: Props) {
  const rawContent = section.content?.content as PrivacyContent;

  const { data, setData, put, processing } = useForm<{ content: PrivacyContent }>({
    content: { body: rawContent?.body ?? '' },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success('¡Política de Cookies actualizada!'),
      onError: () => toast.error('Error al guardar'),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner de Referencia Técnica - Estilo Profesional */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600">
            <Lightbulb size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Referencia de cumplimiento (Estructura Falabella)</h4>
            <p className="text-xs text-slate-500 mt-1">
              Se recomienda incluir: Definiciones, Tipos de cookies (Técnicas/Analíticas), Gestión de terceros y derechos de control.
            </p>
          </div>
        </div>
        <a 
          href="https://www.falabella.com.pe/falabella-pe/page/politicas-de-cookies" 
          target="_blank" 
          className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline whitespace-nowrap bg-white px-3 py-2 rounded-lg border border-slate-200 transition-all"
        >
          Ver Referencia
          <ExternalLink size={14} />
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header idéntico al de Reclamaciones */}
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Configuración de {section.name}</h3>
                <p className="text-sm text-slate-500">Edita el contenido legal y la tabla de rastreadores para los usuarios.</p>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="p-6">
            <RichTextEditor
              value={data.content.body}
              onChange={(val) => setData('content', { body: val })}
            />
          </div>
        </div>

        {/* Botón de acción */}
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
    </div>
  );
}