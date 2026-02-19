'use client';

import { useForm } from '@inertiajs/react';
import { Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';

interface HoursContent {
  weekday_from: string;
  weekday_to: string;
  saturday_from: string;
  saturday_to: string;
}

// "08:00" → "8:00 AM"
function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function TimeRangeRow({
  label,
  from,
  to,
  onFromChange,
  onToChange,
}: {
  label: string;
  from: string;
  to: string;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-sm transition-all">
      {/* Ícono + label en mobile van juntos */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
          <Clock size={16} />
        </div>
        <div className="sm:hidden">
          <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
            {label}
          </Label>
        </div>
      </div>

      <div className="hidden sm:block w-px h-10 bg-slate-200 flex-shrink-0" />

      <div className="flex-1">
        {/* Label solo visible en desktop */}
        <Label className="hidden sm:block text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
          {label}
        </Label>

        {/* Time pickers */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[9px] text-slate-400 uppercase tracking-wide">Desde</span>
              <input
                type="time"
                value={from}
                onChange={(e) => onFromChange(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700
                           focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <span className="text-slate-400 font-medium mt-4">—</span>
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[9px] text-slate-400 uppercase tracking-wide">Hasta</span>
              <input
                type="time"
                value={to}
                onChange={(e) => onToChange(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700
                           focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          {/* Preview */}
          {from && to && (
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1.5 rounded-lg whitespace-nowrap self-end sm:self-auto">
              {formatTime(from)} - {formatTime(to)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HoursEditor({ section }: Props) {
  const rawContent = section.content?.content as HoursContent;

  const { data, setData, put, processing } = useForm<{ content: HoursContent }>({
    content: {
      weekday_from:  rawContent?.weekday_from  ?? '08:00',
      weekday_to:    rawContent?.weekday_to    ?? '17:00',
      saturday_from: rawContent?.saturday_from ?? '08:00',
      saturday_to:   rawContent?.saturday_to   ?? '12:00',
    },
  });

  const update = (field: keyof HoursContent) => (val: string) =>
    setData('content', { ...data.content, [field]: val });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('HoursEditor content a enviar:', data.content); // ← log
    put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success('¡Horarios actualizados!'),
      onError: () => toast.error('Error al guardar'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Clock size={20} /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Configuración de {section.name}</h3>
              <p className="text-sm text-slate-500">
                Selecciona los horarios — se mostrarán como "8:00 AM - 5:00 PM" en el footer.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8 space-y-3">
          <TimeRangeRow
            label="Lunes - Viernes"
            from={data.content.weekday_from}
            to={data.content.weekday_to}
            onFromChange={update('weekday_from')}
            onToChange={update('weekday_to')}
          />
          <TimeRangeRow
            label="Sábado"
            from={data.content.saturday_from}
            to={data.content.saturday_to}
            onFromChange={update('saturday_from')}
            onToChange={update('saturday_to')}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={processing} className="w-full sm:w-auto px-10 py-6 rounded-xl shadow-md gap-2 text-base font-bold">
          <Save size={20} />
          {processing ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}