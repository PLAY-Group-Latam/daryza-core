import { Badge } from '@/components/ui/badge';

export type UnifiedOrderStatus =
    | 'pending_payment'
    | 'payment_received'
    | 'preparing'
    | 'in_delivery'
    | 'delivered'
    | 'delivery_failed'
    | 'cancelled'
    | 'payment_failed'
    | 'refunded';

export type AdminOrderAction =
    | 'accept_payment'
    | 'reject_payment'
    | 'reset_to_pending_payment'
    | 'start_preparing'
    | 'schedule_shipping'
    | 'start_transit'
    | 'mark_delivered_full'
    | 'mark_delivery_failed'
    | 'cancel_order';

type OrderActionMeta = {
    state: string;
    payment_method_type?: 'bank_transfer' | 'niubiz';
    allowed_actions?: string[];
    rollback_action?: string | null;
    rollback_label?: string | null;
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
    preparing: {
        label: 'En preparacion',
        className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    },
    in_delivery: {
        label: 'En envio',
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
    payment_failed: {
        label: 'Pago no exitoso',
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

export const stateTransitionMap: Record<UnifiedOrderStatus, UnifiedOrderStatus[]> = {
    pending_payment: ['payment_received', 'payment_failed', 'cancelled'],
    payment_received: ['preparing', 'pending_payment', 'cancelled', 'refunded'],
    preparing: ['in_delivery', 'payment_received', 'cancelled'],
    in_delivery: ['delivered', 'delivery_failed', 'preparing', 'cancelled'],
    delivered: ['in_delivery', 'preparing'],
    delivery_failed: ['in_delivery', 'preparing', 'cancelled'],
    cancelled: ['pending_payment', 'payment_received', 'preparing'],
    payment_failed: ['pending_payment', 'payment_received', 'cancelled'],
    refunded: ['pending_payment', 'payment_received'],
};

export const getStateLabel = (value: string): string => unifiedStatusMeta[value as UnifiedOrderStatus]?.label ?? value;

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
    accept_payment: 'payment_received',
    reject_payment: 'payment_failed',
    reset_to_pending_payment: 'pending_payment',
    start_preparing: 'preparing',
    schedule_shipping: 'in_delivery',
    start_transit: 'in_delivery',
    mark_delivered_full: 'delivered',
    mark_delivery_failed: 'delivery_failed',
    cancel_order: 'cancelled',
};

const niubizConfirmedStates: UnifiedOrderStatus[] = [
    'payment_received',
    'preparing',
    'in_delivery',
    'delivered',
    'refunded',
];

export const ADMIN_ACTION_OPTIONS: Array<{ value: AdminOrderAction; label: string }> = [
    { value: 'accept_payment', label: 'Cambiar a Pago recibido' },
    { value: 'reject_payment', label: 'Cambiar a Pago no exitoso' },
    { value: 'reset_to_pending_payment', label: 'Cambiar a Pendiente de pago' },
    { value: 'start_preparing', label: 'Cambiar a En preparacion' },
    { value: 'start_transit', label: 'Cambiar a En envio' },
    { value: 'mark_delivered_full', label: 'Cambiar a Entregado' },
    { value: 'mark_delivery_failed', label: 'Cambiar a Entrega fallida' },
    { value: 'cancel_order', label: 'Cambiar a Cancelado' },
];

export function isAdminActionAvailable(order: OrderActionMeta, action: AdminOrderAction): boolean {
    if (Array.isArray(order.allowed_actions)) {
        return order.allowed_actions.includes(action);
    }

    const from = getUnifiedOrderStatus(order);
    const to = actionTargetStateMap[action];

    if (from === to) return false;

    if (
        order.payment_method_type === 'niubiz'
        && niubizConfirmedStates.includes(from)
        && (to === 'pending_payment' || to === 'payment_failed')
    ) {
        return false;
    }

    return (stateTransitionMap[from] ?? []).includes(to);
}

function getActionTargetState(action: AdminOrderAction): UnifiedOrderStatus {
    return actionTargetStateMap[action];
}

export function getPreviousState(order: OrderActionMeta): UnifiedOrderStatus | null {
    const current = getUnifiedOrderStatus(order);

    if (current === 'pending_payment') return null;
    if (current === 'payment_received') {
        return order.payment_method_type === 'bank_transfer' ? 'pending_payment' : null;
    }
    if (current === 'preparing') return 'payment_received';
    if (current === 'in_delivery') return 'preparing';
    if (current === 'delivered') return 'in_delivery';
    if (current === 'delivery_failed') return 'in_delivery';
    if (current === 'payment_failed') return 'pending_payment';
    if (current === 'cancelled') return 'preparing';
    if (current === 'refunded') return 'payment_received';

    return null;
}

export function getRollbackAction(order: OrderActionMeta): AdminOrderAction | null {
    if (order.rollback_action) {
        return order.rollback_action as AdminOrderAction;
    }

    const previous = getPreviousState(order);
    if (!previous) return null;

    const rollbackCandidates: AdminOrderAction[] = [
        'start_transit',
        'start_preparing',
        'accept_payment',
        'reset_to_pending_payment',
    ];

    for (const action of rollbackCandidates) {
        if (getActionTargetState(action) !== previous) continue;
        if (isAdminActionAvailable(order, action)) return action;
    }

    return null;
}

export function getAdminActionLabel(
    order: OrderActionMeta,
    action: AdminOrderAction,
): string {
    if (order.rollback_action === action && order.rollback_label) {
        return order.rollback_label;
    }

    const defaultLabel = ADMIN_ACTION_OPTIONS.find((item) => item.value === action)?.label ?? action;
    const rollbackAction = getRollbackAction(order);
    const previous = getPreviousState(order);

    if (rollbackAction === action && previous) {
        return `Regresar a ${getStateLabel(previous)}`;
    }

    return defaultLabel;
}
