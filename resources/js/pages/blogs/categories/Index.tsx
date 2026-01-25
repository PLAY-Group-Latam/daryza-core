import TableList from '@/components/custom-ui/blogs/categories/TableList';
import AppLayout from '@/layouts/app-layout';
import { BlogCategory } from '@/types/blogs';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function Index() {
    const { paginatedCategories } = usePage<{
        paginatedCategories: Paginated<BlogCategory>;
    }>().props;

    return (
        <AppLayout>
            <Head title="Lista de Blogs" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Categorías
                    </h1>

                    <Link
                        href="/blogs/categorias/create"
                        className="flex items-center gap-2 rounded-sm bg-gray-900 px-2.5 py-1.5 text-sm text-white"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Crear Categoría
                    </Link>
                </div>

                <TableList data={paginatedCategories} />
            </div>
        </AppLayout>
    );
}
