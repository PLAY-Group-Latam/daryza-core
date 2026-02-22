'use client';

import { useForm } from '@inertiajs/react';
import { Save, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface IntroAboutusContent {
  video:       File | string | null;
  subtitulo:   string;
  titulo_bold: string;
  descripcion: string;
}

// ─── Editor principal ─────────────────────────────────────────────────────────

export default function IntroAboutusEditor({ section }: Props) {
  const rawContent = section.content?.content as IntroAboutusContent;

  const { data, setData, put, processing } = useForm<{ content: IntroAboutusContent }>({
    content: {
      video:       rawContent?.video       ?? null,
      subtitulo:   rawContent?.subtitulo   ?? '',
      titulo_bold: rawContent?.titulo_bold ?? '',
      descripcion: rawContent?.descripcion ?? '',
    },
  });

  const set = <K extends keyof IntroAboutusContent>(key: K, val: IntroAboutusContent[K]) =>
    setData('content', { ...data.content, [key]: val });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => toast.success('¡Intro "Sobre Nosotros" actualizada!'),
      onError:   () => toast.error('Error al guardar los cambios'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">

      {/* ── Video lateral ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Video size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Video</h3>
              <p className="text-sm text-slate-500">Video al lado izquierdo del bloque introductorio.</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="w-full aspect-video rounded-xl border border-dashed border-slate-300 bg-slate-50 overflow-hidden">
            <div className="w-full h-full [&>*]:!w-full [&>*]:!h-full [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover [&_video]:!rounded-none">
              <Upload
                value={data.content.video}
                onFileChange={(file) => set('video', file)}
                accept="video/*"
                type="video"
                previewClassName="!w-full !h-full !object-cover !rounded-none !border-0 !bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Textos ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Contenido</h3>
              <p className="text-sm text-slate-500">Subtítulo pequeño, título resaltado y descripción.</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Subtítulo pequeño */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Subtítulo
            </Label>
            <Input
              value={data.content.subtitulo}
              onChange={(e) => set('subtitulo', e.target.value)}
              placeholder="Soluciones de Higiene para tu hogar"
              className="text-sm"
            />
          </div>

          {/* Título resaltado */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Título resaltado
            </Label>
            <Input
              value={data.content.titulo_bold}
              onChange={(e) => set('titulo_bold', e.target.value)}
              placeholder="Sobre Nosotros"
              className="text-sm font-bold text-primary"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Descripción
            </Label>
            <textarea
              value={data.content.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              placeholder="Lorem ipsum dolor sit amet..."
              rows={5}
              className="w-full text-sm rounded-md border border-input bg-background px-3 py-2
                         placeholder:text-muted-foreground focus-visible:outline-none
                         focus-visible:ring-1 focus-visible:ring-ring resize-none min-h-[120px]"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
          </div>

        </div>
      </div>

      {/* ── Guardar ── */}
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