'use client';

import { useForm } from '@inertiajs/react';
import { Save, Monitor, Smartphone, Link2, ImagePlus, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';
import { ImagePromotionalContent, PromotionalItem } from '@/types/content/content-types';

function UploadFixed({
  value,
  onChange,
  className,
  label,
  icon: Icon
}: {
  value: File | string | null;
  onChange: (f: File | string | null) => void;
  className?: string;
  label: string;
  icon: any;
}) {
  return (
    <div className="space-y-2 w-full"> {/* Aseguramos que el contenedor ocupe el 100% */}
      <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400/80">
        <Icon size={12} className="text-slate-400" /> {label}
      </Label>
      <div className={`relative rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/30 transition-all overflow-hidden group ${className ?? ''}`}>
        <Upload
          value={value}
          onFileChange={onChange}
          accept="image/*"
          previewClassName="!w-full !h-full !object-cover !border-0"
        />
        {!value && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400">
            <ImagePlus size={24} strokeWidth={1.5} />
            <span className="text-[10px] mt-1 font-medium italic">Subir imagen</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ImagePromotionalEditor({ section }: Props) {
  const rawContent = section.content?.content as ImagePromotionalContent;

  const { data, setData, put, processing } = useForm<{ content: ImagePromotionalContent }>({
    content: {
      items: rawContent?.items?.slice(0, 3) ?? [],
    },
  });

  const items = data.content.items;

  const updateItem = (index: number, patch: Partial<PromotionalItem>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...patch };
    setData('content', { items: updated });
  };

  const addItem = () => {
    if (items.length >= 3) return;
    setData('content', {
      items: [
        ...items,
        {
          id: crypto.randomUUID(),
          src_desktop: null,
          src_mobile: null,
          link_url: '',
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setData('content', { items: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => toast.success('Imágenes promocionales actualizadas'),
      onError: () => toast.error('Error al guardar'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-2xl text-slate-600 shadow-sm">
              <ImagePlus size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Imágenes Promocionales
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                {items.length} de 3 promociones configuradas.
              </p>
            </div>
          </div>

          {items.length < 3 && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={addItem}
              className="gap-2 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold"
            >
              <Plus size={16} /> Agregar Promo
            </Button>
          )}
        </div>

        <div className="divide-y divide-slate-100 bg-slate-50/20">
          {items.map((item, index) => (
            <div key={item.id} className="p-8 relative group bg-white">
              
              {/* Indicador de número sutil */}
              <div className="mb-6 flex justify-between items-end">
                <span className="text-[11px] font-black text-slate-300 tracking-[0.2em] uppercase">
                  Promoción #0{index + 1}
                </span>
                
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Eliminar promoción"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-8">
                {/* GRID DE IMÁGENES: Aquí está el cambio principal */}
                <div className="grid grid-cols-12 gap-8 items-start">
                  
                  {/* Desktop ocupa 8 columnas (espacio grande) */}
                  <div className="col-span-12 lg:col-span-8">
                    <UploadFixed
                      label="Desktop (Recomendado 1200x400)"
                      icon={Monitor}
                      value={item.src_desktop}
                      onChange={(file) => updateItem(index, { src_desktop: file })}
                      className="aspect-[3/1] w-full" 
                    />
                  </div>

                  {/* Móvil ocupa 4 columnas (espacio proporcional) */}
                  <div className="col-span-12 lg:col-span-4">
                    <UploadFixed
                      label="Móvil (Recomendado 400x700)"
                      icon={Smartphone}
                      value={item.src_mobile}
                      onChange={(file) => updateItem(index, { src_mobile: file })}
                      className="aspect-[4/5] w-full max-w-[240px] lg:max-w-none mx-auto"
                    />
                  </div>
                </div>

                {/* Input de Enlace */}
                <div className="w-full space-y-2">
                  <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400/80">
                    <Link2 size={12} /> URL de destino del banner
                  </Label>
                  <Input
                    value={item.link_url ?? ''}
                    onChange={(e) => updateItem(index, { link_url: e.target.value })}
                    placeholder="https://www.tusitio.com/oferta-especial"
                    className="h-12 px-5 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Estado vacío */}
          {items.length === 0 && (
            <div className="p-24 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                <ImagePlus size={32} strokeWidth={1} />
              </div>
              <h4 className="text-slate-900 font-bold mb-1">No hay promociones activas</h4>
              <p className="text-slate-500 text-sm max-w-[240px] mx-auto mb-6">
                Agrega hasta 3 banners promocionales para destacar en tu sitio.
              </p>
              <Button onClick={addItem} variant="outline" className="rounded-xl font-bold">
                Crear mi primera promoción
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Botón Guardar Flotante */}
      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={processing} 
          className="h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 gap-3 text-base font-bold transition-all hover:scale-[1.02] active:scale-95 bg-primary"
        >
          <Save size={20} />
          {processing ? 'Guardando configuración...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}