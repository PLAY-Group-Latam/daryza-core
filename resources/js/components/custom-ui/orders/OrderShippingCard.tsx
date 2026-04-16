import { MapPin } from 'lucide-react';

import { OrderDetail } from './types';

export default function OrderShippingCard({ order }: { order: OrderDetail }) {
    return (
        <div className="rounded-lg border p-5">
            <p className="mb-4 flex items-center gap-2 text-base font-semibold">
                <MapPin className="h-4 w-4" /> Direccion de envio
            </p>

            <div className="space-y-1 text-sm">
                <p className="font-semibold">{order.shipping_address_line}</p>
                <p className="text-muted-foreground">
                    {order.district_name}, {order.province_name}, {order.department_name}
                </p>
                {!!order.shipping_number && <p>Numero: {order.shipping_number}</p>}
                {!!order.shipping_floor_apartment && <p>Piso/Dpto: {order.shipping_floor_apartment}</p>}
                {!!order.shipping_reference && <p className="text-muted-foreground">Referencia: {order.shipping_reference}</p>}
            </div>
        </div>
    );
}
