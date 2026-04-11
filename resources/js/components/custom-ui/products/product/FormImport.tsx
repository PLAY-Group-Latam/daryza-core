/* eslint-disable no-extra-boolean-cast */
/* eslint-disable react-hooks/incompatible-library */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
        errors_total_available?: number;
        errors_preview_limit?: number;
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

type ImportSession = {
    id: string;
    action: 'validate' | 'import';
    original_filename?: string | null;
    status:
        | 'queued'
        | 'validating'
        | 'importing'
        | 'completed'
        | 'completed_with_errors'
        | 'failed_validation'
        | 'failed_system'
        | 'cancelled';
    total_rows?: number | null;
    processed_rows?: number;
    failed_rows?: number;
    progress_percent?: number;
    resume_from_row?: number | null;
    summary?: ImportResult['summary'];
    error_message?: string | null;
    message?: string;
    ok?: boolean;
    is_finished?: boolean;
    status_url: string;
    retry_url: string;
    cancel_url: string;
    errors_url?: string | null;
    updated_at?: string;
};

type ErrorDetailItem = {
    row: number;
    message: string;
    field?: string;
    value?: string;
    context?: Record<string, unknown>;
};

const STATUS_LABELS: Record<ImportSession['status'], string> = {
    queued: 'En cola',
    validating: 'Validando',
    importing: 'Importando',
    completed: 'Completado',
    completed_with_errors: 'Completado con observaciones',
    failed_validation: 'Falló validación',
    failed_system: 'Error técnico',
    cancelled: 'Cancelada',
};

const ACTION_LABELS: Record<ImportSession['action'], string> = {
    validate: 'validación',
    import: 'importación',
};
const RETRYABLE_STATUSES: ImportSession['status'][] = [
    'failed_system',
    'cancelled',
];

