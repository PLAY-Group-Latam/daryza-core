/* eslint-disable @typescript-eslint/no-unused-vars */
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useFlashMessage = () => {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    const errors = props.errors as Record<string, string>;

    useEffect(() => {
        // 1. Mensajes Flash de Sesión
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }

        // 2. Errores de Validación (Todos)
        const errorEntries = Object.entries(errors);

        if (errorEntries.length > 0) {
            errorEntries.forEach(([_, message]) => {
                // Mostramos un toast por cada error
                toast.error(message);
                // Si quieres ser más específico: toast.error(`${field}: ${message}`);
            });
        }
    }, [flash, errors]);
};
