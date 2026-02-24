'use client';

import { useForm } from '@inertiajs/react';
import { Save, Monitor, Smartphone, Link2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';

interface SingleImage {
  src_desktop: File | string | null;
  src_mobile:  File | string | null;
  link_url:    string;
  type:        string;
}

interface FilterProductContent {
  banner: SingleImage;
  promo:  SingleImage;
}

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
      <div className="w-full h-full [&>*]:!w-full [&>*]:!h-full [&_img]:!object-cover">
        <Upload
          value={value}
          onFileChange={onChange}
          accept="image/*"
          previewClassName="!w-full !h-full !object-cover !border-0 !bg-transparent"
        />
      </div>
    </div>
  );
}

export default function FilterProductEditor({ section }: Props) {
  const rawContent = section.content?.content as FilterProductContent;

  const { data, setData, put, processing, transform } = useForm<{ content: FilterProductContent }>({
    content: {
      banner: {
        src_desktop: rawContent?.banner?.src_desktop ?? null,
        src_mobile:  rawContent?.banner?.src_mobile  ?? null,
        link_url:    rawContent?.banner?.link_url    ?? '',
        type:        rawContent?.banner?.type        ?? 'image',
      },
      promo: {
        src_desktop: rawContent?.promo?.src_desktop ?? null,
        src_mobile:  rawContent?.promo?.src_mobile  ?? null,
        link_url:    rawContent?.promo?.link_url    ?? '',
        type:        rawContent?.promo?.type        ?? 'image',
      },
    },
  });

  transform((values) => ({
    content: {
      banner: { ...values.content.banner, type: 'image' },
      promo:  { ...values.content.promo,  type: 'image', src_mobile: null },
    },
  }));

  const updateBanner = (patch: Partial<SingleImage>) =>
    setData('content', { ...data.content, banner: { ...data.content.banner, ...patch } });

  const updatePromo = (patch: Partial<SingleImage>) =>
    setData('content', { ...data.content, promo: { ...data.content.promo, ...patch } });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => toast.success('Página de filtrado actualizada correctamente'),
      onError: () => toast.error('Error al guardar'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">

      {/* ── Banner Estático ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <ImagePlus size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Banner Principal</h3>
            <p className="text-sm text-slate-500">Formato horizontal para la cabecera del listado.</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs uppercase text-slate-400">
                <Monitor size={12} /> Desktop (Horizontal)
              </Label>
              <UploadFixed
                value={data.content.banner.src_desktop}
                onChange={(file) => updateBanner({ src_desktop: file })}
                className="w-full aspect-[3/1]"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs uppercase text-slate-400">
                <Smartphone size={12} /> Móvil
              </Label>
              <UploadFixed
                value={data.content.banner.src_mobile}
                onChange={(file) => updateBanner({ src_mobile: file })}
                className="w-[120px] aspect-[9/16]"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1 text-xs uppercase text-slate-400">
              <Link2 size={12} /> URL destino
            </Label>
            <Input
              value={data.content.banner.link_url}
              onChange={(e) => updateBanner({ link_url: e.target.value })}
              placeholder="https://ejemplo.com"
            />
          </div>
        </div>
      </div>

      {/* ── Imagen Promocional (Ajustada) ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600">
            <ImagePlus size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Imagen Promocional Lateral</h3>
            <p className="text-sm text-slate-500">Formato vertical (9:16) para el lateral del listado.</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Contenedor de imagen con ancho fijo y alto proporcional */}
            <div className="space-y-2 shrink-0">
              <Label className="flex items-center gap-1 text-xs uppercase text-slate-400">
                <Monitor size={12} /> Imagen Vertical
              </Label>
              <UploadFixed
                value={data.content.promo.src_desktop}
                onChange={(file) => updatePromo({ src_desktop: file })}
                className="w-[240px] aspect-[9/16] shadow-inner"
              />
            </div>
            
            {/* Nota pegada a la imagen para eliminar espacio sobrante */}
            <div className="flex-1 space-y-6 pt-6">
              <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl">
                <h4 className="text-sm font-bold text-amber-800 mb-1 leading-none">Información de diseño</h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Esta sección requiere una <strong>imagen vertical (proporción 9:16)</strong>. 
                  En la tienda se ubicará de forma fija en la columna lateral o intercalada entre las tarjetas de producto. 
                  Asegúrese de que los textos sean legibles en este formato.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs uppercase text-slate-400 font-bold">
                  <Link2 size={12} /> URL destino de promoción
                </Label>
                <Input
                  value={data.content.promo.link_url}
                  onChange={(e) => updatePromo({ link_url: e.target.value })}
                  placeholder="https://ejemplo.com/promocion-lateral"
                  className="bg-slate-50 border-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={processing} className="px-12 py-6 rounded-xl shadow-lg gap-2 text-base font-black uppercase tracking-tight">
          <Save size={20} />
          {processing ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

    </form>
  );
}