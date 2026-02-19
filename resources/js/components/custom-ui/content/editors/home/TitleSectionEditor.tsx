'use client';

import { useForm } from '@inertiajs/react';
import { Save, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '../../../../../types/content/content';

interface TitleItem {
  key: 'brands' | 'best_sellers' | 'pack' | 'blog';
  label: string;
}

interface SectionTitlesContent {
  titles: TitleItem[];
}

const DEFAULT_TITLES: TitleItem[] = [
  { key: 'brands',       label: 'Marcas Aliadas' },
  { key: 'best_sellers', label: 'Los más vendidos' },
  { key: 'pack',         label: 'Pack de Productos' },
  { key: 'blog',         label: 'Nuestro Blog' },
];

// Metadato visual por key — no es editable, solo informativo
const KEY_META: Record<TitleItem['key'], { name: string; description: string }> = {
  brands:       { name: 'Marcas Aliadas',     description: 'Título encima del carrusel de marcas' },
  best_sellers: { name: 'Los más vendidos',   description: 'Título encima de los productos más vendidos' },
  pack:         { name: 'Pack de Productos',  description: 'Título encima del pack de productos' },
  blog:         { name: 'Nuestro Blog',       description: 'Título encima de las entradas del blog' },
};

export default function SectionTitlesEditor({ section }: Props) {
  const rawContent = section.content?.content;

  const isTitlesContent = (content: any): content is SectionTitlesContent =>
    content && Array.isArray(content.titles);

  const initialContent: SectionTitlesContent = isTitlesContent(rawContent)
    ? rawContent
    : { titles: DEFAULT_TITLES };

  const { data, setData, put, processing } = useForm<{ content: SectionTitlesContent }>({
    content: initialContent,
  });

  const updateTitle = (index: number, label: string) => {
    const newTitles = [...data.content.titles];
    newTitles[index] = { ...newTitles[index], label };
    setData('content', { ...data.content, titles: newTitles });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(
      `/content/update/${section.page.slug}/${section.type}/${section.id}`,
      {
        preserveScroll: true,
        onSuccess: () => toast.success('¡Títulos actualizados!'),
        onError: () => toast.error('Error al guardar los títulos'),
      }
    );
  };

  const titles = data.content.titles;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Type size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Configuración de {section.name}
              </h3>
              <p className="text-sm text-slate-500">
                Edita el título que aparece encima de cada sección en el home.
              </p>
            </div>
          </div>
        </div>

        {/* Items editor */}
        <div className="p-8 space-y-3">
          {titles.map((item, index) => {
            const meta = KEY_META[item.key];
            return (
              <div
                key={item.key}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white
                           hover:border-primary/30 hover:shadow-sm transition-all"
              >
                {/* Número */}
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>

                {/* Divider */}
                <div className="w-px h-10 bg-slate-200 flex-shrink-0" />

                {/* Input */}
                <div className="flex-1">
                  <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">
                    {meta.name} — <span className="normal-case">{meta.description}</span>
                  </Label>
                  <Input
                    value={item.label}
                    onChange={(e) => updateTitle(index, e.target.value)}
                    placeholder={`Ej: ${meta.name}`}
                    className="text-sm font-semibold"
                  />
                </div>
              </div>
            );
          })}
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