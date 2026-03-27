import { ColumnDef } from "@tanstack/react-table";
import { es } from 'date-fns/locale';
import { formatDistanceToNow, isValid } from "date-fns";
import { TrendingUp, Search } from "lucide-react";

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "customer.full_name", // Cambiado de .name a .full_name
        header: "Cliente",
        cell: ({ row }) => {
            const customer = row.original.customer;
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900">
                        {customer?.full_name || 'Usuario Anónimo'}
                    </span>
                    <span className="text-xs text-slate-500">
                        {customer?.email || 'Sin correo'}
                    </span>
                </div>
            );
        }
    },
    {
        accessorKey: "event_type", // Cambiado para mostrar el tipo de evento actual
        header: "Última Acción",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm capitalize">
                    {row.getValue("event_type")?.toString().replace(/_/g, ' ')}
                </span>
            </div>
        )
    },
    {
        accessorKey: "created_at", // Cambiado de last_activity a created_at
        header: "Última vez",
        cell: ({ row }) => {
            const dateValue = row.getValue('created_at');
            if (!dateValue) return <span className="text-sm text-slate-400">N/A</span>;

            const date = new Date(dateValue as string);
            
            // Validación de fecha para evitar el RangeError
            if (!isValid(date)) {
                return <span className="text-sm text-red-400">Fecha inválida</span>;
            }

            return (
                <span className="text-sm text-slate-600">
                    {formatDistanceToNow(date, { addSuffix: true, locale: es })}
                </span>
            );
        },
    },
    {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
            <a 
                href={`/intention-purchase/${row.original.customer_id}`} 
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
                <Search className="h-4 w-4" />
                Ver historial
            </a>
        ),
    }
];