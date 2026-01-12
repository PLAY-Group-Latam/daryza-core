import {ConfirmDeleteAlert as ModalDelete} from '@/components/custom-ui/ConfirmDeleteAlert';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Script, ScriptForm } from './ScriptForm';

export const columns: ColumnDef<Script>[] = [
    {
        accessorKey: 'name',
        header: 'Nombre',
    },
    {
        accessorKey: 'placement',
        header: 'Ubicación',
        cell: ({ row }) => {
            const placement = row.getValue<'head' | 'body'>('placement');

            return <Badge variant={placement === 'head' ? 'default' : 'secondary'}>{placement === 'head' ? 'Head' : 'Body'}</Badge>;
        },
    },
    {
        accessorKey: 'active',
        header: 'Estado',
        cell: ({ row }) => {
            const active = row.getValue<boolean>('active');

            return (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    } `}
                >
                    {active ? 'Activo' : 'Inactivo'}
                </span>
            );
        },
    },

    {
        accessorKey: 'created_at',
        header: 'Creado el',
        cell: ({ row }) => {
            const createdAt = row.getValue<string>('created_at');
            return format(new Date(createdAt), 'dd/MM/yyyy');
        },
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const script = row.original;

            return (
                <div className="flex gap-2">
                    <ScriptForm script={script} />

                    <ModalDelete
                        title="Eliminar script"
                        messageDelete="¿Está seguro de que desea eliminar este script?"
                        id={script.id}
                        routeName="scripts.destroy"
                    />
                </div>
            );
        },
    },
];
