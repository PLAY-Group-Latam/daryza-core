import FormLanding from '@/components/custom-ui/landings/FormLanding';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BackButton } from '@/components/custom-ui/PageHeader';

export default function Create() {
    return (
        <AppLayout>
            <Head title="Crear Landing" />
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">Crear Landing</h1>
                </div>

                <FormLanding />
            </div>
        </AppLayout>
    );
}
