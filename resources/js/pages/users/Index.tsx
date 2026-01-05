import { CreateOrUpdateUserModal } from '@/components/custom-ui/users/CreateOrUpdateUserModal';
import TableList from '@/components/custom-ui/users/TableList';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { PaginatedUsers } from '@/types/user';
import { Head, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function Index() {
    const { paginatedUsers } = usePage<{ paginatedUsers: PaginatedUsers }>()
        .props;
    return (
        <AppLayout>
            <Head title="Lista de Usuarios" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Usuarios
                    </h1>
                    <CreateOrUpdateUserModal
                        trigger={
                            <Button variant="default">
                                <Plus className="mr-1 h-4 w-4" /> Crear Usuario
                            </Button>
                        }
                    />
                </div>
                <TableList data={paginatedUsers} />
            </div>
        </AppLayout>
    );
}