export default function FormImport() {
    const {
        errors: serverErrors,
        importResult,
        importSession,
        importSessions,
    } = usePage<{
        errors?: Record<string, string>;
        importResult?: ImportResult | null;
        importSession?: ImportSession | null;
        importSessions?: ImportSession[];
    }>().props;
    const [lastAction, setLastAction] = useState<'validate' | 'import'>(
        'validate',
    );
    const [serverErrorDetails, setServerErrorDetails] = useState<
        ErrorDetailItem[]
    >([]);
    const [serverErrorsTotal, setServerErrorsTotal] = useState<number | null>(
        null,
    );
    const [serverErrorsTotalPages, setServerErrorsTotalPages] =
        useState<number>(1);
    const [errorsPage, setErrorsPage] = useState(1);
    const [errorsPerPage, setErrorsPerPage] = useState(50);
    const errorTableRef = useRef<HTMLDivElement | null>(null);
    const [liveSession, setLiveSession] = useState<ImportSession | null>(
        importSession ?? null,
    );
    const [recentSessions, setRecentSessions] = useState<ImportSession[]>(
        importSessions ?? [],
    );
    const [hasPickedNewFile, setHasPickedNewFile] = useState(false);

    const methods = useForm<ImportFormValues>({
        resolver: zodResolver(ImportSchema),
        defaultValues: { file: undefined },
    });

    const {
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = methods;

    const file = watch('file');
    const canImport = Boolean(
        liveSession?.action === 'validate' &&
        !hasPickedNewFile &&
        liveSession?.status === 'completed' &&
        (liveSession?.failed_rows ?? 0) === 0,
    );
    const resolvedSummary =
        !hasPickedNewFile && liveSession?.summary
            ? liveSession.summary
            : importResult?.summary;
    const summaryForView = resolvedSummary;
    const localErrorDetails = (resolvedSummary?.error_details ??
        []) as ErrorDetailItem[];
    const hasRemoteErrorsEndpoint = Boolean(liveSession?.errors_url);
    const errorDetails = hasRemoteErrorsEndpoint
        ? serverErrorDetails
        : localErrorDetails;
    const totalErrorsAvailable = hasRemoteErrorsEndpoint
        ? (serverErrorsTotal ?? 0)
        : (liveSession?.failed_rows ??
          resolvedSummary?.failed ??
          resolvedSummary?.errors_total_available ??
          localErrorDetails.length);
    const localTotalPages = Math.max(
        1,
        Math.ceil(localErrorDetails.length / Math.max(1, errorsPerPage)),
    );
    const totalErrorPages = hasRemoteErrorsEndpoint
        ? Math.max(1, serverErrorsTotalPages)
        : localTotalPages;
    const safeErrorsPage = Math.max(1, Math.min(errorsPage, totalErrorPages));
    const visibleErrors = hasRemoteErrorsEndpoint
        ? errorDetails
        : localErrorDetails.slice(
              (safeErrorsPage - 1) * errorsPerPage,
              safeErrorsPage * errorsPerPage,
          );
    const rangeStart =
        totalErrorsAvailable > 0 ? (safeErrorsPage - 1) * errorsPerPage + 1 : 0;
    const rangeEnd = Math.min(
        totalErrorsAvailable,
        safeErrorsPage * errorsPerPage,
    );
    const progress = Math.max(
        0,
        Math.min(100, liveSession?.progress_percent ?? 0),
    );
    const isQueueRunning =
        liveSession &&
        !hasPickedNewFile &&
        ['queued', 'validating', 'importing'].includes(liveSession.status);
    const isSessionStalled = (() => {
        if (!liveSession || !isQueueRunning || !liveSession.updated_at)
            return false;
        const updatedAt = new Date(liveSession.updated_at).getTime();
        if (Number.isNaN(updatedAt)) return false;
        return Date.now() - updatedAt > 15 * 60 * 1000;
    })();
    const currentActionLabel = liveSession?.action
        ? ACTION_LABELS[liveSession.action]
        : 'proceso';
    const currentStatusLabel = liveSession?.status
        ? STATUS_LABELS[liveSession.status]
        : '';
    const showSessionCard = Boolean(
        liveSession && !hasPickedNewFile && isQueueRunning,
    );
    const showResultCard =
        !hasPickedNewFile &&
        !Boolean(isQueueRunning) &&
        Boolean(importResult || summaryForView);

    useEffect(() => {
        setServerErrorDetails([]);
        setServerErrorsTotal(null);
        setServerErrorsTotalPages(1);
        setErrorsPage(1);
        if (errorTableRef.current) {
            errorTableRef.current.scrollTop = 0;
        }
    }, [liveSession?.id, hasPickedNewFile]);

    useEffect(() => {
        const errorsUrl = liveSession?.errors_url;
        if (!hasRemoteErrorsEndpoint || !errorsUrl) return;
        if (!liveSession.is_finished && (liveSession.failed_rows ?? 0) <= 0)
            return;

        let cancelled = false;

        const fetchPage = async () => {
            try {
                const url = new URL(errorsUrl, window.location.origin);
                url.searchParams.set('page', String(safeErrorsPage));
                url.searchParams.set('per_page', String(errorsPerPage));

                const response = await fetch(url.toString(), {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                if (!response.ok || cancelled) return;

                const payload = (await response.json()) as {
                    data?: ErrorDetailItem[];
                    pagination?: { total?: number; total_pages?: number };
                };

                if (cancelled) return;

                setServerErrorDetails(
                    Array.isArray(payload.data) ? payload.data : [],
                );
                setServerErrorsTotal(payload.pagination?.total ?? 0);
                setServerErrorsTotalPages(
                    Math.max(1, payload.pagination?.total_pages ?? 1),
                );
            } catch {
                if (!cancelled) {
                    setServerErrorDetails([]);
                }
            }
        };

        fetchPage();

        return () => {
            cancelled = true;
        };
    }, [
        hasRemoteErrorsEndpoint,
        liveSession?.errors_url,
        liveSession?.is_finished,
        liveSession?.failed_rows,
        safeErrorsPage,
        errorsPerPage,
    ]);

    useEffect(() => {
        setLiveSession(importSession ?? null);
    }, [importSession]);

    useEffect(() => {
        setRecentSessions(importSessions ?? []);
    }, [importSessions]);

    useEffect(() => {
        if (!liveSession) return;

        setRecentSessions((prev) => {
            const source = Array.isArray(prev) ? [...prev] : [];
            const index = source.findIndex(
                (item) => item.id === liveSession.id,
            );

            if (index >= 0) {
                source[index] = { ...source[index], ...liveSession };
            } else {
                source.unshift(liveSession);
            }

            return source.slice(0, 10);
        });
    }, [liveSession]);

    useEffect(() => {
        if (!liveSession || liveSession.is_finished) return;

        let cancelled = false;
        let timerId: number | null = null;

        const resolveNextDelay = (status?: ImportSession['status']) => {
            if (status === 'queued') return 2200;
            if (status === 'validating' || status === 'importing') return 1400;
            return 2000;
        };

        const poll = async () => {
            try {
                const response = await fetch(liveSession.status_url, {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                if (!response.ok) {
                    if (!cancelled) {
                        timerId = window.setTimeout(poll, 5000);
                    }
                    return;
                }

                const data = (await response.json()) as {
                    session?: ImportSession;
                };
                const nextSession = data.session;
                if (nextSession) {
                    setLiveSession(nextSession);
                    if (!cancelled && !nextSession.is_finished) {
                        timerId = window.setTimeout(
                            poll,
                            resolveNextDelay(nextSession.status),
                        );
                    }
                    return;
                }
            } catch {
                // Ignoramos errores transitorios de polling.
            }

            if (!cancelled) {
                timerId = window.setTimeout(poll, 5000);
            }
        };

        timerId = window.setTimeout(poll, 400);

        return () => {
            cancelled = true;
            if (timerId !== null) {
                window.clearTimeout(timerId);
            }
        };
    }, [liveSession?.id, liveSession?.is_finished, liveSession?.status_url]);

    const onSubmit = async (
        data: ImportFormValues,
        action: 'validate' | 'import',
    ) => {
        setLastAction(action);
        setHasPickedNewFile(false);
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

    const onClearHistory = () => {
        if (isQueueRunning) return;

        router.delete('/productos/items/import/sessions', {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setLiveSession(null);
                setRecentSessions([]);
                setHasPickedNewFile(false);
                reset({ file: undefined });
            },
        });
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={(e) => e.preventDefault()}
                className="relative mx-auto w-full max-w-4xl"
            >
                {/* Encabezado */}
                <div className="mx-auto w-full max-w-4xl space-y-6">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold">
                            Importar Productos
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Agrega miles de productos mediante un archivo Excel.
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
                                    disabled={
                                        Boolean(isQueueRunning) || isSubmitting
                                    }
                                    onChange={(e) =>
                                        (() => {
                                            if (isQueueRunning) return;
                                            setHasPickedNewFile(true);
                                            setLiveSession(null);
                                            field.onChange(
                                                e.target.files?.[0] || null,
                                            );
                                        })()
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

                    {showResultCard && (
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                        Resultado de{' '}
                                        {(importResult?.mode ??
                                            liveSession?.action) === 'validate'
                                            ? 'validación'
                                            : 'importación'}
                                    </p>
                                    <p
                                        className={`mt-1 text-sm font-medium ${
                                            (importResult?.ok ??
                                            liveSession?.ok)
                                                ? 'text-emerald-700'
                                                : 'text-rose-700'
                                        }`}
                                    >
                                        {importResult?.message ??
                                            liveSession?.message}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        (importResult?.ok ?? liveSession?.ok)
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-rose-100 text-rose-700'
                                    }`}
                                >
                                    {(importResult?.ok ?? liveSession?.ok)
                                        ? 'Listo'
                                        : 'Revisar'}
                                </span>
                            </div>

                            {summaryForView && (
                                <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-slate-700 sm:grid-cols-2">
                                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-[11px] text-slate-500 uppercase">
                                            Total de filas procesadas
                                        </p>
                                        <p className="mt-1 text-base font-semibold text-slate-900">
                                            {summaryForView.processed ?? 0}
                                        </p>
                                    </div>
                                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                        <p className="text-[11px] text-slate-500 uppercase">
                                            Errores
                                        </p>
                                        <p className="mt-1 text-base font-semibold text-slate-900">
                                            {summaryForView.failed ?? 0}
                                        </p>
                                    </div>
                                    {!summaryForView.dry_run && (
                                        <>
                                            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                                <p className="text-[11px] text-slate-500 uppercase">
                                                    Productos (creados /
                                                    actualizados / sin cambios)
                                                </p>
                                                <p className="mt-1 text-base font-semibold text-slate-900">
                                                    {summaryForView.products_created ??
                                                        0}
                                                    /
                                                    {summaryForView.products_updated ??
                                                        0}
                                                    /
                                                    {summaryForView.products_unchanged ??
                                                        0}
                                                </p>
                                            </div>
                                            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                                <p className="text-[11px] text-slate-500 uppercase">
                                                    Variantes (creadas /
                                                    actualizadas / sin cambios)
                                                </p>
                                                <p className="mt-1 text-base font-semibold text-slate-900">
                                                    {summaryForView.variants_created ??
                                                        0}
                                                    /
                                                    {summaryForView.variants_updated ??
                                                        0}
                                                    /
                                                    {summaryForView.variants_unchanged ??
                                                        0}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {(totalErrorsAvailable > 0 ||
                                errorDetails.length > 0) && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-600">
                                            Detalle de errores
                                        </p>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                            <span>
                                                Mostrando {rangeStart}-
                                                {rangeEnd} de{' '}
                                                {totalErrorsAvailable} errores
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        ref={errorTableRef}
                                        className="mt-2 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white"
                                    >
                                        <div className="grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase">
                                            <span className="col-span-2">
                                                Fila
                                            </span>
                                            <span className="col-span-3">
                                                Campo
                                            </span>
                                            <span className="col-span-4">
                                                Error
                                            </span>
                                            <span className="col-span-3">
                                                Valor recibido
                                            </span>
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
                                                    {item.field &&
                                                    item.field !== ''
                                                        ? item.field
                                                        : 'sin_columna'}
                                                </span>
                                                <span className="col-span-4">
                                                    {item.message}
                                                </span>
                                                <span className="col-span-3 text-slate-500">
                                                    {item.value &&
                                                    item.value !== ''
                                                        ? item.value
                                                        : 'sin_dato'}
                                                </span>
                                            </div>
                                        ))}
                                        {visibleErrors.length === 0 && (
                                            <div className="px-3 py-4 text-center text-xs text-slate-500">
                                                No hay errores en esta página.
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                            <span>Por página</span>
                                            <select
                                                className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px]"
                                                value={errorsPerPage}
                                                onChange={(e) => {
                                                    const nextSize =
                                                        Number(
                                                            e.target.value,
                                                        ) || 50;
                                                    setErrorsPerPage(nextSize);
                                                    setErrorsPage(1);
                                                }}
                                            >
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                                <option value={200}>200</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-7 px-2 text-[11px]"
                                                disabled={safeErrorsPage <= 1}
                                                onClick={() =>
                                                    setErrorsPage((prev) =>
                                                        Math.max(1, prev - 1),
                                                    )
                                                }
                                            >
                                                Anterior
                                            </Button>
                                            <span className="text-[11px] text-slate-600">
                                                Página {safeErrorsPage} de{' '}
                                                {totalErrorPages}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-7 px-2 text-[11px]"
                                                disabled={
                                                    safeErrorsPage >=
                                                    totalErrorPages
                                                }
                                                onClick={() =>
                                                    setErrorsPage((prev) =>
                                                        Math.min(
                                                            totalErrorPages,
                                                            prev + 1,
                                                        ),
                                                    )
                                                }
                                            >
                                                Siguiente
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {showSessionCard && liveSession && (
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                        Sesión de {currentActionLabel}
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                        {liveSession.message}
                                    </p>
                                    {liveSession.original_filename && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            Archivo:{' '}
                                            {liveSession.original_filename}
                                        </p>
                                    )}
                                </div>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        liveSession.is_finished
                                            ? liveSession.ok
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-rose-100 text-rose-700'
                                            : 'bg-amber-100 text-amber-700'
                                    }`}
                                >
                                    {currentStatusLabel}
                                </span>
                            </div>

                            <div className="mt-3">
                                <div className="mb-1 flex justify-between text-xs text-slate-600">
                                    <span>Progreso</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className={`h-full transition-[width] duration-700 ease-out ${
                                            liveSession.is_finished
                                                ? liveSession.ok
                                                    ? 'bg-emerald-500'
                                                    : 'bg-rose-500'
                                                : 'bg-amber-500'
                                        }`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                {liveSession.resume_from_row &&
                                    liveSession.resume_from_row > 1 && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            Reanuda desde fila aproximada{' '}
                                            {liveSession.resume_from_row}.
                                        </p>
                                    )}
                            </div>

                            {liveSession.error_message && (
                                <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                    {liveSession.error_message}
                                </p>
                            )}
                            {isSessionStalled && (
                                <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                    La sesión parece detenida. Verifica `php
                                    artisan queue:work` o reintenta.
                                </p>
                            )}

                            {isQueueRunning &&
                                liveSession.action === 'import' && (
                                    <div className="mt-3">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="border-rose-300 text-rose-700 hover:bg-rose-50"
                                                >
                                                    Cancelar importación
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Cancelar importación en
                                                        curso
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Se detendrá el
                                                        procesamiento de esta
                                                        sesión. Los cambios ya
                                                        aplicados no se
                                                        revierten
                                                        automáticamente.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Volver
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-rose-600 text-white hover:bg-rose-700"
                                                        onClick={() =>
                                                            router.post(
                                                                liveSession.cancel_url,
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                    preserveState: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        Sí, cancelar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                )}

                            {isQueueRunning && (
                                <p className="mt-3 text-xs text-slate-500">
                                    Puedes seguir usando el sistema. Esta
                                    importación se procesa en cola y el estado
                                    se actualiza automáticamente.
                                </p>
                            )}
                        </div>
                    )}

                    {Array.isArray(recentSessions) &&
                        recentSessions.length > 0 && (
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    Últimas sesiones
                                </p>
                                <div className="mt-3 space-y-2">
                                    {recentSessions.map((sessionItem) => {
                                        const isCurrent =
                                            liveSession?.id === sessionItem.id;
                                        return (
                                            <div
                                                key={sessionItem.id}
                                                className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                                                                sessionItem.action ===
                                                                'validate'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-emerald-100 text-emerald-700'
                                                            }`}
                                                        >
                                                            {
                                                                ACTION_LABELS[
                                                                    sessionItem
                                                                        .action
                                                                ]
                                                            }
                                                        </span>
                                                        <p className="truncate text-xs font-medium text-slate-800">
                                                            {sessionItem.original_filename ||
                                                                'Archivo sin nombre'}
                                                        </p>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500">
                                                        {
                                                            STATUS_LABELS[
                                                                sessionItem
                                                                    .status
                                                            ]
                                                        }{' '}
                                                        ·{' '}
                                                        {sessionItem.progress_percent ??
                                                            0}
                                                        % ·{' '}
                                                        {sessionItem.updated_at
                                                            ? new Date(
                                                                  sessionItem.updated_at,
                                                              ).toLocaleString()
                                                            : 'sin fecha'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {sessionItem.action ===
                                                        'import' &&
                                                        RETRYABLE_STATUSES.includes(
                                                            sessionItem.status,
                                                        ) && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="h-7 px-2 text-[11px]"
                                                                disabled={Boolean(
                                                                    isQueueRunning,
                                                                )}
                                                                onClick={() =>
                                                                    router.post(
                                                                        sessionItem.retry_url,
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                            preserveState: true,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                Reintentar
                                                            </Button>
                                                        )}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-7 px-2 text-[11px]"
                                                        disabled={isCurrent}
                                                        onClick={() =>
                                                            router.get(
                                                                '/productos/items/import',
                                                                {
                                                                    session:
                                                                        sessionItem.id,
                                                                },
                                                                {
                                                                    preserveScroll: true,
                                                                    preserveState: true,
                                                                    replace: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        {isCurrent
                                                            ? 'Actual'
                                                            : 'Ver'}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    {/* Botón de descargar plantilla */}
                    <div className="flex items-center justify-between text-center">
                        <p>Plantilla de importación:</p>
                        <div className="flex items-center gap-3">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-auto p-0 text-rose-600 hover:bg-transparent hover:text-rose-700 hover:underline disabled:text-rose-300"
                                        disabled={
                                            Boolean(isQueueRunning) ||
                                            isSubmitting
                                        }
                                    >
                                        Limpiar historial
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Limpiar historial de importaciones
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Se eliminará el historial de
                                            sesiones y los archivos Excel/CSV
                                            temporales del storage. Esta acción
                                            no borra productos ni variantes
                                            creados.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={onClearHistory}
                                            className="bg-rose-600 text-white hover:bg-rose-700"
                                        >
                                            Limpiar ahora
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <a
                                href="/template_productos.xlsx"
                                download
                                className="text-green-600 hover:underline"
                            >
                                Descargar Plantilla
                            </a>
                        </div>
                    </div>

                    {/* Botón de envío */}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 border-green-600 text-green-700 hover:bg-green-50"
                            disabled={
                                !file || isSubmitting || Boolean(isQueueRunning)
                            }
                            onClick={handleSubmit((data) =>
                                onSubmit(data, 'validate'),
                            )}
                        >
                            {isSubmitting && lastAction === 'validate' && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isSubmitting && lastAction === 'validate'
                                ? 'Validando...'
                                : 'Validar archivo'}
                        </Button>

                        <Button
                            type="button"
                            className={`h-11 ${canImport ? 'bg-black text-white hover:bg-black/90' : 'bg-gray-300 text-gray-500'}`}
                            disabled={
                                !file ||
                                isSubmitting ||
                                !canImport ||
                                Boolean(isQueueRunning)
                            }
                            onClick={handleSubmit((data) =>
                                onSubmit(data, 'import'),
                            )}
                        >
                            {isSubmitting && lastAction === 'import' && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isSubmitting && lastAction === 'import'
                                ? 'Importando...'
                                : 'Importar'}
                        </Button>
                    </div>
                    {!canImport && (
                        <p className="text-center text-xs text-slate-500">
                            Primero valida el archivo y asegúrate de que termine
                            sin errores para habilitar la importación.
                        </p>
                    )}
                </div>
            </form>
        </FormProvider>
    );
}
