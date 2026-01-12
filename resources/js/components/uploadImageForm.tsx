import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Trash2Icon, UploadIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface UploadProps {
    onFileChange?: (file: File | null) => void;
    value?: File | string | null;
    previewClassName?: string;
}

export function UploadImageForm({
    onFileChange,
    value,
    previewClassName,
}: UploadProps) {
    const [preview, setPreview] = useState<string | null>(
        typeof value === 'string'
            ? value
            : value instanceof File
              ? URL.createObjectURL(value)
              : null,
    );

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (typeof value === 'string') setPreview(value);
        if (value instanceof File) setPreview(URL.createObjectURL(value));
        if (!value) setPreview(null);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setPreview(URL.createObjectURL(file));
            onFileChange?.(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
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
                </div>
            )}

            {/* input real oculto */}
            <Input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleChange}
            />

            {/* botón para reemplazar si ya hay imagen */}
            {/* {preview && (
                <Button type="button" variant="secondary" className="w-fit" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Reemplazar imagen
                </Button>
            )} */}
        </div>
    );
}
