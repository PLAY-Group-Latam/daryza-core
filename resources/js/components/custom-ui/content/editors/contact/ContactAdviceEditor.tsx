'use client';

import { useForm } from '@inertiajs/react';
import { Save, ImagePlus, Monitor, Smartphone, Image, Link2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type BannerType = 'image' | 'url';

interface BannerContent {
  type:         BannerType;
  src_desktop: File | string | null;
  src_mobile:  File | string | null;
  link_url:    string;
}

interface ContactAdviceContent {
  banner:     BannerContent;
  form_image: File | string | null;
}

const TYPE_TABS: { key: BannerType; label: string; Icon: React.ElementType }[] = [
  { key: 'image', label: 'Imagen',         Icon: Image },
  { key: 'url',   label: 'Imagen con URL', Icon: Link2 },
];

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
    <div className={`rounded-xl border border-slate-300 bg-slate-50 overflow-hidden ${className ?? ''}`}>
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

// ─── Editor Principal: ContactAdviceEditor ─────────────────────────────────────

export default function ContactAdviceEditor({ section }: Props) {
  const rawContent = section.content?.content as ContactAdviceContent;
  const rawBanner  = rawContent?.banner;

  const { data, setData, put, processing } = useForm<{ content: ContactAdviceContent }>({
    content: {
      banner: {
        type:         rawBanner?.type         ?? 'image',
        src_desktop: rawBanner?.src_desktop ?? null,
        src_mobile:  rawBanner?.src_mobile  ?? null,
        link_url:    rawBanner?.link_url    ?? '',
      },
      form_image: rawContent?.form_image ?? null,
    },
  });

  const setBanner = (patch: Partial<BannerContent>) =>
    setData('content', { ...data.content, banner: { ...data.content.banner, ...patch } });

  const set = (key: keyof Omit<ContactAdviceContent, 'banner'>, file: File | string | null) =>
    setData('content', { ...data.content, [key]: file });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => toast.success('¡Sección de asesoría actualizada!'),
      onError:   () => toast.error('Error al guardar los cambios'),
    });
  };

  const banner = data.content.banner;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">

      {/* ── Banner Principal ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <ImagePlus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Banner de Distribuidores</h3>
              <p className="text-sm text-slate-500">Banner superior de la sección "Contacta con un asesor".</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Tabs tipo */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            {TYPE_TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setBanner({ type: key })}
                className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors
                  ${banner.type === key
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <Icon size={14} />{label}
              </button>
            ))}
          </div>

          {/* Imágenes desktop + mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                <Monitor size={12} /> Banner Desktop
              </Label>
              <UploadFixed
                value={banner.src_desktop}
                onChange={(file) => setBanner({ src_desktop: file })}
                className="w-full aspect-[3/1]"
              />
            </div>

            <div className="space-y-2 flex flex-col items-center">
              <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400 self-start">
                <Smartphone size={12} /> Banner Móvil
              </Label>
              <UploadFixed
                value={banner.src_mobile}
                onChange={(file) => setBanner({ src_mobile: file })}
                className="w-[120px] aspect-[9/16]"
              />
            </div>
          </div>

          {/* URL opcional */}
          {banner.type === 'url' && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                <Link2 size={12} /> URL del enlace
              </Label>
              <Input
                value={banner.link_url}
                onChange={(e) => setBanner({ link_url: e.target.value })}
                placeholder="https://daryza.com/promocion-asesores"
                className="text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Imagen Formulario (Lateral) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Imagen del Formulario</h3>
              <p className="text-sm text-slate-500">Imagen vertical que aparece al lado izquierdo del formulario.</p>
            </div>
          </div>
        </div>
        <div className="p-6 flex justify-center">
          <UploadFixed
            value={data.content.form_image}
            onChange={(file) => set('form_image', file)}
            className="w-[220px] aspect-[3/4]"
          />
        </div>
      </div>

      {/* ── Botón de Guardado ── */}
      <div className="flex justify-end pt-4">
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