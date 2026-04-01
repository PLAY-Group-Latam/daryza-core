import { SlugInput } from '@/components/custom-ui/slug-text';
import { Upload } from '@/components/custom-ui/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

import { Landing, LandingSections } from '@/types/landings';

interface Props {
    landing?: Landing;
}

type MediaValue = File | string | null;

type LandingMetadataForm = {
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string | null;
    canonical_url?: string;
    og_title?: string;
    og_description?: string;
    og_image?: MediaValue;
    og_type?: string;
    noindex: boolean;
    nofollow: boolean;
};

type LandingSlideForm = {
    id: string;
    is_active: boolean;
    type: 'image' | 'video';
    src_desktop: MediaValue;
    src_mobile: MediaValue;
    src_video: MediaValue;
    link_url: string | null;
};

type LandingFormSections = {
    banner: {
        slides: LandingSlideForm[];
    };
    brandStory: {
        title: string;
        subtitle: string | null;
        description: string;
        media: {
            type: 'image' | 'video';
            src_desktop: MediaValue;
            src_mobile: MediaValue;
            src_video: MediaValue;
        };
    };
    features: {
        title: string;
        items: Array<{
            title: string;
            description: string;
            image: MediaValue;
        }>;
    };
    knowMore: {
        title: string;
        items: Array<{
            id: string;
            title: string;
            description: string;
            image: MediaValue;
        }>;
    };
};

type LandingFormData = {
    title: string;
    slug: string;
    is_active: boolean;
    metadata: LandingMetadataForm;
    sections: LandingFormSections;
};

const uid = (): string =>
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const emptySlide = (): LandingSlideForm => ({
    id: uid(),
    is_active: true,
    type: 'image',
    src_desktop: null,
    src_mobile: null,
    src_video: null,
    link_url: null,
});

const normalizeFeatureItems = (
    items?: Array<{ title?: string; description?: string; image?: string }>,
): Array<{ title: string; description: string; image: MediaValue }> => {
    const source = Array.isArray(items) ? items : [];

    return [0, 1, 2].map((index) => ({
        title: source[index]?.title ?? '',
        description: source[index]?.description ?? '',
        image: source[index]?.image ?? null,
    }));
};

const emptyKnowMore = () => ({
    id: uid(),
    title: '',
    description: '',
    image: null as MediaValue,
});

const normalizeSections = (raw?: LandingSections): LandingFormSections => ({
    banner: {
        slides:
            raw?.banner?.slides?.map((slide) => ({
                id: slide.id,
                is_active: slide.is_active,
                type: slide.type,
                src_desktop: slide.src_desktop,
                src_mobile: slide.src_mobile,
                src_video: slide.src_video,
                link_url: slide.link_url,
            })) ?? [],
    },
    brandStory: {
        title: raw?.brandStory?.title ?? '',
        subtitle: raw?.brandStory?.subtitle ?? '',
        description: raw?.brandStory?.description ?? '',
        media: {
            type: raw?.brandStory?.media?.type === 'video' ? 'video' : 'image',
            src_desktop:
                raw?.brandStory?.media?.src_desktop ??
                raw?.brandStory?.media?.src_mobile ??
                null,
            src_mobile:
                raw?.brandStory?.media?.src_mobile ??
                raw?.brandStory?.media?.src_desktop ??
                null,
            src_video: raw?.brandStory?.media?.src_video ?? null,
        },
    },
    features: {
        title: raw?.features?.title ?? '',
        items: normalizeFeatureItems(raw?.features?.items),
    },
    knowMore: {
        title: raw?.knowMore?.title ?? '',
        items:
            raw?.knowMore?.items?.map((item) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                image: item.image,
            })) ?? [],
    },
});

const getMediaPreview = (value: MediaValue): string | null => {
    if (value instanceof File) {
        return URL.createObjectURL(value);
    }

    if (typeof value === 'string' && value !== '') {
        return value;
    }

    return null;
};

