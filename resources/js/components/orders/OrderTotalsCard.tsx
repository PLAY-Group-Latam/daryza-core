import { ShoppingCart } from 'lucide-react';

import { OrderDetail } from './types';

export default function OrderTotalsCard({ order }: { order: OrderDetail }) {
    return (
        <div className="rounded-lg border p-5">
            <p className="mb-4 flex items-center gap-2 text-base font-semibold">
                <ShoppingCart className="h-4 w-4" /> Resumen de totales
            </p>

            <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>S/ {order.subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Descuento</span>
                    <span>S/ 0.00</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Envio</span>
                    <span>S/ {order.delivery_cost}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2 font-semibold">
                    <span>Total</span>
                    <span>S/ {order.total}</span>
                </div>
            </div>
        </div>
    );
}
