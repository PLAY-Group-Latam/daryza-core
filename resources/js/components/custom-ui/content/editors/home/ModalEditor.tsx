'use client';

import { DatePicker } from '@/components/custom-ui/DatePicker';
import { Upload } from '@/components/custom-ui/upload';
import { Button } from '@/components/ui/button';
import { router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar, Eye, EyeOff, LayoutPanelTop, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
    ModalContent,
    ContentSectionProps as Props,
} from '../../../../../types/content/content';

export default function ModalEditor({ section }: Props) {
    const isModalContent = (content: any): content is ModalContent => {
        return (
            content &&
            ('image' in content ||
                'start_date' in content ||
                'end_date' in content)
        );
    };

    const rawContent = section.content?.content;
    const initialContent: ModalContent = isModalContent(rawContent)
        ? rawContent
        : {
              image: null,
              start_date: '',
              end_date: '',
              is_visible: true,
          };

    const { data, setData, processing } = useForm<{
        content: ModalContent;
    }>({
        content: {
            image: initialContent.image ?? null,
            start_date: initialContent.start_date ?? '',
            end_date: initialContent.end_date ?? '',
            is_visible:
                Number(initialContent.is_visible) === 1 ||
                initialContent.is_visible === true,
        },
    });

    const updateField = (key: keyof ModalContent, value: any) => {
        setData('content', { ...data.content, [key]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                _method: 'PUT',
                content: {
                    image: data.content.image,
                    start_date: data.content.start_date,
                    end_date: data.content.end_date,
                    is_visible: data.content.is_visible ? '1' : '0',
                },
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Errores:', errors);
                    toast.error('Error de validación.');
                },
            },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Cabecera */}
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <LayoutPanelTop size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Configuración de {section.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                                Administra la imagen, fechas y visibilidad.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 p-8">
                    {/* Sección de Imagen */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-800">
                                Imagen del Modal
                            </label>
                            <span className="text-xs font-medium text-slate-400">
                                Sugerido: 800x600px
                            </span>
                        </div>

                        <Upload
                            value={data.content.image}
                            onFileChange={(file) => {
                                updateField('image', file);
                            }}
                            previewClassName="!w-full !aspect-video !rounded-xl !object-cover !border-0 !bg-transparent"
                        />
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Sección de Fechas */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Calendar size={16} className="text-primary" />
                                Fecha de Inicio
                            </label>
                            <DatePicker
                                value={
                                    data.content.start_date
                                        ? new Date(
                                              data.content.start_date +
                                                  'T12:00:00',
                                          )
                                        : undefined
                                }
                                onChange={(date) =>
                                    updateField(
                                        'start_date',
                                        date ? format(date, 'yyyy-MM-dd') : '',
                                    )
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Calendar size={16} className="text-primary" />
                                Fecha de Fin
                            </label>
                            <DatePicker
                                value={
                                    data.content.end_date
                                        ? new Date(
                                              data.content.end_date +
                                                  'T12:00:00',
                                          )
                                        : undefined
                                }
                                onChange={(date) =>
                                    updateField(
                                        'end_date',
                                        date ? format(date, 'yyyy-MM-dd') : '',
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Sección de Visibilidad */}
                    <div
                        className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                            data.content.is_visible
                                ? 'border-primary/20 bg-primary/5'
                                : 'border-slate-200 bg-slate-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`rounded-lg p-2 ${data.content.is_visible ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}
                            >
                                {data.content.is_visible ? (
                                    <Eye size={18} />
                                ) : (
                                    <EyeOff size={18} />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">
                                    Visibilidad
                                </p>
                                <p className="text-xs text-slate-500">
                                    {data.content.is_visible
                                        ? 'Público para los visitantes'
                                        : 'Oculto actualmente'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                updateField(
                                    'is_visible',
                                    !data.content.is_visible,
                                )
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                data.content.is_visible
                                    ? 'bg-primary'
                                    : 'bg-slate-300'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    data.content.is_visible
                                        ? 'translate-x-6'
                                        : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Botón Guardar */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={processing}
                    className="gap-2 rounded-xl px-10 py-6 text-base font-bold shadow-md"
                >
                    <Save size={20} />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}
