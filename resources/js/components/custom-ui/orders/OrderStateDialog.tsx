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

interface OrderStateEditable {
    id: string;
    code?: string;
    state: string;
    payment_method_type?: 'bank_transfer' | 'niubiz';
    allowed_actions?: string[];
    rollback_action?: string | null;
    rollback_label?: string | null;
}

interface OrderStateDialogProps {
    order: OrderStateEditable;
    trigger?: React.ReactNode;
    inline?: boolean;
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
    trigger,
    inline = false,
}: OrderStateDialogProps) {
    const [open, setOpen] = useState(false);
    const [action, setAction] = useState<AdminOrderAction | ''>('');
    const [note, setNote] = useState('');
    const [updating, setUpdating] = useState(false);
    const [errors, setErrors] = useState<Record<string, string | undefined>>(
        {},
    );

    const unifiedStatus: UnifiedOrderStatus = useMemo(
        () => getUnifiedOrderStatus(order),
        [order],
    );
    const availableActions = useMemo(
        () =>
            ADMIN_ACTION_OPTIONS.filter((option) =>
                isAdminActionAvailable(order, option.value),
            ),
        [order],
    );
    const rollbackAction = useMemo(() => getRollbackAction(order), [order]);
    const previousState = useMemo(() => getPreviousState(order), [order]);

    useEffect(() => {
        setAction('');
    }, [order.id, open]);

    const patchAction = () => {
        if (!action) {
            setErrors({ action: 'Selecciona un estado antes de continuar.' });
            toast.error('Selecciona un estado antes de continuar.');
            return;
        }

        setUpdating(true);
        setErrors({});
        router.patch(
            `/ordenes/${order.id}/admin-action`,
            {
                action,
                note,
            },
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
                    router.reload();
                },
            },
        );
    };

    const content = (
        <div className="space-y-4">
            <div className="grid gap-3 rounded-md border bg-muted/20 p-3 md:grid-cols-2">
                <div>
                    <p className="text-xs text-muted-foreground">Estado actual</p>
                    <p className="text-sm font-semibold">{getStateLabel(unifiedStatus)}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Método de pago</p>
                    <p className="text-sm font-semibold">
                        {order.payment_method_type === 'bank_transfer' ? 'Transferencia bancaria' : 'Niubiz'}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium">Acción</Label>
                <Select
                    value={action}
                    onValueChange={(value) =>
                        setAction(value as AdminOrderAction)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona una acción" />
                    </SelectTrigger>
                <SelectContent>
                    {availableActions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                                {getAdminActionLabel(order, option.value)}
                        </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    {!action
                        ? 'Selecciona el estado al que quieres mover la orden.'
                        : rollbackAction === action && previousState
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
                    placeholder="Ejemplo: corrección operativa por llamada del cliente."
                />
                <p className="text-xs text-muted-foreground">
                    Si escribes una nota, se guardará en trazabilidad.
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
                    No hay acciones disponibles para este estado.
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
                    <DialogTitle>Actualizar estado</DialogTitle>
                    <DialogDescription>
                        Elige una acción rápida y guarda.
                    </DialogDescription>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>
    );
}
