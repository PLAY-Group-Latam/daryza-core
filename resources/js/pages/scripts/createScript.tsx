import AppLayout from '@/layouts/app-layout';
import scripts from '@/routes/scripts';
import { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/* ------------------------------------------------------------------
   BREADCRUMBS
------------------------------------------------------------------- */
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Lista de Scripts', href: '/scripts' },
    { title: 'Nuevo Script', href: '/scripts/create' },
];

/* ------------------------------------------------------------------
   SCHEMA
------------------------------------------------------------------- */
const scriptSchema = z.object({
    name: z.string().min(1, 'Debe ingresar un nombre'),
    placement: z.enum(['head', 'body']),
    active: z.boolean(),
    content: z.string().min(1, 'El contenido no puede estar vacío'),
});

type ScriptFormValues = z.infer<typeof scriptSchema>;

/* ------------------------------------------------------------------
   PAGE
------------------------------------------------------------------- */
export default function CreateScript() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ScriptFormValues>({
        resolver: zodResolver(scriptSchema),
        defaultValues: {
            name: '',
            placement: 'head',
            active: true,
            content: '',
        },
    });

    function onSubmit(data: ScriptFormValues) {
        const route = scripts.store();

        router.visit(route.url, {
            method: route.method,
            data,
            onStart: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
            onError: (errors) => console.error(errors),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Script" />

            <div className="mx-auto w-full max-w-6xl p-4 lg:p-6">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Nuevo Script
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Configura scripts personalizados para tracking o
                            funcionalidades externas.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/scripts')}
                        >
                            Cancelar
                        </Button>
                        <Button
                            form="script-form"
                            type="submit"
                            disabled={isSubmitting}
                            className="min-w-[140px]"
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Guardar Script
                        </Button>
                    </div>
                </div>

                <Form {...form}>
                    <form
                        id="script-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
                    >
                        {/* COLUMNA IZQUIERDA: Principal (2/3) */}
                        <div className="space-y-6 lg:col-span-2">
                            <Card className="border-none p-0 shadow-none">
                                <CardContent className="space-y-4 p-0 shadow-none">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col gap-3">
                                                <FormLabel>
                                                    Nombre Identificador
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Ej: Google Tag Manager - Marketing"
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
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col gap-4">
                                                <FormLabel>
                                                    Código del Script
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        className="min-h-[400px] bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-50 focus-visible:ring-slate-400"
                                                        placeholder="<script>&#10;  console.log('Hola');&#10;</script>"
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

                        {/* COLUMNA DERECHA: Configuración (1/3) */}
                        <div className="space-y-6">
                            <Card>
                                <CardContent className="pt-0">
                                    <FormField
                                        control={form.control}
                                        name="active"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0">
                                                <div className="space-y-2">
                                                    <FormLabel className="text-base">
                                                        Script Activo
                                                    </FormLabel>
                                                    <p className="text-xs text-muted-foreground">
                                                        Desactiva para pausar la
                                                        ejecución.
                                                    </p>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
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
                                                <FormLabel>
                                                    Ubicación en el sitio
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                        className="grid grid-cols-1 gap-4"
                                                    >
                                                        <FormItem>
                                                            <FormControl>
                                                                <RadioGroupItem
                                                                    value="head"
                                                                    className="sr-only"
                                                                />
                                                            </FormControl>
                                                            <FormLabel
                                                                className={cn(
                                                                    'flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground',
                                                                    field.value ===
                                                                        'head' &&
                                                                        'border-primary',
                                                                )}
                                                            >
                                                                <span className="text-sm font-bold">
                                                                    Header
                                                                </span>
                                                               
                                                            </FormLabel>
                                                        </FormItem>

                                                        <FormItem>
                                                            <FormControl>
                                                                <RadioGroupItem
                                                                    value="body"
                                                                    className="sr-only"
                                                                />
                                                            </FormControl>
                                                            <FormLabel
                                                                className={cn(
                                                                    'flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground',
                                                                    field.value ===
                                                                        'body' &&
                                                                        'border-primary',
                                                                )}
                                                            >
                                                                <span className="text-sm font-bold">
                                                                    Body
                                                                </span>
                                                               
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <div className="rounded-lg bg-blue-50 p-4 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                <strong>Nota:</strong> Los cambios en los
                                scripts pueden tardar unos minutos en reflejarse
                                debido a la caché del sitio.
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}