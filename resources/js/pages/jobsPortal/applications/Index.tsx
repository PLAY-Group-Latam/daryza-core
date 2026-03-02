import TableList from '@/components/custom-ui/jobsPortal/applications/TableList';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';

type Application = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    cv_path: string;
    job?: { id: string; title: string; slug: string };
};

export default function Index() {
    const { paginatedApplications, filters } = usePage<{
        paginatedApplications: Paginated<Application>;
        filters: { email?: string };
    }>().props;

    return (
        <AppLayout>
            <Head title="Postulaciones" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">Postulaciones</h1>
                </div>

                <TableList data={paginatedApplications} filters={filters} />
            </div>
        </AppLayout>
    );
}
