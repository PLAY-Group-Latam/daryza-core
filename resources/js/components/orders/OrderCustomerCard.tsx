import { UserRound } from 'lucide-react';

import { OrderDetail } from './types';

export default function OrderCustomerCard({ order }: { order: OrderDetail }) {
    return (
        <div className="rounded-lg border p-5">
            <p className="mb-4 flex items-center gap-2 text-base font-semibold">
                <UserRound className="h-4 w-4" /> Informacion del cliente
            </p>

            <div className="space-y-1 text-sm">
                <p className="font-semibold">
                    {order.customer_first_name} {order.customer_last_name}
                </p>
                <p className="text-muted-foreground">{order.customer_email}</p>
                <p>{order.customer_mobile_phone}</p>
                <p className="text-muted-foreground">Documento: {order.customer_document_number}</p>
            </div>
        </div>
    );
}
