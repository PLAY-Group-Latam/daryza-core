import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Trash2Icon, UploadIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface UploadProps {
    onFileChange?: (file: File | null) => void;
    value?: File | string | null;
    previewClassName?: string;
    accept?: string; 
    placeholder?: string; 
    type?: 'image' | 'video'; 
}

export function Upload({ 
    onFileChange, 
    value, 
    previewClassName,
    accept = 'image/*',
    placeholder,
    type = 'image'
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

    const isVideo = type === 'video' || accept.includes('video');
    const resolvedPlaceholder = placeholder ?? (isVideo ? 'Subir video' : 'Subir imagen'); 

    return (
        <div className="flex flex-col gap-3">
            {preview ? (
                <>
                    <div className={cn('relative overflow-hidden rounded-xl bg-slate-50 border border-slate-200', previewClassName)}>
                        {isVideo ? (
                            <video
                                src={preview}
                                controls
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-contain"
                            />
                        )}
                        {onFileChange && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white shadow-md hover:bg-black/80 transition-colors"
                            >
                                <Trash2Icon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    {onFileChange && (
                        <div className="flex justify-center">
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
                    <span className="text-sm text-slate-500">
                         {resolvedPlaceholder}
                    </span>
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