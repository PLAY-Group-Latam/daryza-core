'use client';

import { useForm } from '@inertiajs/react';
import { Save, ImagePlus, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { useRef } from 'react';

interface LogoContent {
  image: File | string | null;
}

function LogoUpload({ value, onChange }: { value: File | string | null; onChange: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = value instanceof File ? URL.createObjectURL(value) : value ?? null;

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) onChange(file); }} />
      <button type="button" onClick={() => inputRef.current?.click()}
        className="group relative w-full h-40 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50
                   hover:border-primary/60 hover:bg-primary/5 transition-all overflow-hidden flex items-center justify-center">
        {preview ? (
          <>
            <div className="absolute inset-0 bg-darysa-gris-800 opacity-80 rounded-xl" />
            <img src={preview} alt="logo preview" className="relative z-10 max-h-32 max-w-[280px] object-contain p-4" />
            <div className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-xl">
              <ImagePlus size={22} className="text-white" />
              <span className="text-white text-xs font-semibold">Cambiar logo</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
            <ImagePlus size={28} />
            <span className="text-xs font-semibold uppercase tracking-wide">Subir logo</span>
            <span className="text-[10px] text-slate-400">PNG, SVG, WEBP recomendado</span>
          </div>
        )}
      </button>
    </>
  );
}

export default function LogoFooterEditor({ section }: Props) {
  const rawContent = section.content?.content as LogoContent;

  const { data, setData, put, processing } = useForm<{ content: LogoContent }>({
    content: { image: rawContent?.image ?? null },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => toast.success('¡Logo del footer actualizado!'),
      onError: () => toast.error('Error al guardar el logo'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Layers size={20} /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Configuración de {section.name}</h3>
              <p className="text-sm text-slate-500">Sube el logo que aparece en el footer del sitio — se mostrará sobre fondo oscuro.</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">

          {/* Especificaciones */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-slate-600">Especificaciones recomendadas</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Ancho máximo', value: '180px' },
                { label: 'Alto máximo',  value: '40px'  },
                { label: 'Formato',      value: 'PNG · SVG · WEBP' },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
                  <span className="text-xs font-medium text-slate-700">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">Se recomienda versión en blanco o clara del logo, con fondo transparente, para contrastar con el fondo oscuro del footer.</p>
          </div>

          {/* Upload */}
          <div>
            <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-3 block">
              Logo del footer
            </Label>
            <LogoUpload value={data.content.image} onChange={(file) => setData('content', { image: file })} />
            {data.content.image && (
              <p className="mt-2 text-[10px] text-slate-400 text-center">
                Haz clic en la imagen para cambiarla — la previsualización simula el fondo oscuro del footer
              </p>
            )}
          </div>

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