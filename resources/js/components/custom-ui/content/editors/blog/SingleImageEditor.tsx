'use client';

import { Input } from '@/components/ui/input';
import { ImagePlus } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';

interface SingleImageEditorProps {
    title: string;
    description?: string;
    data: { src_desktop: File | string | null; link_url: string };
    onChange: (
        updates: Partial<{ src_desktop: File | string | null; link_url: string }>,
    ) => void;
}

export default function SingleImageEditor({
    title,
    description,
    data,
    onChange,
}: SingleImageEditorProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const preview = useMemo(
        () =>
            data.src_desktop instanceof File
                ? URL.createObjectURL(data.src_desktop)
                : data.src_desktop,
        [data.src_desktop],
    );

    // Libera la URL temporal al cambiar de archivo o desmontar
    useEffect(() => {
        return () => {
            if (preview && data.src_desktop instanceof File) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview, data.src_desktop]);

    return (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
            <div>
                <h4 className="font-bold text-slate-900">{title}</h4>
                {description && (
                    <p className="text-sm text-slate-500">{description}</p>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onChange({ src_desktop: file });
                    e.target.value = '';
                }}
            />

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="group relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-primary/60 hover:bg-primary/5"
            >
                {preview ? (
                    <img
                        src={preview}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <ImagePlus size={32} strokeWidth={1.5} />
                        <span className="text-sm font-medium">Subir imagen</span>
                    </div>
                )}
                {preview && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="flex items-center gap-2 text-sm font-semibold text-white">
                            <ImagePlus size={18} /> Cambiar imagen
                        </span>
                    </div>
                )}
            </button>

            <Input
                value={data.link_url}
                onChange={(e) => onChange({ link_url: e.target.value })}
                placeholder="https://... (enlace al hacer clic)"
                className="h-11"
            />
        </div>
    );
}