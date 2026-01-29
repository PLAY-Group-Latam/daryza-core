'use client';

import { formatDate } from '@/lib/helpers/formatDate';
import { Product } from '@/types/products/product';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../tables/DataTable';

interface TableListProps {
    data: Paginated<Product>;
}

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: 'name',
        header: 'Slug / Nombre / Categoría',
        cell: ({ row }) => {
            const product = row.original;
            const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
            console.log(frontendUrl);
            return (
                <div className="flex flex-col text-sm">
                    <a
                        href={`${frontendUrl}/producto/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-fit text-gray-500 hover:underline"
                    >
                        {`/products/${product.slug}`}
                    </a>
                    <div className="flex items-center gap-1">
                        <span className="font-medium text-black">
                            {product.name}
                        </span>

                        {product.category?.name && (
                            <>
                                {'-'}
                                <span className="text-blue-600">
                                    {product.category?.name}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            );
        },
    },

    {
        accessorKey: 'price',
        header: 'Precio',
        cell: ({ row }) => {
            const product = row.original;
            const prices = product.variants.map((v) => {
                // Si hay promo_price activa, la usamos; si no, el precio normal
                return v.is_on_promo && v.promo_price
                    ? Number(v.promo_price)
                    : Number(v.price);
            });

            if (!prices.length)
                return <span className="text-gray-400">Sin variantes</span>;

            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            // Si hay solo un precio, mostrarlo simple
            const displayPrice =
                minPrice === maxPrice
                    ? `S/ ${minPrice.toFixed(2)}`
                    : `S/ ${minPrice.toFixed(2)} - S/ ${maxPrice.toFixed(2)}`;

            return <span>{displayPrice}</span>;
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
