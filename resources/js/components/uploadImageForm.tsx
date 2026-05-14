import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Trash2Icon, UploadIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    type AcceptedFormat,
    type UploadPreset,
    formatsToAccept,
    resolveConfig,
    validateFile,
} from '../hooks/upload-presets';

interface UploadProps {
    onFileChange?: (file: File | null) => void;
    value?: File | string | null;
    previewClassName?: string;
    // ── Validación ──────────────────────────────────────────
    preset?: UploadPreset;
    formats?: AcceptedFormat[];
    maxSizeMB?: number;
}

export function UploadImageForm({
    onFileChange,
    value,
    previewClassName,
    preset,
    formats,
    maxSizeMB,
}: UploadProps) {
    const config = resolveConfig(preset, {
        ...(formats   ? { formats }   : {}),
        ...(maxSizeMB ? { maxSizeMB } : {}),
    });

    const accept = formatsToAccept(config.formats);
    const showHint = !!(preset || formats || maxSizeMB);
    const hint = showHint
        ? config.formats
              .filter((f) => f !== 'jpeg' && f !== 'tif')
              .map((f) => f.toUpperCase())
              .join(', ') + ` · máx. ${config.maxSizeMB} MB`
        : null;

    const [preview, setPreview] = useState<string | null>(
        typeof value === 'string'
            ? value
            : value instanceof File
              ? URL.createObjectURL(value)
              : null,
    );
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (typeof value === 'string') setPreview(value);
        if (value instanceof File) setPreview(URL.createObjectURL(value));
        if (!value) setPreview(null);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;

        const err = validateFile(file, config);
        if (err) {
            setError(err);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setError(null);
        setPreview(URL.createObjectURL(file));
        onFileChange?.(file);
    };

    const handleRemove = () => {
        setPreview(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onFileChange?.(null);
    };

    return (
        <div className="flex flex-col gap-2">
            {preview ? (
                <>
                    <div
                        className={cn(
                            'relative h-48 w-48 overflow-hidden rounded-xl',
                            previewClassName,
                        )}
                    >
                        <img
                            src={preview}
                            alt="Preview"
                            className="h-full w-full rounded-xl border bg-muted object-contain shadow-sm"
                        />
                        {onFileChange && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white shadow-md hover:bg-black/80"
                            >
                                <Trash2Icon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    {onFileChange && (
                        <div className={cn('!h-auto w-48', previewClassName)}>
                            <Button
                                type="button"
                                variant="secondary"
                                className="w-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadIcon className="h-4 w-4" />
                                Cambiar
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div
                    className={cn(
                        'flex h-48 w-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/40 bg-muted/40 transition-colors duration-400 ease-in-out hover:border-primary/40 hover:bg-muted/60',
                        previewClassName,
                    )}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadIcon className="h-6 w-6 text-muted-foreground" />
                    <span className="text-center text-sm text-muted-foreground">
                        Subir imagen
                    </span>
                    {hint && (
                        <span className="text-center text-[11px] text-muted-foreground/70">
                            {hint}
                        </span>
                    )}
                    {error && (
                        <span className="text-center text-[11px] text-red-500">
                            {error}
                        </span>
                    )}
                </div>
            )}

            <Input
                type="file"
                accept={accept}
                className="hidden"
                ref={fileInputRef}
                onChange={handleChange}
            />
        </div>
    );
}