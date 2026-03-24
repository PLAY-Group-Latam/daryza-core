import { Badge } from '@/components/ui/badge';

export type TransitionKind = 'order' | 'payment' | 'shipping';

export const orderStatusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmada' },
    { value: 'preparing', label: 'Preparando' },
    { value: 'shipped', label: 'Enviada' },
    { value: 'delivered', label: 'Entregada' },
    { value: 'cancelled', label: 'Cancelada' },
];

export const paymentStatusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'rejected', label: 'Rechazado' },
    { value: 'failed', label: 'Fallido' },
    { value: 'refunded', label: 'Reembolsado' },
];

export const shippingStatusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'assigned', label: 'Asignado' },
    { value: 'in_transit', label: 'En transito' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'failed', label: 'Fallido' },
];

export const orderTransitionMap: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['pending', 'preparing', 'cancelled'],
    preparing: ['confirmed', 'shipped', 'cancelled'],
    shipped: ['confirmed', 'preparing', 'delivered'],
    delivered: ['confirmed', 'preparing', 'shipped'],
    cancelled: ['pending'],
};

export const paymentTransitionMap: Record<string, string[]> = {
    pending: ['approved', 'rejected', 'failed'],
    approved: ['pending', 'refunded'],
    rejected: ['pending'],
    failed: ['pending'],
    refunded: ['pending', 'approved'],
};

export const shippingTransitionMap: Record<string, string[]> = {
    pending: ['assigned', 'in_transit', 'failed'],
    assigned: ['pending', 'in_transit', 'failed'],
    in_transit: ['pending', 'assigned', 'delivered', 'failed'],
    delivered: ['assigned', 'in_transit'],
    failed: ['pending', 'assigned', 'in_transit'],
};

const statusMeta: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    confirmed: { label: 'Confirmada', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    preparing: { label: 'Preparando', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
    shipped: { label: 'Enviada', className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
    delivered: { label: 'Entregada', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    approved: { label: 'Aprobado', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    rejected: { label: 'Rechazado', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    failed: { label: 'Fallido', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    refunded: { label: 'Reembolsado', className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300' },
    assigned: { label: 'Asignado', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    in_transit: { label: 'En transito', className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
};

export const getAllowedOptions = (
    currentStatus: string,
    allOptions: Array<{ value: string; label: string }>,
    transitionMap: Record<string, string[]>,
) => {
    const allowedValues = new Set([currentStatus, ...(transitionMap[currentStatus] ?? [])]);
    return allOptions.filter((option) => allowedValues.has(option.value));
};

export const hasAvailableTransition = (currentStatus: string, transitionMap: Record<string, string[]>) =>
    (transitionMap[currentStatus] ?? []).length > 0;

export const canTransitionTo = (currentStatus: string, target: string, transitionMap: Record<string, string[]>) =>
    (transitionMap[currentStatus] ?? []).includes(target);

const orderRank: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    preparing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: -1,
};

const paymentRank: Record<string, number> = {
    pending: 0,
    approved: 1,
    rejected: -1,
    failed: -1,
    refunded: -2,
};

const shippingRank: Record<string, number> = {
    pending: 0,
    assigned: 1,
    in_transit: 2,
    delivered: 3,
    failed: -1,
};

export const isRollbackTransition = (kind: TransitionKind, from: string, to: string): boolean => {
    if (from === to) return false;

    const ranksByKind: Record<TransitionKind, Record<string, number>> = {
        order: orderRank,
        payment: paymentRank,
        shipping: shippingRank,
    };

    const ranks = ranksByKind[kind];
    if (!(from in ranks) || !(to in ranks)) return false;

    return ranks[to] < ranks[from];
};

export const getStatusLabel = (
    value: string,
    options: Array<{ value: string; label: string }>,
) => options.find((option) => option.value === value)?.label ?? value;

export function StatusBadge({ status }: { status: string }) {
    const item = statusMeta[status] ?? {
        label: status,
        className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300',
    };

    return <Badge className={item.className}>{item.label}</Badge>;
}
