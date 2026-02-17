'use client';

import { useMemo, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Mail, Calendar, Briefcase, MapPin, UserCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { JobApplication } from '@/types/leads/jobs'; 
import { DataTable } from '../../tables/DataTable';
import { ModalJobDetails } from './ModalList'; 

interface JobTableListProps {
    data: Paginated<JobApplication>;
    filters?: {
        search?: string;
    };
}

export default function JobTableList({ data, filters }: JobTableListProps) {
    const [selectedItem, setSelectedItem] = useState<JobApplication | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSearch = useCallback((value: string) => {
        router.get(
            window.location.pathname,
            { ...filters, search: value },
            { preserveState: true, replace: true },
        );
    }, [filters]);

    const handleViewDetails = useCallback((item: JobApplication) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    }, []);

    const columns = useMemo<ColumnDef<JobApplication>[]>(
        () => [
            {
                accessorKey: 'full_name',
                header: 'Postulante',
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {item.full_name}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-darysa-amarillo-600 tracking-tight">
                                {item.data?.employmentStatus || 'Postulante'}
                            </span>
                        </div>
                    );
                },
            },
            {
                id: 'position_info',
                header: 'Puesto / Área',
                cell: ({ row }) => {
                    const { data: jobData } = row.original;
                    return (
                        <div className="flex flex-col gap-1 text-slate-600">
                            <div className="flex items-center gap-2">
                                <Briefcase size={12} className="opacity-70 text-darysa-azul-600" />
                                <span className="text-xs font-medium capitalize">
                                    {jobData?.position} - {jobData?.area}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={12} className="opacity-70" />
                                <span className="text-[11px] capitalize italic">
                                    {jobData?.location}
                                </span>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'email',
                header: 'Email / Teléfono',
                cell: ({ row }) => (
                    <div className="flex flex-col gap-1 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <Mail size={12} className="shrink-0 opacity-70" />
                            <span className="text-xs truncate max-w-[180px]">
                                {row.original.email}
                            </span>
                        </div>
                        <span className="text-[11px] pl-5 opacity-80">{row.original.phone}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'created_at',
                header: 'Fecha Postulación',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={12} className="opacity-70" />
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
                            className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-zinc-800"
                            onClick={() => handleViewDetails(row.original)}
                        >
                            <Eye size={16} />
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
            <div className="rounded-xl bg-white shadow-sm overflow-hidden border border-gray-100 dark:border-zinc-800 dark:bg-zinc-950">
                <DataTable
                    columns={columns}
                    data={data}
                    onSearch={handleSearch}
                    initialSearch={filters?.search ?? ''}
                />
            </div>

            {/* Modal específico para ver los detalles del trabajo y el CV */}
            <ModalJobDetails
                item={selectedItem}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}