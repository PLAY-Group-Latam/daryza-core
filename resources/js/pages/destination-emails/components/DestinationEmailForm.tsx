import { BackButton } from '@/components/custom-ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { DestinationEmail, DestinationEmailPageOption } from '../types';

const destinationEmailSchema = z.object({
    name: z.string().min(1, 'Debe ingresar un nombre'),
    email: z.string().min(1, 'Debe ingresar un correo').email('Debe ingresar un correo válido'),
    pages: z.array(z.string()).min(1, 'Debe seleccionar al menos una página'),
    is_active: z.boolean(),
});

type DestinationEmailFormValues = z.infer<typeof destinationEmailSchema>;

interface DestinationEmailFormProps {
    mode: 'create' | 'edit';
    pageOptions: DestinationEmailPageOption[];
    destinationEmail?: DestinationEmail & { pages?: string[] };
}

export function DestinationEmailForm({
    mode,
    pageOptions,
    destinationEmail,
}: DestinationEmailFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { errors } = usePage().props as { errors?: Record<string, string> };
    const isEdit = mode === 'edit';

    const form = useForm<DestinationEmailFormValues>({
        resolver: zodResolver(destinationEmailSchema),
        defaultValues: {
            name: destinationEmail?.name ?? '',
            email: destinationEmail?.email ?? '',
            pages: destinationEmail?.pages ?? destinationEmail?.page_keys ?? [],
            is_active: destinationEmail?.is_active ?? true,
        },
    });

    function onSubmit(data: DestinationEmailFormValues) {
        const url = isEdit
            ? `/destination-emails/${destinationEmail?.id}`
            : '/destination-emails';

        router.visit(url, {
            method: isEdit ? 'put' : 'post',
            data,
            preserveScroll: true,
            onStart: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
            onError: (serverErrors) => {
                Object.entries(serverErrors).forEach(([key, value]) => {
                    form.setError(key as keyof DestinationEmailFormValues, {
                        type: 'server',
                        message: value,
                    });
                });
            },
        });
    }

    return (
        <AppLayout>
            <Head title={isEdit ? 'Editar Email de Destino' : 'Crear Email de Destino'} />
            <div className="mb-6 flex items-end gap-4">
                <BackButton />
            </div>

            <div className="w-full p-4 lg:p-6 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEdit ? 'Editar Email de Destino' : 'Crear Email de Destino'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Configura los correos internos que reciben formularios y alertas.
                    </p>
                </div>

                <Form {...form}>
                    <form
                        id="destination-email-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <Card className="border-none p-0 shadow-none">
                            <CardContent className="space-y-6 p-0 shadow-none">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col gap-3">
                                            <FormLabel>Nombre</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej: Correo comercial"
                                                    className="h-11"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col gap-3">
                                            <FormLabel>Correo Electrónico</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="correo@daryza.com"
                                                    className="h-11"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="pages"
                                    render={() => (
                                        <FormItem className="flex flex-col gap-3">
                                            <FormLabel>Páginas</FormLabel>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {pageOptions.map((page) => (
                                                    <FormField
                                                        key={page.key}
                                                        control={form.control}
                                                        name="pages"
                                                        render={({ field }) => {
                                                            const checked = field.value?.includes(page.key);

                                                            return (
                                                                <FormItem className="flex items-start gap-3 rounded-md border p-3">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={checked}
                                                                            onCheckedChange={(value) => {
                                                                                const pages = field.value ?? [];
                                                                                field.onChange(
                                                                                    value
                                                                                        ? [...pages, page.key]
                                                                                        : pages.filter(
                                                                                              (item) =>
                                                                                                  item !== page.key
                                                                                          ),
                                                                                );
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="space-y-1 leading-none">
                                                                        <FormLabel className="cursor-pointer font-normal">
                                                                            {page.label}
                                                                        </FormLabel>
                                                                    </div>
                                                                </FormItem>
                                                            );
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <FormMessage />
                                            {errors?.pages ? (
                                                <p className="text-sm font-medium text-destructive">
                                                    {errors.pages}
                                                </p>
                                            ) : null}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Activo</FormLabel>
                                                <p className="text-xs text-muted-foreground">
                                                    Si está inactivo, se usará el correo del .env.
                                                </p>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <div className="flex justify-start pt-2">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-8"
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isEdit ? 'Guardar Cambios' : 'Crear Email de Destino'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}