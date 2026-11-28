import type { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';

/**
 * Fuerza un re-render del toolbar cuando cambia el estado del editor
 * (selección, marcas activas, etc.), para que los controles reflejen el
 * formato activo de forma reactiva.
 *
 * Se suscribe únicamente al evento `transaction` y agrupa los cambios en un
 * `requestAnimationFrame`, de modo que múltiples transacciones sincrónicas
 * (p. ej. pegar contenido) solo provoquen un único re-render por frame.
 */
export function useEditorRefresh(editor: Editor | null) {
    const [, setTick] = useState(0);

    useEffect(() => {
        if (!editor) return;

        let frame = 0;

        const refresh = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => setTick((tick) => tick + 1));
        };

        editor.on('transaction', refresh);

        return () => {
            cancelAnimationFrame(frame);
            editor.off('transaction', refresh);
        };
    }, [editor]);
}
