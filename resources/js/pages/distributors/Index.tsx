import AppLayout from '@/layouts/app-layout'
import { Head, router, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import TableList from '@/components/custom-ui/distributors/TableList'
import { Distributor } from '@/types/distributors/distributors'


export default function Index() {
    // Usamos usePage para extraer los props, igual que en tus otros componentes
    // Esto mantiene la consistencia total en tu proyecto
    const { paginatedDistributors, filters } = usePage<{
        paginatedDistributors: Paginated<Distributor>;
        filters: { search?: string };
    }>().props;

    return (
        <AppLayout>
            <Head title="Distribuidores" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between px-4 pt-4">
                    <div>
                        <h1 className="text-lg font-bold lg:text-2xl">
                            Distribuidores Autorizados
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona las ubicaciones y puntos de venta.
                        </p>
                    </div>

                    <Button
                        className="bg-black shadow-md hover:bg-slate-800 transition-all"
                        onClick={() => router.get('/distributors/create')}
                    >
                        Crear Nuevo Distribuidor
                    </Button>
                </div>

                {/* Pasamos la data paginada al TableList */}
                {/* Asegúrate que el TableList de Distribuidores reciba 'data' y 'filters' */}
                <TableList 
                    data={paginatedDistributors} 
                    filters={filters} 
                />
            </div>
        </AppLayout>
    );
}