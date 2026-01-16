import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export const useFlashMessage = () => {
    const { flash, errors } = usePage().props as {
        flash?: {
            success?: string;
            error?: string;
        };
        errors?: Record<string, string>;
    };
        const shownRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (flash?.success && !shownRef.current.has(flash.success)) {
            shownRef.current.add(flash.success);
            toast.success(flash.success);
        }

        if (flash?.error && !shownRef.current.has(flash.error)) {
            shownRef.current.add(flash.error);
            toast.error(flash.error);
        }

        const firstError = errors && Object.values(errors)[0];
        if (firstError && !shownRef.current.has(firstError)) {
            shownRef.current.add(firstError);
            toast.error(firstError);
        }
    }, [flash?.success, flash?.error, errors]);

};

