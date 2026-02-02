'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import products from '@/routes/products';
import { Loader2 } from 'lucide-react';

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
                onFinish: () => resolve(), // termina el loader cuando Inertia confirma
            });
        });
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="relative mx-auto max-w-md space-y-6"
            >
                {/* Encabezado */}
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
                        <div className="flex flex-col items-start gap-2">
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) =>
                                    field.onChange(e.target.files?.[0] || null)
                                }
                                className="block w-full rounded-md border border-gray-300 p-2"
                            />
                            {errors.file && (
                                <InputError message={errors.file.message} />
                            )}
                            {file && (
                                <p className="text-sm text-gray-600">
                                    Archivo seleccionado: {file.name}
                                </p>
                            )}
                        </div>
                    )}
                />

                {/* Botón de descargar plantilla */}
                <div className="text-center">
                    <a
                        href="#"
                        download
                        className="rounded-xl bg-green-600 px-2.5 py-1.5 text-white"
                    >
                        Descargar Plantilla
                    </a>
                </div>

                {/* Botón de envío */}
                <Button
                    type="submit"
                    className="flex h-11 w-full items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
                    disabled={!file || isSubmitting}
                >
                    {isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {isSubmitting ? 'Enviando...' : 'Importar Productos'}
                </Button>
            </form>
        </FormProvider>
    );
}
