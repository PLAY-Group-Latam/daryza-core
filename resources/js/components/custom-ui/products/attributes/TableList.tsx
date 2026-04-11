'use client';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import attributes from '@/routes/products/attributes';
import { Attribute } from '@/types/products/attributes';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { ConfirmDeleteAlert } from '../../ConfirmDeleteAlert';
import { DataTable } from '../../tables/DataTable';

interface TableListProps {
    data: Paginated<Attribute>;
}

const columns: ColumnDef<Attribute>[] = [
    {
        accessorKey: 'name',
        header: 'Nombre',
    },
    {
        id: 'usage',
        header: 'Uso',
        cell: ({ row }) => (
            <span
                className={
                    row.original.is_variant
                        ? 'font-medium text-emerald-700'
                        : 'font-medium text-blue-700'
                }
            >
                {row.original.is_variant ? 'Variante' : 'Especificación'}
            </span>
        ),
    },
    // {
    //     accessorKey: 'type',
    //     header: 'Tipo',
    //     cell: ({ row }) => (
    //         <span className="capitalize">{row.original.type}</span>
    //     ),
    // },
    // {
    //     accessorKey: 'is_variant',
    //     header: 'Variante',
    //     cell: ({ row }) => (
    //         <span
    //             className={
    //                 row.original.is_variant
    //                     ? 'font-medium text-green-600'
    //                     : 'font-medium text-red-600'
    //             }
    //         >
    //             {row.original.is_variant ? 'Sí' : 'No'}
    //         </span>
    //     ),
    // },

    {
        id: 'values',
        header: 'Valores',
        size: 320,
        maxSize: 360,
        cell: ({ row }) => {
            const attribute = row.original;

            if (attribute.type !== 'select') {
                return (
                    <span className="text-xs text-gray-400 italic">
                        No aplica
                    </span>
                );
            }

            if (!attribute.values || attribute.values.length === 0) {
                return (
                    <span className="text-xs text-red-500">Sin valores</span>
                );
            }

            const isColor = (value: string) =>
                /^#([0-9A-F]{3}){1,2}$/i.test(value);

            const colors = attribute.values.filter((v) => isColor(v.value));
            const textValues = attribute.values
                .filter((v) => !isColor(v.value))
                .map((v) => v.value);
            const visibleTexts = textValues.slice(0, 6).join(', ');
            const hiddenTextsCount = Math.max(textValues.length - 6, 0);

            return (
                <div className="flex max-w-[320px] flex-wrap items-center gap-2">
                    {colors.map((v) => (
                        <span
                            key={v.id}
                            className="h-4 w-4 rounded-full border"
                            style={{ backgroundColor: v.value }}
                            title={v.value}
                        />
                    ))}

                    {visibleTexts && (
                        <span
                            className="max-w-[260px] truncate text-xs text-gray-700"
                            title={textValues.join(', ')}
                        >
                            {visibleTexts}
                            {hiddenTextsCount > 0
                                ? `, +${hiddenTextsCount}`
                                : ''}
                        </span>
                    )}
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
            const attribute = row.original;

            return (
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Editar atributo"
                        asChild
                    >
                        <Link href={attributes.edit(attribute.id)}>
                            <Edit />
                        </Link>
                    </Button>
                    <ConfirmDeleteAlert
                        resourceId={attribute.id}
                        resourceName={attribute.name}
                        routes={attributes}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar atributo"
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
    if (!data) {
        return (
            <div className="p-4 text-center text-gray-500">
                No hay atributos disponibles.
            </div>
        );
    }

    return <DataTable columns={columns} data={data} />;
}
