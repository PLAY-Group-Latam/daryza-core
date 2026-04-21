'use client';

import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { BannerContentAll } from '@/types/content/content-types';
import ResponsiveBannerEditor from '@/components/custom-ui/content/ResponsiveBannerEditor';

export default function CheckoutEditor({ section }: Props) {
  const rawContent = section.content?.content as BannerContentAll;

  const { data, setData, put, processing } = useForm<{ content: BannerContentAll }>({
    content: {
      src_desktop: rawContent?.src_desktop ?? null,
      src_mobile:  rawContent?.src_mobile  ?? null,
      link_url:    rawContent?.link_url    ?? '',
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => toast.success('Banner de checkout actualizado correctamente'),
      onError: () => toast.error('Error al guardar'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
      
      <ResponsiveBannerEditor
        title="Banner Principal"
        description="Este banner aparecerá en la pantalla de finalización de compra."
        data={{
          src_desktop: data.content.src_desktop,
          src_mobile: data.content.src_mobile,
          link_url: data.content.link_url ?? '',
          type: 'url',
        }}
        onChange={(updates) => setData('content', { 
            ...data.content, 
            ...updates 
        })}
        showTypeTabs={false}
      />

      <div className="flex justify-end pt-2">
        <Button 
          type="submit" 
          disabled={processing} 
          className="px-12 py-6 rounded-xl shadow-lg gap-2 text-base font-black uppercase tracking-tight"
        >
          <Save size={20} />
          {processing ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
        </Button>
      </div>

    </form>
  );
}