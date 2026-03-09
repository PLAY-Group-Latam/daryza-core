'use client';

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface Script {
    id: string;
    name: string;
    placement: 'head' | 'body';
    active: boolean;
    content: string;
}

const scriptSchema = z.object({
    name: z.string().min(1, 'Debe ingresar un nombre'),
    placement: z.enum(['head', 'body']),
    active: z.boolean(),
    content: z.string().min(1, 'El contenido no puede estar vacío'),
});

type ScriptFormValues = z.infer<typeof scriptSchema>;

export default function EditScript({ script }: { script: Script }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ScriptFormValues>({
        resolver: zodResolver(scriptSchema),
        defaultValues: {
            name: script.name,
            placement: script.placement,
            active: script.active,
            content: script.content,
        },
    });

    function onSubmit(data: ScriptFormValues) {
        router.put(`/scripts/${script.id}`, data, {
            onStart: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
           
        });
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Lista de Scripts', href: '/scripts' },
        { title: 'Editar Script', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Script" />

            <div className="mx-auto w-full max-w-6xl p-4 lg:p-6">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Editar Script</h1>
                        <p className="text-muted-foreground text-sm">Modifica la configuración de tu script.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => router.visit('/scripts')}>
                            Cancelar
                        </Button>
                        <Button form="edit-script-form" type="submit" disabled={isSubmitting} className="min-w-[140px]">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Guardar Cambios
                        </Button>
                    </div>
                </div>

                <Form {...form}>
                    <form id="edit-script-form" onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className='border-none p-0 shadow-none'>
                                <CardContent className="p-0 space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-col gap-3'>
                                                <FormLabel>Nombre Identificador</FormLabel>
                                                <FormControl>
                                                    <Input className="h-11" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem className='flex flex-col gap-4'>
                                                <FormLabel>Código del Script</FormLabel>
                                                <FormControl>
                                                    <Textarea 
                                                        className="min-h-[400px] font-mono text-xs bg-slate-950 text-slate-50 p-4" 
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardContent className="pt-0">
                                    <FormField
                                        control={form.control}
                                        name="active"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Script Activo</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-0">
                                    <FormField
                                        control={form.control}
                                        name="placement"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Ubicación</FormLabel>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid gap-4">
                                                    <FormItem>
                                                        <FormControl>
                                                            <RadioGroupItem value="head" className="sr-only" />
                                                        </FormControl>
                                                        <FormLabel className={cn(
                                                                    'flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground',
                                                                    field.value ===
                                                                        'head' &&
                                                                        'border-primary',
                                                                 field.value === 'head' && "border-primary")}>
                                                            <span className="font-bold">Header</span>
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem>
                                                        <FormControl>
                                                            <RadioGroupItem value="body" className="sr-only" />
                                                        </FormControl>
                                                        <FormLabel  className={cn(
                                                                    'flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground', field.value === 'body' && "border-primary")}>
                                                            <span className="font-bold">Body</span>
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}