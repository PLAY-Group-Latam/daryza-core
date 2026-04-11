import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/helpers/formatDate';
import { useServerPagination } from '@/lib/utils/useServerPagination';
import { Landing } from '@/types/landings';
import { Head, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useState } from 'react';

type LandingLead = {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    created_at: string;
    data?: {
        ruc_or_dni?: string | null;
        company_name?: string | null;
        comments?: string | null;
    } | null;
};

export default function Leads() {
    const { goToPage } = useServerPagination();
    const { landing, paginatedLeads } = usePage<{
        landing: Landing;
        paginatedLeads: Paginated<LandingLead>;
    }>().props;

    const perPageOptions = Array.from(
        new Set(
            [10, 20, 30, 40, 50, paginatedLeads.per_page].filter(
                (value) => value > 0,
            ),
        ),
    ).sort((a, b) => a - b);
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
    const publicUrl = `${frontendUrl}/landing/producto/${landing.slug}`;
    const [selectedLead, setSelectedLead] = useState<LandingLead | null>(null);

    return (
        <AppLayout>
            <Head title={`Leads · ${landing.title}`} />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div>
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Leads de {landing.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Link de landing:{' '}
                        <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            {publicUrl}
                        </a>
                    </p>
                </div>

                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-3 text-left">Fecha</th>
                                <th className="p-3 text-left">Nombre</th>
                                <th className="p-3 text-left">Email</th>
                                <th className="p-3 text-left">Teléfono</th>
                                <th className="p-3 text-left">RUC</th>
                                <th className="p-3 text-left">Empresa</th>
                                <th className="p-3 text-left">Comentarios</th>
                                <th className="p-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLeads.data.length === 0 ? (
                                <tr>
                                    <td
                                        className="p-4 text-center text-muted-foreground"
                                        colSpan={8}
                                    >
                                        No hay leads para esta landing.
                                    </td>
                                </tr>
                            ) : (
                                paginatedLeads.data.map((lead) => (
                                    <tr key={lead.id} className="border-t">
                                        <td className="p-3">
                                            {formatDate(lead.created_at, true)}
                                        </td>
                                        <td className="p-3">
                                            {lead.full_name}
                                        </td>
                                        <td className="p-3">{lead.email}</td>
                                        <td className="p-3">{lead.phone}</td>
                                        <td className="p-3">
                                            {lead.data?.ruc_or_dni ?? '-'}
                                        </td>
                                        <td className="p-3">
                                            {lead.data?.company_name ?? '-'}
                                        </td>
                                        <td className="p-3">
                                            {lead.data?.comments ?? '-'}
                                        </td>
                                        <td className="p-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedLead(lead)
                                                }
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver detalle
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-muted-foreground">
                        Mostrando página {paginatedLeads.current_page} de{' '}
                        {paginatedLeads.last_page} ({paginatedLeads.total} leads
                        en total)
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                                Filas por página
                            </span>
                            <Select
                                value={`${paginatedLeads.per_page}`}
                                onValueChange={(value) =>
                                    goToPage(1, Number(value))
                                }
                            >
                                <SelectTrigger className="h-8 w-[80px]">
                                    <SelectValue
                                        placeholder={`${paginatedLeads.per_page}`}
                                    />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {perPageOptions.map((pageSize) => (
                                        <SelectItem
                                            key={pageSize}
                                            value={`${pageSize}`}
                                        >
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                    goToPage(
                                        paginatedLeads.current_page - 1,
                                        paginatedLeads.per_page,
                                    )
                                }
                                disabled={paginatedLeads.current_page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                    goToPage(
                                        paginatedLeads.current_page + 1,
                                        paginatedLeads.per_page,
                                    )
                                }
                                disabled={
                                    paginatedLeads.current_page ===
                                    paginatedLeads.last_page
                                }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog
                open={!!selectedLead}
                onOpenChange={(open) => !open && setSelectedLead(null)}
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalle del lead</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Fecha
                            </p>
                            <p className="text-sm font-medium">
                                {selectedLead
                                    ? formatDate(selectedLead.created_at, true)
                                    : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Nombre
                            </p>
                            <p className="text-sm font-medium">
                                {selectedLead?.full_name ?? '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Email
                            </p>
                            <p className="text-sm font-medium">
                                {selectedLead?.email ?? '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Teléfono
                            </p>
                            <p className="text-sm font-medium">
                                {selectedLead?.phone ?? '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">RUC</p>
                            <p className="text-sm font-medium">
                                {selectedLead?.data?.ruc_or_dni ?? '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Empresa
                            </p>
                            <p className="text-sm font-medium">
                                {selectedLead?.data?.company_name ?? '-'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Comentarios
                        </p>
                        <p className="mt-1 rounded-md border p-3 text-sm whitespace-pre-wrap">
                            {selectedLead?.data?.comments ?? '-'}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
