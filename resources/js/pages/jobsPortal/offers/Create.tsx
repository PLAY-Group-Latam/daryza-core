import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';

import { SlugInput } from '@/components/custom-ui/slug-text';
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

type Option = { id: string; name: string; city?: string };

type FormValues = {
    title: string;
    slug: string;
    description: string;
    requirements: string;
    benefits: string;
    modality: string;
    vacancies: number;
    is_active: boolean;
    area_id: string;
    place_id: string;
};

const modalityLabels: Record<string, string> = {
    on_site: 'Presencial',
    remote: 'Remoto',
    hybrid: 'Híbrido',
};

export default function Create() {
    const { departments, places, modalities } = usePage<{
        departments: Option[];
        places: Option[];
        modalities: string[];
    }>().props;

    const form = useForm<FormValues>({
        defaultValues: {
            title: '',
            slug: '',
            description: '',
            requirements: '',
            benefits: '',
            modality: modalities[0] ?? 'remote',
            vacancies: 1,
            is_active: true,
            area_id: departments[0]?.id ?? '',
            place_id: places[0]?.id ?? '',
        },
    });

    const onSubmit = (values: FormValues) => {
        router.post('/admin/jobs/offers', {
            ...values,
            requirements: values.requirements
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean),
            benefits: values.benefits
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean),
        });
    };

    return (
        <AppLayout>
            <Head title="Crear Oferta" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <h1 className="text-xl font-bold">Crear Oferta</h1>

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
                                            <Input {...field} />
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
                                            error={form.formState.errors.slug?.message}
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
                                            <Textarea className="min-h-44" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="requirements"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Requisitos (uno por línea)</FormLabel>
                                        <FormControl>
                                            <Textarea className="min-h-28" {...field} />
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
                                        <FormLabel>Beneficios (uno por línea)</FormLabel>
                                        <FormControl>
                                            <Textarea className="min-h-28" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <aside className="space-y-6">
                            <div className="space-y-4 rounded-xl border p-4">
                                <p className="text-xs font-bold tracking-widest uppercase">
                                    Configuración
                                </p>
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
                                                        <SelectValue placeholder="Selecciona" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {modalities.map((modality) => (
                                                        <SelectItem key={modality} value={modality}>
                                                            {modalityLabels[modality] ?? modality}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                                        <SelectValue placeholder="Selecciona" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {departments.map((department) => (
                                                        <SelectItem
                                                            key={department.id}
                                                            value={department.id}
                                                        >
                                                            {department.name}
                                                        </SelectItem>
                                                    ))}
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
                                                        <SelectValue placeholder="Selecciona" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {places.map((place) => (
                                                        <SelectItem key={place.id} value={place.id}>
                                                            {place.name}
                                                        </SelectItem>
                                                    ))}
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
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(Number(e.target.value))
                                                    }
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
                                                <div className="flex h-10 items-center rounded-md border border-input bg-background px-3">
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="w-full"
                            >
                                Guardar
                            </Button>
                        </aside>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
