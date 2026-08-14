'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContentSectionProps as Props } from '@/types/content/content';
import { useForm } from '@inertiajs/react';
import { Mail, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Estructura del contenido guardado en JSON
export interface NewsLetterContent {
    title?: string;
    description?: string;
    input_placeholder?: string;
    button_text?: string;
}

export default function NewsLetterEditor({ section }: Props) {
   const rawContent = section.content?.content as NewsLetterContent;

    const { data, setData, put, processing } = useForm<{
        content: NewsLetterContent;
    }>({
        content: {
            title: rawContent?.title ?? '',
            description: rawContent?.description ?? '',
            input_placeholder: rawContent?.input_placeholder ?? '',
            button_text: rawContent?.button_text ?? '',
        },
    });

    const handleChange = (field: keyof NewsLetterContent, value: string) => {
        setData('content', {
            ...data.content,
            [field]: value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                preserveScroll: true,
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Ocurrió un error al guardar los cambios.');
                },
            },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-8 pb-12">
            {/* Cabecera del Editor */}
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                        <Mail className="h-6 w-6 text-black" />
                        Sección Newsletter
                    </h2>
                    <p className="text-sm text-slate-500">
                        Administra los textos del formulario de suscripción que
                        se muestra en el inicio.
                    </p>
                </div>
                <Button
                    type="submit"
                    disabled={processing}
                    className="gap-2 rounded-xl bg-black px-6 font-semibold text-white"
                >
                    <Save className="h-4 w-4" />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                            <Sparkles className="h-4 w-4 text-black" />
                            Contenido Administrable
                        </CardTitle>
                        <CardDescription>
                            Modifica los campos del banner de suscripción
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 p-6">
                        {/* Título */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="title"
                                className="font-semibold text-slate-700"
                            >
                                Título Principal
                            </Label>
                            <Input
                                id="title"
                                value={data.content.title ?? ''}
                                onChange={(e) =>
                                    handleChange('title', e.target.value)
                                }
                                placeholder="Ej. Suscríbete y recibe las últimas novedades"
                                className="border-slate-200 bg-slate-50/50 focus:bg-white"
                            />
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="description"
                                className="font-semibold text-slate-700"
                            >
                                Mensaje / Descripción
                            </Label>
                            <Textarea
                                id="description"
                                rows={4}
                                value={data.content.description ?? ''}
                                onChange={(e) =>
                                    handleChange('description', e.target.value)
                                }
                                placeholder="Escribe el texto que acompañará al formulario..."
                                className="resize-none border-slate-200 bg-slate-50/50 focus:bg-white"
                            />
                        </div>

                        {/* Placeholder Input */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="input_placeholder"
                                className="font-semibold text-slate-700"
                            >
                                Placeholder del Campo de Correo
                            </Label>
                            <Input
                                id="input_placeholder"
                                value={data.content.input_placeholder ?? ''}
                                onChange={(e) =>
                                    handleChange(
                                        'input_placeholder',
                                        e.target.value,
                                    )
                                }
                                placeholder="Ej. correo@ejemplo.com"
                                className="border-slate-200 bg-slate-50/50 focus:bg-white"
                            />
                        </div>

                        {/* Texto del Botón */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="button_text"
                                className="font-semibold text-slate-700"
                            >
                                Texto del Botón
                            </Label>
                            <Input
                                id="button_text"
                                value={data.content.button_text ?? ''}
                                onChange={(e) =>
                                    handleChange('button_text', e.target.value)
                                }
                                placeholder="Ej. Suscribirse"
                                className="border-slate-200 bg-slate-50/50 focus:bg-white"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    );
}
