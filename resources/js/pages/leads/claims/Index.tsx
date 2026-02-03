import TableList from '@/components/custom-ui/leads/TableList';
import AppLayout from '@/layouts/app-layout';
import { Claim } from '@/types/claim';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function Index() {
    const { paginatedClaims } = usePage<{
        paginatedClaims: Paginated<Claim>;
    }>().props;

    return (
        <AppLayout>
            <Head title="Lista de Reclamaciones" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Reclamaciones
                    </h1>

                </div>

                <TableList data={paginatedClaims} />
            </div>
        </AppLayout>
    );
}