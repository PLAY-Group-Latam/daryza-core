import TableList from '@/components/custom-ui/leads/jobs/TableList';
import AppLayout from '@/layouts/app-layout';
import { JobApplication } from '@/types/leads/jobs';
import { Head, usePage } from '@inertiajs/react';

export default function Index() {
    const { paginatedJobs, filters } = usePage<{
        paginatedJobs: Paginated<JobApplication>;
        filters: { search?: string }; 
    }>().props;

    return (
        <AppLayout>
            <Head title="Lista de Solicitudes de Trabajo" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Solicitudes de Trabajo
                    </h1>
                </div>

                <TableList 
                    data={paginatedJobs} 
                    filters={filters} 
                />
            </div>
        </AppLayout>
    );
}