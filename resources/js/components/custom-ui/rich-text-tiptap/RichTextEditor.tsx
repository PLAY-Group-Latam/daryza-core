'use client';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import '../../../../css/tiptap.css';
import { MenuBar } from './MenuBar';
import { ImageExtension } from './extension/Image-extension';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            ImageExtension,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({
                placeholder: 'Escribe aquí...',
            }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: ' focus:outline-none overflow-y-auto ',
            },
        },
    });

    // Si el value externo cambia, actualizamos el editor
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '');
        }
    }, [value, editor]);

    return (
        <div className="rounded-xl border">
            <MenuBar editor={editor} />
            <div className="px-2">
                <EditorContent editor={editor} className="rich-editor" />
            </div>
        </div>
    );
}
