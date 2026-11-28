'use client';

import type { Editor } from '@tiptap/react';
import { Image as ImageIcon } from 'lucide-react';
import { useId, useRef, useState, type ChangeEvent } from 'react';
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
    TooltipTrigger,
} from '@/components/ui/tooltip';

import { MAX_INLINE_IMAGE_BYTES, MAX_INLINE_IMAGE_MB } from '../constants';
import type { UploadImage } from '../types';
import { isGcsUrl } from '../utils';

interface ImageButtonProps {
    editor: Editor;
    uploadImage?: UploadImage;
}

export function ImageButton({ editor, uploadImage }: ImageButtonProps) {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputId = useId();

    const insertImage = (src: string) => {
        editor.chain().focus().setImage({ src }).run();
        setUrl('');
        setOpen(false);
    };

    const applyUrl = async () => {
        if (!url.trim()) return;

        if (url.startsWith('data:')) {
            toast.error('No se permiten imágenes en Base64.', {
                description:
                    'Sube el archivo directamente o usa una URL pública.',
            });
            return;
        }

        if (isGcsUrl(url) || !uploadImage) {
            insertImage(url.trim());
            return;
        }

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
                insertImage(gcsUrl);
                toast.success('Imagen subida a GCS e insertada correctamente.');
            }
        } catch {
            toast.dismiss(uploadToast);
            insertImage(url.trim());
            toast.warning('Imagen insertada como enlace externo.', {
                description:
                    'No se pudo subir a GCS por restricciones del servidor origen.',
            });
        }
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('El archivo seleccionado no es una imagen válida.');
            e.currentTarget.value = '';
            return;
        }

        if (file.size > MAX_INLINE_IMAGE_BYTES) {
            const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
            toast.error(
                `La imagen pesa ${sizeMb}MB. Máximo ${MAX_INLINE_IMAGE_MB}MB para el editor.`,
            );
            e.currentTarget.value = '';
            return;
        }

        if (uploadImage) {
            const uploadToast = toast.loading('Subiendo imagen a GCS...');
            try {
                const gcsUrl = await uploadImage(file);
                if (gcsUrl) {
                    insertImage(gcsUrl);
                    toast.success('Imagen insertada con éxito.');
                }
            } finally {
                toast.dismiss(uploadToast);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } else {
            const reader = new FileReader();
            reader.onload = () => {
                insertImage(reader.result as string);
            };
            reader.readAsDataURL(file);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button type="button" size="icon" variant="outline">
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Imagen</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-72 p-3" sideOffset={8}>
                <div className="flex flex-col gap-2">
                    <Input
                        placeholder="https://ejemplo.com/imagen.png"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <Button type="button" onClick={applyUrl}>
                        Aplicar URL
                    </Button>

                    <div className="my-1 border-t border-neutral-200" />

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id={inputId}
                        onChange={handleFileChange}
                    />
                    <label
                        htmlFor={inputId}
                        className="cursor-pointer rounded-md bg-secondary p-2 text-center text-sm font-medium transition-colors hover:bg-secondary/80"
                    >
                        Subir Imagen
                    </label>
                </div>
            </PopoverContent>
        </Popover>
    );
}
