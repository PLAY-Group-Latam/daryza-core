import { Button } from '@/components/ui/button';
import { Paginate } from '@/interfaces/paginate';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Script } from './types';
import { TableList } from './components/table-list';
import { Plus } from 'lucide-react';

interface ScriptsListProps {
    paginatedScripts: Paginated<Script>;
    filters?: { search?: string };
}

export default function ScriptsList({ paginatedScripts, filters }: ScriptsListProps) {
    return (
        <AppLayout>
            <Head title="Lista de Scripts" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <div className="text-lg font-bold lg:text-2xl">
                        Lista de Scripts
                    </div>
                    <Button onClick={() => router.visit('/scripts/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Script
                    </Button>
                </div>

                <TableList data={paginatedScripts} filters={filters} />
            </div>
        </AppLayout>
    );
}
