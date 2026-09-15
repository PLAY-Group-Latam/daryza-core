'use client';

import { router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
    className?: string;
    showText?: boolean;
    refresh?: boolean;
    fallbackUrl?: string;
}

export function BackButton({
    className,
    showText = true,
    refresh = false,
    fallbackUrl,
}: BackButtonProps) {
    const handleBack = () => {
        // Si hay una URL de retorno definida, la usamos directamente para evitar la memoria en caché del navegador
        if (fallbackUrl) {
            router.visit(fallbackUrl, {
                replace: true,
                preserveState: !refresh,
            });
            return;
        }

        if (window.history.length > 1) {
            window.history.back();
            if (refresh) {
                // Se escucha el evento de popstate para forzar la recarga una vez que la página anterior cargue
                window.addEventListener(
                    'popstate',
                    () => {
                        router.reload();
                    },
                    { once: true },
                );
            }
        } else {
            router.visit('/');
        }
    };

    return (
        <button
            type="button"
            onClick={handleBack}
            className={cn(
                'group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground',
                className,
            )}
        >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background transition-colors group-hover:bg-muted">
                <ArrowLeft size={16} />
            </div>

            {showText && <span className="text-sm font-medium">Volver</span>}
        </button>
    );
}