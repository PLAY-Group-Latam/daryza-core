'use client';

import { Upload } from '@/components/custom-ui/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    ImageIcon,
    Layout,
    Link,
    Plus,
    Save,
    Trash2,
    Video,
    Monitor,
    Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    BannerContent,
    ContentSectionProps,
    MediaItem,
} from '../../../../../types/content/content';

export default function BannerDinamicoEditor({ section }: ContentSectionProps) {
    const normalizeMediaArray = (rawContent: any): BannerContent => {
        if (!rawContent || !Array.isArray(rawContent.media)) {
            return {
                media: [{ src: '', type: 'image', device: 'desktop' }],
                is_visible: true,
            };
        }

        const itemsWithDevice = rawContent.media.filter((m: any) => m.device && !m.src);
        const itemsWithSrc = rawContent.media.filter((m: any) => m.src);

        const wellFormatted = rawContent.media.filter((m: any) => m.src && m.device);
        if (wellFormatted.length > 0) {
            return {
                ...rawContent,
                media: wellFormatted,
                is_visible: rawContent.is_visible ?? true,
            };
        }

        const normalized = itemsWithSrc.map((srcItem: any, index: number) => ({
            src: srcItem.src,
            type: itemsWithDevice[index]?.type || 'image',
            device: itemsWithDevice[index]?.device || 'desktop',
            link_url: rawContent.link_url,
        }));

        return {
            media: normalized.length > 0
                ? normalized
                : [{ src: '', type: 'image', device: 'desktop' }],
            is_visible: rawContent.is_visible ?? true,
            link_url: rawContent.link_url,
        };
    };

    const initialContent: BannerContent = normalizeMediaArray(section.content?.content);

    const { data, setData, put, processing } = useForm<{
        content: BannerContent;
    }>({
        content: initialContent,
    });

    const updateField = <K extends keyof BannerContent>(
        key: K,
        value: BannerContent[K],
    ) => {
        setData('content', { ...data.content, [key]: value });
    };

    const updateMediaItem = (index: number, newItem: MediaItem) => {
        const newMedia = [...data.content.media];
        newMedia[index] = newItem;
        setData('content', { ...data.content, media: newMedia });
    };

    const addMediaItem = () => {
        setData('content', {
            ...data.content,
            media: [
                ...data.content.media,
                { src: '', type: 'image', device: 'desktop' },
            ],
        });
    };

    const removeMediaItem = (index: number) => {
        if (data.content.media.length === 1) {
            toast.error('Debe haber al menos un elemento');
            return;
        }
        const newMedia = [...data.content.media];
        newMedia.splice(index, 1);
        setData('content', { ...data.content, media: newMedia });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                forceFormData: true,
                onSuccess: () => toast.success('¡Banner Dinámico actualizado!'),
            },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6 pb-10">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <Layout className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle>Banner Dinámico</CardTitle>
                            <CardDescription>
                                Gestiona las imágenes y videos del carrusel principal
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Lista de Slides */}
                    <div className="space-y-4">
                        {data.content.media.map((item, index) => (
                            <Card key={index} className="overflow-hidden">
                                <CardHeader className="bg-muted/50 pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary" className="h-7 w-7 justify-center p-0">
                                                {index + 1}
                                            </Badge>
                                            <div>
                                                <p className="text-sm font-semibold">Slide #{index + 1}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.type === 'image' ? 'Imagen' : 'Video'} •{' '}
                                                    {item.device === 'desktop' ? 'Desktop' : item.device === 'mobile' ? 'Mobile' : 'Ambos dispositivos'}
                                                </p>
                                            </div>
                                        </div>

                                        {data.content.media.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeMediaItem(index)}
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 pt-6">
                                    {/* Tipo de Media */}
                                    <div className="space-y-2">
                                        <Label>Tipo de contenido</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={item.type === 'image' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() =>
                                                    updateMediaItem(index, {
                                                        ...item,
                                                        type: 'image',
                                                        src: '',
                                                        device: 'desktop',
                                                    })
                                                }
                                                className="flex-1"
                                            >
                                                <ImageIcon className="mr-2 h-4 w-4" />
                                                Imagen
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={item.type === 'video' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() =>
                                                    updateMediaItem(index, {
                                                        ...item,
                                                        type: 'video',
                                                        src: '',
                                                        device: 'both',
                                                    })
                                                }
                                                className="flex-1"
                                            >
                                                <Video className="mr-2 h-4 w-4" />
                                                Video
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Upload de Imagen */}
                                    {item.type === 'image' && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Imagen Promocional</Label>
                                                <Upload
                                                    value={item.src}
                                                    onFileChange={(file) =>
                                                        updateMediaItem(index, {
                                                            ...item,
                                                            src: file,
                                                        })
                                                    }
                                                    accept="image/*"
                                                    placeholder="Subir imagen promocional"
                                                    type="image"
                                                    previewClassName="w-full aspect-[21/9] rounded-lg object-cover border-2 border-dashed"
                                                />
                                            </div>

                                            {/* Selector de dispositivo SOLO para imágenes */}
                                            <div className="space-y-2">
                                                <Label>Dispositivo</Label>
                                                <Select
                                                    value={item.device}
                                                    onValueChange={(value) =>
                                                        updateMediaItem(index, {
                                                            ...item,
                                                            device: value as 'desktop' | 'mobile',
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="desktop">
                                                            <div className="flex items-center gap-2">
                                                                <Monitor className="h-4 w-4" />
                                                                Desktop
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="mobile">
                                                            <div className="flex items-center gap-2">
                                                                <Smartphone className="h-4 w-4" />
                                                                Mobile
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}

                                    {/* Upload de Video */}
                                    {item.type === 'video' && (
                                        <div className="space-y-2">
                                            <Label>Video Promocional</Label>
                                            <Upload
                                                value={item.src}
                                                onFileChange={(file) =>
                                                    updateMediaItem(index, {
                                                        ...item,
                                                        src: file,
                                                    })
                                                }
                                                accept="video/*"
                                                placeholder="Subir video promocional"
                                                type="video"
                                                previewClassName="w-full aspect-[21/9] rounded-lg object-cover border-2 border-dashed"
                                            />

                                            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                                <Video className="h-4 w-4" />
                                                <p>Este video se mostrará en desktop y mobile</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Botón Agregar Slide */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addMediaItem}
                        className="w-full border-dashed"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Slide
                    </Button>

                    <Separator />

                    {/* Enlace de Redirección */}
                    <div className="space-y-2">
                        <Label htmlFor="link-url" className="flex items-center gap-2">
                            <Link className="h-4 w-4" />
                            Enlace de Redirección (Opcional)
                        </Label>
                        <Input
                            id="link-url"
                            placeholder="https://ejemplo.com/promocion"
                            value={data.content.media[0]?.link_url || ''}
                            onChange={(e) => {
                                const updatedMedia = data.content.media.map((m) => ({
                                    ...m,
                                    link_url: e.target.value,
                                }));
                                updateField('media', updatedMedia);
                            }}
                        />
                        <p className="text-xs text-muted-foreground">
                            Este enlace se aplicará a todos los slides del banner
                        </p>
                    </div>

                    <Separator />

                    {/* Visibilidad */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                {data.content.is_visible ? (
                                    <Eye className="h-4 w-4 text-green-600" />
                                ) : (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                )}
                                <Label htmlFor="visibility" className="font-semibold">
                                    Visibilidad del Banner
                                </Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {data.content.is_visible
                                    ? 'El banner está visible en el sitio web'
                                    : 'El banner está oculto para los usuarios'}
                            </p>
                        </div>
                        <Switch
                            id="visibility"
                            checked={!!data.content.is_visible}
                            onCheckedChange={(checked) => updateField('is_visible', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Botón Guardar */}
            <div className="flex justify-end">
                <Button type="submit" disabled={processing} size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    {processing ? 'Guardando...' : 'Actualizar Banner'}
                </Button>
            </div>
        </form>
    );
}