export default function FormLanding({ landing }: Props) {
    const { data, setData, post, put, processing, errors } =
        useForm<LandingFormData>({
            title: landing?.title ?? '',
            slug: landing?.slug ?? '',
            is_active: landing?.is_active ?? true,
            metadata: {
                meta_title: landing?.metadata?.meta_title ?? '',
                meta_description: landing?.metadata?.meta_description ?? '',
                meta_keywords: landing?.metadata?.meta_keywords ?? '',
                canonical_url: landing?.metadata?.canonical_url ?? '',
                og_title: landing?.metadata?.og_title ?? '',
                og_description: landing?.metadata?.og_description ?? '',
                og_image: landing?.metadata?.og_image ?? null,
                og_type: landing?.metadata?.og_type ?? 'website',
                noindex: landing?.metadata?.noindex ?? false,
                nofollow: landing?.metadata?.nofollow ?? false,
            },
            sections: normalizeSections(landing?.sections),
        });

    const [isSlideSheetOpen, setIsSlideSheetOpen] = useState(false);
    const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(
        null,
    );
    const [slideDraft, setSlideDraft] =
        useState<LandingSlideForm>(emptySlide());
    const [isKnowMoreSheetOpen, setIsKnowMoreSheetOpen] = useState(false);
    const [editingKnowMoreIndex, setEditingKnowMoreIndex] = useState<
        number | null
    >(null);
    const [knowMoreDraft, setKnowMoreDraft] =
        useState<LandingFormSections['knowMore']['items'][number]>(
            emptyKnowMore(),
        );

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            forceFormData: true,
        } as const;

        if (landing) {
            put(`/landings/items/${landing.id}`, options);
            return;
        }

        post('/landings/items', options);
    };

    const errorFor = (key: string): string | undefined => {
        const value = errors[key as keyof typeof errors];
        return typeof value === 'string' ? value : undefined;
    };

    const openNewSlideSheet = () => {
        setEditingSlideIndex(null);
        setSlideDraft(emptySlide());
        setIsSlideSheetOpen(true);
    };

    const openEditSlideSheet = (index: number) => {
        setEditingSlideIndex(index);
        setSlideDraft({ ...data.sections.banner.slides[index] });
        setIsSlideSheetOpen(true);
    };

    const saveSlideDraft = () => {
        if (!slideDraft.id.trim()) {
            setSlideDraft((prev) => ({ ...prev, id: uid() }));
        }

        const slides = [...data.sections.banner.slides];

        if (editingSlideIndex === null) {
            slides.push({ ...slideDraft, id: slideDraft.id || uid() });
        } else {
            slides[editingSlideIndex] = {
                ...slideDraft,
                id: slideDraft.id || uid(),
            };
        }

        setData('sections', {
            ...data.sections,
            banner: { slides },
        });

        setIsSlideSheetOpen(false);
    };

    const removeSlide = (index: number) => {
        const slides = data.sections.banner.slides.filter(
            (_, i) => i !== index,
        );
        setData('sections', {
            ...data.sections,
            banner: { slides },
        });
    };

    const openNewKnowMoreSheet = () => {
        setEditingKnowMoreIndex(null);
        setKnowMoreDraft(emptyKnowMore());
        setIsKnowMoreSheetOpen(true);
    };

    const openEditKnowMoreSheet = (index: number) => {
        setEditingKnowMoreIndex(index);
        setKnowMoreDraft({ ...data.sections.knowMore.items[index] });
        setIsKnowMoreSheetOpen(true);
    };

    const saveKnowMoreDraft = () => {
        const items = [...data.sections.knowMore.items];

        if (editingKnowMoreIndex === null) {
            items.push({
                ...knowMoreDraft,
                id: knowMoreDraft.id || uid(),
            });
        } else {
            items[editingKnowMoreIndex] = {
                ...knowMoreDraft,
                id: knowMoreDraft.id || uid(),
            };
        }

        setData('sections', {
            ...data.sections,
            knowMore: {
                ...data.sections.knowMore,
                items,
            },
        });

        setIsKnowMoreSheetOpen(false);
    };

    const removeKnowMoreItem = (index: number) => {
        const items = data.sections.knowMore.items.filter(
            (_, i) => i !== index,
        );
        setData('sections', {
            ...data.sections,
            knowMore: {
                ...data.sections.knowMore,
                items,
            },
        });
    };

    const updateFeature = (
        index: number,
        patch: { title?: string; description?: string; image?: MediaValue },
    ) => {
        const items = [...data.sections.features.items];
        items[index] = { ...items[index], ...patch };
        setData('sections', {
            ...data.sections,
            features: {
                ...data.sections.features,
                items,
            },
        });
    };

    return (
        <>
            <form onSubmit={onSubmit} className="pb-10">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_0.5fr]">
                    <div className="space-y-10">
                        <section>
                            <div className="space-y-6">
                                <div className="flex flex-col gap-2">
                                    <Label>Título *</Label>
                                    <Input
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        placeholder="Nombre de la landing"
                                    />
                                    {errorFor('title') && (
                                        <p className="text-sm text-red-500">
                                            {errorFor('title')}
                                        </p>
                                    )}
                                </div>

                                <SlugInput
                                    id="slug"
                                    label="Slug *"
                                    source={data.title}
                                    value={data.slug}
                                    onChange={(value) => setData('slug', value)}
                                    placeholder="producto-campana"
                                    error={errorFor('slug')}
                                />
                            </div>
                        </section>

                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-xs font-bold tracking-widest uppercase">
                                    ● Banner
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={openNewSlideSheet}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar diapositiva
                                </Button>
                            </div>

                            <div className="overflow-hidden rounded-xl border">
                                <div className="overflow-x-auto">
                                    <div className="min-w-[740px]">
                                        <div className="grid grid-cols-12 bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                                            <div className="col-span-1">#</div>
                                            <div className="col-span-4">
                                                Tipo
                                            </div>
                                            <div className="col-span-4">
                                                Estado
                                            </div>
                                            <div className="col-span-3 text-right">
                                                Acciones
                                            </div>
                                        </div>

                                        {data.sections.banner.slides.length ===
                                        0 ? (
                                            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                                                No hay diapositivas registradas.
                                            </div>
                                        ) : (
                                            data.sections.banner.slides.map(
                                                (slide, idx) => (
                                                    <div
                                                        key={slide.id}
                                                        className="grid grid-cols-12 items-center border-t px-4 py-3 text-sm"
                                                    >
                                                        <div className="col-span-1 font-medium">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="col-span-4">
                                                            {slide.type ===
                                                            'image'
                                                                ? 'Imagen'
                                                                : 'Video'}
                                                        </div>
                                                        <div className="col-span-4">
                                                            {slide.is_active ? (
                                                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                                                    Activo
                                                                </span>
                                                            ) : (
                                                                <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
                                                                    Inactivo
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="col-span-3 flex justify-end gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() =>
                                                                    openEditSlideSheet(
                                                                        idx,
                                                                    )
                                                                }
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                onClick={() =>
                                                                    removeSlide(
                                                                        idx,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ),
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <p className="mb-4 text-xs font-bold tracking-widest uppercase">
                                ● Historia de marca
                            </p>
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label>Título</Label>
                                        <Input
                                            value={
                                                data.sections.brandStory.title
                                            }
                                            onChange={(e) =>
                                                setData('sections', {
                                                    ...data.sections,
                                                    brandStory: {
                                                        ...data.sections
                                                            .brandStory,
                                                        title: e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>Subtítulo</Label>
                                        <Input
                                            value={
                                                data.sections.brandStory
                                                    .subtitle ?? ''
                                            }
                                            onChange={(e) =>
                                                setData('sections', {
                                                    ...data.sections,
                                                    brandStory: {
                                                        ...data.sections
                                                            .brandStory,
                                                        subtitle:
                                                            e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Descripción</Label>
                                    <Textarea
                                        value={
                                            data.sections.brandStory.description
                                        }
                                        onChange={(e) =>
                                            setData('sections', {
                                                ...data.sections,
                                                brandStory: {
                                                    ...data.sections.brandStory,
                                                    description: e.target.value,
                                                },
                                            })
                                        }
                                        rows={4}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Tipo de contenido</Label>
                                    <Select
                                        value={
                                            data.sections.brandStory.media.type
                                        }
                                        onValueChange={(
                                            value: 'image' | 'video',
                                        ) =>
                                            setData('sections', {
                                                ...data.sections,
                                                brandStory: {
                                                    ...data.sections.brandStory,
                                                    media: {
                                                        ...data.sections
                                                            .brandStory.media,
                                                        type: value,
                                                        src_desktop:
                                                            value === 'image'
                                                                ? data.sections
                                                                      .brandStory
                                                                      .media
                                                                      .src_desktop
                                                                : null,
                                                        src_mobile:
                                                            value === 'image'
                                                                ? data.sections
                                                                      .brandStory
                                                                      .media
                                                                      .src_mobile
                                                                : null,
                                                        src_video:
                                                            value === 'video'
                                                                ? data.sections
                                                                      .brandStory
                                                                      .media
                                                                      .src_video
                                                                : null,
                                                    },
                                                },
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="image">
                                                Imagen
                                            </SelectItem>
                                            <SelectItem value="video">
                                                Video
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="max-w-68 space-y-2">
                                    <Label>
                                        {data.sections.brandStory.media.type ===
                                        'video'
                                            ? 'Video'
                                            : 'Imagen'}
                                    </Label>
                                    {data.sections.brandStory.media.type ===
                                    'video' ? (
                                        <Upload
                                            value={
                                                data.sections.brandStory.media
                                                    .src_video
                                            }
                                            onFileChange={(file) =>
                                                setData('sections', {
                                                    ...data.sections,
                                                    brandStory: {
                                                        ...data.sections
                                                            .brandStory,
                                                        media: {
                                                            type: 'video',
                                                            src_desktop: null,
                                                            src_mobile: null,
                                                            src_video: file,
                                                        },
                                                    },
                                                })
                                            }
                                            accept="video/*"
                                            type="video"
                                            previewClassName="w-full aspect-video "
                                        />
                                    ) : (
                                        <Upload
                                            value={
                                                data.sections.brandStory.media
                                                    .src_desktop
                                            }
                                            onFileChange={(file) =>
                                                setData('sections', {
                                                    ...data.sections,
                                                    brandStory: {
                                                        ...data.sections
                                                            .brandStory,
                                                        media: {
                                                            type: 'image',
                                                            src_desktop: file,
                                                            src_mobile: file,
                                                            src_video: null,
                                                        },
                                                    },
                                                })
                                            }
                                            accept="image/*"
                                            type="image"
                                            previewClassName="w-full aspect-video "
                                        />
                                    )}
                                </div>
                            </div>
                        </section>

                        <section>
                            <p className="mb-4 text-xs font-bold tracking-widest uppercase">
                                ● Características
                            </p>
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <Label>Título</Label>
                                    <Input
                                        value={data.sections.features.title}
                                        onChange={(e) =>
                                            setData('sections', {
                                                ...data.sections,
                                                features: {
                                                    ...data.sections.features,
                                                    title: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>

                                <div className="overflow-hidden rounded-xl border">
                                    <div className="bg-muted/40 px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        3 ítems de características
                                    </div>

                                    <div className="space-y-0">
                                        {data.sections.features.items.map(
                                            (item, idx) => (
                                                <div
                                                    key={`feature-${idx}`}
                                                    className="border-t px-4 py-4"
                                                >
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                                                            Ítem {idx + 1}
                                                        </span>
                                                    </div>

                                                    <div className="grid gap-4">
                                                        <div className="flex flex-col gap-2">
                                                            <Label>
                                                                Título del ítem
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    item.title
                                                                }
                                                                onChange={(e) =>
                                                                    updateFeature(
                                                                        idx,
                                                                        {
                                                                            title: e
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Label>
                                                                Descripción del
                                                                ítem
                                                            </Label>
                                                            <Textarea
                                                                value={
                                                                    item.description
                                                                }
                                                                onChange={(e) =>
                                                                    updateFeature(
                                                                        idx,
                                                                        {
                                                                            description:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                                rows={3}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Label>
                                                                Imagen del ítem
                                                            </Label>
                                                            <div className="w-full max-w-28">
                                                                <Upload
                                                                    value={
                                                                        item.image
                                                                    }
                                                                    onFileChange={(
                                                                        file,
                                                                    ) =>
                                                                        updateFeature(
                                                                            idx,
                                                                            {
                                                                                image: file,
                                                                            },
                                                                        )
                                                                    }
                                                                    accept="image/*"
                                                                    type="image"
                                                                    previewClassName="w-full aspect-video h-24"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-xs font-bold tracking-widest uppercase">
                                    ● Conoce más
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={openNewKnowMoreSheet}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar ítem
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <Label>Título Princial</Label>
                                    <Input
                                        value={data.sections.knowMore.title}
                                        onChange={(e) =>
                                            setData('sections', {
                                                ...data.sections,
                                                knowMore: {
                                                    ...data.sections.knowMore,
                                                    title: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>

                                <div className="overflow-hidden rounded-xl border">
                                    <div className="overflow-x-auto">
                                        <div className="min-w-[740px]">
                                            <div className="grid grid-cols-12 bg-muted/40 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                                                <div className="col-span-1">
                                                    #
                                                </div>
                                                <div className="col-span-3">
                                                    Título
                                                </div>
                                                <div className="col-span-5">
                                                    Descripción
                                                </div>
                                                <div className="col-span-1">
                                                    Imagen
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    Acciones
                                                </div>
                                            </div>

                                            {data.sections.knowMore.items
                                                .length === 0 ? (
                                                <div className="px-4 py-6 text-sm text-muted-foreground">
                                                    No hay ítems registrados.
                                                </div>
                                            ) : (
                                                data.sections.knowMore.items.map(
                                                    (item, idx) => (
                                                        <div
                                                            key={item.id}
                                                            className="grid grid-cols-12 items-center border-t px-4 py-3 text-sm"
                                                        >
                                                            <div className="col-span-1 font-medium">
                                                                {idx + 1}
                                                            </div>
                                                            <div className="col-span-3 font-medium">
                                                                {item.title ||
                                                                    '-'}
                                                            </div>
                                                            <div className="col-span-5 max-w-60 truncate text-muted-foreground">
                                                                {item.description ||
                                                                    '-'}
                                                            </div>
                                                            <div className="col-span-1">
                                                                {getMediaPreview(
                                                                    item.image,
                                                                ) ? (
                                                                    <img
                                                                        src={
                                                                            getMediaPreview(
                                                                                item.image,
                                                                            ) ??
                                                                            ''
                                                                        }
                                                                        alt={`Conoce más ${idx + 1}`}
                                                                        className="h-10 w-10 rounded-md border object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Sin
                                                                        imagen
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="col-span-2 flex justify-end gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        openEditKnowMoreSheet(
                                                                            idx,
                                                                        )
                                                                    }
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        removeKnowMoreItem(
                                                                            idx,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ),
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="sticky top-24 space-y-8">
                        <div className="space-y-2">
                            <p className="mb-4 text-xs font-bold tracking-widest uppercase">
                                ● Estado
                            </p>
                            <div className="flex items-center justify-between rounded-2xl border p-4">
                                <div>
                                    <p className="text-sm font-medium">
                                        Landing activa
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Visible para captación de leads
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', checked)
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs font-bold tracking-widest uppercase">
                                ● SEO
                            </p>
                            <div className="space-y-4">
                                <Label>Título meta</Label>
                                <Input
                                    value={data.metadata.meta_title ?? ''}
                                    onChange={(e) =>
                                        setData('metadata', {
                                            ...data.metadata,
                                            meta_title: e.target.value,
                                        })
                                    }
                                    placeholder="Meta title"
                                />

                                <Label>Descripción meta</Label>
                                <Textarea
                                    value={data.metadata.meta_description ?? ''}
                                    onChange={(e) =>
                                        setData('metadata', {
                                            ...data.metadata,
                                            meta_description: e.target.value,
                                        })
                                    }
                                    rows={3}
                                    placeholder="Meta description"
                                />

                                <Label>Palabras clave meta</Label>
                                <Input
                                    value={data.metadata.meta_keywords ?? ''}
                                    onChange={(e) =>
                                        setData('metadata', {
                                            ...data.metadata,
                                            meta_keywords: e.target.value,
                                        })
                                    }
                                    placeholder="Meta keywords"
                                />

                                <Label>URL canónica</Label>
                                <Input
                                    value={data.metadata.canonical_url ?? ''}
                                    onChange={(e) =>
                                        setData('metadata', {
                                            ...data.metadata,
                                            canonical_url: e.target.value,
                                        })
                                    }
                                    placeholder="Canonical URL"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 w-full rounded-xl"
                        >
                            {processing ? 'Guardando...' : 'Guardar landing'}
                        </Button>
                    </aside>
                </div>
            </form>

            <Sheet open={isSlideSheetOpen} onOpenChange={setIsSlideSheetOpen}>
                <SheetContent className="sm:max-w-xl" side="right">
                    <SheetHeader>
                        <SheetTitle>
                            {editingSlideIndex === null
                                ? 'Nueva diapositiva'
                                : `Editar diapositiva #${editingSlideIndex + 1}`}
                        </SheetTitle>
                        <SheetDescription>
                            Configura el contenido del banner sin ocupar espacio
                            en el formulario principal.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 px-4 pb-4">
                        <div className="flex items-center justify-between rounded-xl border p-3">
                            <div>
                                <p className="text-sm font-medium">
                                    Estado de la diapositiva
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Controla si se muestra en frontend
                                </p>
                            </div>
                            <Switch
                                checked={slideDraft.is_active}
                                onCheckedChange={(checked) =>
                                    setSlideDraft((prev) => ({
                                        ...prev,
                                        is_active: checked,
                                    }))
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select
                                value={slideDraft.type}
                                onValueChange={(value: 'image' | 'video') =>
                                    setSlideDraft((prev) => ({
                                        ...prev,
                                        type: value,
                                        src_desktop:
                                            value === 'image'
                                                ? prev.src_desktop
                                                : null,
                                        src_mobile:
                                            value === 'image'
                                                ? prev.src_mobile
                                                : null,
                                        src_video:
                                            value === 'video'
                                                ? prev.src_video
                                                : null,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="image">
                                        Imagen
                                    </SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Enlace (opcional)</Label>
                            <Input
                                value={slideDraft.link_url ?? ''}
                                onChange={(e) =>
                                    setSlideDraft((prev) => ({
                                        ...prev,
                                        link_url: e.target.value || null,
                                    }))
                                }
                                placeholder="https://..."
                            />
                        </div>

                        {slideDraft.type === 'image' ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Imagen escritorio</Label>
                                    <Upload
                                        value={slideDraft.src_desktop}
                                        onFileChange={(file) =>
                                            setSlideDraft((prev) => ({
                                                ...prev,
                                                src_desktop: file,
                                            }))
                                        }
                                        accept="image/*"
                                        type="image"
                                        previewClassName="w-full aspect-video"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Imagen móvil</Label>
                                    <Upload
                                        value={slideDraft.src_mobile}
                                        onFileChange={(file) =>
                                            setSlideDraft((prev) => ({
                                                ...prev,
                                                src_mobile: file,
                                            }))
                                        }
                                        accept="image/*"
                                        type="image"
                                        previewClassName="w-full aspect-video"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Video</Label>
                                <Upload
                                    value={slideDraft.src_video}
                                    onFileChange={(file) =>
                                        setSlideDraft((prev) => ({
                                            ...prev,
                                            src_video: file,
                                        }))
                                    }
                                    accept="video/*"
                                    type="video"
                                    previewClassName="w-full aspect-video"
                                />
                            </div>
                        )}
                    </div>

                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsSlideSheetOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="button" onClick={saveSlideDraft}>
                            Guardar diapositiva
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <Sheet
                open={isKnowMoreSheetOpen}
                onOpenChange={setIsKnowMoreSheetOpen}
            >
                <SheetContent className="sm:max-w-xl" side="right">
                    <SheetHeader>
                        <SheetTitle>
                            {editingKnowMoreIndex === null
                                ? 'Nuevo ítem'
                                : `Editar ítem #${editingKnowMoreIndex + 1}`}
                        </SheetTitle>
                        <SheetDescription>
                            Completa el contenido del bloque Conoce más sin
                            ocupar espacio en el formulario principal.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 px-4 pb-4">
                        <div className="flex flex-col gap-2">
                            <Label>Título</Label>
                            <Input
                                value={knowMoreDraft.title}
                                onChange={(e) =>
                                    setKnowMoreDraft((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Descripción</Label>
                            <Textarea
                                value={knowMoreDraft.description}
                                onChange={(e) =>
                                    setKnowMoreDraft((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Imagen</Label>
                            <Upload
                                value={knowMoreDraft.image}
                                onFileChange={(file) =>
                                    setKnowMoreDraft((prev) => ({
                                        ...prev,
                                        image: file,
                                    }))
                                }
                                accept="image/*"
                                type="image"
                                previewClassName="w-full aspect-video"
                            />
                        </div>
                    </div>

                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsKnowMoreSheetOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="button" onClick={saveKnowMoreDraft}>
                            Guardar ítem
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
