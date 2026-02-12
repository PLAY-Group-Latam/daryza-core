import TableList from '@/components/custom-ui/leads/aboutus/TableList';
import AppLayout from '@/layouts/app-layout';
import { AboutUs } from '@/types/leads/about'; // Importamos el nuevo tipo
import { Head, usePage } from '@inertiajs/react';

export default function Index() {
    // Usamos AboutUs aquí para que coincida con lo que enviamos desde Laravel
    const { paginatedClaims, filters } = usePage<{
        paginatedClaims: Paginated<AboutUs>; 
        filters: { search?: string }; 
    }>().props;

    return (
        <AppLayout>
            <Head title="Lista de Nosotros" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg lg:text-2xl text-gray-800">
                        Lista de <span className="font-black">Nosotros</span>
                    </h1>
                </div>

                <TableList 
                    data={paginatedClaims} 
                    filters={filters} 
                />
            </div>
        </AppLayout>
    );
}