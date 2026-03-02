import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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

type Department = { id: string; name: string; is_active: boolean };

const schema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio.'),
    is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function Edit() {
    const { department } = usePage<{ department: Department }>().props;

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: department.name,
            is_active: department.is_active,
        },
    });

    const onSubmit = (data: FormValues) => {
        router.put(`/admin/jobs/departments/${department.id}`, data);
    };

    return (
        <AppLayout>
            <Head title="Editar Área" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <h1 className="text-xl font-bold">Editar Área</h1>

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

                        <div className="md:col-span-2"><Button type="submit" disabled={form.formState.isSubmitting}>
                            Actualizar
                        </Button></div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
