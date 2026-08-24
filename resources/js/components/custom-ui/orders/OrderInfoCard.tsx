import { ClipboardList } from 'lucide-react';
import { formatDate } from '@/lib/helpers/formatDate';
import { OrderDetail } from './types';

export default function OrderInfoCard({ order }: { order: OrderDetail }) {
    return (
        <div className="flex h-full flex-col justify-between rounded-lg border p-5">
            <div>
                <p className="mb-4 flex items-center gap-2 text-base font-semibold">
                    <ClipboardList className="h-4 w-4" /> Informacion de la orden
                </p>

                <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                        <p className="text-xs text-muted-foreground">Numero de orden</p>
                        <p className="font-semibold">{order.code}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Canal</p>
                        <p className="font-semibold">Web</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Fecha de creacion</p>
                        <p className="font-semibold">
                            {order.created_at ? formatDate(order.created_at, true) : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Ultima actualizacion</p>
                        <p className="font-semibold">
                            {order.updated_at ? formatDate(order.updated_at, true) : '-'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}