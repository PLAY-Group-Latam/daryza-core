/* eslint-disable @typescript-eslint/no-explicit-any */
import FormImport from '@/components/custom-ui/products/items-table/FormImport';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Import() {
    const { import: importData } = usePage<{ import?: any }>().props;

    console.log(importData);
    return (
        <AppLayout>
            <Head title="Importar Productos" />

            <div className="flex flex-col gap-6 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Link
                        href="/productos/items"
                        className="text-sm text-muted-foreground hover:underline"
                    >
                        ← Volver a la lista
                    </Link>
                </div>

                {/* Formulario Import */}
                <FormImport />
            </div>
        </AppLayout>
    );
}
