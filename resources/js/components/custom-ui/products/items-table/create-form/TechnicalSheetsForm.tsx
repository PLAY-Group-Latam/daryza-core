'use client';

import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Upload } from 'lucide-react';
import { ControllerRenderProps } from 'react-hook-form';
import { ProductFormValues } from './FormProduct';

interface TechnicalSheetsFormProps {
    field: ControllerRenderProps<ProductFormValues, 'technicalSheets'>;
}

export function TechnicalSheetsForm({ field }: TechnicalSheetsFormProps) {
    const technicalSheets = field.value || [];

    const handleFilesUpload = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).map((file) => ({ file }));
        field.onChange([...technicalSheets, ...newFiles]);
    };

    const handleRemove = (index: number) => {
        field.onChange(technicalSheets.filter((_, i) => i !== index));
    };

    const getFileNameFromPath = (path?: string) => {
        if (!path) return 'Unnamed PDF';
        return path.split('/').pop();
    };

    return (
        <div className="space-y-3">
            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                ● Technical Sheets
            </p>

            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-slate-50 p-6 text-slate-500">
                <label className="flex cursor-pointer flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm font-medium">
                        Drag & drop or click to upload PDFs
                    </span>
                    <input
                        type="file"
                        multiple
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => handleFilesUpload(e.target.files)}
                    />
                </label>

                {technicalSheets.length > 0 && (
                    <ul className="mt-4 w-full space-y-2">
                        {technicalSheets.map((sheet, index) => {
                            const isRemote = !!sheet.file_path;

                            return (
                                <li
                                    key={index}
                                    className="flex items-center justify-between rounded-md border bg-gray-50 p-3 text-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-500" />

                                        {isRemote ? (
                                            <a
                                                href={sheet.file_path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 truncate text-blue-600 hover:underline"
                                            >
                                                {getFileNameFromPath(
                                                    sheet.file_path,
                                                )}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        ) : (
                                            <span className="truncate">
                                                {sheet.file?.name ||
                                                    'Unnamed PDF'}
                                            </span>
                                        )}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="link"
                                        size="sm"
                                        className="text-xs text-red-500"
                                        onClick={() => handleRemove(index)}
                                    >
                                        Eliminar
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
