import { router, usePage } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { SlugInput } from '@/components/custom-ui/slug-text';
import { Upload } from '@/components/custom-ui/upload';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BackButton } from '@/components/custom-ui/PageHeader';

type Option = { id: string; name: string; city?: string; area_ids?: string[] };
type Offer = {
    id: string;
    title: string;
    slug: string;
    image_url?: string | null;
    description: string;
    requirements: string[];
    benefits: string[];
    modality: string;
    vacancies: number;
    is_active: boolean;
    area_id: string;
    place_id: string;
    metadata?: {
        meta_title?: string;
        meta_description?: string;
        canonical_url?: string;
        noindex?: boolean;
        nofollow?: boolean;
    } | null;
};

type FormValues = {
    title: string;
    slug: string;
    image: File | string | null;
    description: string;
    requirements: string;
    benefits: string;
    modality: string;
    vacancies: number;
    is_active: boolean;
    area_id: string;
    place_id: string;
    metadata: {
        meta_title: string;
        meta_description: string;
        canonical_url: string;
        noindex: boolean;
        nofollow: boolean;
    };
};

const modalityLabels: Record<string, string> = {
    on_site: 'Presencial',
    remote: 'Remoto',
    hybrid: 'Híbrido',
};

export default function Edit() {
    const { offer, departments, places, modalities } = usePage<{
        offer: Offer;
        departments: Option[];
        places: Option[];
        modalities: string[];
    }>().props;

    const form = useForm<FormValues>({
        defaultValues: {
            title: offer.title,
            slug: offer.slug,
            image: null,
            description: offer.description,
            requirements: (offer.requirements ?? []).join('\n'),
            benefits: (offer.benefits ?? []).join('\n'),
            modality: offer.modality,
            vacancies: offer.vacancies,
            is_active: offer.is_active,
            area_id: offer.area_id,
            place_id: offer.place_id,
            metadata: {
                meta_title: offer.metadata?.meta_title ?? '',
                meta_description: offer.metadata?.meta_description ?? '',
                canonical_url: offer.metadata?.canonical_url ?? '',
                noindex: offer.metadata?.noindex ?? false,
                nofollow: offer.metadata?.nofollow ?? false,
            },
        },
    });

    const selectedAreaId = form.watch('area_id');
    const filteredPlaces = useMemo(
        () =>
            places.filter((place) =>
                place.area_ids?.length
                    ? place.area_ids.includes(selectedAreaId)
                    : true,
            ),
        [places, selectedAreaId],
    );

    useEffect(() => {
        const currentPlaceId = form.getValues('place_id');
        if (!currentPlaceId) return;

        const exists = filteredPlaces.some(
            (place) => place.id === currentPlaceId,
        );
        if (!exists) {
            form.setValue('place_id', filteredPlaces[0]?.id ?? '');
        }
    }, [filteredPlaces, form]);

    const onSubmit = (values: FormValues) => {
        router.post(
            `/admin/jobs/offers/${offer.id}`,
            {
                _method: 'put',
                ...values,
                requirements: values.requirements
                    .split('\n')
                    .map((item) => item.trim())
                    .filter(Boolean),
                benefits: values.benefits
                    .split('\n')
                    .map((item) => item.trim())
                    .filter(Boolean),
            },
            { forceFormData: true },
        );
    };

    return (
        <AppLayout>
            <Head title="Editar Oferta" />
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <h1 className="text-xl font-bold">Editar Oferta</h1>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.42fr]"
                    >
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Backend Developer Laravel" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <SlugInput
                                            source={form.watch('title')}
                                            value={field.value}
                                            onChange={field.onChange}
                                            label="Slug"
                                            error={
                                                form.formState.errors.slug
                                                    ?.message
                                            }
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="min-h-44"
                                                placeholder="Describe el puesto, responsabilidades y objetivo de la vacante."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="area_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Área</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar área" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {departments.map(
                                                        (department) => (
                                                            <SelectItem
                                                                key={
                                                                    department.id
                                                                }
                                                                value={
                                                                    department.id
                                                                }
                                                            >
                                                                {
                                                                    department.name
                                                                }
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="place_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sede</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar sede (elige área primero)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {filteredPlaces.map(
                                                        (place) => (
                                                            <SelectItem
                                                                key={place.id}
                                                                value={place.id}
                                                            >
                                                                {place.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="modality"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Modalidad</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar modalidad" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {modalities.map(
                                                        (modality) => (
                                                            <SelectItem
                                                                key={modality}
                                                                value={modality}
                                                            >
                                                                {modalityLabels[
                                                                    modality
                                                                ] ?? modality}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="vacancies"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vacantes</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    placeholder="Ej: 2"
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="requirements"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Requisitos (uno por línea)
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="min-h-28"
                                                placeholder={'Ej:\n3+ años en Laravel\nSQL avanzado\nBuenas prácticas SOLID'}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="benefits"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Beneficios (uno por línea)
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="min-h-28"
                                                placeholder={'Ej:\nTrabajo híbrido\nSeguro de salud\nCapacitaciones'}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <aside className="space-y-6">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col gap-3">
                                            <FormLabel>
                                                Imagen de la oferta
                                            </FormLabel>
                                            <FormControl>
                                                <Upload
                                                    value={
                                                        field.value ||
                                                        offer.image_url ||
                                                        null
                                                    }
                                                    onFileChange={
                                                        field.onChange
                                                    }
                                                    previewClassName="h-40 w-full"
                                                    accept="image/*"
                                                    placeholder="Subir imagen de la oferta"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estado activo</FormLabel>
                                            <FormControl>
                                                <div className="flex h-10 w-fit items-center rounded-md border border-input bg-background px-3">
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Regla de publicación: en el portal público solo se mostrará la oferta si están activos la oferta, el área y la sede seleccionada.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs font-bold tracking-widest uppercase">
                                    ● SEO
                                </p>
                                <FormField
                                    control={form.control}
                                    name="metadata.meta_title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Meta title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Título SEO de la oferta" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="metadata.meta_description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Meta description
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="min-h-24"
                                                    placeholder="Resumen SEO de la oferta para buscadores."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="metadata.canonical_url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Canonical URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://tu-frontend.com/trabajos/slug-oferta" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="h-12 w-full"
                            >
                                Actualizar
                            </Button>
                        </aside>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
