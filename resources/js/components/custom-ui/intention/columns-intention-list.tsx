'use client';

import { ColumnDef } from "@tanstack/react-table";
import { es } from 'date-fns/locale';
import { formatDistanceToNow, isValid } from "date-fns";
import { TrendingUp, ClipboardList } from "lucide-react";
import { Link } from '@inertiajs/react';
import { UserAvatar } from '../UserAvatar'; 

// 1. Diccionario basado en tu Middleware de Laravel + Evento de Packs
const eventTranslations: Record<string, string> = {
    'product_view': 'Visualizó un producto',
    'pack_view': 'Visualizó un pack', // ✅ Agregado para diferenciar los packs
    'add_to_cart': 'Agregó al carrito',
    'wishlist_toggle': 'Cambió favoritos',
    'coupon_attempt': 'Intentó usar cupón',
    'order_placed': 'Creó una orden',
    'voucher_upload': 'Subió un comprobante',
    'payment_result_success': 'Pago exitoso',
};

export const columns: ColumnDef<any>[] = [
    // ── 1. NOMBRE DEL CLIENTE CON AVATAR ─────────────────────
    {
        accessorKey: "customer.full_name",
        header: "Nombre",
        cell: ({ row }) => {
            const customer = row.original.customer;
            const name = customer?.full_name ?? 'Usuario Anónimo';
            
            return (
                <div className="flex items-center gap-2">
                    {/* ✅ Agregado el UserAvatar al costado del nombre */}
                    <UserAvatar
                        image={customer?.photo} // Mapea el avatar/foto del usuario
                        name={name}
                    />
                    <span className="font-medium text-slate-900 text-sm">
                        {name}
                    </span>
                </div>
            );
        }
    },
    
    // ── 2. CORREO ELECTRÓNICO ──────────────────────────────
    {
        accessorKey: "customer.email",
        header: "Correo",
        cell: ({ row }) => {
            const customer = row.original.customer;
            return (
                <span className="text-sm text-slate-600">
                    {customer?.email || 'Sin correo'}
                </span>
            );
        }
    },
    
    // ── 3. ÚLTIMA ACCIÓN REALIZADA ─────────────────────────
    {
        accessorKey: "event_type",
        header: "Última Acción",
        cell: ({ row }) => {
            const eventType = row.getValue("event_type") as string;
            const translatedEvent = eventTranslations[eventType] || eventType?.replace(/_/g, ' ');

            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 capitalize">
                        {translatedEvent}
                    </span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
            );
        }
    },
    
    // ── 4. TIEMPO TRANSCURRIDO ──────────────────────────────
    {
        accessorKey: "created_at",
        header: "Hace",
        cell: ({ row }) => {
            const dateValue = row.getValue('created_at');
            if (!dateValue) return <span className="text-sm text-slate-400">N/A</span>;

            const date = new Date(dateValue as string);

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
    
    // ── 5. ACCIONES (Link al historial) ──────────────────────
    {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
        <Link
            href={`/intention-purchase/${row.original.customer_id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-black hover:text-gray-600 transition-colors"
        >
            <ClipboardList className="h-4 w-4" />
            Ver historial
        </Link>
    ),
}
];