/* eslint-disable react-hooks/set-state-in-effect */
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
    ADMIN_ACTION_OPTIONS,
    AdminOrderAction,
    getAdminActionLabel,
    getPreviousState,
    getRollbackAction,
    getStateLabel,
    getUnifiedOrderStatus,
    isAdminActionAvailable,
    UnifiedOrderStatus,
} from './status';

export interface OrderStateEditable {
    id: string;
    code?: string;
    state: string;
    payment_method_type?: 'bank_transfer' | 'niubiz';
    allowed_actions?: string[];
    rollback_action?: string | null;
    rollback_label?: string | null;
}

interface OrderStateDialogProps {
    order?: OrderStateEditable;
    orders?: OrderStateEditable[];
    trigger?: React.ReactNode;
    inline?: boolean;
    onSuccessCallback?: () => void;
}

const ACTION_HELP: Record<AdminOrderAction, string> = {
    accept_payment: 'Actualiza el estado a Pago recibido.',
    reject_payment: 'Actualiza el estado a Pago no exitoso.',
    reset_to_pending_payment: 'Actualiza el estado a Pendiente de pago (solo transferencia si aplica).',
    start_preparing: 'Actualiza el estado a En preparacion.',
    schedule_shipping: 'Actualiza el estado a En envio.',
    start_transit: 'Actualiza el estado a En envio.',
    mark_delivered_full: 'Actualiza el estado a Entregado.',
    mark_delivery_failed: 'Actualiza el estado a Entrega fallida.',
    cancel_order: 'Actualiza el estado a Cancelado.',
};

export default function OrderStateDialog({
    order,
    orders = [],
    trigger,
    inline = false,
    onSuccessCallback,
}: OrderStateDialogProps) {
    const targetOrders = useMemo(() => {
        if (order) return [order];
        return orders;
    }, [order, orders]);

    const isBulk = targetOrders.length > 1;
    const singleOrder = targetOrders.length === 1 ? targetOrders[0] : null;

    const [open, setOpen] = useState(false);
    const [action, setAction] = useState<AdminOrderAction | ''>('');
    const [note, setNote] = useState('');
    const [updating, setUpdating] = useState(false);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    const unifiedStatus: UnifiedOrderStatus | null = useMemo(
        () => (singleOrder ? getUnifiedOrderStatus(singleOrder) : null),
        [singleOrder],
    );

    const availableActions = useMemo(() => {
        return ADMIN_ACTION_OPTIONS.filter((option) =>
            targetOrders.some((ord) => isAdminActionAvailable(ord, option.value)),
        );
    }, [targetOrders]);

    const rollbackAction = useMemo(
        () => (singleOrder ? getRollbackAction(singleOrder) : null),
        [singleOrder],
    );
    const previousState = useMemo(
        () => (singleOrder ? getPreviousState(singleOrder) : null),
        [singleOrder],
    );

    useEffect(() => {
        setAction('');
        setNote('');
        setErrors({});
    }, [open, targetOrders.length]);

    const patchAction = () => {
        if (!action) {
            setErrors({ action: 'Selecciona un estado antes de continuar.' });
            toast.error('Selecciona un estado antes de continuar.');
            return;
        }

        setUpdating(true);
        setErrors({});

        if (isBulk) {
            const allowedOrders = targetOrders.filter((ord) =>
                isAdminActionAvailable(ord, action),
            );
            const blockedOrders = targetOrders.filter(
                (ord) => !isAdminActionAvailable(ord, action),
            );

            if (allowedOrders.length === 0) {
                setUpdating(false);
                toast.error('La acción seleccionada no aplica para las órdenes seleccionadas.');
                return;
            }

            router.patch(
                '/ordenes/admin-action/bulk',
                {
                    order_ids: allowedOrders.map((ord) => ord.id),
                    action,
                    note: note || null,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onFinish: () => setUpdating(false),
                    onError: () => toast.error('No se pudo aplicar la acción masiva.'),
                    onSuccess: () => {
                        setNote('');
                        setOpen(false);
                        if (blockedOrders.length > 0) {
                            toast.success(
                                `Actualización parcial: ${allowedOrders.length} actualizadas, ${blockedOrders.length} sin cambios.`,
                            );
                        } else {
                            toast.success(`Se actualizaron ${allowedOrders.length} orden(es).`);
                        }
                        onSuccessCallback?.();
                        router.reload();
                    },
                },
            );
        } else if (singleOrder) {
            router.patch(
                `/ordenes/${singleOrder.id}/admin-action`,
                { action, note },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onFinish: () => setUpdating(false),
                    onError: (formErrors) => {
                        const typedErrors = formErrors as Record<string, string>;
                        setErrors(typedErrors);
                        toast.error(
                            typedErrors.action ?? 'No se pudo actualizar el estado.',
                        );
                    },
                    onSuccess: () => {
                        setNote('');
                        setOpen(false);
                        toast.success('Estado actualizado correctamente.');
                        onSuccessCallback?.();
                        router.reload();
                    },
                },
            );
        }
    };

    const content = (
        <div className="space-y-4">
            {isBulk ? (
                <div className="rounded-md border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Órdenes seleccionadas</p>
                    <p className="text-sm font-semibold">{targetOrders.length} orden(es)</p>
                </div>
            ) : singleOrder && unifiedStatus ? (
                <div className="grid gap-3 rounded-md border bg-muted/20 p-3 md:grid-cols-2">
                    <div>
                        <p className="text-xs text-muted-foreground">Estado actual</p>
                        <p className="text-sm font-semibold">{getStateLabel(unifiedStatus)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Método de pago</p>
                        <p className="text-sm font-semibold">
                            {singleOrder.payment_method_type === 'bank_transfer'
                                ? 'Transferencia bancaria'
                                : 'Niubiz'}
                        </p>
                    </div>
                </div>
            ) : null}

            <div className="space-y-2">
                <Label className="text-sm font-medium">Acción</Label>
                <Select
                    value={action}
                    onValueChange={(value) => setAction(value as AdminOrderAction)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona una acción" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableActions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {singleOrder
                                    ? getAdminActionLabel(singleOrder, option.value)
                                    : option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    {!action
                        ? 'Selecciona el estado al que quieres mover la(s) orden(es).'
                        : !isBulk && rollbackAction === action && previousState
                        ? `Devuelve la orden a ${getStateLabel(previousState)}.`
                        : ACTION_HELP[action]}
                </p>
                {errors.action ? (
                    <p className="mt-2 text-xs text-red-600">{errors.action}</p>
                ) : null}
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium">Nota (opcional)</Label>
                <textarea
                    className="min-h-[72px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ejemplo: corrección operativa masiva por logística."
                />
                <p className="text-xs text-muted-foreground">
                    Si escribes una nota, se guardará en la trazabilidad de cada orden.
                </p>
            </div>

            <Button
                type="button"
                size="sm"
                className="w-full"
                disabled={updating || availableActions.length === 0 || !action}
                onClick={patchAction}
            >
                {updating ? 'Guardando...' : 'Aplicar acción'}
            </Button>
            {availableActions.length === 0 ? (
                <p className="text-xs text-amber-600">
                    No hay acciones disponibles para el estado actual de la selección.
                </p>
            ) : null}
        </div>
    );

    if (inline) return content;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isBulk ? `Actualizar ${targetOrders.length} orden(es)` : 'Actualizar estado'}
                    </DialogTitle>
                    <DialogDescription>
                        {isBulk
                            ? 'Selecciona una acción para aplicar a todas las órdenes seleccionadas.'
                            : 'Elige una acción rápida y guarda.'}
                    </DialogDescription>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>
    );
}