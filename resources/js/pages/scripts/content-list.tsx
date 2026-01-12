import { useFlashMessage } from '@/hooks/use-flash-message';
import { Paginate } from '@/interfaces/paginate';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Script, ScriptForm } from './components/ScriptForm';
import { TableList } from './components/table-list';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lista de contactos',
        href: '/contactos',
    },
];

interface ScriptsListProps {
    scripts: Script[];
    meta: Paginate;
}

export default function ScriptsList({ scripts, meta }: ScriptsListProps) {
    useFlashMessage();
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zonas de Delivery" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <div className="text-lg font-bold lg:text-2xl">Lista de Scripts</div>
                    <ScriptForm />
                </div>

                <TableList data={scripts} meta={meta} />
            </div>
        </AppLayout>
    );
}
