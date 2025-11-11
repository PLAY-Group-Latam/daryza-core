import TableList from '@/components/custom-ui/users/TableList';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lista de usuarios',
        href: '/usuarios',
    },
];

export default function Index() {
    const { users } = usePage<{ users: User[] }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lista de Usuarios" />
            <div className="flex flex-1 flex-col gap-4 rounded-xl">
                <div className="flex justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Usuarios
                    </h1>
                    <Button variant="default">
                        <Plus className="mr-1 h-4 w-4" />
                        Crear Usuario
                    </Button>
                </div>
                <TableList data={users} />
            </div>
        </AppLayout>
    );
}
