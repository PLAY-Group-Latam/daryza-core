import TableList from '@/components/custom-ui/jobsPortal/places/TableList';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';

type Place = {
    id: string;
    name: string;
    address: string;
    city: string;
    is_active: boolean;
};

export default function Index() {
    const { paginatedPlaces, filters } = usePage<{
        paginatedPlaces: Paginated<Place>;
        filters: { search?: string };
    }>().props;

    return (
        <AppLayout>
            <Head title="Sedes" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">Sedes</h1>
                    <Link href="/admin/jobs/places/create">
                        <Button>Crear Sede</Button>
                    </Link>
                </div>

                <TableList data={paginatedPlaces} filters={filters} />
            </div>
        </AppLayout>
    );
}
