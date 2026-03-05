import { CreditCard } from 'lucide-react';

import { StatusBadge } from './status';
import { OrderDetail } from './types';

export default function OrderPaymentInfoCard({ order }: { order: OrderDetail }) {
    const lastPayment = order.payments?.[0];

    return (
        <div className="rounded-lg border p-5">
            <p className="mb-4 flex items-center gap-2 text-base font-semibold">
                <CreditCard className="h-4 w-4" /> Informacion de pago
            </p>

            <div className="grid gap-4 text-sm md:grid-cols-2">
                <div>
                    <p className="text-xs text-muted-foreground">Metodo de pago</p>
                    <p className="font-semibold">{order.payment_method_type === 'bank_transfer' ? 'Transferencia bancaria' : 'Niubiz'}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Estado del pago</p>
                    <StatusBadge status={order.payment_status} />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Monto</p>
                    <p className="font-semibold">S/ {order.total}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Voucher de pago</p>
                    {lastPayment?.voucher_url ? (
                        <a className="font-semibold text-primary underline" href={lastPayment.voucher_url} target="_blank" rel="noreferrer">
                            Ver voucher
                        </a>
                    ) : (
                        <p className="font-semibold">-</p>
                    )}
                </div>
            </div>
        </div>
    );
}
