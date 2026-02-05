import BlogForm from '@/components/custom-ui/blogs/FormBlog';
import AppLayout from '@/layouts/app-layout';
import { BlogCategory } from '@/types/blogs';
import { Head, usePage } from '@inertiajs/react';

export default function Create() {
    const { categories } = usePage<{
        categories: BlogCategory[];
    }>().props;
    return (
        <AppLayout>
            <Head title="Lista de CLientes" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Crear Blog
                    </h1>
                </div>

                <BlogForm categories={categories} />
            </div>
        </AppLayout>
    );
}
