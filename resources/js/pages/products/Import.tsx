import FormImport from '@/components/custom-ui/products/items-table/FormImport';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

type ImportStatus = 'pending' | 'processing' | 'done' | 'failed';

interface Import {
    id: string;
    status: ImportStatus;
    error_message?: string | null;
}

export default function Import() {
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

                {/* Formulario */}
                <FormImport />
            </div>
        </AppLayout>
    );
}
