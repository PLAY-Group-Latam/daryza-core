'use client';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import attributes from '@/routes/products/attributes';
import { Attribute } from '@/types/products';
import { ColumnDef } from '@tanstack/react-table';
import { Trash } from 'lucide-react';
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
    // {
    //     accessorKey: 'type',
    //     header: 'Tipo',
    //     cell: ({ row }) => (
    //         <span className="capitalize">{row.original.type}</span>
    //     ),
    // },
    {
        accessorKey: 'is_variant',
        header: 'Variante',
        cell: ({ row }) => (
            <span
                className={
                    row.original.is_variant
                        ? 'font-medium text-green-600'
                        : 'font-medium text-red-600'
                }
            >
                {row.original.is_variant ? 'Sí' : 'No'}
            </span>
        ),
    },
    {
        accessorKey: 'is_filterable',
        header: 'Filtrable',
        cell: ({ row }) => (
            <span
                className={
                    row.original.is_filterable
                        ? 'font-medium text-green-600'
                        : 'font-medium text-red-600'
                }
            >
                {row.original.is_filterable ? 'Sí' : 'No'}
            </span>
        ),
    },
    {
        id: 'values',
        header: 'Valores',
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

            return (
                <div className="flex flex-wrap gap-2">
                    {attribute.values.map((v) => {
                        const color = isColor(v.value);

                        return (
                            <div
                                key={v.id}
                                className="flex items-center gap-1 text-xs"
                            >
                                {color && (
                                    <span
                                        className="h-4 w-4 rounded-full border"
                                        style={{ backgroundColor: v.value }}
                                        title={v.value}
                                    />
                                )}

                                {/* <span className="font-medium">{v.value}</span> */}
                            </div>
                        );
                    })}
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
                    {/* <ModalFormAttributes
            attribute={attribute}
            trigger={
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Editar atributo"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit />
              </Button>
            }
          /> */}

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
