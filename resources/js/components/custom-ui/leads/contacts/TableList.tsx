'use client';

import { useMemo, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Mail, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { Contact } from '@/types/leads/contacts';
import { DataTable } from '../../tables/DataTable';
import { ModalContactList, TYPE_LABELS } from './ModalList'; 

interface TableListProps {
    data: Paginated<Contact>;
    filters?: {
        search?: string;
        type?: string;
    };
}

export default function TableList({ data, filters }: TableListProps) {
    const [selectedClaim, setSelectedClaim] = useState<Contact | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSearch = useCallback((value: string) => {
        router.get(
            window.location.pathname,
            { ...filters, search: value },
            { preserveState: true, replace: true },
        );
    }, [filters]);

    const handleViewDetails = useCallback((claim: Contact) => {
        setSelectedClaim(claim);
        setIsModalOpen(true);
    }, []);

    const columns = useMemo<ColumnDef<Contact>[]>(
        () => [
            {
                accessorKey: 'full_name',
                header: 'Nombre',
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {item.full_name || '---'}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight">
                                
                                {TYPE_LABELS[item.type] || item.type}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'email',
                header: 'Email',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Mail size={12} className="shrink-0 opacity-70" />
                        <span className="text-xs truncate max-w-[180px]">
                            {row.original.email}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'created_at',
                header: 'Fecha',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar size={12} className="shrink-0 opacity-70" />
                        <span className="text-xs whitespace-nowrap">
                            {formatDate(row.original.created_at)}
                        </span>
                    </div>
                ),
            },
            {
                id: 'actions',
                header: () => <div className="text-right pr-4">Acciones</div>,
                cell: ({ row }) => (
                    <div className="text-right pr-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                            onClick={() => handleViewDetails(row.original)}
                        >
                            <Eye size={16} />
                            <span className="sr-only">Ver detalles</span>
                        </Button>
                    </div>
                ),
            },
        ],
        [handleViewDetails] 
    );

    if (!data?.data) return null;

    return (
        <div className="w-full space-y-4">
            <div>
                <DataTable
                    columns={columns}
                    data={data}
                    onSearch={handleSearch}
                    initialSearch={filters?.search ?? ''}
                />
            </div>

            <ModalContactList
                claim={selectedClaim}
                isOpen={isModalOpen}
                onClose={setIsModalOpen}
            />
        </div>
    );
}