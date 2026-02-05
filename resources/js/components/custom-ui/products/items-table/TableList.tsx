'use client';

import { formatDate } from '@/lib/helpers/formatDate';
import {
    getMainVariant,
    getVariantFirstImage,
} from '@/lib/helpers/GetMainVariant';
import { Product } from '@/types/products/product';
import { Link } from '@inertiajs/react';
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
            // console.log(frontendUrl);
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
        id: 'product_info',
        header: 'Producto / Sku / Stock',
        cell: ({ row }) => {
            const product = row.original;
            const mainVariant = getMainVariant(product);
            const image = getVariantFirstImage(mainVariant);

            return (
                <div className="flex items-center gap-3">
                    <img
                        src={image}
                        alt={product.name}
                        className="h-14 w-14 rounded-md border object-cover"
                    />

                    <div className="flex flex-col text-sm">
                        <span className="font-semibold text-gray-800">
                            {product.name}
                        </span>

                        {mainVariant ? (
                            <>
                                <span className="text-xs text-gray-500">
                                    SKU: {mainVariant.sku || '—'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    Stock: {mainVariant.stock}
                                </span>
                            </>
                        ) : (
                            <span className="text-xs text-gray-400">
                                Sin variantes
                            </span>
                        )}
                    </div>
                </div>
            );
        },
    },
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
        cell: ({ row }) => {
            const product = row.original;
            return (
                <div className="flex items-center gap-2">
                    <Link href={`/productos/items/${product.id}/edit`}>
                        Editar
                    </Link>
                </div>
            );
        },
    },
];

export default function TableList({ data }: TableListProps) {
    if (!data) return null;

    return <DataTable columns={columns} data={data} />;
}
