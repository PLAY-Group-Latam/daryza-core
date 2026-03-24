import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

import {
    getAllowedOptions,
    isRollbackTransition,
    getStatusLabel,
    orderStatusOptions,
    orderTransitionMap,
    paymentStatusOptions,
    paymentTransitionMap,
    shippingStatusOptions,
    shippingTransitionMap,
} from './status';

type UpdateType = 'order' | 'payment' | 'shipping';

interface OrderStateEditable {
    id: string;
    code?: string;
    status: string;
    payment_status: string;
    shipping_status: string;
}

interface OrderStateDialogProps {
    order: OrderStateEditable;
    trigger: React.ReactNode;
}

export default function OrderStateDialog({ order, trigger }: OrderStateDialogProps) {
    const [open, setOpen] = useState(false);

    const [orderStatus, setOrderStatus] = useState(order.status);
    const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
    const [shippingStatus, setShippingStatus] = useState(order.shipping_status);
    const [note, setNote] = useState('');

    const [updating, setUpdating] = useState<UpdateType | null>(null);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    useEffect(() => {
        setOrderStatus(order.status);
        setPaymentStatus(order.payment_status);
        setShippingStatus(order.shipping_status);
    }, [order]);

    const orderOptions = useMemo(
        () => getAllowedOptions(order.status, orderStatusOptions, orderTransitionMap),
        [order.status],
    );
    const paymentOptions = useMemo(
        () => getAllowedOptions(order.payment_status, paymentStatusOptions, paymentTransitionMap),
        [order.payment_status],
    );
    const shippingOptions = useMemo(
        () => getAllowedOptions(order.shipping_status, shippingStatusOptions, shippingTransitionMap),
        [order.shipping_status],
    );

    const patchStatus = (type: UpdateType, value: string) => {
        const isRollback =
            (type === 'order' && isRollbackTransition('order', order.status, value)) ||
            (type === 'payment' && isRollbackTransition('payment', order.payment_status, value)) ||
            (type === 'shipping' && isRollbackTransition('shipping', order.shipping_status, value));

        if (isRollback && note.trim() === '') {
            const errorKey = type === 'order' ? 'status' : type === 'payment' ? 'payment_status' : 'shipping_status';
            setErrors((prev) => ({
                ...prev,
                [errorKey]: 'Para un retroceso, ingresa una nota explicando la correccion.',
            }));
            return;
        }

        const routes: Record<UpdateType, string> = {
            order: `/ordenes/${order.id}/status`,
            payment: `/ordenes/${order.id}/payment-status`,
            shipping: `/ordenes/${order.id}/shipping-status`,
        };

        const payload: Record<string, string | null> = {
            note: note || null,
        };

        if (type === 'order') payload.status = value;
        if (type === 'payment') payload.payment_status = value;
        if (type === 'shipping') payload.shipping_status = value;

        router.patch(routes[type], payload, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => {
                setUpdating(type);
                setErrors({});
            },
            onFinish: () => setUpdating(null),
            onError: (formErrors) => {
                setErrors(formErrors as Record<string, string>);
            },
            onSuccess: () => {
                setNote('');
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Actualizar estados</DialogTitle>
                    <DialogDescription>
                        {order.code ? `Gestion de la orden ${order.code}` : 'Gestion de estados de la orden'}.
                        Las transiciones permitidas se muestran automaticamente. Si una orden fue cancelada,
                        solo el admin puede reactivarla a pendiente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-md border p-3">
                        <Label className="text-xs text-muted-foreground">Nota (opcional)</Label>
                        <textarea
                            className="mt-2 min-h-[72px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Esta nota se guarda en historial"
                        />
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-md border p-3">
                            <p className="mb-2 text-sm font-semibold">Estado de orden</p>
                            <Select value={orderStatus} onValueChange={setOrderStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {orderOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isRollbackTransition('order', order.status, orderStatus) ? (
                                <p className="mt-2 text-xs text-amber-600">Cambio en modo correccion (retroceso).</p>
                            ) : null}
                            {errors.status ? <p className="mt-2 text-xs text-red-600">{errors.status}</p> : null}
                            <Button
                                type="button"
                                size="sm"
                                className="mt-3 w-full"
                                disabled={updating !== null || orderStatus === order.status}
                                onClick={() => patchStatus('order', orderStatus)}
                            >
                                {updating === 'order'
                                    ? 'Guardando...'
                                    : `Guardar ${getStatusLabel(orderStatus, orderStatusOptions)}`}
                            </Button>
                        </div>

                        <div className="rounded-md border p-3">
                            <p className="mb-2 text-sm font-semibold">Estado de pago</p>
                            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isRollbackTransition('payment', order.payment_status, paymentStatus) ? (
                                <p className="mt-2 text-xs text-amber-600">Cambio en modo correccion (retroceso).</p>
                            ) : null}
                            {errors.payment_status ? <p className="mt-2 text-xs text-red-600">{errors.payment_status}</p> : null}
                            <Button
                                type="button"
                                size="sm"
                                className="mt-3 w-full"
                                disabled={updating !== null || paymentStatus === order.payment_status}
                                onClick={() => patchStatus('payment', paymentStatus)}
                            >
                                {updating === 'payment'
                                    ? 'Guardando...'
                                    : `Guardar ${getStatusLabel(paymentStatus, paymentStatusOptions)}`}
                            </Button>
                        </div>

                        <div className="rounded-md border p-3">
                            <p className="mb-2 text-sm font-semibold">Estado de envio</p>
                            <Select value={shippingStatus} onValueChange={setShippingStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shippingOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isRollbackTransition('shipping', order.shipping_status, shippingStatus) ? (
                                <p className="mt-2 text-xs text-amber-600">Cambio en modo correccion (retroceso).</p>
                            ) : null}
                            {errors.shipping_status ? <p className="mt-2 text-xs text-red-600">{errors.shipping_status}</p> : null}
                            <Button
                                type="button"
                                size="sm"
                                className="mt-3 w-full"
                                disabled={updating !== null || shippingStatus === order.shipping_status}
                                onClick={() => patchStatus('shipping', shippingStatus)}
                            >
                                {updating === 'shipping'
                                    ? 'Guardando...'
                                    : `Guardar ${getStatusLabel(shippingStatus, shippingStatusOptions)}`}
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
