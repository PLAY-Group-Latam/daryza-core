/* eslint-disable react-hooks/incompatible-library */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
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

export default function FormImport() {
    const [uploadProgress, setUploadProgress] = useState(0);

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

    const onSubmit = async (data: ImportFormValues) => {
        const formData = new FormData();
        formData.append('file', data.file);

        // Aquí se muestra el loader mientras se envía la petición
        await new Promise<void>((resolve) => {
            router.post(products.items.import().url, formData, {
                forceFormData: true,
                preserveScroll: true,
                onProgress: (progressEvent) => {
                    if (progressEvent?.lengthComputable) {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total!,
                        );
                        setUploadProgress(percent);
                    }
                },
                onFinish: () => {
                    setUploadProgress(0); // reset
                    resolve();
                },
            });
        });
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="relative mx-auto max-w-md"
            >
                {' '}
                {isSubmitting && (
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                        <Loader2 className="mb-4 h-12 w-12 animate-spin text-white" />
                        <span className="mb-2 font-semibold text-white">
                            Importando productos...
                        </span>
                        <div className="h-3 w-64 overflow-hidden rounded-full bg-white/20">
                            <div
                                className="h-3 rounded-full bg-green-500 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <span className="mt-1 text-white">
                            {uploadProgress}%
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

                    {/* Botón de descargar plantilla */}
                    <div className="flex items-center justify-between text-center">
                        <p>Plantilla de importación:</p>
                        <a
                            href="#"
                            download
                            className="text-green-600 hover:underline"
                        >
                            Descargar Plantilla
                        </a>
                    </div>

                    {/* Botón de envío */}
                    <Button
                        type="submit"
                        className={`flex h-11 w-full items-center justify-center gap-2 transition-colors duration-300 ${isSubmitting ? 'cursor-not-allowed bg-gray-400' : 'bg-green-600 text-white hover:bg-green-700'} `}
                        disabled={!file || isSubmitting}
                    >
                        {isSubmitting && (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        )}
                        <span>
                            {isSubmitting
                                ? 'Importando productos...'
                                : 'Importar Productos'}
                        </span>
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
