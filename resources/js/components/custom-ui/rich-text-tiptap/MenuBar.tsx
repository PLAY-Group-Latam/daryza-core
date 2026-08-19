'use client';

import { Editor } from '@tiptap/react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    ArrowLeft,
    ArrowRight,
    Bold,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Palette,
    Underline as UnderlineIcon,
} from 'lucide-react';

const COLOR_PALETTE = [
    [
        '#000000',
        '#434343',
        '#666666',
        '#999999',
        '#b7b7b7',
        '#cccccc',
        '#d9d9d9',
        '#efefef',
        '#f3f3f3',
        '#ffffff',
    ],
    [
        '#ff0000',
        '#ff4e00',
        '#ff9900',
        '#fad900',
        '#99cc00',
        '#33cc99',
        '#3399ff',
        '#0033cc',
        '#762ca7',
        '#ff0099',
    ],
    [
        '#ffcccc',
        '#ffe6cc',
        '#ffffcc',
        '#e6f2ff',
        '#e6f7ff',
        '#e6e6ff',
        '#f2e6ff',
        '#ffe6f2',
        '#f9f9f9',
        '#f0f0f0',
    ],
    [
        '#ea9999',
        '#f9cb9c',
        '#ffe599',
        '#b6d7a8',
        '#a2c4c9',
        '#9fc5e8',
        '#b4a7d6',
        '#d5a6bd',
        '#e2e2e2',
        '#dcdcdc',
    ],
    [
        '#e06666',
        '#f6b26b',
        '#ffd966',
        '#93c47d',
        '#76a5af',
        '#6fa8dc',
        '#8e7cc3',
        '#c27ba0',
        '#c8c8c8',
        '#b4b4b4',
    ],
    [
        '#cc0000',
        '#e69138',
        '#f1c232',
        '#6aa84f',
        '#45818e',
        '#3d85c6',
        '#674ea7',
        '#a64d79',
        '#969696',
        '#828282',
    ],
    [
        '#990000',
        '#b45f06',
        '#bf9000',
        '#38761d',
        '#134f5c',
        '#0b5394',
        '#351c75',
        '#741b47',
        '#595959',
        '#464646',
    ],
    [
        '#660000',
        '#783f04',
        '#7f6000',
        '#274e13',
        '#0c343d',
        '#073763',
        '#20124d',
        '#4c1130',
        '#222222',
        '#111111',
    ],
];

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
    /**
     * Función de subida centralizada, provista por RichTextEditor.
     * Sube el archivo a GCS y retorna la URL pública, o null si falla.
     */
    uploadImage?: (file: File) => Promise<string | null>;
}

