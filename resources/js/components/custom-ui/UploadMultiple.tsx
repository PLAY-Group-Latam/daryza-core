/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { Trash2Icon, UploadIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type UploadItem = File | string;

interface UploadMultipleProps {
    value?: UploadItem[];
    onFilesChange?: (files: UploadItem[]) => void;
    previewClassName?: string;
}

export function UploadMultiple({
    value = [],
    onFilesChange,
    previewClassName,
}: UploadMultipleProps) {
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const dragIndex = useRef<number | null>(null);

    // 🔥 Generar previews correctamente
    useEffect(() => {
        const urls = value.map((item) => {
            if (item instanceof File) {
                return URL.createObjectURL(item);
            }
            return item; // string URL existente
        });

        setPreviews(urls);

        return () => {
            value.forEach((item, index) => {
                if (item instanceof File) {
                    URL.revokeObjectURL(urls[index]);
                }
            });
        };
    }, [value]);

    // 📥 Nuevos archivos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (!files.length) return;

        onFilesChange?.([...value, ...files]);
    };

    // ❌ Eliminar
    const handleRemove = (index: number) => {
        const newItems = [...value];
        newItems.splice(index, 1);
        onFilesChange?.(newItems);
    };

    // 🧲 Drag & Drop
    const handleDragStart = (index: number) => {
        dragIndex.current = index;
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (index: number) => {
        if (dragIndex.current === null || dragIndex.current === index) return;

        const newValue = [...value];
        const draggedItem = newValue[dragIndex.current];

        newValue.splice(dragIndex.current, 1);
        newValue.splice(index, 0, draggedItem);

        dragIndex.current = null;
        onFilesChange?.(newValue);
    };

    return (
        <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
                <div
                    key={i}
                    className={`relative ${previewClassName}`}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(i)}
                >
                    <img
                        src={src}
                        className="h-24 w-24 rounded-xl border object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => handleRemove(i)}
                        className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-red-600"
                    >
                        <Trash2Icon className="h-4 w-4" />
                    </button>
                </div>
            ))}

            <div
                onClick={() => fileInputRef.current?.click()}
                className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed ${previewClassName}`}
            >
                <UploadIcon className="h-6 w-6 text-muted-foreground" />
                <span className="text-center text-xs leading-tight">
                    Subir Imagen
                </span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleChange}
            />
        </div>
    );
}
