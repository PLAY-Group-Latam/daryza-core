'use client';

import { DataTable } from '@/components/custom-ui/tables/DataTable';
import { Paginate } from '@/interfaces/paginate';
import { columns } from './columns-intention-detail';
import { useServerPagination } from '@/lib/utils/useServerPagination';

interface TableDetailProps {
    data: any[];
    meta: Paginate;
}

export function TableDetail({ data: purchaseIntents, meta }: TableDetailProps) {
    // Solo mantenemos goToPage para que la paginación de abajo siga funcionando
    const { goToPage } = useServerPagination();

    const paginatedData = {
        data: purchaseIntents,
        current_page: meta.currentPage,
        last_page: meta.lastPage,
        per_page: meta.perPage,
        total: meta.total,
    } as any;

    return (
        <div className="flex flex-col space-y-4 w-full">
            <div className="rounded-lg bg-card overflow-hidden">
                <DataTable
                    columns={columns}
                    data={paginatedData}
                    // ✅ Al no pasar onSearch, el Input desaparece automáticamente
                />
            </div>
        </div>
    );
}