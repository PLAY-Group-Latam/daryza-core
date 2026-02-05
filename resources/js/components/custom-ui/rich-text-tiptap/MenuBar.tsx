'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Editor } from '@tiptap/react';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    ArrowLeft,
    ArrowRight,
    Bold,
    Heading1,
    Heading2,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Underline as UnderlineIcon,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Componente reutilizable para cada botón del toolbar
interface IconButtonProps {
    editor: Editor;
    command: () => void;
    isActive: () => boolean;
    icon: React.ReactNode;
    tooltip: string;
}

const IconButton: React.FC<IconButtonProps> = ({
    editor,
    command,
    isActive,
    icon,
    tooltip,
}) => {
    const [active, setActive] = useState(isActive());

    useEffect(() => {
        const listener = () => setActive(isActive());
        editor.on('transaction', listener);
        editor.on('selectionUpdate', listener);

        return () => {
            editor.off('transaction', listener);
            editor.off('selectionUpdate', listener);
        };
    }, [editor, isActive]);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    size="icon"
                    variant={active ? 'default' : 'outline'}
                    onClick={command}
                >
                    {icon}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    );
};

interface MenuBarProps {
    editor: Editor | null;
}

export const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
    const [url, setUrl] = useState('');
    const [activePopover, setActivePopover] = useState<'link' | 'image' | null>(
        null,
    );

    if (!editor) return null;

    const applyURL = () => {
        if (!url) return;
        if (activePopover === 'link')
            editor.chain().focus().setLink({ href: url }).run();
        if (activePopover === 'image')
            editor.chain().focus().setImage({ src: url }).run();
        setUrl('');
        setActivePopover(null);
    };

    return (
        <div className="flex flex-wrap gap-2 border-b p-2">
            <IconButton
                editor={editor}
                command={() => editor.chain().focus().undo().run()}
                isActive={() => false}
                icon={<ArrowLeft className="h-4 w-4" />}
                tooltip="Deshacer"
            />

            <IconButton
                editor={editor}
                command={() => editor.chain().focus().redo().run()}
                isActive={() => false}
                icon={<ArrowRight className="h-4 w-4" />}
                tooltip="Rehacer"
            />

            <IconButton
                editor={editor}
                command={() => editor.chain().focus().toggleBold().run()}
                isActive={() => editor.isActive('bold')}
                icon={<Bold className="h-4 w-4" />}
                tooltip="Negrita"
            />

            <IconButton
                editor={editor}
                command={() => editor.chain().focus().toggleItalic().run()}
                isActive={() => editor.isActive('italic')}
                icon={<Italic className="h-4 w-4" />}
                tooltip="Cursiva"
            />

            <IconButton
                editor={editor}
                command={() => editor.chain().focus().toggleUnderline().run()}
                isActive={() => editor.isActive('underline')}
                icon={<UnderlineIcon className="h-4 w-4" />}
                tooltip="Subrayado"
            />

            <IconButton
                editor={editor}
                command={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                isActive={() => editor.isActive('heading', { level: 1 })}
                icon={<Heading1 className="h-4 w-4" />}
                tooltip="Encabezado H1"
            />

            <IconButton
                editor={editor}
                command={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                isActive={() => editor.isActive('heading', { level: 2 })}
                icon={<Heading2 className="h-4 w-4" />}
                tooltip="Encabezado H2"
            />

            <IconButton
                editor={editor}
                command={() => editor.chain().focus().toggleBulletList().run()}
                isActive={() => editor.isActive('bulletList')}
                icon={<List className="h-4 w-4" />}
                tooltip="Lista desordenada"
            />

            <IconButton
                editor={editor}
                command={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={() => editor.isActive('orderedList')}
                icon={<ListOrdered className="h-4 w-4" />}
                tooltip="Lista ordenada"
            />

            {/* Link Popover */}
            <Popover
                open={activePopover === 'link'}
                onOpenChange={(open) => setActivePopover(open ? 'link' : null)}
            >
                <PopoverTrigger asChild>
                    <Button type="button" size="icon" variant="outline">
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[250px] rounded-t-none"
                    sideOffset={8}
                >
                    <div className="flex flex-col gap-2">
                        <Input
                            placeholder="https://ejemplo.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <Button type="button" onClick={applyURL}>
                            Aplicar
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Image Popover */}
            {/* Image Popover */}
            <Popover
                open={activePopover === 'image'}
                onOpenChange={(open) => setActivePopover(open ? 'image' : null)}
            >
                <PopoverTrigger asChild>
                    <Button type="button" size="icon" variant="outline">
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[300px] rounded-t-none"
                    sideOffset={8}
                >
                    <div className="flex flex-col gap-2">
                        {/* Input de URL */}
                        <Input
                            placeholder="https://ejemplo.com/imagen.png"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <Button type="button" onClick={applyURL}>
                            Aplicar URL
                        </Button>

                        <div className="my-2 border-t border-gray-200"></div>

                        {/* Input de archivo */}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="image-upload-input"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const reader = new FileReader();
                                reader.onload = () => {
                                    editor
                                        ?.chain()
                                        .focus()
                                        .setImage({
                                            src: reader.result as string,
                                        })
                                        .run();
                                };
                                reader.readAsDataURL(file);
                                setActivePopover(null); // cerrar popover
                            }}
                        />
                        <label
                            htmlFor="image-upload-input"
                            className="cursor-pointer rounded-md bg-secondary p-2 text-center text-sm hover:bg-secondary/80"
                        >
                            Subir Imagen
                        </label>
                    </div>
                </PopoverContent>
            </Popover>

            <IconButton
                editor={editor}
                command={() =>
                    editor.chain().focus().setTextAlign('left').run()
                }
                isActive={() => editor.isActive({ textAlign: 'left' })}
                icon={<AlignLeft className="h-4 w-4" />}
                tooltip="Alinear a la izquierda"
            />

            <IconButton
                editor={editor}
                command={() =>
                    editor.chain().focus().setTextAlign('center').run()
                }
                isActive={() => editor.isActive({ textAlign: 'center' })}
                icon={<AlignCenter className="h-4 w-4" />}
                tooltip="Centrar"
            />

            <IconButton
                editor={editor}
                command={() =>
                    editor.chain().focus().setTextAlign('right').run()
                }
                isActive={() => editor.isActive({ textAlign: 'right' })}
                icon={<AlignRight className="h-4 w-4" />}
                tooltip="Alinear a la derecha"
            />
        </div>
    );
};
