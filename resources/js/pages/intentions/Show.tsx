import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { TableDetail } from "@/components/custom-ui/intention/TableDetail";
import { UserAvatar } from '@/components/custom-ui/UserAvatar'; 
import { BackButton } from "@/components/custom-ui/PageHeader";


export default function PurchaseIntentDetail({ paginatedEvents }: { paginatedEvents: any }) {
    const events = paginatedEvents?.data ?? [];
    const firstEvent = events[0];
    const customer = firstEvent?.customer;
    const fullName = customer 
    ? `${customer.full_name ?? ''} ${customer.full_last_name ?? ''}`.trim() 
    : 'Usuario Anónimo';
    return (
        <AppLayout >
            <Head title="Historial de Intenciones de Compra" />
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-6 p-0">
                <div className="flex justify-between items-center">
                    <div className="text-xl font-bold lg:text-2xl text-slate-900">
                        Historial de Intenciones de Compra
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border ">
                    <UserAvatar
                        image={customer?.photo}
                        name={fullName}
                    />
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-base">
                            {fullName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {customer?.email ?? 'Sin correo'}
                        </span>
                    </div>
                </div>

                <TableDetail 
                    data={events} 
                    meta={paginatedEvents?.meta} 
                />
            </div>
        </AppLayout>
    );
}