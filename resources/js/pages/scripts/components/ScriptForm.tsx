'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Loader2 } from 'lucide-react';

/* ------------------------------------------------------------------
   TYPES
------------------------------------------------------------------- */
export interface Script {
    id: string;
    name: string;
    placement: 'head' | 'body';
    active: boolean;
    content: string;
}

/* ------------------------------------------------------------------
   ZOD SCHEMA
------------------------------------------------------------------- */
const scriptSchema = z.object({
    name: z.string().min(1, 'Debe ingresar un nombre'),
    placement: z.enum(['head', 'body']),
    active: z.boolean(),
    content: z.string().min(1, 'El contenido no puede estar vacío'),
});

type ScriptFormValues = z.infer<typeof scriptSchema>;

/* ------------------------------------------------------------------
   PROPS
------------------------------------------------------------------- */
interface ScriptFormProps {
    script?: Script | null;
}

/* ------------------------------------------------------------------
   COMPONENT
------------------------------------------------------------------- */
export function ScriptForm({ script = null }: ScriptFormProps) {
    const [open, setOpen] = useState(false);
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

    /* -----------------------------------------
       Load data when editing
    ------------------------------------------ */
    useEffect(() => {
        if (script && open) {
            form.reset({
                name: script.name,
                placement: script.placement,
                active: script.active,
                content: script.content,
            });
        }

        if (!script && open) {
            form.reset({
                name: '',
                placement: 'head',
                active: true,
                content: '',
            });
        }
    }, [script, open, form]);

    /* -----------------------------------------
       Submit
    ------------------------------------------ */
    function onSubmit(data: ScriptFormValues) {
        if (script) {
            router.put(route('scripts.update', script.id), data, {
                onStart: () => setIsSubmitting(true),
                onFinish: () => setIsSubmitting(false),
                onSuccess: () => setOpen(false),
            });
        } else {
            router.post(route('scripts.store'), data, {
                onStart: () => setIsSubmitting(true),
                onFinish: () => setIsSubmitting(false),
                onSuccess: () => setOpen(false),
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {script ? (
                    <Button variant="secondary" size="icon" title="Editar Script" className="hover:bg-secondary">
                        <Edit className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button>Nuevo Script</Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{script ? 'Editar Script' : 'Agregar Nuevo Script'}</DialogTitle>
                    <DialogDescription>
                        {script ? 'Actualiza la información del script' : 'Agrega un nuevo script personalizado a tu sitio'}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[50vh]">
                    <Form {...form}>
                        <form id="script-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 pr-6 pl-2">
                            {/* Nombre */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del Script</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: Google Analytics" className="h-11" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Estado */}
                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-1">
                                            <FormLabel className="text-base font-semibold">Estado</FormLabel>
                                            <p className="text-muted-foreground text-sm">El script solo se ejecutará si está activo</p>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Ubicación */}
                            <FormField
                                control={form.control}
                                name="placement"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ubicación</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="head">Dentro de &lt;head&gt;</SelectItem>
                                                <SelectItem value="body">Antes de cerrar &lt;/body&gt;</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Contenido */}
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contenido del Script</FormLabel>
                                        <FormControl>
                                            <Textarea className="min-h-[200px] font-mono text-sm" placeholder="<script></script>" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </ScrollArea>
                {/* FOOTER FUERA DEL FORM */}
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>

                    <Button type="submit" form="script-form" disabled={isSubmitting} className="min-w-[160px]">
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Guardando...
                            </span>
                        ) : script ? (
                            'Guardar Cambios'
                        ) : (
                            'Agregar Script'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
