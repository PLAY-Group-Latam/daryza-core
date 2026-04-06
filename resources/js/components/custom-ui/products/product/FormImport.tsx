/* eslint-disable react-hooks/incompatible-library */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import products from '@/routes/products';
import { Loader2, Upload } from 'lucide-react';
import { useState } from 'react';

const ImportSchema = z.object({
    file: z
        .instanceof(File, { message: 'Debes seleccionar un archivo válido' })
        .refine(
            (file) =>
                [
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/csv',
                ].includes(file.type) || file.name.endsWith('.csv'),
            {
                message: 'El archivo debe ser Excel (.xlsx, .xls) o CSV.',
            },
        ),
});

type ImportFormValues = z.infer<typeof ImportSchema>;

type ImportResult = {
    mode?: 'validate' | 'import';
    ok?: boolean;
    message?: string;
    summary?: {
        total?: number;
        processed?: number;
        failed?: number;
        dry_run?: boolean;
        products_created?: number;
        products_updated?: number;
        products_unchanged?: number;
        variants_created?: number;
        variants_updated?: number;
        variants_unchanged?: number;
        errors?: string[];
    };
};

export default function FormImport() {
    const { errors: serverErrors, importResult } = usePage<{
        errors?: Record<string, string>;
        importResult?: ImportResult | null;
    }>().props;
    const [lastAction, setLastAction] = useState<'validate' | 'import'>(
        'validate',
    );

    const methods = useForm<ImportFormValues>({
        resolver: zodResolver(ImportSchema),
        defaultValues: { file: undefined },
    });

    const {
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting },
    } = methods;

    const file = watch('file');
    const canImport = Boolean(importResult?.mode === 'validate' && importResult?.ok);

    const onSubmit = async (
        data: ImportFormValues,
        action: 'validate' | 'import',
    ) => {
        setLastAction(action);
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('action', action);

        await new Promise<void>((resolve) => {
            router.post(products.items.import().url, formData, {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                onFinish: () => resolve(),
            });
        });
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={(e) => e.preventDefault()}
                className="relative mx-auto max-w-md"
            >
                {' '}
                {isSubmitting && (
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                        <Loader2 className="mb-4 h-12 w-12 animate-spin text-white" />
                        <span className="font-semibold text-white">
                            {lastAction === 'validate'
                                ? 'Validando archivo...'
                                : 'Importando productos...'}
                        </span>
                    </div>
                )}
                {/* Encabezado */}
                <div className="mx-auto max-w-md space-y-6">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold">
                            Importar Productos
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Agrega miles de productos en segundos mediante un
                            archivo Excel o CSV.
                        </p>
                    </div>

                    {/* Selector de archivo */}
                    <Controller
                        name="file"
                        control={control}
                        render={({ field }) => (
                            <label
                                htmlFor="file-upload"
                                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors hover:border-green-600 hover:bg-green-50 ${
                                    errors.file
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300 bg-white'
                                }`}
                            >
                                {/* Icono de Lucide */}
                                <Upload className="h-8 w-8 text-gray-400" />

                                <span className="text-center text-sm text-gray-600">
                                    {field.value
                                        ? field.value.name
                                        : 'Selecciona o arrastra tu archivo'}
                                </span>

                                {/* Input oculto */}
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    className="hidden"
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                />
                            </label>
                        )}
                    />
                    {errors.file && (
                        <InputError message={errors.file.message} />
                    )}
                    {serverErrors?.file && (
                        <InputError message={serverErrors.file} />
                    )}

                    {importResult && (
                        <div
                            className={`rounded-lg border p-4 ${
                                importResult.ok
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-red-200 bg-red-50'
                            }`}
                        >
                            <p
                                className={`text-sm font-medium ${
                                    importResult.ok
                                        ? 'text-green-700'
                                        : 'text-red-700'
                                }`}
                            >
                                {importResult.message}
                            </p>

                            {importResult.summary && (
                                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-700 sm:grid-cols-2">
                                    <p>
                                        Filas: {importResult.summary.processed ?? 0}/
                                        {importResult.summary.total ?? 0}
                                    </p>
                                    <p>
                                        Errores:{' '}
                                        {importResult.summary.failed ?? 0}
                                    </p>
                                    {!importResult.summary.dry_run && (
                                        <>
                                            <p>
                                                Productos C/U/SC:{' '}
                                                {importResult.summary
                                                    .products_created ?? 0}
                                                /
                                                {importResult.summary
                                                    .products_updated ?? 0}
                                                /
                                                {importResult.summary
                                                    .products_unchanged ?? 0}
                                            </p>
                                            <p>
                                                Variantes C/U/SC:{' '}
                                                {importResult.summary
                                                    .variants_created ?? 0}
                                                /
                                                {importResult.summary
                                                    .variants_updated ?? 0}
                                                /
                                                {importResult.summary
                                                    .variants_unchanged ?? 0}
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            {Array.isArray(importResult.summary?.errors) &&
                                importResult.summary?.errors.length > 0 && (
                                    <div className="mt-3 max-h-44 overflow-y-auto rounded border border-red-200 bg-white p-2">
                                        {importResult.summary.errors
                                            .slice(0, 20)
                                            .map((rowError, index) => (
                                                <p
                                                    key={`${rowError}-${index}`}
                                                    className="text-xs text-red-700"
                                                >
                                                    {rowError}
                                                </p>
                                            ))}
                                    </div>
                                )}
                        </div>
                    )}

                    {/* Botón de descargar plantilla */}
                    <div className="flex items-center justify-between text-center">
                        <p>Plantilla de importación:</p>
                        <a
                            href="/template_productos.xlsx"
                            download
                            className="text-green-600 hover:underline"
                        >
                            Descargar Plantilla
                        </a>
                    </div>

                    {/* Botón de envío */}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 border-green-600 text-green-700 hover:bg-green-50"
                            disabled={!file || isSubmitting}
                            onClick={handleSubmit((data) =>
                                onSubmit(data, 'validate'),
                            )}
                        >
                            {isSubmitting && lastAction === 'validate' && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Validar archivo
                        </Button>

                        <Button
                            type="button"
                            className={`h-11 ${canImport ? 'bg-black text-white hover:bg-black/90' : 'bg-gray-300 text-gray-500'}`}
                            disabled={!file || isSubmitting || !canImport}
                            onClick={handleSubmit((data) =>
                                onSubmit(data, 'import'),
                            )}
                        >
                            {isSubmitting && lastAction === 'import' && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Importar
                        </Button>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
