'use client';

import { formatDate } from '@/lib/helpers/formatDate';
import { Customer, PaginatedCustomers } from '@/types/customers';
import { router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../tables/DataTable';
import { UserAvatar } from '../UserAvatar';
import { ModalChangePassword } from './ModalChangePassword';
import { ModalProfileDetails } from './ModalProfileDetails';

/**
 * Definición de columnas para la tabla de clientes.
 * Se mantiene la lógica de visualización de avatares, formateo de fechas
 * y acciones (Detalles y Cambio de contraseña).
 */
export const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: 'full_name',
        header: 'Nombre Completo',
        cell: ({ row }) => {
            const customer = row.original;
            return (
                <div className="flex items-center gap-2">
                    <UserAvatar
                        image={customer.photo}
                        name={customer.full_name ?? 'Usuario'}
                    />
                    <span className="capitalize">
                        {customer.full_name.toLowerCase()},{' '}
                        {customer.full_last_name?.toLowerCase()}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'email',
        header: 'Correo',
        cell: ({ row }) => (
            <span className="lowercase">{row.original.email}</span>
        ),
    },
    {
        accessorKey: 'dni',
        header: 'DNI / RUC',
        cell: ({ row }) => <span>{row.original.dni || '-'}</span>,
    },
    {
        accessorKey: 'phone',
        header: 'Teléfono',
        cell: ({ row }) => <span>{row.original.phone || '-'}</span>,
    },
    {
        accessorKey: 'created_at',
        header: 'Creado el',
        cell: ({ row }) => (
            <span>{formatDate(row.original.created_at, true)}</span>
        ),
    },
    {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
            const customer = row.original;
            return (
                <div className="flex items-center gap-2">
                    <ModalProfileDetails customer={customer} />
                    {!customer.google_id && (
                        <ModalChangePassword customer={customer} />
                    )}
                </div>
            );
        },
    },
];

/**
 * Componente TableList
 *
 * Maneja la visualización de la lista de clientes mediante el componente DataTable.
 * Implementa búsqueda server-side utilizando Inertia.js para filtrar directamente
 * en la base de datos PostgreSQL.
 */
export default function TableList({ data }: { data: PaginatedCustomers }) {
    // Obtenemos los filtros persistidos en la URL desde el servidor
    const { filters } = usePage<{ filters: any }>().props;

    if (!data) return null;

    /**
     * handleSearch
     * Dispara una petición GET al controlador de Laravel cuando el usuario escribe.
     *
     * @param value - El término de búsqueda ingresado.
     */
    const handleSearch = (value: string) => {
        router.get(
            '/clientes', // URL normal sin usar el helper route()
            {
                search: value,
                per_page: data.per_page,
            },
            {
                preserveState: true, // Crucial para no perder el foco del input mientras escribes
                replace: true, // Evita llenar el historial del navegador con cada tecla pulsada
                only: ['paginatedCustomers'], // Partial Reload: solo refresca los datos de la tabla
            },
        );
    };
    return (
        <DataTable
            columns={columns}
            data={data}
            onSearch={handleSearch}
            initialSearch={filters?.search || ''}
            placeholder="Buscar por nombre o correo..."
        />
    );
}
