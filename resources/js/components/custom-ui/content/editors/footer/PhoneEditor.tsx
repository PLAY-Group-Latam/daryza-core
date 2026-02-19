'use client';

import { useForm } from '@inertiajs/react';
import { Save, Phone, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';

interface PhoneContent {
  phone: string;
  mobile: string;
}

export default function PhoneEditor({ section }: Props) {
  const rawContent = section.content?.content as PhoneContent;

  const { data, setData, put, processing } = useForm<{ content: PhoneContent }>({
    content: {
      phone:  rawContent?.phone  ?? '(01) 315-3600',
      mobile: rawContent?.mobile ?? '+51 967 767 831',
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success('¡Teléfonos actualizados!'),
      onError: () => toast.error('Error al guardar'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Phone size={20} /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Configuración de {section.name}</h3>
              <p className="text-sm text-slate-500">Edita los números de teléfono del footer.</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-3">
          {/* Teléfono fijo */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-sm transition-all">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
              <Phone size={16} />
            </div>
            <div className="w-px h-10 bg-slate-200 flex-shrink-0" />
            <div className="flex-1">
              <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">Teléfono fijo</Label>
              <Input
                value={data.content.phone}
                onChange={(e) => setData('content', { ...data.content, phone: e.target.value })}
                placeholder="(01) 315-3600"
                className="text-sm font-medium"
              />
            </div>
          </div>

          {/* Celular */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-sm transition-all">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
              <Smartphone size={16} />
            </div>
            <div className="w-px h-10 bg-slate-200 flex-shrink-0" />
            <div className="flex-1">
              <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">Celular / WhatsApp</Label>
              <Input
                value={data.content.mobile}
                onChange={(e) => setData('content', { ...data.content, mobile: e.target.value })}
                placeholder="+51 967 767 831"
                className="text-sm font-medium"
              />
            </div>
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