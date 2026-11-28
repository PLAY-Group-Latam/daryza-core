import type { Editor } from '@tiptap/react';

import { GCS_HOST } from './constants';

export const duplicateContent = (editor: Editor) => {
    const { view } = editor;
    const { state } = view;
    const { selection } = state;

    editor
        .chain()
        .insertContentAt(
            selection.to,
            selection.content().content.firstChild?.toJSON(),
            {
                updateSelection: true,
            },
        )
        .focus(selection.to)
        .run();
};

export const isGcsUrl = (url: string): boolean => {
    try {
        return new URL(url).hostname === GCS_HOST;
    } catch {
        return false;
    }
};

export const cleanWordPastedHtml = (html: string): string => {
    let cleaned = html;

    // Eliminar comentarios condicionales y normales de Word
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

    // Eliminar el documento y las hojas de estilo que Word incrusta
    // (no son renderizables fuera de Word y rompen el layout).
    cleaned = cleaned.replace(
        /<\/?(?:html|head|body|meta|link|style)[^>]*>/gi,
        '',
    );

    // Eliminar etiquetas de namespaces de Office (<o:p>, <w:...>, etc.)
    cleaned = cleaned.replace(/<\/?(?:o|w|m|v):[^>]*>/gi, '');

    // Eliminar SOLO las propiedades CSS `mso-*` (no tienen efecto en el
    // navegador), conservando el resto de estilos inline (fuente, tamaño,
    // color, bordes, alineación…) tal cual vienen de Word.
    cleaned = cleaned.replace(/mso-[a-z-]+(?::[^;"]*)?;?/gi, '');

    // Quitar clases de Word que ya no tienen hoja de estilo asociada
    // (la información visual vive en los estilos inline, que se conservan).
    cleaned = cleaned.replace(/\sclass="[^"]*"/gi, '');

    return cleaned;
};
