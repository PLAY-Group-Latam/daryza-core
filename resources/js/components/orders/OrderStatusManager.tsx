import { Button } from '@/components/ui/button';
import { PencilLine } from 'lucide-react';

import { StatusBadge } from './status';
import { OrderDetail } from './types';
import OrderStateDialog from './OrderStateDialog';

interface OrderStatusManagerProps {
    order: OrderDetail;
}

export default function OrderStatusManager({ order }: OrderStatusManagerProps) {
    return (
        <div className="rounded-lg border p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Orden</span>
                        <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Pago</span>
                        <StatusBadge status={order.payment_status} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Envio</span>
                        <StatusBadge status={order.shipping_status} />
                    </div>
                </div>

                <OrderStateDialog
                    order={order}
                    trigger={
                        <Button type="button" size="sm" className="gap-2">
                            <PencilLine className="h-4 w-4" /> Actualizar estado
                        </Button>
                    }
                />
            </div>
        </div>
    );
}
