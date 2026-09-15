'use client';

import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
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
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Escribe aquí...',
    readOnly = false,
}: RichTextEditorProps) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isUpdatingRef = useRef(false);

    const editor = useEditor({
        editable: !readOnly,
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true, // Permite usar cualquier color en el resaltador
            }),
            ImageExtension.configure({
                allowBase64: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
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
            <MenuBar editor={editor} />
            <div className="px-2 pb-2">
                <EditorContent
                    editor={editor}
                    className="rich-editor not-prose prose-sm max-w-none"
                />
            </div>
        </div>
    );
}