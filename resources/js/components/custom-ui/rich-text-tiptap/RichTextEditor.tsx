'use client';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';
import '../../../../css/tiptap.css';
import { MenuBar } from './MenuBar';
import { ImageExtension } from './extension/Image-extension';
interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isUpdatingRef = useRef(false);
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyleKit,

            ImageExtension.configure({
                allowBase64: true,
            }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({
                placeholder: 'Escribe aquí...',
            }),
        ],
        content: value || '',

        onUpdate: ({ editor }) => {
            if (isUpdatingRef.current) return;

            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                onChange(editor.getHTML());
            }, 400);
        },

        editorProps: {
            attributes: {
                class: 'focus:outline-none overflow-y-auto ',
                spellcheck: 'false', // 🔥 esto
            },
        },
    });

    // Si el value externo cambia, actualizamos el editor
    useEffect(() => {
        if (!editor || !value) return;

        const current = editor.getHTML();

        if (value !== current) {
            isUpdatingRef.current = true;

            try {
                editor.commands.setContent(value, {
                    emitUpdate: false,
                });
            } finally {
                isUpdatingRef.current = false;
            }
        }
    }, [value]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div className="rounded-xl border">
            <MenuBar editor={editor} />
            <div className="px-2">
                <EditorContent
                    editor={editor}
                    className="rich-editor not-prose"
                />
            </div>
        </div>
    );
}
