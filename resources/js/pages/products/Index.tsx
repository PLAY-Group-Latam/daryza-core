import TableList from '@/components/custom-ui/products/product/TableList';
import AppLayout from '@/layouts/app-layout';
import productRoutes from '@/routes/products';
import { Product } from '@/types/products/product';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function Index() {
    const { products, filters } = usePage<{
        products: Paginated<Product>;
        filters?: {
            search?: string;
        };
    }>().props;

    return (
        <AppLayout>
            <Head title="Lista de Productos" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4 sm:p-6">
                {/* Cabecera responsiva: se apila en móvil y se pone en fila en pantallas medianas/grandes */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-xl font-bold lg:text-2xl">
                        Lista de Productos
                    </h1>

                    {/* Contenedor de botones adaptado para móviles (scroll horizontal o wrap) */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Botón para crear producto */}
                        <Link
                            href="/productos/items/create"
                            className="flex items-center gap-2 rounded-sm bg-black px-3 py-2 text-xs sm:text-sm text-white hover:bg-black/90"
                        >
                            <Plus className="h-4 w-4 shrink-0" />
                            <span>Crear Producto</span>
                        </Link>

                        {/* Botón para importar Excel */}
                        <Link
                            href="/productos/items/import"
                            className="flex items-center gap-2 rounded-sm bg-black px-3 py-2 text-xs sm:text-sm text-white hover:bg-black/90"
                        >
                            <Plus className="h-4 w-4 shrink-0" />
                            <span>Importar</span>
                        </Link>

                        {/* Botón para exportar */}
                        <button
                            onClick={() => {
                                window.location.href =
                                    productRoutes.items.export().url;
                            }}
                            className="flex cursor-pointer items-center gap-2 rounded-sm bg-black px-3 py-2 text-xs sm:text-sm text-white hover:bg-black/90"
                        >
                            <Plus className="h-4 w-4 shrink-0" />
                            <span>Exportar</span>
                        </button>
                    </div>
                </div>

                {/* Contenedor de la tabla con scroll horizontal para evitar desbordamientos en móvil */}
                <div className="w-full overflow-x-auto">
                    <TableList data={products} filters={filters} />
                </div>
            </div>
        </AppLayout>
    );
}