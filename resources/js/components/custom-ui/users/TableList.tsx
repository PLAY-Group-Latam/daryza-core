import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import users from '@/routes/users';
import { User } from '@/types/user';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { ConfirmDeleteAlert } from '../ConfirmDeleteAlert';
import { DataTable } from '../tables/DataTable';
import { CreateOrUpdateUserModal } from './CreateOrUpdateUserModal';

interface TableListProps {
    data: Paginated<User>;
}

export const columns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
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
            const user = row.original;

            return (
                <div className="flex items-center gap-2">
                    <CreateOrUpdateUserModal
                        user={user}
                        trigger={
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                title="Editar Usuario"
                            >
                                <Edit />
                            </Button>
                        }
                    />

                    <ConfirmDeleteAlert
                        resourceId={user.id}
                        resourceName={user.name}
                        routes={users}
                        trigger={
                            <Button
                                variant="destructive"
                                size="icon"
                                title="Eliminar Usuario"
                                className="bg-red-700!"
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
