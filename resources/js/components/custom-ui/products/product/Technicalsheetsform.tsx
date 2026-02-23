'use client';

import { useRef } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { ExternalLink, FileIcon, Trash2Icon, UploadIcon } from 'lucide-react';

import { ProductFormValues } from './schema';

function getFileName(item: File | { file_path: string }): string {
    if (item instanceof File) return item.name;
    return item.file_path.split('/').pop() ?? 'Archivo';
}

export function TechnicalSheetsForm() {
    const { control } = useFormContext<ProductFormValues>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'technicalSheets',
        keyName: '_fieldId',
    });

    // watch para obtener los valores reales (File | Media), no el wrapper de useFieldArray
    const sheets = useWatch({
        control,
        name: 'technicalSheets',
        defaultValue: [],
    });

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        files.forEach((file) => append(file)); // File directamente — es valid MediaFieldSchema
        e.target.value = '';
    };

    return (
        <section className="space-y-4">
            <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                ● Fichas Técnicas
            </p>

            {fields.length > 0 && (
                <div className="space-y-2">
                    {fields.map((field, index) => {
                        const item = sheets[index];
                        if (!item) return null; // ← aquí
                        const isFile = item instanceof File;
                        const name = item
                            ? getFileName(item as File | { file_path: string })
                            : '—';

                        return (
                            <div
                                key={field._fieldId}
                                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                            >
                                <div className="flex items-center gap-2">
                                    <FileIcon className="h-4 w-4 text-slate-400" />
                                    {isFile ? (
                                        <span className="max-w-xs truncate text-xs text-slate-700">
                                            {name}
                                        </span>
                                    ) : (
                                        <a
                                            href={
                                                (item as { file_path: string })
                                                    .file_path
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="max-w-xs truncate text-xs text-slate-700 hover:text-indigo-600 hover:underline"
                                        >
                                            {name}
                                        </a>
                                    )}
                                    <ExternalLink className="size-4 text-slate-400" />
                                    {isFile && (
                                        <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-600">
                                            Nueva
                                        </span>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-red-400 hover:text-red-600"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2Icon className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-5 py-3 text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
            >
                <UploadIcon className="h-4 w-4" />
                Subir ficha técnica
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xlsx"
                multiple
                className="hidden"
                onChange={handleFiles}
            />
        </section>
    );
}
