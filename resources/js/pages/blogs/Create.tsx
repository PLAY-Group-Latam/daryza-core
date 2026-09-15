import BlogForm from '@/components/custom-ui/blogs/FormBlog';
import AppLayout from '@/layouts/app-layout';
import { BlogCategory } from '@/types/blogs';
import { Head, usePage } from '@inertiajs/react';
import { BackButton } from '@/components/custom-ui/PageHeader';

export default function Create() {
    const { categories } = usePage<{
        categories: BlogCategory[];
    }>().props;
    return (
        <AppLayout>
            <Head title="Lista de Blog" />
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>
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
