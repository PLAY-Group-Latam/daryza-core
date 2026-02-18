'use client';

import { useForm } from '@inertiajs/react';
import { Save, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload } from '@/components/custom-ui/upload';
import { ContentSectionProps as Props } from '../../../../../types/content/content';

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
                4 atributos destacados — cada uno con icono y texto.
              </p>
            </div>
          </div>
        </div>

        {/* Preview banner — muestra cómo se verá en el front */}
        <div className="px-8 pt-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Vista previa
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 rounded-xl overflow-hidden border border-slate-100">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i % 2 === 0 ? 'bg-primary' : 'bg-slate-600'
                }`}
              >
                {/* Icono preview */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  {item.icon ? (
                    <img
                      src={item.icon instanceof File ? URL.createObjectURL(item.icon) : item.icon}
                      alt=""
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-sm bg-white/40" />
                  )}
                </div>
                <span className="text-white text-xs font-semibold leading-tight line-clamp-2">
                  {item.text || '…'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Items editor */}
        <div className="p-8 space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-5 p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-sm transition-all"
            >
              {/* Número badge */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-sm font-bold flex items-center justify-center">
                {index + 1}
              </div>

              {/* Icono upload — compacto */}
              <div className="flex-shrink-0">
                <Label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Icono
                </Label>
                <div className="relative w-16 h-16">
                  <Upload
                    value={item.icon}
                    onFileChange={(file) => updateItem(index, { icon: file })}
                    previewClassName="!absolute !inset-0 !h-full !w-full !rounded-lg !object-contain !p-1.5"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-14 bg-slate-200 flex-shrink-0" />

              {/* Texto */}
              <div className="flex-1">
                <Label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">
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