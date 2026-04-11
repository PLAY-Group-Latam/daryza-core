import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { PaymentMethod } from '@/types/paymentmethods';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TableList } from '@/components/custom-ui/paymentmethods/TableList';
import { useFlashMessage } from '@/hooks/use-flash-message';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Métodos de Pago', href: '/metodos-de-pago' },
];

interface Props {
    paymentMethods: PaymentMethod[];
}

export default function PaymentMethodsList({ paymentMethods }: Props) {
  
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Métodos de Pago" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="text-lg font-bold lg:text-2xl">Lista de Métodos de Pago</div>
                    
                    {/* Botón de creación movido aquí para seguir el estilo de Scripts */}
                    <Button onClick={() => router.visit('/metodos-de-pago/crear')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Cuenta Bancaria
                    </Button>
                </div>

                <div className="flex flex-col gap-6">
                    <TableList data={paymentMethods} />
                </div>
            </div>
        </AppLayout>
    );
}