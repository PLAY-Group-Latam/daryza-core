import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { MultiSelect } from '@/components/custom-ui/MultiSelect';
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
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BackButton } from '@/components/custom-ui/PageHeader';

type Place = {
    id: string;
    name: string;
    address: string;
    city: string;
    is_active: boolean;
    area_ids: string[];
};
type AreaOption = { id: string; name: string };

const schema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio.'),
    address: z.string().min(1, 'La dirección es obligatoria.'),
    city: z.string().min(1, 'La ciudad es obligatoria.'),
    is_active: z.boolean(),
    area_ids: z.array(z.string()).min(1, 'Selecciona al menos un área.'),
});

type FormValues = z.infer<typeof schema>;

export default function Edit() {
    const { place, areas } = usePage<{ place: Place; areas: AreaOption[] }>()
        .props;

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: place.name,
            address: place.address,
            city: place.city,
            is_active: place.is_active,
            area_ids: place.area_ids ?? [],
        },
    });

    const onSubmit = (data: FormValues) => {
        router.put(`/admin/jobs/places/${place.id}`, data);
    };

    return (
        <AppLayout>
            <Head title="Editar Sede" />
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <h1 className="text-xl font-bold">Editar Sede</h1>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ciudad</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="area_ids"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Áreas relacionadas</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={areas.map((area) => ({
                                                label: area.name,
                                                value: area.id,
                                            }))}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Seleccionar áreas"
                                            searchPlaceholder="Buscar área..."
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

                        <div className="md:col-span-2">
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                            >
                                Actualizar
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
