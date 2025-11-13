import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface FlashMessage {
    message?: string;
    type?: 'success' | 'error';
}

export const useFlashMessage = () => {
    const { props } = usePage<SharedData>();
    // Si props.flash no existe, lo tratamos como un objeto vacío
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const flash = (props?.flash ?? {}) as FlashMessage;

    const lastMessage = useRef<string | null>(null);

    useEffect(() => {
        if (!flash.message) return;

        // Evita mostrar dos veces el mismo mensaje
        if (flash.message === lastMessage.current) return;
        lastMessage.current = flash.message;

        if (flash.type === 'success') {
            toast.success(flash.message);
        } else if (flash.type === 'error') {
            toast.error(flash.message);
        }
    }, [flash]);

    return { flash };
};