export const MenuBar: React.FC<MenuBarProps> = ({ editor, uploadImage }) => {
    const MAX_INLINE_IMAGE_MB = 5;
    const MAX_INLINE_IMAGE_BYTES = MAX_INLINE_IMAGE_MB * 1024 * 1024;

    const [url, setUrl] = useState('');
    const [color, setColor] = useState('#000000');
    const [highlightColor, setHighlightColor] = useState('#ffff00');
    const [activePopover, setActivePopover] = useState<
        'link' | 'image' | 'color' | 'highlight' | null
    >(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!editor) return null;

    const GCS_HOST = 'storage.googleapis.com';

    const isGcsUrl = (u: string) => {
        try {
            return new URL(u).hostname === GCS_HOST;
        } catch {
            return false;
        }
    };

    const applyURL = async () => {
        if (!url.trim()) return;

        // Links normales: insertar directo
        if (activePopover === 'link') {
            editor.chain().focus().setLink({ href: url }).run();
            setUrl('');
            setActivePopover(null);
            return;
        }

        if (activePopover !== 'image') return;

        // URL base64: bloquear siempre
        if (url.startsWith('data:')) {
            toast.error('No se permiten imágenes en Base64.', {
                description:
                    'Sube el archivo directamente o usa una URL pública.',
            });
            return;
        }

        // URL ya en GCS: insertar directo
        if (isGcsUrl(url)) {
            editor.chain().focus().setImage({ src: url }).run();
            setUrl('');
            setActivePopover(null);
            return;
        }

        // Si no hay uploadImage configurado, fallback a enlace directo
        if (!uploadImage) {
            editor.chain().focus().setImage({ src: url }).run();
            setUrl('');
            setActivePopover(null);
            return;
        }

        // URL externa: descargar y subir a GCS
        const uploadToast = toast.loading(
            'Descargando imagen y subiendo a GCS...',
        );

        try {
            const response = await fetch(url, { mode: 'cors' });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const blob = await response.blob();

            if (!blob.type.startsWith('image/')) {
                toast.dismiss(uploadToast);
                toast.error('La URL no apunta a una imagen válida.');
                return;
            }

            const ext = blob.type.split('/')[1] ?? 'jpg';
            const file = new File([blob], `image-from-url.${ext}`, {
                type: blob.type,
            });

            const gcsUrl = await uploadImage(file);

            toast.dismiss(uploadToast);

            if (gcsUrl) {
                editor.chain().focus().setImage({ src: gcsUrl }).run();
                toast.success('Imagen subida a GCS e insertada correctamente.');
                setUrl('');
                setActivePopover(null);
            }
        } catch {
            toast.dismiss(uploadToast);
            // CORS o error de red → insertar URL directo como fallback
            editor.chain().focus().setImage({ src: url }).run();
            toast.warning('Imagen insertada como enlace externo.', {
                description:
                    'No se pudo subir a GCS por restricciones del servidor origen.',
            });
            setUrl('');
            setActivePopover(null);
        }
    };

    const applyColor = (selectedColor: string) => {
        setColor(selectedColor);
        editor.chain().focus().setColor(selectedColor).run();
    };

    const applyHighlight = (selectedColor: string) => {
        setHighlightColor(selectedColor);
        editor.chain().focus().setHighlight({ color: selectedColor }).run();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('El archivo seleccionado no es una imagen válida.');
            e.currentTarget.value = '';
            return;
        }

        if (file.size > MAX_INLINE_IMAGE_BYTES) {
            const currentSizeMb = (file.size / (1024 * 1024)).toFixed(2);
            toast.error(
                `La imagen pesa ${currentSizeMb}MB. Máximo ${MAX_INLINE_IMAGE_MB}MB para el editor.`,
            );
            e.currentTarget.value = '';
            return;
        }

        if (uploadImage) {
            const uploadToast = toast.loading('Subiendo imagen a GCS...');
            try {
                const gcsUrl = await uploadImage(file);
                if (gcsUrl) {
                    editor.chain().focus().setImage({ src: gcsUrl }).run();
                    toast.success('Imagen insertada con éxito.');
                    setActivePopover(null);
                }
            } finally {
                toast.dismiss(uploadToast);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } else {
            // Fallback a Base64 local si no se provee uploadImage
            const reader = new FileReader();
            reader.onload = () => {
                editor
                    .chain()
                    .focus()
                    .setImage({ src: reader.result as string })
                    .run();
                setActivePopover(null);
            };
            reader.readAsDataURL(file);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <TooltipProvider>
            <div className="flex flex-wrap items-center gap-1.5 border-b p-2">
                {/* Deshacer / Rehacer */}
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

                <div className="mx-1 h-5 w-[1px] bg-border" />

                {/* Formato Básico */}
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
                    command={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    isActive={() => editor.isActive('underline')}
                    icon={<UnderlineIcon className="h-4 w-4" />}
                    tooltip="Subrayado"
                />

                <div className="mx-1 h-5 w-[1px] bg-border" />

                {/* Encabezados */}
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
                    command={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    isActive={() => editor.isActive('heading', { level: 3 })}
                    icon={<Heading3 className="h-4 w-4" />}
                    tooltip="Encabezado H3"
                />

                <div className="mx-1 h-5 w-[1px] bg-border" />

                {/* Listas */}
                <IconButton
                    editor={editor}
                    command={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    isActive={() => editor.isActive('bulletList')}
                    icon={<List className="h-4 w-4" />}
                    tooltip="Lista desordenada"
                />
                <IconButton
                    editor={editor}
                    command={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    isActive={() => editor.isActive('orderedList')}
                    icon={<ListOrdered className="h-4 w-4" />}
                    tooltip="Lista ordenada"
                />

                <div className="mx-1 h-5 w-[1px] bg-border" />

                {/* Color de Texto */}
                <Tooltip>
                    <Popover
                        open={activePopover === 'color'}
                        onOpenChange={(open) =>
                            setActivePopover(open ? 'color' : null)
                        }
                    >
                        <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant={
                                        editor.isActive('textStyle') &&
                                        editor.getAttributes('textStyle').color
                                            ? 'default'
                                            : 'outline'
                                    }
                                >
                                    <Palette className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                        </TooltipTrigger>
                        <PopoverContent
                            className="w-[260px] p-3"
                            sideOffset={8}
                        >
                            <div className="flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-full justify-start gap-2 px-2 text-xs hover:bg-neutral-100"
                                    onClick={() => {
                                        editor
                                            .chain()
                                            .focus()
                                            .unsetColor()
                                            .run();
                                        setActivePopover(null);
                                    }}
                                >
                                    <span className="relative block h-4 w-4 rounded-sm border border-dashed border-neutral-400 after:absolute after:top-1/2 after:left-0 after:h-[1px] after:w-full after:-rotate-45 after:bg-red-500 after:content-['']" />
                                    Color predeterminado
                                </Button>

                                <div className="flex flex-col gap-[2px]">
                                    {COLOR_PALETTE.map((row, rowIndex) => (
                                        <div
                                            key={rowIndex}
                                            className="flex gap-[2px]"
                                        >
                                            {row.map((hex) => (
                                                <button
                                                    key={hex}
                                                    type="button"
                                                    onClick={() => {
                                                        applyColor(hex);
                                                        setActivePopover(null);
                                                    }}
                                                    className="relative flex h-5 w-5 items-center justify-center rounded-[2px] border border-black/5 transition-transform hover:scale-110"
                                                    style={{
                                                        backgroundColor: hex,
                                                    }}
                                                    title={hex}
                                                >
                                                    {color === hex && (
                                                        <svg
                                                            className="h-2.5 w-2.5"
                                                            viewBox="0 0 10 10"
                                                            fill="none"
                                                        >
                                                            <path
                                                                d="M1.5 5L4 7.5L8.5 2.5"
                                                                stroke={
                                                                    [
                                                                        '#ffffff',
                                                                        '#f3f3f3',
                                                                        '#efefef',
                                                                        '#d9d9d9',
                                                                        '#cccccc',
                                                                        '#fad900',
                                                                        '#ffff00',
                                                                        '#ffffcc',
                                                                    ].includes(
                                                                        hex,
                                                                    )
                                                                        ? '#555'
                                                                        : 'white'
                                                                }
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-1 flex items-center justify-between gap-2 border-t border-neutral-100 pt-2">
                                    <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-neutral-600 transition-colors hover:text-neutral-900">
                                        <input
                                            type="color"
                                            value={
                                                color.startsWith('#') &&
                                                color.length === 7
                                                    ? color
                                                    : '#000000'
                                            }
                                            onChange={(e) =>
                                                applyColor(e.target.value)
                                            }
                                            className="h-4 w-4 cursor-pointer rounded-sm border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-[1px] [&::-webkit-color-swatch]:border-neutral-300 [&::-webkit-color-swatch-wrapper]:p-0"
                                        />
                                        Más colores
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase">
                                            HEX:
                                        </span>
                                        <Input
                                            type="text"
                                            value={color}
                                            onChange={(e) =>
                                                applyColor(e.target.value)
                                            }
                                            className="h-5 w-16 border-neutral-200 bg-neutral-50 px-1 py-0 text-center font-mono text-[10px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <TooltipContent>Color de texto</TooltipContent>
                </Tooltip>

                {/* Resaltado (Highlight) */}
                <Tooltip>
                    <Popover
                        open={activePopover === 'highlight'}
                        onOpenChange={(open) =>
                            setActivePopover(open ? 'highlight' : null)
                        }
                    >
                        <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant={
                                        editor.isActive('highlight')
                                            ? 'default'
                                            : 'outline'
                                    }
                                >
                                    <Highlighter className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                        </TooltipTrigger>
                        <PopoverContent
                            className="w-[260px] p-3"
                            sideOffset={8}
                        >
                            <div className="flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-full justify-start gap-2 px-2 text-xs hover:bg-neutral-100"
                                    onClick={() => {
                                        editor
                                            .chain()
                                            .focus()
                                            .unsetHighlight()
                                            .run();
                                        setActivePopover(null);
                                    }}
                                >
                                    <span className="relative block h-4 w-4 rounded-sm border border-dashed border-neutral-400 after:absolute after:top-1/2 after:left-0 after:h-[1px] after:w-full after:-rotate-45 after:bg-red-500 after:content-['']" />
                                    Sin relleno
                                </Button>

                                <div className="flex flex-col gap-[2px]">
                                    {COLOR_PALETTE.map((row, rowIndex) => (
                                        <div
                                            key={rowIndex}
                                            className="flex gap-[2px]"
                                        >
                                            {row.map((hex) => (
                                                <button
                                                    key={hex}
                                                    type="button"
                                                    onClick={() => {
                                                        applyHighlight(hex);
                                                        setActivePopover(null);
                                                    }}
                                                    className="relative flex h-5 w-5 items-center justify-center rounded-[2px] border border-black/5 transition-transform hover:scale-110"
                                                    style={{
                                                        backgroundColor: hex,
                                                    }}
                                                    title={hex}
                                                >
                                                    {/* EVALUACIÓN DIRECTA DESDE TIPTAP */}
                                                    {editor.isActive(
                                                        'highlight',
                                                        { color: hex },
                                                    ) && (
                                                        <svg
                                                            className="h-2.5 w-2.5"
                                                            viewBox="0 0 10 10"
                                                            fill="none"
                                                        >
                                                            <path
                                                                d="M1.5 5L4 7.5L8.5 2.5"
                                                                stroke={
                                                                    [
                                                                        '#ffffff',
                                                                        '#f3f3f3',
                                                                        '#efefef',
                                                                        '#d9d9d9',
                                                                        '#cccccc',
                                                                        '#fad900',
                                                                        '#ffff00',
                                                                        '#ffffcc',
                                                                    ].includes(
                                                                        hex,
                                                                    )
                                                                        ? '#555'
                                                                        : 'white'
                                                                }
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <TooltipContent>Cdadolor de resaltado</TooltipContent>
                </Tooltip>

                <div className="mx-1 h-5 w-[1px] bg-border" />

                {/* Popover Enlace */}
                <Popover
                    open={activePopover === 'link'}
                    onOpenChange={(open) =>
                        setActivePopover(open ? 'link' : null)
                    }
                >
                    <PopoverTrigger asChild>
                        <Button type="button" size="icon" variant="outline">
                            <LinkIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" sideOffset={8}>
                        <div className="flex flex-col gap-2">
                            <Input
                                placeholder="https://ejemplo.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                            <Button type="button" onClick={applyURL}>
                                Aplicar enlace
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Popover Imagen */}
                <Popover
                    open={activePopover === 'image'}
                    onOpenChange={(open) =>
                        setActivePopover(open ? 'image' : null)
                    }
                >
                    <PopoverTrigger asChild>
                        <Button type="button" size="icon" variant="outline">
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-3" sideOffset={8}>
                        <div className="flex flex-col gap-2">
                            <Input
                                placeholder="https://ejemplo.com/imagen.png"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                            <Button type="button" onClick={applyURL}>
                                Aplicar URL
                            </Button>

                            <div className="my-1 border-t border-neutral-200" />

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="image-upload-input"
                                onChange={handleFileChange}
                            />
                            <label
                                htmlFor="image-upload-input"
                                className="cursor-pointer rounded-md bg-secondary p-2 text-center text-sm font-medium transition-colors hover:bg-secondary/80"
                            >
                                Subir Imagen
                            </label>
                        </div>
                    </PopoverContent>
                </Popover>

                <div className="mx-1 h-5 w-[1px] bg-border" />

                {/* Alineaciones */}
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
        </TooltipProvider>
    );
};
