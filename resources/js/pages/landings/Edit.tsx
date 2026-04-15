import FormLanding from '@/components/custom-ui/landings/FormLanding';
import AppLayout from '@/layouts/app-layout';
import { Landing } from '@/types/landings';
import { Head, usePage } from '@inertiajs/react';
import { BackButton } from '@/components/custom-ui/PageHeader';
export default function Edit() {
    const { landing } = usePage<{ landing: Landing }>().props;

    return (
        <AppLayout>
            <Head title="Editar Landing" />
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">Editar Landing</h1>
                </div>

                <FormLanding landing={landing} />
            </div>
        </AppLayout>
    );
}
