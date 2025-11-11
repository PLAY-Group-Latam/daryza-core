import { User } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../tables/DataTable';

interface TableListProps {
    data: User[];
}

export const columns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'created_at', header: 'Creado el' },
];

export default function TableList({ data }: TableListProps) {
    return <DataTable columns={columns} data={data} />;
}
