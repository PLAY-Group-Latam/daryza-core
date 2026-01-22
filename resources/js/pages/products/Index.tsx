import TableList from '@/components/custom-ui/products/items-table/TableList';
import AppLayout from '@/layouts/app-layout';
import { Product } from '@/types/products';
import { Head, usePage } from '@inertiajs/react';
// import { Button } from '@/components/ui/button';
// import { Plus } from 'lucide-react';

export default function Index() {
    const { products } = usePage<{
        products: Paginated<Product>;
    }>().props;

    return (
        <AppLayout>
            <Head title="Lista de Productos" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Productos
                    </h1>

                    {/*
          Luego aquí pondrás tu botón para crear producto
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Crear Producto
          </Button>
          */}
                </div>

                <TableList data={products} />
            </div>
        </AppLayout>
    );
}
