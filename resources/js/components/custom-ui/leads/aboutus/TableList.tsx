'use client';

import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Building2, Calendar, Eye, Mail } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers/formatDate';
import { AboutUs } from '@/types/leads/about';
import { DataTable } from '../../tables/DataTable';
import { ModalAboutUs } from './ModalList';

interface TableListProps {
    data: Paginated<AboutUs>;
    filters?: {
        search?: string;
    };
}

export default function TableList({ data, filters }: TableListProps) {
    const [selectedItem, setSelectedItem] = useState<AboutUs | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSearch = useCallback(
        (value: string) => {
            router.get(
                window.location.pathname,
                { ...filters, search: value },
                { preserveState: true, replace: true },
            );
        },
        [filters],
    );

    const handleViewDetails = useCallback((item: AboutUs) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    }, []);

    const columns = useMemo<ColumnDef<AboutUs>[]>(
        () => [
            {
                accessorKey: 'full_name',
                header: 'Contacto',
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {/* CORRECCIÓN: last_name está en item.data */}
                                {item.full_name} {item.data?.last_name || ''}
                            </span>
                            <span className="text-darysa-azul-600 text-[10px] font-bold tracking-tight uppercase">
                                Solicitud de Información
                            </span>
                        </div>
                    );
                },
            },
            {
                // Usamos un id único porque company_name no existe en la raíz
                id: 'company',
                header: 'Empresa',
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="flex items-center gap-2 text-slate-600">
                            <Building2 size={12} className="opacity-70" />
                            <span className="text-xs font-medium">
                                {/* CORRECCIÓN: company_name está en item.data */}
                                {item.data?.company_name || 'Particular'}
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
                        <span className="max-w-[180px] truncate text-xs">
                            {row.original.email}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'created_at',
                header: 'Fecha de Registro',
                cell: ({ row }) => (
                    <div className="flex flex-col text-slate-600">
                        <div className="flex items-center gap-2">
                            <Calendar size={12} className="opacity-70" />
                            <span className="text-xs whitespace-nowrap">
                                {formatDate(row.original.created_at)}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                id: 'actions',
                header: () => <div className="pr-4 text-right">Acciones</div>,
                cell: ({ row }) => (
                    <div className="pr-2 text-right">
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
        [handleViewDetails],
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
                    placeholder="Buscar por nombre, email o empresa..."
                />
            </div>

            <ModalAboutUs
                // Mantenemos el cast as any porque el modal original espera Contact
                item={selectedItem as any}
                isOpen={isModalOpen}
                onClose={setIsModalOpen}
            />
        </div>
    );
}
