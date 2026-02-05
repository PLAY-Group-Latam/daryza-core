import TableList from '@/components/custom-ui/products/items-table/TableList';
import AppLayout from '@/layouts/app-layout';
import { Product } from '@/types/products/product';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function Index() {
    const { products } = usePage<{
        products: Paginated<Product>;
    }>().props;

    console.log('productos:', products);
    return (
        <AppLayout>
            <Head title="Lista de Productos" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Productos
                    </h1>

                    <div className="flex gap-2">
                        {/* Botón para crear producto */}
                        <Link
                            href="/productos/items/create"
                            className="flex items-center gap-2 rounded-sm bg-gray-900 px-2.5 py-1.5 text-sm text-white"
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Crear Producto
                        </Link>

                        {/* Botón para importar Excel */}
                        <Link
                            href="/productos/items/import"
                            className="flex items-center gap-2 rounded-sm bg-green-600 px-2.5 py-1.5 text-sm text-white hover:bg-green-700"
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Importar Productos
                        </Link>
                    </div>
                </div>

                <TableList data={products} />
            </div>
        </AppLayout>
    );
}
