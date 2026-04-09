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
import { useEffect, useRef, useState } from 'react';

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
        products_parent_without_variants?: number;
        variants_without_attributes?: number;
        sku_duplicates?: number;
        errors?: string[];
        error_details?: {
            row: number;
            message: string;
            field?: string;
            value?: string;
            context?: Record<string, unknown>;
        }[];
        error_columns?: { column: string; count: number }[];
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
    const [showAllErrors, setShowAllErrors] = useState(false);
    const errorTableRef = useRef<HTMLDivElement | null>(null);

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
    const errorDetails = importResult?.summary?.error_details ?? [];
    const visibleErrors = showAllErrors ? errorDetails : errorDetails.slice(0, 50);

    useEffect(() => {
        setShowAllErrors(false);
        if (errorTableRef.current) {
            errorTableRef.current.scrollTop = 0;
        }
    }, [importResult?.summary?.error_details]);

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
                className="relative mx-auto w-full max-w-4xl"
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
                <div className="mx-auto w-full max-w-4xl space-y-6">
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
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Resultado de {importResult.mode === 'validate' ? 'validacion' : 'importacion'}
                                    </p>
                                    <p
                                        className={`mt-1 text-sm font-medium ${
                                            importResult.ok
                                                ? 'text-emerald-700'
                                                : 'text-rose-700'
                                        }`}
                                    >
                                        {importResult.message}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        importResult.ok
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-rose-100 text-rose-700'
                                    }`}
                                >
                                    {importResult.ok ? 'Listo' : 'Revisar'}
                                </span>
                            </div>

                            {importResult.summary && (
                                <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-slate-700 sm:grid-cols-2">
                                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-[11px] uppercase text-slate-500">
                                            Total de filas procesadas
                                        </p>
                                        <p className="mt-1 text-base font-semibold text-slate-900">
                                            {importResult.summary.processed ?? 0}
                                        </p>
                                    </div>
                                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-[11px] uppercase text-slate-500">
                                            Errores
                                        </p>
                                        <p className="mt-1 text-base font-semibold text-slate-900">
                                            {importResult.summary.failed ?? 0}
                                        </p>
                                    </div>
                                    {!importResult.summary.dry_run && (
                                        <>
                                            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                                <p className="text-[11px] uppercase text-slate-500">
                                                    Productos (creados / actualizados / sin cambios)
                                                </p>
                                                <p className="mt-1 text-base font-semibold text-slate-900">
                                                    {importResult.summary
                                                        .products_created ?? 0}
                                                    /
                                                    {importResult.summary
                                                        .products_updated ?? 0}
                                                    /
                                                    {importResult.summary
                                                        .products_unchanged ?? 0}
                                                </p>
                                            </div>
                                            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                                <p className="text-[11px] uppercase text-slate-500">
                                                    Variantes (creadas / actualizadas / sin cambios)
                                                </p>
                                                <p className="mt-1 text-base font-semibold text-slate-900">
                                                    {importResult.summary
                                                        .variants_created ?? 0}
                                                    /
                                                    {importResult.summary
                                                        .variants_updated ?? 0}
                                                    /
                                                    {importResult.summary
                                                        .variants_unchanged ?? 0}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {errorDetails.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-600">
                                            Detalle de errores
                                        </p>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                            <span>
                                                {visibleErrors.length} de {errorDetails.length}
                                            </span>
                                            {errorDetails.length > 50 && (
                                                <button
                                                    type="button"
                                                    className="font-semibold text-slate-700 hover:underline"
                                                    onClick={() => setShowAllErrors((prev) => !prev)}
                                                >
                                                    {showAllErrors ? 'Ver menos' : 'Ver todos'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        ref={errorTableRef}
                                        className={`mt-2 rounded-lg border border-slate-200 bg-white ${
                                            showAllErrors ? '' : 'max-h-72 overflow-y-auto'
                                        }`}
                                    >
                                        <div className="grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase text-slate-500">
                                            <span className="col-span-2">Fila</span>
                                            <span className="col-span-3">Campo</span>
                                            <span className="col-span-4">Error</span>
                                            <span className="col-span-3">Valor recibido</span>
                                        </div>
                                        {visibleErrors.map((item, index) => (
                                            <div
                                                key={`${item.row}-${index}`}
                                                className="grid grid-cols-12 gap-2 border-b border-slate-100 px-3 py-2 text-xs text-slate-700 last:border-b-0"
                                            >
                                                <span className="col-span-2 font-semibold text-slate-900">
                                                    {item.row}
                                                </span>
                                                <span className="col-span-3">
                                                    {item.field && item.field !== '' ? item.field : 'sin_columna'}
                                                </span>
                                                <span className="col-span-4">{item.message}</span>
                                                <span className="col-span-3 text-slate-500">
                                                    {item.value && item.value !== '' ? item.value : 'sin_dato'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {Array.isArray(importResult.summary?.errors) &&
                                importResult.summary?.errors.length > 0 && (
                                    <div className="mt-4 rounded-md border border-rose-100 bg-rose-50 p-3 text-xs text-rose-700">
                                        <p className="font-semibold">
                                            Mensajes rapidos
                                        </p>
                                        <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                                            {importResult.summary.errors.map((rowError, index) => (
                                                <p key={`${rowError}-${index}`}>
                                                    {rowError}
                                                </p>
                                            ))}
                                        </div>
                                        <p className="mt-2 text-[11px] text-rose-700/80">
                                            Mostrando {importResult.summary.errors.length} mensajes.
                                        </p>
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
