import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Trash2Icon, UploadIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import {
    type AcceptedFormat,
    type UploadPreset,
    type UploadValidationConfig,
    formatsToAccept,
    resolveConfig,
    validateFile,
} from '../../hooks/upload-presets';

interface UploadProps {
    onFileChange?: (file: File | null) => void;
    value?: File | string | null;
    previewClassName?: string;
    placeholder?: string;
    type?: 'image' | 'video';
    // ── Validación ──────────────────────────────────────────
    preset?: UploadPreset;
    formats?: AcceptedFormat[];
    maxSizeMB?: number;
    mediaType?: 'image' | 'video';
}

function getInitialPreview(value: File | string | null | undefined): string | null {
    if (typeof value === 'string') return value;
    if (value instanceof File) return URL.createObjectURL(value);
    return null;
}

function buildHint(config: UploadValidationConfig): string {
    const fmts = config.formats
        .filter((f) => f !== 'jpeg' && f !== 'tif')
        .map((f) => f.toUpperCase())
        .join(', ');
    return `${fmts} · máx. ${config.maxSizeMB} MB`;
}

export function Upload({
    onFileChange,
    value,
    previewClassName,
    placeholder,
    type = 'image',
    preset,
    formats,
    maxSizeMB,
    mediaType,
}: UploadProps) {
    const config = resolveConfig(preset, {
        ...(formats   ? { formats }   : {}),
        ...(maxSizeMB ? { maxSizeMB } : {}),
        ...(mediaType ? { mediaType } : {}),
    });

    const accept = formatsToAccept(config.formats);
    const isVideo = config.mediaType === 'video' || type === 'video';

    const [localPreview, setLocalPreview] = useState<string | null>(() =>
        getInitialPreview(value),
    );
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const preview = localPreview ?? getInitialPreview(value);
    const resolvedPlaceholder = placeholder ?? (isVideo ? 'Subir video' : 'Subir imagen');

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
        setLocalPreview(URL.createObjectURL(file));
        onFileChange?.(file);
    };

    const handleRemove = () => {
        setLocalPreview(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onFileChange?.(null);
    };

    return (
        <div className="flex flex-col gap-3">
            {preview ? (
                <>
                    <div
                        className={cn(
                            'relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50',
                            previewClassName,
                        )}
                    >
                        {isVideo ? (
                            <video
                                src={preview}
                                controls
                                className="h-full w-full object-contain"
                            />
                        ) : (
                            <img
                                src={preview}
                                alt="Preview"
                                className="h-full w-full object-contain"
                            />
                        )}
                        {onFileChange && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white shadow-md transition-colors hover:bg-black/80"
                            >
                                <Trash2Icon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    {onFileChange && (
                        <div className="flex w-full justify-center">
                            <Button
                                type="button"
                                variant="secondary"
                                className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
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
                        'flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 transition-colors hover:border-primary hover:bg-slate-100/50',
                        previewClassName,
                    )}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadIcon className="h-6 w-6 text-slate-400" />
                    <span className="text-sm text-slate-500">{resolvedPlaceholder}</span>
                    {/* Línea de restricciones — solo cuando hay config */}
                    {(preset || formats || maxSizeMB) && (
                        <span className="text-[11px] text-slate-400">{buildHint(config)}</span>
                    )}
                    {error && (
                        <span className="text-[11px] text-red-500">{error}</span>
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