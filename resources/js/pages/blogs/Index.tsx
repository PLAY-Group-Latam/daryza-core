import TableList from '@/components/custom-ui/blogs/TableList';
import AppLayout from '@/layouts/app-layout';
import { Blog } from '@/types/blogs';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function Index() {
    const { paginatedBlogs } = usePage<{
        paginatedBlogs: Paginated<Blog>;
    }>().props;

    console.log(paginatedBlogs);
    return (
        <AppLayout>
            <Head title="Lista de Blogs" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Blogs
                    </h1>

                    <Link
                        href="/blogs/items/create"
                        className="flex items-center gap-2 rounded-sm bg-gray-900 px-2.5 py-1.5 text-sm text-white"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Crear Blog
                    </Link>
                </div>

                <TableList data={paginatedBlogs} />
            </div>
        </AppLayout>
    );
}
