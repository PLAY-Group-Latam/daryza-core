'use client';

import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import {
    Table,
    TableCell,
    TableHeader,
    TableRow,
} from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';

import '../../../../css/tiptap.css';
import { ImageExtension } from './extension/Image-extension';
import { MenuBar } from './MenuBar';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    uploadImage?: (file: File) => Promise<string | null>;
}

function cleanWordPastedHtml(html: string): string {
    let cleaned = html;

    // Eliminar comentarios condicionales y normales de Word
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

    // Eliminar etiquetas de namespaces de Office (<o:p>, <w:...>, etc.)
    cleaned = cleaned.replace(/<\/?(?:o|w|m|v):[^>]*>/gi, '');

    // Quitar clases Mso* de Word
    cleaned = cleaned.replace(/\sclass="[^"]*Mso[^"]*"/gi, '');

    // Quitar dimensiones y estilos inline rígidos en estructuras de tabla
    cleaned = cleaned.replace(
        /<(table|thead|tbody|tr|td|th)([^>]*)>/gi,
        (_match, tag, attrs) => {
            const cleanedAttrs = attrs
                .replace(/\s(?:width|height)="[^"]*"/gi, '')
                .replace(/\sstyle="[^"]*"/gi, '');
            return `<${tag}${cleanedAttrs}>`;
        },
    );

    return cleaned;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Escribe aquí...',
    readOnly = false,
    uploadImage,
}: RichTextEditorProps) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isUpdatingRef = useRef(false);

    const editor = useEditor({
        editable: !readOnly,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4],
                },
            }),
            Link.configure({
                openOnClick: false,
            }),
            Subscript,
            Superscript,
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true, // Permite usar cualquier color en el resaltador
            }),
            ImageExtension.configure({
                allowBase64: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph', 'tableCell', 'tableHeader'],
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value || '',

        onUpdate: ({ editor }) => {
            if (isUpdatingRef.current) return;

            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // Debounce de 300ms para cambios fluidos en formularios
            timeoutRef.current = setTimeout(() => {
                const html = editor.getHTML();
                const cleanHtml = editor.isEmpty ? '' : html;
                onChange(cleanHtml);
            }, 300);
        },

        editorProps: {
            transformPastedHTML: cleanWordPastedHtml,
            attributes: {
                class: 'focus:outline-none min-h-[150px] p-3 overflow-y-auto',
                spellcheck: 'false',
            },
        },
    });

    // Sincronización bidireccional limpia (External Value -> TipTap)
    useEffect(() => {
        if (!editor) return;

        const currentHtml = editor.getHTML();
        const normalize = (v: string) => (v === '<p></p>' ? '' : v);

        if (normalize(value) !== normalize(currentHtml)) {
            isUpdatingRef.current = true;

            try {
                editor.commands.setContent(value || '', {
                    emitUpdate: false,
                });
            } finally {
                isUpdatingRef.current = false;
            }
        }
    }, [value, editor]);

    // Cleanup del timer
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Actualización dinámicas del modo editable/readOnly
    useEffect(() => {
        if (editor && editor.isEditable !== !readOnly) {
            editor.setEditable(!readOnly);
        }
    }, [readOnly, editor]);

    return (
        <div className="rounded-xl border border-input bg-background transition-colors focus-within:ring-1 focus-within:ring-ring">
            <MenuBar editor={editor} uploadImage={uploadImage} />
            <div className="px-2 pb-2">
                <EditorContent
                    editor={editor}
                    className="rich-editor not-prose prose-sm max-w-none"
                />
            </div>
        </div>
    );
}