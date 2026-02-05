/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { Trash2Icon, UploadIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface UploadMultipleProps {
    value?: File[]; // ✅ solo archivos
    onFilesChange?: (files: File[]) => void; // ✅ callback con archivos
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

    // Generar previews de archivos
    useEffect(() => {
        const urls = value.map((file) => URL.createObjectURL(file));
        setPreviews(urls);

        // Cleanup URLs cuando cambia el array
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [value]);

    // Cuando se seleccionan nuevos archivos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length === 0) return;
        onFilesChange?.([...value, ...files]); // ✅ solo File
    };

    // Eliminar archivo
    const handleRemove = (index: number) => {
        const newFiles = [...value];
        newFiles.splice(index, 1);
        onFilesChange?.(newFiles);
    };

    // --- Drag & Drop Nativo ---
    const handleDragStart = (index: number) => {
        dragIndex.current = index;
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // necesario para permitir drop
    };

    const handleDrop = (index: number) => {
        if (dragIndex.current === null || dragIndex.current === index) return;

        const newValue = [...value];
        const draggedItem = newValue[dragIndex.current];
        // eliminar del lugar original
        newValue.splice(dragIndex.current, 1);
        // insertar en la posición nueva
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
                        className="h-24 w-24 rounded-xl border object-fill"
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
