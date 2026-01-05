'use client';

import { formatDate } from '@/lib/helpers/formatDate';
import { Customer } from '@/types/customers';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../tables/DataTable';
import { ModalChangePassword } from './ModalChangePassword';
import { ModalProfileDetails } from './ModalProfileDetails';

interface TableListProps {
    data: Paginated<Customer>;
}

export const columns: ColumnDef<Customer>[] = [
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    {
        accessorKey: 'phone',
        header: 'Teléfono',
        cell: ({ row }) => <span>{row.original.phone || '-'}</span>,
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
            const customer = row.original;

            return (
                <div className="flex items-center gap-2">
                    <ModalProfileDetails customer={customer} />
                    <ModalChangePassword customer={customer} />
                </div>
            );
        },
    },
];

export default function TableList({ data }: TableListProps) {
    if (!data) return null;

    return <DataTable columns={columns} data={data} />;
}
