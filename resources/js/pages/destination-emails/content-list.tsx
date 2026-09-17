import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { TableList } from './components/table-list';
import { DestinationEmail, DestinationEmailPageOption } from './types';

interface DestinationEmailsListProps {
    paginatedDestinationEmails: Paginated<DestinationEmail>;
    filters?: { search?: string };
    pageOptions: DestinationEmailPageOption[];
}

export default function DestinationEmailsList({
    paginatedDestinationEmails,
    filters,
    pageOptions,
}: DestinationEmailsListProps) {
    return (
        <AppLayout>
            <Head title="Lista de Emails de Destino" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="text-lg font-bold lg:text-2xl">
                        Lista de Emails de Destino
                    </div>
                    <Button onClick={() => router.visit('/destination-emails/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Email
                    </Button>
                </div>

                <TableList
                    data={paginatedDestinationEmails}
                    filters={filters}
                    pageOptions={pageOptions}
                />
            </div>
        </AppLayout>
    );
}
