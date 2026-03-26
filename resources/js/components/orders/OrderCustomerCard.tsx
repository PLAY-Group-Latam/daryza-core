import { UserRound } from 'lucide-react';
import { UserAvatar } from '../custom-ui/UserAvatar';

import { OrderDetail } from './types';

export default function OrderCustomerCard({ order }: { order: OrderDetail }) {
    const fullName = order.customer?.full_name ?? `${order.customer_first_name} ${order.customer_last_name}`.trim();
    const customerEmail = order.customer?.email ?? order.customer_email;
    const customerPhone = order.customer?.phone ?? order.customer_mobile_phone;
    const customerDocument = order.customer?.dni ?? order.customer_document_number;
    const customerPhoto = order.customer?.photo ?? null;

    return (
        <div className="rounded-lg border p-5">
            <p className="mb-4 flex items-center gap-2 text-base font-semibold">
                <UserRound className="h-4 w-4" /> Informacion del cliente
            </p>

            <div className="flex items-start gap-3">
                <UserAvatar name={fullName || 'Cliente'} image={customerPhoto} size="lg" />
                <div className="space-y-1 text-sm">
                    <p className="font-semibold">{fullName || '-'}</p>
                    <p className="text-muted-foreground">{customerEmail || '-'}</p>
                    <p>{customerPhone || '-'}</p>
                    <p className="text-muted-foreground">Documento: {customerDocument || '-'}</p>
                </div>
            </div>
        </div>
    );
}
