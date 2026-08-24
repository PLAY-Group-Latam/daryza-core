'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { Claim } from '@/types/leads/claim';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '../../tables/DataTable';
import { ModalClaimList } from './ModalList';

interface TableListProps {
    data: Paginated<Claim>;
    filters?: {
        search?: string;
    };
}

export default function TableList({ data, filters }: TableListProps) {
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSearch = (value: string) => {
        router.get(
            window.location.pathname,
            { search: value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    if (!data || !data.data) return null;

    const handleViewDetails = (claim: Claim) => {
        setSelectedClaim(claim);
        setIsModalOpen(true);
    };

    const columns: ColumnDef<Claim>[] = [
        {
            id: 'code',
            header: 'Código',
            cell: ({ row }) => (
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {row.original.claim_code ?? row.original.data?.claim_code}
                </span>
            ),
        },
        {
            accessorKey: 'full_name',
            header: 'Nombre completo',
            cell: ({ row }) => (
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {row.original.full_name}
                </span>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Correo',
            cell: ({ row }) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {row.original.email}
                </span>
            ),
        },
        {
            id: 'document',
            header: 'Documento',
            cell: ({ row }) => (
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                    {row.original.data.document_type_id}:{' '}
                    {row.original.data.document_number}
                </span>
            ),
        },
        {
            id: 'product_service',
            header: 'Producto/Servicio',
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className="border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                    {row.original.data.well_hired_id}
                </Badge>
            ),
        },
        {
            accessorKey: 'type',
            header: 'Tipo',
            cell: ({ row }) => {
                const type = row.original.data.type_of_claim_id.toLowerCase();
                const isClaim = type === 'reclamo';
                return (
                    <span
                        className={`text-xs font-bold uppercase tracking-wider ${isClaim ? 'text-amber-600 dark:text-amber-500' : 'text-blue-600 dark:text-blue-500'}`}
                    >
                        {row.original.data.type_of_claim_id}
                    </span>
                );
            },
        },
        {
            accessorKey: 'date',
            header: 'Fecha Reclamo',
            cell: ({ row }) => (
                <span className="text-xs text-slate-600 dark:text-slate-400">
                    {formatDate(row.original.data.created_at_form)}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    onClick={() => handleViewDetails(row.original)}
                >
                    <Eye className="h-5 w-5" />
                </Button>
            ),
        },
    ];

    return (
        <div className="w-full">
            <DataTable
                columns={columns}
                data={data}
                onSearch={handleSearch}
                initialSearch={filters?.search}
                placeholder="Buscar por código, nombre, correo o documento..."
            />

            <ModalClaimList
                claim={selectedClaim}
                isOpen={isModalOpen}
                onClose={setIsModalOpen}
            />
        </div>
    );
}