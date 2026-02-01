import BlogForm from '@/components/custom-ui/blogs/FormBlog';
import AppLayout from '@/layouts/app-layout';
import { Blog, BlogCategory } from '@/types/blogs';
import { Head, usePage } from '@inertiajs/react';

export default function Edit() {
    const { categories, blog } = usePage<{
        categories: BlogCategory[];
        blog: Blog;
    }>().props;
    return (
        <AppLayout>
            <Head title="Lista de CLientes" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Editar Blog
                    </h1>
                </div>

                <BlogForm categories={categories} blog={blog} />
            </div>
        </AppLayout>
    );
}
