'use client';

import type { Editor } from '@tiptap/react';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    ArrowLeft,
    ArrowRight,
    Bold,
    Highlighter,
    Italic,
    List,
    ListOrdered,
    Palette,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    Underline as UnderlineIcon,
} from 'lucide-react';

import { TooltipProvider } from '@/components/ui/tooltip';

import type { UploadImage } from '../types';
import { ColorPicker } from './ColorPicker';
import { HeadingSelect } from './HeadingSelect';
import { ImageButton } from './ImageButton';
import { LinkButton } from './LinkButton';
import { TableMenu } from './TableMenu';
import { ToolbarButton, ToolbarDivider } from './ToolbarButton';
import { useEditorRefresh } from './useEditorRefresh';

interface MenuBarProps {
    editor: Editor | null;
    uploadImage?: UploadImage;
}

export function MenuBar({ editor, uploadImage }: MenuBarProps) {
    useEditorRefresh(editor);

    if (!editor) return null;

    return (
        <TooltipProvider>
            <div className="flex flex-wrap items-center gap-1.5 border-b p-2">
                {/* Historial */}
                <ToolbarButton
                    command={() => editor.chain().focus().undo().run()}
                    isActive={() => false}
                    icon={<ArrowLeft className="h-4 w-4" />}
                    tooltip="Deshacer"
                />
                <ToolbarButton
                    command={() => editor.chain().focus().redo().run()}
                    isActive={() => false}
                    icon={<ArrowRight className="h-4 w-4" />}
                    tooltip="Rehacer"
                />

                <ToolbarDivider />

                {/* Párrafo / Encabezados */}
                <HeadingSelect editor={editor} />

                <ToolbarDivider />

                {/* Formato de texto */}
                <ToolbarButton
                    command={() => editor.chain().focus().toggleBold().run()}
                    isActive={() => editor.isActive('bold')}
                    icon={<Bold className="h-4 w-4" />}
                    tooltip="Negrita"
                />
                <ToolbarButton
                    command={() => editor.chain().focus().toggleItalic().run()}
                    isActive={() => editor.isActive('italic')}
                    icon={<Italic className="h-4 w-4" />}
                    tooltip="Cursiva"
                />
                <ToolbarButton
                    command={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    isActive={() => editor.isActive('underline')}
                    icon={<UnderlineIcon className="h-4 w-4" />}
                    tooltip="Subrayado"
                />
                <ToolbarButton
                    command={() =>
                        editor.chain().focus().toggleSubscript().run()
                    }
                    isActive={() => editor.isActive('subscript')}
                    icon={<SubscriptIcon className="h-4 w-4" />}
                    tooltip="Subíndice"
                />
                <ToolbarButton
                    command={() =>
                        editor.chain().focus().toggleSuperscript().run()
                    }
                    isActive={() => editor.isActive('superscript')}
                    icon={<SuperscriptIcon className="h-4 w-4" />}
                    tooltip="Superíndice"
                />

                <ToolbarDivider />

                {/* Color de texto y resaltado */}
                <ColorPicker
                    editor={editor}
                    kind="text"
                    icon={<Palette className="h-4 w-4" />}
                    tooltip="Color de texto"
                    isTriggerActive={() =>
                        editor.isActive('textStyle') &&
                        !!editor.getAttributes('textStyle').color
                    }
                />
                <ColorPicker
                    editor={editor}
                    kind="highlight"
                    icon={<Highlighter className="h-4 w-4" />}
                    tooltip="Color de resaltado"
                    isTriggerActive={() => editor.isActive('highlight')}
                />

                <ToolbarDivider />

                {/* Alineación */}
                <ToolbarButton
                    command={() =>
                        editor.chain().focus().setTextAlign('left').run()
                    }
                    isActive={() => editor.isActive({ textAlign: 'left' })}
                    icon={<AlignLeft className="h-4 w-4" />}
                    tooltip="Alinear a la izquierda"
                />
                <ToolbarButton
                    command={() =>
                        editor.chain().focus().setTextAlign('center').run()
                    }
                    isActive={() => editor.isActive({ textAlign: 'center' })}
                    icon={<AlignCenter className="h-4 w-4" />}
                    tooltip="Centrar"
                />
                <ToolbarButton
                    command={() =>
                        editor.chain().focus().setTextAlign('right').run()
                    }
                    isActive={() => editor.isActive({ textAlign: 'right' })}
                    icon={<AlignRight className="h-4 w-4" />}
                    tooltip="Alinear a la derecha"
                />

                <ToolbarDivider />

                {/* Listas */}
                <ToolbarButton
                    command={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    isActive={() => editor.isActive('bulletList')}
                    icon={<List className="h-4 w-4" />}
                    tooltip="Lista desordenada"
                />
                <ToolbarButton
                    command={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    isActive={() => editor.isActive('orderedList')}
                    icon={<ListOrdered className="h-4 w-4" />}
                    tooltip="Lista ordenada"
                />

                <ToolbarDivider />

                {/* Enlace e imagen */}
                <LinkButton editor={editor} />
                <ImageButton editor={editor} uploadImage={uploadImage} />

                <ToolbarDivider />

                {/* Tabla */}
                <TableMenu editor={editor} />
            </div>
        </TooltipProvider>
    );
}
