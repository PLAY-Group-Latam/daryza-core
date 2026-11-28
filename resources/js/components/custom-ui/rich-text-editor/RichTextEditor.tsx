'use client';

import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table, TableCell, TableHeader } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ImageExtension } from './extensions/ImageExtension';
import { ResizableTableColumn } from './extensions/ResizableTableColumn';
import { ResizableTableRow } from './extensions/ResizableTableRow';
import { MenuBar } from './toolbar/MenuBar';
import { TableBubbleMenu } from './toolbar/TableBubbleMenu';
import type { RichTextEditorProps } from './types';
import { cleanWordPastedHtml } from './utils';

import './rich-text-editor.css';

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Escribe aquí...',
    readOnly = false,
    uploadImage,
}: RichTextEditorProps) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isUpdatingRef = useRef(false);
    // Contenido inicial capturado una sola vez (TipTap solo lo usa al crear el editor).
    const [initialContent] = useState(() => value);

    // Las extensiones se memoizan para que TipTap no reconstruya plugins/estado
    // en cada render (comparación por referencia en `setOptions`).
    const extensions = useMemo(
        () => [
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
            FontFamily,
            FontSize,
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
                resizable: false,
                cellMinWidth: 40,
            }),
            ResizableTableRow,
            ResizableTableColumn,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder,
            }),
        ],
        [placeholder],
    );

    const editorProps = useMemo(
        () => ({
            transformPastedHTML: cleanWordPastedHtml,
            attributes: {
                class: 'focus:outline-none min-h-[150px] p-3 overflow-y-auto',
                spellcheck: 'false',
            },
        }),
        [],
    );

    const editor = useEditor({
        editable: !readOnly,
        extensions,
        content: initialContent,
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
        editorProps,
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

    // Actualización dinámica del modo editable/readOnly
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
            {editor && <TableBubbleMenu editor={editor} />}
        </div>
    );
}
