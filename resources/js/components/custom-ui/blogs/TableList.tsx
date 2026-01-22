'use client';

import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/helpers/formatDate';
import { Blog } from '@/types/blogs';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../tables/DataTable';

interface TableListProps {
    data: Paginated<Blog>;
}

export const columns: ColumnDef<Blog>[] = [
    {
        accessorKey: 'title',
        header: 'Título',
        cell: ({ row }) => row.original.title,
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
        accessorKey: 'author',
        header: 'Autor',
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
        accessorKey: 'featured',
        header: 'Destacado',
        cell: ({ row }) =>
            row.original.featured ? (
                <Badge>Sí</Badge>
            ) : (
                <Badge variant="outline">No</Badge>
            ),
    },
    {
        accessorKey: 'publication_date',
        header: 'Fecha publicación',
        cell: ({ row }) => formatDate(row.original.publication_date),
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: () => <div>asdsadsasd</div>,
    },
];

export default function TableList({ data }: TableListProps) {
    if (!data) return null;

    return <DataTable columns={columns} data={data} />;
}
