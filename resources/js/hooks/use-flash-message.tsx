import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useFlashMessage = () => {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash?.type && flash?.message) {
            toast[flash.type](flash.message);
        }
    }, [flash]);
};
