import FormImport from '@/components/custom-ui/products/product/FormImport';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BackButton } from '@/components/custom-ui/PageHeader';

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
                    <div className=" flex items-center gap-4">
                        <BackButton></BackButton>
                    </div>
                </div>

                {/* Formulario */}
                <FormImport />
            </div>
        </AppLayout>
    );
}
