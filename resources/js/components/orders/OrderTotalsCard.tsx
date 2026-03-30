import { ShoppingCart } from 'lucide-react';

import { OrderDetail } from './types';

export default function OrderTotalsCard({ order }: { order: OrderDetail }) {
    const subtotal = Number(order.subtotal ?? 0);
    const couponDiscount = Number(order.coupon_discount_total ?? order.discount_total ?? 0);
    const deliveryCost = Number(order.delivery_cost ?? 0);
    const deliveryDiscount = Number(order.delivery_discount_total ?? 0);
    const total = Number(order.total ?? 0);

    return (
        <div className="rounded-lg border p-5">
            <p className="mb-4 flex items-center gap-2 text-base font-semibold">
                <ShoppingCart className="h-4 w-4" /> Resumen de totales
            </p>

            <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                        Descuento cupón
                    </span>
                    <span>- S/ {couponDiscount.toFixed(2)}</span>
                </div>
                {deliveryDiscount > 0 && (
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                            Descuento delivery
                        </span>
                        <span>- S/ {deliveryDiscount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Envio</span>
                    <span>S/ {deliveryCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2 font-semibold">
                    <span>Total</span>
                    <span>S/ {total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
