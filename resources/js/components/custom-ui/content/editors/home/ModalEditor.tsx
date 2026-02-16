'use client';

import { useForm } from '@inertiajs/react';
import { Save, Calendar, Eye, EyeOff, LayoutPanelTop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DatePicker } from '@/components/custom-ui/DatePicker';
import { Upload } from '@/components/custom-ui/upload';
import { ModalContent, ContentSectionProps as Props } from '../../../../../types/content/content';

export default function ModalEditor({ section }: Props) {
    const initialContent = section.content?.content;

    const { data, setData, put, processing, errors } = useForm<{
        content: ModalContent;
    }>({
        content: {
            image: initialContent?.image ?? null,
            start_date: initialContent?.start_date ?? '',
            end_date: initialContent?.end_date ?? '',
            is_visible: Number(initialContent?.is_visible) === 1 || initialContent?.is_visible === true,
        },
    });

    const updateField = (key: keyof ModalContent, value: any) => {
        setData('content', { ...data.content, [key]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('¡Configuración guardada!'),
            onError: () => toast.error('Error al guardar los cambios.'),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                
                {/* Cabecera */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <LayoutPanelTop size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Configuración de {section.name}</h3>
                            <p className="text-sm text-slate-500">Administra la imagen, fechas y visibilidad.</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Sección de Imagen */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-slate-800">Imagen del Modal</label>
                            <span className="text-xs text-slate-400 font-medium">Sugerido: 800x600px</span>
                        </div>
                        
                        <Upload
                            value={data.content.image}
                            onFileChange={(file) => updateField('image', file)}
                            previewClassName="!w-full !aspect-video !rounded-xl !object-cover !border-0 !bg-transparent"
                        />
                        
                        {errors['content.image'] && (
                            <p className="text-sm text-red-500 font-medium mt-2">{errors['content.image']}</p>
                        )}
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Sección de Fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Calendar size={16} className="text-primary" />
                                Fecha de Inicio
                            </label>
                            <DatePicker
                                value={data.content.start_date ? new Date(data.content.start_date) : undefined}
                                onChange={(date) => updateField('start_date', date ? format(date, 'yyyy-MM-dd') : '')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Calendar size={16} className="text-primary" />
                                Fecha de Fin
                            </label>
                            <DatePicker
                                value={data.content.end_date ? new Date(data.content.end_date) : undefined}
                                onChange={(date) => updateField('end_date', date ? format(date, 'yyyy-MM-dd') : '')}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Sección de Visibilidad */}
                    <div className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                        data.content.is_visible ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-200'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${data.content.is_visible ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {data.content.is_visible ? <Eye size={18} /> : <EyeOff size={18} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Visibilidad</p>
                                <p className="text-xs text-slate-500">
                                    {data.content.is_visible ? 'Público para los visitantes' : 'Oculto actualmente'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => updateField('is_visible', !data.content.is_visible)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                data.content.is_visible ? 'bg-primary' : 'bg-slate-300'
                            }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                data.content.is_visible ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Botón Guardar */}
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