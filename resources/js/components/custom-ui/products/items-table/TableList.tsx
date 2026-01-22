'use client';

import { formatDate } from '@/lib/helpers/formatDate';
import { Product } from '@/types/products';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../tables/DataTable';

interface TableListProps {
    data: Paginated<Product>;
}

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => {
            const product = row.original;

            return (
                <div className="flex flex-col">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {product.slug}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'category.name',
        header: 'Categoría',
        cell: ({ row }) => <span>{row.original.category?.name || '-'}</span>,
    },
    {
        accessorKey: 'price',
        header: 'Precio',
        cell: ({ row }) => {
            const product = row.original;
            return <span>S/ {Number(product.price).toFixed(2)}</span>;
        },
    },
    // {
    //   accessororKey: 'stock',
    //   header: 'Stock',
    //   cell: ({ row }) => {
    //     const stock = row.original.stock;

    //     return (
    //       <span
    //         className={
    //           stock > 0
    //             ? 'text-green-600 font-medium'
    //             : 'text-red-600 font-medium'
    //         }
    //       >
    //         {stock}
    //       </span>
    //     );
    //   },
    // },
    {
        accessorKey: 'created_at',
        header: 'Creado el',
        cell: ({ row }) => (
            <span>{formatDate(row.original.created_at, true)}</span>
        ),
    },
    {
        accessorKey: 'updated_at',
        header: 'Actualizado el',
        cell: ({ row }) => (
            <span>{formatDate(row.original.updated_at, true)}</span>
        ),
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: () => {
            // Por ahora vacío como pediste
            return <div className="flex items-center gap-2"></div>;
        },
    },
];

export default function TableList({ data }: TableListProps) {
    if (!data) return null;

    return <DataTable columns={columns} data={data} />;
}
