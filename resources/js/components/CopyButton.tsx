import { copyTextToClipboard } from '@/lib/utils/copyTextToClipboard';
import { Clipboard } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface CopyButtonProps {
    textToCopy: string;
    ariaLabel?: string;
}

export function CopyButton({
    textToCopy,
    ariaLabel = 'Copiar al portapapeles',
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    // Memoizamos la función para evitar recrearla en cada render
    const handleClick = useCallback(() => {
        copyTextToClipboard(textToCopy, () => {
            setCopied(true);
        });
    }, [textToCopy]);

    // Limpiamos el estado "copied" después de 1.5 segundos para ocultar el tooltip
    useEffect(() => {
        if (!copied) return;

        const timeoutId = window.setTimeout(() => {
            setCopied(false);
        }, 1500);

        return () => clearTimeout(timeoutId);
    }, [copied]);

    return (
        <button
            type="button"
            aria-label={ariaLabel}
            onClick={handleClick}
            className="relative rounded p-1 transition hover:bg-gray-100 active:bg-gray-200"
        >
            <Clipboard className="h-4 w-4 text-gray-600" />

            {/* Tooltip visual */}
            <span
                className={`tooltip pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white transition-opacity ${
                    copied ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden={!copied}
            >
                ¡Copiado!
            </span>

            {/* Aviso para lectores de pantalla */}
            <span className="sr-only" aria-live="polite" aria-atomic="true">
                {copied ? 'Texto copiado al portapapeles' : ''}
            </span>
        </button>
    );
}
