'use client';

import { Upload } from '@/components/custom-ui/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContentSectionProps as Props } from '@/types/content/content';
import { IntroAboutusContent } from '@/types/content/content-types';
import { useForm } from '@inertiajs/react';
import { FileText, Link as LinkIcon, Save, Video } from 'lucide-react';
import { toast } from 'sonner';

// Función para extraer el ID de un video de YouTube
function getYouTubeEmbedUrl(url: string) {
    if (!url) return null;
    const match = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function IntroAboutusEditor({ section }: Props) {
    const rawContent = section.content?.content as IntroAboutusContent;

    const { data, setData, put, processing } = useForm<{
        content: IntroAboutusContent & { video_url?: string };
    }>({
        content: {
            video: rawContent?.video ?? null,
            video_url: rawContent?.video_url ?? '',
            subtitulo: rawContent?.subtitulo ?? '',
            titulo_bold: rawContent?.titulo_bold ?? '',
            descripcion: rawContent?.descripcion ?? '',
        },
    });

    const set = <K extends keyof IntroAboutusContent | 'video_url'>(
        key: K,
        val: any,
    ) => setData('content', { ...data.content, [key]: val });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                forceFormData: true,
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Errores:', errors);
                    toast.error('Error al guardar los cambios');
                },
            },
        );
    };

    const youtubeEmbedUrl = getYouTubeEmbedUrl(data.content.video_url || '');

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
            {/* ── Video lateral ── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Video size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Video
                            </h3>
                            <p className="text-sm text-slate-500">
                                Sube un archivo de video (MP4) o ingresa un
                                enlace de YouTube.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 p-6">
                    {/* Campo para Enlace URL (YouTube/Vimeo) */}
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
                            <LinkIcon size={12} />
                            URL de Video (YouTube)
                        </Label>
                        <Input
                            value={data.content.video_url || ''}
                            onChange={(e) => set('video_url', e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="text-sm"
                        />
                        <p className="text-xs text-slate-400">
                            Si ingresas un enlace de YouTube, este tendrá
                            prioridad sobre el video subido.
                        </p>
                    </div>

                    {/* Separador */}
                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 font-medium text-slate-400">
                                O sube un archivo MP4
                            </span>
                        </div>
                    </div>

                    {/* Previsualización / Carga de Archivo */}
                    <div className="aspect-video w-full overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                        {youtubeEmbedUrl ? (
                            <iframe
                                src={youtubeEmbedUrl}
                                className="h-full w-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Vista previa del video"
                            />
                        ) : (
                            <div className="h-full w-full [&_video]:!h-full [&_video]:!w-full [&_video]:!rounded-none [&_video]:!object-cover [&>*]:!h-full [&>*]:!w-full">
                                <Upload
                                    value={data.content.video}
                                    onFileChange={(file) => set('video', file)}
                                    accept="video/*"
                                    type="video"
                                    previewClassName="!w-full !h-full !object-cover !rounded-none !border-0 !bg-transparent"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Textos ── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Contenido
                            </h3>
                            <p className="text-sm text-slate-500">
                                Subtítulo pequeño, título resaltado y
                                descripción.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 p-6">
                    {/* Subtítulo pequeño */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
                            Subtítulo
                        </Label>
                        <Input
                            value={data.content.subtitulo}
                            onChange={(e) => set('subtitulo', e.target.value)}
                            placeholder="Soluciones de Higiene para tu hogar"
                            className="text-sm"
                        />
                    </div>

                    {/* Título resaltado */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
                            Título resaltado
                        </Label>
                        <Input
                            value={data.content.titulo_bold}
                            onChange={(e) => set('titulo_bold', e.target.value)}
                            placeholder="Sobre Nosotros"
                            className="text-sm font-bold text-primary"
                        />
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
                            Descripción
                        </Label>
                        <textarea
                            value={data.content.descripcion}
                            onChange={(e) => set('descripcion', e.target.value)}
                            placeholder="Lorem ipsum dolor sit amet..."
                            rows={5}
                            className="min-h-[120px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            style={
                                {
                                    fieldSizing: 'content',
                                } as React.CSSProperties
                            }
                        />
                    </div>
                </div>
            </div>

            {/* ── Guardar ── */}
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
