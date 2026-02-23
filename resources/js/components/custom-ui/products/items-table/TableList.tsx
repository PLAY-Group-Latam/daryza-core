'use client';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import {
    getMainVariant,
    getVariantFirstImage,
} from '@/lib/helpers/GetMainVariant';
import products from '@/routes/products';
import { Product } from '@/types/products/product';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { ConfirmDeleteAlert } from '../../ConfirmDeleteAlert';
import { StatusBadge } from '../../StatusBadge';
import { DataTable } from '../../tables/DataTable';

interface TableListProps {
    data: Paginated<Product>;
}

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: 'name',
        header: 'Slug / Nombre ',
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
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'is_active',
        header: 'Estado',
        cell: ({ row }) => <StatusBadge status={row.original.is_active} />,
    },
    // {
    //     accessorKey: 'brief_description',
    //     header: 'Descripción Corta',
    //     cell: ({ row }) => {
    //         const description = row.original.brief_description;
    //         return (
    //             <div className="w-full max-w-[300px]">
    //                 <p className="w-full truncate text-sm">
    //                     {description || (
    //                         <span className="text-gray-300">
    //                             Sin descripción
    //                         </span>
    //                     )}
    //                 </p>
    //             </div>
    //         );
    //     },
    // },
    {
        id: 'product_info',
        header: 'Precio / Sku Daryza / Stock',
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
                        {mainVariant ? (
                            <>
                                <span className="font-semibold text-gray-800">
                                    S/{mainVariant.price}
                                </span>
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
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Editar atributo"
                        asChild
                    >
                        <Link href={products.items.edit(product.id)}>
                            <Edit />
                        </Link>
                    </Button>

                    <ConfirmDeleteAlert
                        resourceId={product.id}
                        resourceName={product.name}
                        routes={products.items}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar Categoría"
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
