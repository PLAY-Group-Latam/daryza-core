import FormCreate from '@/components/custom-ui/products/attributes/FormCreate';
import AppLayout from '@/layouts/app-layout';
import { Attribute } from '@/types/products/attributes';
import { Head, usePage } from '@inertiajs/react';
import { BackButton } from '@/components/custom-ui/PageHeader';
export default function Edit() {
    const { attribute } = usePage<{
        attribute: Attribute; // el atributo que viene del backend con sus valores
    }>().props;

    return (
        <AppLayout>
            <Head title="Editar Atributo" />
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Editar Atributo
                    </h1>
                </div>

                {/* Reutilizamos el mismo formulario, pasándole los valores existentes */}
                <FormCreate attribute={attribute} />
            </div>
        </AppLayout>
    );
}
