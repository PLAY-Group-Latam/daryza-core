'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ContentSectionProps as Props } from '@/types/content/content';
import { LogoContent } from '@/types/content/content-types';
import { useForm } from '@inertiajs/react';
import { ImagePlus, Layers, Save } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

function LogoUpload({
    value,
    onChange,
}: {
    value: File | string | null;
    onChange: (file: File) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const preview =
        value instanceof File ? URL.createObjectURL(value) : (value ?? null);

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onChange(file);
                }}
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="group relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-primary/60 hover:bg-primary/5"
            >
                {preview ? (
                    <>
                        <div
                            className="absolute inset-0 rounded-xl bg-slate-200"
                            style={{
                                backgroundImage: `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAACpJREFUGFdjZEACJv///z9mYGBgYGRkZAASMMHEEIKMIIXoAnABRAnIBQCmshAL7Y+67wAAAABJRU5ErkJggg==')`,
                                backgroundRepeat: 'repeat',
                            }}
                        />
                        <img
                            src={preview}
                            alt="logo preview"
                            className="relative z-10 max-h-32 max-w-[280px] object-contain p-4 drop-shadow-md"
                        />

                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <ImagePlus size={22} className="text-white" />
                            <span className="text-xs font-semibold text-white">
                                Cambiar logo
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400 transition-colors group-hover:text-primary">
                        <ImagePlus size={28} />
                        <span className="text-xs font-semibold tracking-wide uppercase">
                            Subir logo
                        </span>
                        <span className="text-[10px] text-slate-400">
                            PNG, SVG, WEBP recomendado
                        </span>
                    </div>
                )}
            </button>
        </>
    );
}

export default function LogoFooterEditor({ section }: Props) {
    const rawContent = section.content?.content as LogoContent;

    const { data, setData, put, processing } = useForm<{
        content: LogoContent;
    }>({
        content: { image: rawContent?.image ?? null },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                forceFormData: true,
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Errores:', errors);
                    toast.error('Error al guardar el logo');
                },
            },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Header */}
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Configuración de {section.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                                Sube el logo que aparece en el footer del sitio
                                — se mostrará sobre fondo oscuro.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 p-8">
                    {/* Especificaciones */}
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs font-semibold text-slate-600">
                            Especificaciones recomendadas
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Ancho máximo', value: '180px' },
                                { label: 'Alto máximo', value: '40px' },
                                { label: 'Formato', value: 'PNG · SVG · WEBP' },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    className="flex flex-col gap-0.5"
                                >
                                    <span className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                                        {label}
                                    </span>
                                    <span className="text-xs font-medium text-slate-700">
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400">
                            Se recomienda versión en blanco o clara del logo,
                            con fondo transparente, para contrastar con el fondo
                            oscuro del footer.
                        </p>
                    </div>

                    {/* Upload */}
                    <div>
                        <Label className="mb-3 block text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                            Logo del footer
                        </Label>
                        <LogoUpload
                            value={data.content.image}
                            onChange={(file) =>
                                setData('content', { image: file })
                            }
                        />
                        {data.content.image && (
                            <p className="mt-2 text-center text-[10px] text-slate-400">
                                Haz clic en la imagen para cambiarla — la
                                previsualización simula el fondo oscuro del
                                footer
                            </p>
                        )}
                    </div>
                </div>
            </div>

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
