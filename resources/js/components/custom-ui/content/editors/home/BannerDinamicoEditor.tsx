'use client';

import { useForm } from '@inertiajs/react';
import { Save, ImageIcon, Video, Link, Eye, EyeOff, Layout, Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload } from '@/components/custom-ui/upload';
import { ContentSectionProps as Props } from '../../../../../types/content/content';

export default function BannerDinamicoEditor({ section }: Props) {
    const initialContent = section.content?.content;

    const { data, setData, put, processing, errors } = useForm({
        content: {
            media_desktop: initialContent?.media_desktop ?? null,
            media_mobile: initialContent?.media_mobile ?? null,
            type: initialContent?.type ?? 'image', // 'image' | 'video'
            link_url: initialContent?.link_url ?? '',
            is_visible: initialContent?.is_visible ?? true,
        },
    });

    const updateField = (key: string, value: any) => {
        setData('content', { ...data.content, [key]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
            forceFormData: true,
            onSuccess: () => toast.success('¡Banner Dinámico actualizado!'),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                
                {/* Cabecera Estilizada */}
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-lg shadow-slate-200">
                                <Layout size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Banner Dinámico</h3>
                                <p className="text-sm text-slate-500 font-medium">Configura versiones para escritorio y dispositivos móviles.</p>
                            </div>
                        </div>

                        {/* Selector de Tipo (Switch Moderno) */}
                        <div className="flex p-1 bg-slate-200/50 rounded-xl">
                            <button
                                type="button"
                                onClick={() => updateField('type', 'image')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                    data.content.type === 'image' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <ImageIcon size={14} /> IMAGEN
                            </button>
                            <button
                                type="button"
                                onClick={() => updateField('type', 'video')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                    data.content.type === 'video' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Video size={14} /> VIDEO
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-10">
                    
                    {/* Grid de Medios (Desktop y Mobile) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Versión Desktop */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="flex items-center gap-2 text-slate-800">
                                <Monitor size={18} className="text-slate-400" />
                                <span className="text-sm font-bold uppercase tracking-wider">Versión Desktop</span>
                            </div>
                            <Upload
                                value={data.content.media_desktop}
                                onFileChange={(file) => updateField('media_desktop', file)}
                                previewClassName="w-full aspect-[21/9] rounded-2xl object-cover bg-slate-50 border-2 border-dashed border-slate-200 hover:border-slate-400 transition-colors"
                            />
                            <p className="text-[11px] text-slate-400 italic text-right">Recomendado: 1920x820px</p>
                        </div>

                        {/* Versión Móvil */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="flex items-center gap-2 text-slate-800">
                                <Smartphone size={18} className="text-slate-400" />
                                <span className="text-sm font-bold uppercase tracking-wider">Versión Móvil</span>
                            </div>
                            <Upload
                                value={data.content.media_mobile}
                                onFileChange={(file) => updateField('media_mobile', file)}
                                previewClassName="w-full aspect-[9/12] rounded-2xl object-cover bg-slate-50 border-2 border-dashed border-slate-200 hover:border-slate-400 transition-colors"
                            />
                            <p className="text-[11px] text-slate-400 italic text-right">Recomendado: 600x800px</p>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Fila Inferior: URL y Visibilidad */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        
                        {/* Enlace opcional */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-800 flex items-center gap-2 ml-1">
                                <Link size={16} className="text-slate-400" />
                                Enlace de Redirección (URL)
                            </label>
                            <Input
                                placeholder="https://ejemplo.com/oferta"
                                value={data.content.link_url}
                                onChange={(e) => updateField('link_url', e.target.value)}
                                className="h-12 rounded-xl border-slate-200 focus:ring-slate-900 bg-slate-50/30"
                            />
                        </div>

                        {/* Toggle de Visibilidad */}
                        <div className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
                            data.content.is_visible ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400 grayscale'
                        }`}>
                            <div className="flex items-center gap-3 pl-2">
                                {data.content.is_visible ? <Eye size={20} /> : <EyeOff size={20} />}
                                <div>
                                    <p className="text-sm font-bold">Visibilidad del Banner</p>
                                    <p className={`text-[11px] ${data.content.is_visible ? 'text-slate-300' : 'text-slate-400'}`}>
                                        {data.content.is_visible ? 'Activo en el sitio web' : 'Oculto para usuarios'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => updateField('is_visible', !data.content.is_visible)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    data.content.is_visible ? 'bg-white' : 'bg-slate-300'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                                    data.content.is_visible ? 'translate-x-6 bg-slate-900' : 'translate-x-1 bg-white'
                                }`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer de Acción */}
            <div className="flex justify-end pt-4">
                <Button 
                    type="submit" 
                    disabled={processing} 
                    className="h-14 px-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 gap-3 text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Save size={20} />
                    {processing ? 'Guardando...' : 'Actualizar Banner'}
                </Button>
            </div>
        </form>
    );
}