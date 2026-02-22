'use client';

import { useForm } from '@inertiajs/react';
import { Save, BookOpen, FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';
import { useState } from 'react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface HistoryYear {
  anio:   string;
  imagen: File | string | null;
  texto:  string;
}

interface OurHistoryContent {
  titulo:      string;
  descripcion: string;
  years:       HistoryYear[];
}

const DEFAULT_YEAR = (): HistoryYear => ({
  anio:   String(new Date().getFullYear()),
  imagen: null,
  texto:  '',
});

// ─── Upload con aspect ratio fijo ─────────────────────────────────────────────

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
      <div className="w-full h-full [&>*]:!w-full [&>*]:!h-full [&_img]:!w-full [&_img]:!h-full [&_img]:!object-cover [&_img]:!rounded-none">
        <Upload
          value={value}
          onFileChange={onChange}
          accept="image/*"
          previewClassName="!w-full !h-full !object-cover !rounded-none !border-0 !bg-transparent"
        />
      </div>
    </div>
  );
}

// ─── Editor principal ─────────────────────────────────────────────────────────

export default function OurHistoryEditor({ section }: Props) {
  const rawContent = section.content?.content as OurHistoryContent;

  const { data, setData, put, processing } = useForm<{ content: OurHistoryContent }>({
    content: {
      titulo:      rawContent?.titulo      ?? '',
      descripcion: rawContent?.descripcion ?? '',
      years:       rawContent?.years?.length ? rawContent.years : [DEFAULT_YEAR()],
    },
  });

  const [activeTab, setActiveTab] = useState(0);

  const set = <K extends keyof OurHistoryContent>(key: K, val: OurHistoryContent[K]) =>
    setData('content', { ...data.content, [key]: val });

  const updateYear = (index: number, patch: Partial<HistoryYear>) => {
    const updated = [...data.content.years];
    updated[index] = { ...updated[index], ...patch };
    set('years', updated);
  };

  const addYear = () => {
    const updated = [...data.content.years, DEFAULT_YEAR()];
    set('years', updated);
    setActiveTab(updated.length - 1);
  };

  const removeYear = (index: number) => {
    if (data.content.years.length === 1) return;
    const updated = data.content.years.filter((_, i) => i !== index);
    set('years', updated);
    setActiveTab(Math.min(activeTab, updated.length - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => toast.success('¡Nuestra Historia actualizada!'),
      onError:   () => toast.error('Error al guardar los cambios'),
    });
  };

  const activeYear = data.content.years[activeTab];

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">

      {/* ── Encabezado ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Encabezado</h3>
              <p className="text-sm text-slate-500">Título y texto introductorio de la sección.</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Título</Label>
            <Input
              value={data.content.titulo}
              onChange={(e) => set('titulo', e.target.value)}
              placeholder="Nuestra Historia"
              className="text-sm font-bold text-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Descripción</Label>
            <textarea
              value={data.content.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              placeholder="Lorem ipsum dolor sit amet..."
              rows={3}
              className="w-full text-sm rounded-md border border-input bg-background px-3 py-2
                         placeholder:text-muted-foreground focus-visible:outline-none
                         focus-visible:ring-1 focus-visible:ring-ring resize-none min-h-[80px]"
              style={{ fieldSizing: 'content', whiteSpace: 'pre-wrap', wordBreak: 'break-word' } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* ── Años ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Línea de tiempo</h3>
                <p className="text-sm text-slate-500">Agrega y edita cada año de la historia.</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={addYear}
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm"
            >
              <Plus size={14} /> Agregar año
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Tabs de años */}
          <div className="flex flex-wrap gap-2">
            {data.content.years.map((year, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveTab(index)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors
                  ${activeTab === index
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {year.anio || `Año ${index + 1}`}
              </button>
            ))}
          </div>

          {/* Editor del año activo */}
          {activeYear && (
            <div key={activeTab} className="rounded-2xl border border-slate-200 overflow-hidden">
              {/* Header del año */}
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Año</Label>
                  <Input
                    value={activeYear.anio}
                    onChange={(e) => updateYear(activeTab, { anio: e.target.value })}
                    placeholder="2024"
                    className="text-sm font-bold w-28 h-8"
                    maxLength={4}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeYear(activeTab)}
                  disabled={data.content.years.length === 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Imagen + texto — responsive */}
              <div className="p-5 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-5 items-start">
                {/* Imagen cuadrada */}
                <div className="space-y-2">
                  <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Imagen</Label>
                  <UploadFixed
                    key={activeTab}
                    value={activeYear.imagen}
                    onChange={(file) => updateYear(activeTab, { imagen: file })}
                    className="w-full aspect-square"
                  />
                </div>

                {/* Texto — ocupa todo el ancho restante */}
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Texto</Label>
                  <textarea
  value={activeYear.texto}
  onChange={(e) => updateYear(activeTab, { texto: e.target.value })}
  placeholder="Descripción de lo que ocurrió en este año..."
  rows={6}
  className="w-full text-sm rounded-md border border-input bg-background px-3 py-2
             placeholder:text-muted-foreground focus-visible:outline-none
             focus-visible:ring-1 focus-visible:ring-ring resize-none min-h-[160px]"
  style={{ fieldSizing: 'content', whiteSpace: 'pre-wrap', wordBreak: 'break-word' } as React.CSSProperties}
/>
                </div>
              </div>
            </div>
          )}

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