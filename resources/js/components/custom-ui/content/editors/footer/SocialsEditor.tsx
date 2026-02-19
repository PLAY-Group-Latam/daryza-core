'use client';

import { useForm } from '@inertiajs/react';
import { Save, Share2, ImagePlus, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { useRef, useState } from 'react';

interface SocialItem {
  id: number;
  image: File | string | null;
  url: string;
}

interface SocialsContent {
  socials: SocialItem[];
}

function SocialImageUpload({
  value,
  onChange,
}: {
  value: File | string | null;
  onChange: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = value instanceof File ? URL.createObjectURL(value) : value ?? null;

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
        className="group relative w-12 h-12 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50
                   hover:border-primary/60 hover:bg-primary/5 transition-all overflow-hidden flex items-center justify-center flex-shrink-0"
      >
        {preview ? (
          <>
            <img src={preview} alt="social icon" className="w-full h-full object-contain p-1" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity
                            flex items-center justify-center rounded-xl">
              <ImagePlus size={14} className="text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-0.5 text-slate-400 group-hover:text-primary transition-colors">
            <ImagePlus size={14} />
            <span className="text-[8px] font-semibold uppercase">Logo</span>
          </div>
        )}
      </button>
    </>
  );
}

export default function SocialsEditor({ section }: Props) {
  const rawContent = section.content?.content as SocialsContent;

  const { data, setData, put, processing } = useForm<{ content: SocialsContent }>({
    content: {
      socials: rawContent?.socials ?? [],
    },
  });

  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const addSocial = () => {
    const newItem: SocialItem = { id: Date.now(), image: null, url: '' };
    setData('content', { socials: [...data.content.socials, newItem] });
  };

  const removeSocial = (index: number) => {
    setData('content', { socials: data.content.socials.filter((_, i) => i !== index) });
  };

  const updateSocial = (index: number, patch: Partial<SocialItem>) => {
    const updated = [...data.content.socials];
    updated[index] = { ...updated[index], ...patch };
    setData('content', { socials: updated });
  };

  const handleDragStart = (index: number) => { dragIndex.current = index; };
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); setDragOver(index); };
  const handleDragEnd = () => { dragIndex.current = null; setDragOver(null); };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === dropIndex) { setDragOver(null); return; }
    const updated = [...data.content.socials];
    const dragged = updated[dragIndex.current];
    updated.splice(dragIndex.current, 1);
    updated.splice(dropIndex, 0, dragged);
    setData('content', { socials: updated });
    dragIndex.current = null;
    setDragOver(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  console.log('SocialsEditor content a enviar:', data.content);
  console.log('Socials con imágenes:', data.content.socials.map(s => ({
    id: s.id,
    image: s.image instanceof File ? `FILE: ${s.image.name}` : s.image,
    url: s.url,
  })));
  put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
    forceFormData: true,
    preserveScroll: true,
    onSuccess: () => toast.success('¡Redes sociales actualizadas!'),
    onError: () => toast.error('Error al guardar'),
  });
};

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Configuración de {section.name}</h3>
              <p className="text-sm text-slate-500">
                Agrega, elimina y reordena las redes sociales arrastrando. Cada una tiene su logo e URL.
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        {data.content.socials.length > 0 && (
          <div className="px-8 pt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Vista previa</p>
            <div className="flex flex-wrap gap-3 p-4 bg-slate-800 rounded-xl">
              {data.content.socials.map((social) => {
                const preview = social.image instanceof File
                  ? URL.createObjectURL(social.image)
                  : social.image ?? null;
                return (
                  <div key={social.id} className="w-9 h-9 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                    {preview
                      ? <img src={preview} alt="" className="w-full h-full object-contain p-1" />
                      : <div className="w-4 h-4 bg-white/20 rounded" />
                    }
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="p-8 space-y-2">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
              Redes ({data.content.socials.length})
            </Label>
            <p className="text-[10px] text-slate-400">Arrastra para reordenar</p>
          </div>

          {data.content.socials.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
              No hay redes sociales. Agrega una abajo.
            </div>
          )}

          {data.content.socials.map((social, index) => (
            <div
              key={social.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 rounded-xl border bg-white transition-all cursor-grab active:cursor-grabbing
                ${dragOver === index
                  ? 'border-primary/50 bg-primary/5 shadow-md scale-[1.01]'
                  : 'border-slate-200 hover:border-primary/30 hover:shadow-sm'
                }`}
            >
              {/* Drag handle */}
              <div className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors">
                <GripVertical size={18} />
              </div>

              {/* Número */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                {index + 1}
              </div>

              {/* Logo upload */}
              <SocialImageUpload
                value={social.image}
                onChange={(file) => updateSocial(index, { image: file })}
              />

              {/* URL */}
              <div className="flex-1 min-w-0">
                <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1 block">
                  URL de la red social
                </Label>
                <Input
                  value={social.url}
                  onChange={(e) => updateSocial(index, { url: e.target.value })}
                  placeholder="https://www.facebook.com/..."
                  className="text-sm font-medium"
                />
              </div>

              {/* Ver link */}
              {social.url && (
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-[10px] text-slate-400 hover:text-primary underline transition-colors"
                >
                  Ver
                </a>
              )}

              {/* Eliminar */}
              <button
                type="button"
                onClick={() => removeSocial(index)}
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Agregar */}
          <button
            type="button"
            onClick={addSocial}
            className="w-full mt-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400
                       hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all
                       flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Share2 size={16} />
            Agregar red social
          </button>
        </div>
      </div>

      {/* Guardar */}
      <div className="flex justify-end">
        <Button type="submit" disabled={processing} className="px-10 py-6 rounded-xl shadow-md gap-2 text-base font-bold">
          <Save size={20} />
          {processing ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}