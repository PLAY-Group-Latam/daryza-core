import TableList from '@/components/custom-ui/jobsPortal/departments/TableList';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';

type Department = { id: string; name: string; is_active: boolean };

export default function Index() {
    const { paginatedDepartments, filters } = usePage<{
        paginatedDepartments: Paginated<Department>;
        filters: { search?: string };
    }>().props;

    return (
        <AppLayout>
            <Head title="Áreas" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">Áreas</h1>
                    <Link href="/admin/jobs/departments/create">
                        <Button>Crear Área</Button>
                    </Link>
                </div>

                <TableList data={paginatedDepartments} filters={filters} />
            </div>
        </AppLayout>
    );
}
