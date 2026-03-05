import { useFlashMessage } from '@/hooks/use-flash-message';
import { Paginate } from '@/interfaces/paginate';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Script } from './components/ScriptForm';
import { TableList } from './components/table-list';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Lista de Scripts', href: '/scripts' },
];

interface ScriptsListProps {
    scripts: Script[];
    meta: Paginate;
}

export default function ScriptsList({ scripts, meta }: ScriptsListProps) {
    useFlashMessage();
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lista de Scripts" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-0">
                <div className="flex justify-between">
                    <div className="text-lg font-bold lg:text-2xl">Lista de Scripts</div>
                    <Button onClick={() => router.visit('/scripts/create')}>
                        Nuevo Script
                    </Button>
                </div>

                <TableList data={scripts} meta={meta} />
            </div>
        </AppLayout>
    );
}