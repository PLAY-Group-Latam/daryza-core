'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import blogs from '@/routes/blogs';
import { Blog } from '@/types/blogs';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { ConfirmDeleteAlert } from '../ConfirmDeleteAlert';
import { DataTable } from '../tables/DataTable';

interface TableListProps {
    data: Paginated<Blog>;
}

export const columns: ColumnDef<Blog>[] = [
    {
        accessorKey: 'title',
        header: 'Artículo',
        cell: ({ row }) => {
            const blog = row.original;
            const frontendUrl = import.meta.env.VITE_FRONTEND_URL;

            return (
                <div className="flex flex-col">
                    <a
                        href={`${frontendUrl}/blogs/${blog.slug}`}
                        className="w-fit font-medium text-blue-600 hover:underline"
                        target="_blank" // si quieres abrir en otra pestaña
                        rel="noopener noreferrer"
                    >
                        {blog.title}
                    </a>
                    <span className="text-sm text-muted-foreground">
                        por {blog.author}
                    </span>
                </div>
            );
        },
    },

    {
        id: 'categories',
        header: 'Categorías',
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
                {row.original.categories.map((cat) => (
                    <Badge key={cat.id}>{cat.name}</Badge>
                ))}
            </div>
        ),
    },

    {
        accessorKey: 'visibility',
        header: 'Visibilidad',
        cell: ({ row }) =>
            row.original.visibility ? (
                <Badge>Publicado</Badge>
            ) : (
                <Badge variant="outline">Borrador</Badge>
            ),
    },

    {
        accessorKey: 'publication_date',
        header: 'Fecha publicación',
        cell: ({ row }) => formatDate(row.original.publication_date, true),
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const blog = row.original;

            return (
                <div className="flex items-center gap-2">
                    {/* Editar */}
                    <Button type="button" variant="outline" size="icon" asChild>
                        <Link
                            href={blogs.items.edit(blog.id)}
                            title="Editar blog"
                        >
                            <Edit />
                        </Link>
                    </Button>

                    {/* Eliminar */}
                    <ConfirmDeleteAlert
                        resourceId={blog.id}
                        resourceName={blog.title}
                        routes={blogs.items}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar blog"
                                className="bg-red-700!"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Trash />
                            </Button>
                        }
                    />
                </div>
            );
        },
    },
];

export default function TableList({ data }: TableListProps) {
    if (!data) return null;

    return <DataTable columns={columns} data={data} />;
}
