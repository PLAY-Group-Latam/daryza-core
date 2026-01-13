/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form } from '@inertiajs/react';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../ui/alert-dialog';

/** Interfaz para helpers de rutas */
interface RouteHelper {
    destroy: (...args: any[]) => {
        url: string;
        method: 'get' | 'post' | 'put' | 'patch' | 'delete';
    };
}

interface ConfirmDeleteAlertProps {
    /** ID del recurso a eliminar */
    resourceId: number | string;

    /** Nombre o descripción del recurso a mostrar */
    resourceName?: string;

    /** Helper de rutas (por ejemplo: users, products, etc.) */
    routes: RouteHelper;

    /** Palabra que el usuario debe escribir para confirmar */
    confirmWord?: string;

    /** Mensaje personalizado de éxito */
    successMessage?: string;

    /** Trigger visual que abre el modal */
    trigger: React.ReactNode;
}

export function ConfirmDeleteAlert({
    resourceId,
    resourceName,
    routes,
    trigger,
    confirmWord = 'ELIMINAR',
}: ConfirmDeleteAlertProps) {
    const [input, setInput] = useState('');
    const [open, setOpen] = useState(false);
    const disabled = input.trim().toUpperCase() !== confirmWord.toUpperCase();

    const { url, method } = routes.destroy(resourceId);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

            <AlertDialogContent className="max-w-md">
                <Form
                    method={method}
                    action={url}
                    onSuccess={() => {
                        setInput('');
                        setOpen(false);
                    }}
                    onError={() => toast.error('Ocurrió un error al eliminar.')}
                >
                    {({ processing }) => (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    ¿Seguro que deseas eliminar?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="space-y-2">
                                    Esta acción no se puede deshacer. Esto
                                    eliminará permanentemente {''}
                                    <span className="font-semibold">
                                        {resourceName ?? 'este registro'}
                                    </span>
                                    .
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="space-y-1.5 py-4">
                                <p className="text-sm text-muted-foreground">
                                    Para confirmar, escribe{' '}
                                    <span className="font-semibold">
                                        {confirmWord.toUpperCase()}
                                    </span>{' '}
                                    en el campo siguiente.
                                </p>
                                <Input
                                    placeholder="Escribe aquí..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={processing}
                                />
                            </div>

                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={processing}>
                                    Cancelar
                                </AlertDialogCancel>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={disabled || processing}
                                >
                                    {processing && (
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </Button>
                            </AlertDialogFooter>
                        </>
                    )}
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
