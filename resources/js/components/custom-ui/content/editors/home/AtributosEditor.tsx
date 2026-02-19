'use client';

import { useForm } from '@inertiajs/react';
import { Save, LayoutGrid, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '../../../../../types/content/content';
import { useRef } from 'react';

interface AtributoItem {
  id: number;
  icon: File | string | null;
  text: string;
}

interface AtributosContent {
  items: AtributoItem[];
}

const DEFAULT_ITEMS: AtributoItem[] = [
  { id: 1, icon: null, text: 'Productos certificados con respaldo técnico garantizado' },
  { id: 2, icon: null, text: 'Envíos a toda Lima Metropolitana' },
  { id: 3, icon: null, text: 'Servicio postventa comprometido contigo' },
  { id: 4, icon: null, text: 'Pagos 100% seguros y protegidos' },
];

function IconUpload({
  value,
  onChange,
}: {
  value: File | string | null;
  onChange: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const preview =
    value instanceof File
      ? URL.createObjectURL(value)
      : value ?? null;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50
                   hover:border-primary/60 hover:bg-primary/5 transition-all overflow-hidden flex items-center justify-center"
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="icon"
              className="w-full h-full object-contain p-1"
            />
            {/* Overlay sutil solo al hacer hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity
                            flex items-center justify-center rounded-xl">
              <ImagePlus size={16} className="text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-primary transition-colors">
            <ImagePlus size={18} />
            <span className="text-[9px] font-semibold uppercase tracking-wide">Subir</span>
          </div>
        )}
      </button>
    </>
  );
}

export default function AtributosEditor({ section }: Props) {
  const rawContent = section.content?.content;

  const isAtributosContent = (content: any): content is AtributosContent =>
    content && Array.isArray(content.items);

  const initialContent: AtributosContent = isAtributosContent(rawContent)
    ? rawContent
    : { items: DEFAULT_ITEMS };

  const { data, setData, put, processing } = useForm<{ content: AtributosContent }>({
    content: initialContent,
  });

  const updateItem = (index: number, newItem: Partial<AtributoItem>) => {
    const newItems = [...data.content.items];
    newItems[index] = { ...newItems[index], ...newItem };
    setData('content', { ...data.content, items: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(
      `/content/update/${section.page.slug}/${section.type}/${section.id}`,
      {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => toast.success('¡Atributos actualizados!'),
        onError: () => toast.error('Error al guardar los atributos'),
      }
    );
  };

  const items = data.content.items.slice(0, 4);

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <LayoutGrid size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Configuración de {section.name}
              </h3>
              <p className="text-sm text-slate-500">
                4 atributos fijos — edita el ícono y el texto de cada uno.
              </p>
            </div>
          </div>
        </div>

        {/* Vista previa */}
        <div className="px-8 pt-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Vista previa
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 rounded-xl overflow-hidden border border-slate-100">
            {items.map((item, i) => {
              const preview =
                item.icon instanceof File
                  ? URL.createObjectURL(item.icon)
                  : item.icon ?? null;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-4 ${
                    i % 2 === 0 ? 'bg-primary' : 'bg-slate-600'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden">
                    {preview ? (
                      <img src={preview} alt="" className="w-6 h-6 object-contain" />
                    ) : (
                      <div className="w-4 h-4 rounded bg-white/30" />
                    )}
                  </div>
                  {/* ← Aquí el fix: whitespace normal + line-clamp */}
                  <span className="text-white text-xs font-semibold leading-snug line-clamp-3 whitespace-normal break-words">
                    {item.text || '…'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items editor */}
        <div className="p-8 space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white
                         hover:border-primary/30 hover:shadow-sm transition-all"
            >
              {/* Número */}
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                {index + 1}
              </div>

              {/* Icon upload limpio */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                  Ícono
                </span>
                <IconUpload
                  value={item.icon}
                  onChange={(file) => updateItem(index, { icon: file })}
                />
              </div>

              {/* Divider */}
              <div className="w-px h-12 bg-slate-200 flex-shrink-0" />

              {/* Texto */}
              <div className="flex-1">
                <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Texto del atributo
                </Label>
                <Input
                  value={item.text}
                  onChange={(e) => updateItem(index, { text: e.target.value })}
                  placeholder="Ej: Envíos a toda Lima Metropolitana"
                  className="text-sm font-medium"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guardar */}
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