import TableList from '@/components/custom-ui/jobsPortal/offers/TableList';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';

type Offer = {
    id: string;
    title: string;
    modality: string;
    vacancies: number;
    is_active: boolean;
    area?: { id: string; name: string };
    place?: { id: string; name: string; city: string };
};

export default function Index() {
    const { paginatedOffers, filters } = usePage<{
        paginatedOffers: Paginated<Offer>;
        filters: { search?: string; is_active?: string };
    }>().props;

    return (
        <AppLayout>
            <Head title="Ofertas Laborales" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">Ofertas Laborales</h1>
                    <Link href="/admin/jobs/offers/create">
                        <Button>Crear Oferta</Button>
                    </Link>
                </div>

                <TableList data={paginatedOffers} filters={filters} />
            </div>
        </AppLayout>
    );
}
