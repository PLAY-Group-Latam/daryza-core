'use client';

import { useForm } from '@inertiajs/react';
import { Save, ImagePlus, Monitor, Smartphone, Image, Link2, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { Upload } from '@/components/custom-ui/upload';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type BannerType = 'image' | 'url';

interface BannerContent {
  type:        BannerType;
  src_desktop: File | string | null;
  src_mobile:  File | string | null;
  link_url:    string;
}

interface DistributorCard {
  imagen: File | string | null;
  titulo: string;
  texto:  string;
}

interface DistributorNetworkContent {
  banner:     BannerContent;
  form_image: File | string | null;
  cards:      [DistributorCard, DistributorCard, DistributorCard, DistributorCard];
}

const DEFAULT_CARD: DistributorCard = { imagen: null, titulo: '', texto: '' };

const CARD_LABELS = ['Tarjeta 1', 'Tarjeta 2', 'Tarjeta 3', 'Tarjeta 4'];

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
    <div className={`rounded-xl border border-dashed border-slate-300 bg-slate-50 overflow-hidden ${className ?? ''}`}>
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

// ─── Editor de una card ───────────────────────────────────────────────────────

function CardEditor({
  card,
  label,
  onUpdate,
}: {
  card:     DistributorCard;
  label:    string;
  onUpdate: (patch: Partial<DistributorCard>) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      </div>

      <div className="p-5">
        {/* Mobile: stack vertical — Desktop: imagen + campos lado a lado */}
        <div className="flex flex-col sm:flex-row gap-5">

          {/* Imagen — cuadrada fija, no se estira */}
          <div className="flex-shrink-0 space-y-2">
            <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
              Imagen
            </Label>
            <UploadFixed
              value={card.imagen}
              onChange={(file) => onUpdate({ imagen: file })}
              className="w-20 h-20"
            />
          </div>

          {/* Título + Texto — ocupa todo el ancho restante */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                Título
              </Label>
              <Input
                value={card.titulo}
                onChange={(e) => onUpdate({ titulo: e.target.value })}
                placeholder="Marca Peruana"
                className="text-sm w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                Texto
              </Label>
              {/* textarea que crece con el contenido */}
              <textarea
                value={card.texto}
                onChange={(e) => onUpdate({ texto: e.target.value })}
                placeholder="Descripción de la tarjeta..."
                rows={3}
                className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 
                           placeholder:text-muted-foreground focus-visible:outline-none 
                           focus-visible:ring-1 focus-visible:ring-ring resize-none
                           field-sizing-content min-h-[72px]"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Editor principal ─────────────────────────────────────────────────────────

export default function DistributorNetworkEditor({ section }: Props) {
  const rawContent = section.content?.content as DistributorNetworkContent;
  const rawBanner  = rawContent?.banner;

  const { data, setData, put, processing } = useForm<{ content: DistributorNetworkContent }>({
    content: {
      banner: {
        type:        rawBanner?.type        ?? 'image',
        src_desktop: rawBanner?.src_desktop ?? null,
        src_mobile:  rawBanner?.src_mobile  ?? null,
        link_url:    rawBanner?.link_url    ?? '',
      },
      form_image: rawContent?.form_image ?? null,
      cards: [
        rawContent?.cards?.[0] ?? DEFAULT_CARD,
        rawContent?.cards?.[1] ?? DEFAULT_CARD,
        rawContent?.cards?.[2] ?? DEFAULT_CARD,
        rawContent?.cards?.[3] ?? DEFAULT_CARD,
      ],
    },
  });

  const setBanner = (patch: Partial<BannerContent>) =>
    setData('content', { ...data.content, banner: { ...data.content.banner, ...patch } });

  const set = (key: keyof Omit<DistributorNetworkContent, 'banner' | 'cards'>, file: File | string | null) =>
    setData('content', { ...data.content, [key]: file });

  const updateCard = (index: number, patch: Partial<DistributorCard>) => {
    const updated = [...data.content.cards] as DistributorNetworkContent['cards'];
    updated[index] = { ...updated[index], ...patch };
    setData('content', { ...data.content, cards: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => toast.success('¡Red de distribuidores actualizada!'),
      onError:   () => toast.error('Error al guardar'),
    });
  };

  const banner = data.content.banner;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">

      {/* ── Banner principal ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ImagePlus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Banner principal</h3>
              <p className="text-sm text-slate-500">Imagen de fondo del hero, una para cada dispositivo.</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                <Monitor size={12} /> Imagen Desktop
              </Label>
              <UploadFixed
                value={banner.src_desktop}
                onChange={(file) => setBanner({ src_desktop: file })}
                className="w-full aspect-[3/1]"
              />
            </div>

            <div className="space-y-2 flex flex-col items-center">
              <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400 self-start">
                <Smartphone size={12} /> Imagen Móvil
              </Label>
              <UploadFixed
                value={banner.src_mobile}
                onChange={(file) => setBanner({ src_mobile: file })}
                className="w-[120px] aspect-[9/16]"
              />
            </div>
          </div>

          {banner.type === 'url' && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                <Link2 size={12} /> Enlace de redirección al hacer clic
              </Label>
              <Input
                value={banner.link_url}
                onChange={(e) => setBanner({ link_url: e.target.value })}
                placeholder="https://ejemplo.com/promo"
                className="text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Imagen del formulario ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Image size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Imagen del formulario</h3>
              <p className="text-sm text-slate-500">Imagen promocional al costado izquierdo del formulario.</p>
            </div>
          </div>
        </div>
        <div className="p-6 flex justify-center">
          <UploadFixed
            value={data.content.form_image}
            onChange={(file) => set('form_image', file)}
            className="w-[200px] aspect-[3/4]"
          />
        </div>
      </div>

      {/* ── 4 Cards ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <LayoutGrid size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Tarjetas informativas</h3>
              <p className="text-sm text-slate-500">4 tarjetas con imagen, título y texto descriptivo.</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {data.content.cards.map((card, index) => (
            <CardEditor
              key={index}
              card={card}
              label={CARD_LABELS[index]}
              onUpdate={(patch) => updateCard(index, patch)}
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
