'use client';

import { useForm } from '@inertiajs/react';
import { Save, Leaf, FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface SustainabilityCard {
  imagen: File | string | null;
  nombre: string;
}

interface SustainabilityContent {
  titulo:      string;
  descripcion: string;
  cards:       SustainabilityCard[];
}

const DEFAULT_CARD = (): SustainabilityCard => ({ imagen: null, nombre: '' });

// ─── Upload con aspect ratio fijo ─────────────────────────────────────────────

function UploadFixed({
  value,
  onChange,
  className,
  uploadKey,
}: {
  value: File | string | null;
  onChange: (f: File | string | null) => void;
  className?: string;
  uploadKey?: string | number;
}) {
  return (
    <div className={`rounded-xl border border-dashed border-slate-300 bg-slate-50 overflow-hidden ${className ?? ''}`}>
      <div className="w-full h-full [&>*]:!w-full [&>*]:!h-full [&_img]:!w-full [&_img]:!h-full [&_img]:!object-cover [&_img]:!rounded-none">
        <Upload
          key={uploadKey}
          value={value}
          onFileChange={onChange}
          accept="image/*"
          previewClassName="!w-full !h-full !object-cover !rounded-none !border-0 !bg-transparent"
        />
      </div>
    </div>
  );
}

// ─── Editor de una card ───────────────────────────────────────────────────────

function CardEditor({
  card,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  card:      SustainabilityCard;
  index:     number;
  onUpdate:  (patch: Partial<SustainabilityCard>) => void;
  onRemove:  () => void;
  canRemove: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Ítem {index + 1}
        </p>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-5 items-start">
        {/* Imagen circular */}
        <div className="space-y-2">
          <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Imagen</Label>
          <UploadFixed
            value={card.imagen}
            onChange={(file) => onUpdate({ imagen: file })}
            className="w-full aspect-square rounded-full"
            uploadKey={index}
          />
        </div>

        {/* Nombre */}
        <div className="space-y-1.5">
          <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Nombre</Label>
          <Input
            value={card.nombre}
            onChange={(e) => onUpdate({ nombre: e.target.value })}
            placeholder="Pasión"
            className="text-sm font-bold text-primary"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Editor principal ─────────────────────────────────────────────────────────

export default function SustainabilityEditor({ section }: Props) {
  const rawContent = section.content?.content as SustainabilityContent;

  const { data, setData, put, processing } = useForm<{ content: SustainabilityContent }>({
    content: {
      titulo:      rawContent?.titulo      ?? '',
      descripcion: rawContent?.descripcion ?? '',
      cards:       rawContent?.cards?.length
        ? rawContent.cards
        : Array.from({ length: 5 }, DEFAULT_CARD),
    },
  });

  const set = <K extends keyof SustainabilityContent>(key: K, val: SustainabilityContent[K]) =>
    setData('content', { ...data.content, [key]: val });

  const updateCard = (index: number, patch: Partial<SustainabilityCard>) => {
    const updated = [...data.content.cards];
    updated[index] = { ...updated[index], ...patch };
    set('cards', updated);
  };

  const addCard = () => set('cards', [...data.content.cards, DEFAULT_CARD()]);

  const removeCard = (index: number) => {
    if (data.content.cards.length <= 1) return;
    set('cards', data.content.cards.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => toast.success('¡Sostenibilidad actualizada!'),
      onError:   () => toast.error('Error al guardar los cambios'),
    });
  };

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
              <p className="text-sm text-slate-500">Título y descripción de la sección.</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Título</Label>
            <Input
              value={data.content.titulo}
              onChange={(e) => set('titulo', e.target.value)}
              placeholder="Sostenibilidad - Productos BIO"
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
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* ── Ítems ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Leaf size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Ítems de sostenibilidad</h3>
                <p className="text-sm text-slate-500">Imagen circular y nombre de cada ítem.</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={addCard}
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm"
            >
              <Plus size={14} /> Agregar
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {data.content.cards.map((card, index) => (
            <CardEditor
              key={index}
              card={card}
              index={index}
              onUpdate={(patch) => updateCard(index, patch)}
              onRemove={() => removeCard(index)}
              canRemove={data.content.cards.length > 1}
            />
          ))}
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