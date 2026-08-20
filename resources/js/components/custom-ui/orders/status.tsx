import { Badge } from '@/components/ui/badge';

export type UnifiedOrderStatus =
    | 'pending_payment'
    | 'payment_received'
    | 'payment_failed'
    | 'preparing'
    | 'in_delivery'
    | 'delivered'
    | 'delivery_failed'
    | 'cancelled'
    | 'refunded';

export type AdminOrderAction =
    | 'reset_to_pending_payment'
    | 'accept_payment'
    | 'reject_payment'
    | 'start_preparing'
    | 'start_transit'
    | 'mark_delivered_full'
    | 'mark_delivery_failed'
    | 'cancel_order'
    | 'mark_refunded';

type OrderActionMeta = {
    state: string;
};

const unifiedStatusMeta: Record<UnifiedOrderStatus, { label: string; className: string }> = {
    pending_payment: {
        label: 'Pendiente de pago',
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    },
    payment_received: {
        label: 'Pago recibido',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    },
    payment_failed: {
        label: 'Pago no exitoso',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    },
    preparing: {
        label: 'En preparación',
        className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    },
    in_delivery: {
        label: 'En envío',
        className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    },
    delivered: {
        label: 'Entregado',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    },
    delivery_failed: {
        label: 'Entrega fallida',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    },
    cancelled: {
        label: 'Cancelado',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    },
    refunded: {
        label: 'Reembolsado',
        className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300',
    },
};

export const stateOptions: Array<{ value: UnifiedOrderStatus; label: string }> = Object.entries(unifiedStatusMeta).map(
    ([value, item]) => ({
        value: value as UnifiedOrderStatus,
        label: item.label,
    }),
);

export const getStateLabel = (value: string): string =>
    unifiedStatusMeta[value as UnifiedOrderStatus]?.label ?? value;

export function StatusBadge({ status }: { status: string }) {
    const item = unifiedStatusMeta[status as UnifiedOrderStatus] ?? {
        label: status,
        className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300',
    };

    return <Badge className={item.className}>{item.label}</Badge>;
}

export function UnifiedStatusBadge({ status }: { status: UnifiedOrderStatus }) {
    return <StatusBadge status={status} />;
}

export const getUnifiedOrderStatus = (order: { state: string }): UnifiedOrderStatus =>
    (order.state as UnifiedOrderStatus) ?? 'pending_payment';

const actionTargetStateMap: Record<AdminOrderAction, UnifiedOrderStatus> = {
    reset_to_pending_payment: 'pending_payment',
    accept_payment: 'payment_received',
    reject_payment: 'payment_failed',
    start_preparing: 'preparing',
    start_transit: 'in_delivery',
    mark_delivered_full: 'delivered',
    mark_delivery_failed: 'delivery_failed',
    cancel_order: 'cancelled',
    mark_refunded: 'refunded',
};

// Opciones con labels exactos al selector del modal
export const ADMIN_ACTION_OPTIONS: Array<{ value: AdminOrderAction; label: string; targetState: UnifiedOrderStatus }> = [
    { value: 'reset_to_pending_payment', label: 'Pendiente de pago', targetState: 'pending_payment' },
    { value: 'accept_payment', label: 'Pago recibido', targetState: 'payment_received' },
    { value: 'reject_payment', label: 'Pago no exitoso', targetState: 'payment_failed' },
    { value: 'start_preparing', label: 'En preparación', targetState: 'preparing' },
    { value: 'start_transit', label: 'En envío', targetState: 'in_delivery' },
    { value: 'mark_delivered_full', label: 'Entregado', targetState: 'delivered' },
    { value: 'mark_delivery_failed', label: 'Entrega fallida', targetState: 'delivery_failed' },
    { value: 'cancel_order', label: 'Cancelado', targetState: 'cancelled' },
    { value: 'mark_refunded', label: 'Reembolsado', targetState: 'refunded' },
];

export function isAdminActionAvailable(order: OrderActionMeta, action: AdminOrderAction): boolean {
    const current = getUnifiedOrderStatus(order);
    const target = actionTargetStateMap[action];
    return current !== target;
}

export function getAdminActionLabel(_order: OrderActionMeta, action: AdminOrderAction): string {
    return ADMIN_ACTION_OPTIONS.find((item) => item.value === action)?.label ?? action;
}


export function getRollbackAction(order: OrderActionMeta & { rollback_action?: string | null }): AdminOrderAction | null {
    return (order.rollback_action as AdminOrderAction) ?? null;
}

export function getPreviousState(order: OrderActionMeta & { rollback_action?: string | null }): UnifiedOrderStatus | null {
    const rollbackAction = getRollbackAction(order);
    return rollbackAction ? actionTargetStateMap[rollbackAction] ?? null : null;
}