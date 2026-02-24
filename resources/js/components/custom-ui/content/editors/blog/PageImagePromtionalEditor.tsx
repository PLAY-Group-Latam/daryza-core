'use client';

import { useForm } from '@inertiajs/react';
import {
  Save, Monitor, Smartphone, Link2, ImagePlus,
  Trash2, Share2, GripVertical, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';
import { PromotionalItem, SocialItem } from '@/types/content/content-types';

// URL de respaldo indestructible
const DEFAULT_IMAGE = 'https://placehold.co/600x600/f1f5f9/94a3b8?text=Imagen';

interface CombinedContent {
  promotions: PromotionalItem[];
  socials: SocialItem[];
}

// ─── Upload Container (Cuadrado / Proporcional) ──────────────
function UploadFixed({
  value, onChange, className, labelIcon: Icon, labelText
}: {
  value: File | string | null;
  onChange: (f: File | string | null) => void;
  className?: string;
  labelIcon: any;
  labelText: string;
}) {
  return (
    <div className="space-y-2 flex-1">
      <Label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 ml-1">
        <Icon size={12} /> {labelText}
      </Label>
      <div className={`group relative rounded-2xl border-2 border-dashed border-slate-200 bg-white hover:border-primary/40 transition-all overflow-hidden ${className ?? ''}`}>
        <div className="w-full h-full [&>*]:!w-full [&>*]:!h-full [&_img]:!object-cover">
          <Upload 
            value={value} 
            onFileChange={onChange} 
            accept="image/*" 
            previewClassName="!w-full !h-full !object-cover !border-0"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Social Logo Upload ──────────────────────────────────────
function SocialImageUpload({
  value, onChange,
}: {
  value: File | string | null;
  onChange: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = value instanceof File ? URL.createObjectURL(value) : (value || DEFAULT_IMAGE);

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) onChange(file); }}
      />
      <button type="button" onClick={() => inputRef.current?.click()}
        className="group relative w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 hover:border-primary/60 hover:bg-primary/5 transition-all overflow-hidden flex items-center justify-center flex-shrink-0"
      >
        <img 
            src={preview} 
            alt="social icon" 
            className="w-full h-full object-contain p-2" 
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
          <ImagePlus size={14} className="text-white" />
        </div>
      </button>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function CombinedFooterEditor({ section }: Props) {
  const rawContent = section.content?.content as { items?: PromotionalItem[]; socials?: SocialItem[] };

  const { data, setData, put, processing, transform } = useForm<{ content: CombinedContent }>({
    content: {
      promotions: rawContent?.items?.slice(0, 2) ?? [],
      socials: rawContent?.socials ?? [],
    },
  });

  transform((values) => ({
    content: {
      items: values.content.promotions,
      socials: values.content.socials,
    },
  }));

  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  // Handlers
  const updatePromo = (index: number, patch: Partial<PromotionalItem>) => {
    const updated = [...data.content.promotions];
    updated[index] = { ...updated[index], ...patch };
    setData('content', { ...data.content, promotions: updated });
  };

  const addPromo = () => {
    if (data.content.promotions.length >= 2) return;
    setData('content', {
      ...data.content,
      promotions: [...data.content.promotions, { id: crypto.randomUUID(), src_desktop: null, src_mobile: null, link_url: '' }],
    });
  };

  const updateSocial = (index: number, patch: Partial<SocialItem>) => {
    const updated = [...data.content.socials];
    updated[index] = { ...updated[index], ...patch };
    setData('content', { ...data.content, socials: updated });
  };

  const addSocial = () => {
    setData('content', {
      ...data.content,
      socials: [...data.content.socials, { id: Number(Date.now()), image: null, url: '' }],
    });
  };

  const handleDragStart = (index: number) => { dragIndex.current = index; };
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); setDragOver(index); };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === dropIndex) { setDragOver(null); return; }
    const updated = [...data.content.socials];
    const dragged = updated[dragIndex.current];
    updated.splice(dragIndex.current, 1);
    updated.splice(dropIndex, 0, dragged);
    setData('content', { ...data.content, socials: updated });
    setDragOver(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => toast.success('Footer actualizado'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-12 pb-24 px-4">
      
      {/* ── SECCIÓN IMÁGENES PROMOCIONALES ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-200"><ImagePlus size={24} /></div>
            <div>
              <h2 className="text-xl font-black text-slate-900 italic ">Banners Footer</h2>
              <p className="text-sm text-slate-500 font-medium italic">Máximo 2 banners cuadrados.</p>
            </div>
          </div>
          {data.content.promotions.length < 2 && (
            <Button type="button" onClick={addPromo} variant="outline" className="rounded-xl border-slate-200 gap-2 font-bold hover:bg-slate-50 shadow-sm transition-all">
              <Plus size={18} /> AGREGAR BANNER
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.content.promotions.map((item, index) => (
            <div key={item.id} className="relative bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm hover:border-primary/20 transition-all">
              <button 
                type="button" 
                onClick={() => setData('content', { ...data.content, promotions: data.content.promotions.filter((_, i) => i !== index) })}
                className="absolute -top-2 -right-2 bg-white shadow-xl border border-slate-100 text-slate-400 hover:text-red-500 p-2.5 rounded-full transition-all z-10"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex gap-4">
                <UploadFixed 
                  labelText="Desktop"
                  labelIcon={Monitor}
                  value={item.src_desktop} 
                  onChange={(file) => updatePromo(index, { src_desktop: file })} 
                  className="aspect-square" 
                />
                <UploadFixed 
                  labelText="Móvil"
                  labelIcon={Smartphone}
                  value={item.src_mobile} 
                  onChange={(file) => updatePromo(index, { src_mobile: file })} 
                  className="aspect-[4/5] max-w-[120px]" 
                />
              </div>

              <div className="mt-6 space-y-2">
                <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Enlace de acción</Label>
                <div className="relative group/input">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-primary transition-colors" size={16} />
                    <Input 
                      value={item.link_url ?? ''} 
                      onChange={(e) => updatePromo(index, { link_url: e.target.value })} 
                      placeholder="https://tienda.com/oferta" 
                      className="pl-10 h-11 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-0 focus:border-slate-200 transition-all"
                    />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECCIÓN REDES SOCIALES (LIGERA Y BLANCA) ── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-600"><Share2 size={24} /></div>
            <div>
              <h3 className="text-l font-black text-slate-900 tracking-tight uppercase">Redes Sociales</h3>
              <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Enlaces del pie de página</p>
            </div>
          </div>
          <Button type="button" onClick={addSocial} variant="outline" size="sm" className="rounded-xl font-bold bg-slate-900 text-white hover:bg-black border-none">
            + AGREGAR RED
          </Button>
        </div>

        <div className="space-y-3">
          {data.content.socials.map((social, index) => (
             <div 
                key={social.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`flex items-center gap-4 p-3 bg-white border rounded-2xl transition-all group
                  ${dragOver === index ? 'border-primary ring-4 ring-primary/5 bg-slate-50' : 'border-slate-100 hover:border-slate-300 shadow-sm'}`}
             >
                <GripVertical size={20} className="text-slate-300 cursor-grab active:cursor-grabbing flex-shrink-0 group-hover:text-slate-400" />
                <SocialImageUpload value={social.image} onChange={(file) => updateSocial(index, { image: file })} />
                <Input 
                  value={social.url} 
                  onChange={(e) => updateSocial(index, { url: e.target.value })} 
                  placeholder="URL de la red social..." 
                  className="bg-slate-50 border-none text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-200 h-11 transition-all"
                />
                <button 
                    type="button" 
                    onClick={() => setData('content', { ...data.content, socials: data.content.socials.filter((_, i) => i !== index) })} 
                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
             </div>
          ))}
          {data.content.socials.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                 <p className="text-slate-400 italic text-sm font-medium">No has agregado redes sociales todavía.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTÓN GUARDAR FLOTANTE ── */}
      <div className="flex justify-center sticky bottom-6 z-50">
        <Button 
          type="submit" 
          disabled={processing} 
          className="h-16 px-20 rounded-full bg-slate-900 hover:bg-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] gap-3 text-lg font-black transition-all active:scale-95"
        >
          <Save size={24} />
          {processing ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}
        </Button>
      </div>
    </form>
  );
}