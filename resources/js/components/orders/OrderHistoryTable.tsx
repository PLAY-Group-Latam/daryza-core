import { formatDate } from '@/lib/helpers/formatDate';

import { getStatusLabel, orderStatusOptions, paymentStatusOptions, shippingStatusOptions } from './status';
import { OrderStatusHistory } from './types';

function describeStatus(raw: string | null | undefined) {
    if (!raw) return { scope: 'Sistema', label: 'Sin estado' };

    if (raw.startsWith('payment:')) {
        const status = raw.replace('payment:', '');
        return { scope: 'Pago', label: getStatusLabel(status, paymentStatusOptions) };
    }

    if (raw.startsWith('shipping:')) {
        const status = raw.replace('shipping:', '');
        return { scope: 'Envio', label: getStatusLabel(status, shippingStatusOptions) };
    }

    return { scope: 'Orden', label: getStatusLabel(raw, orderStatusOptions) };
}

function actorLabel(actor: string) {
    if (actor === 'admin') return 'Administrador';
    if (actor === 'customer') return 'Cliente';
    return 'Sistema';
}

export default function OrderHistoryTable({ history }: { history: OrderStatusHistory[] }) {
    return (
        <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm">
                <thead className="bg-muted/30 text-left">
                    <tr>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Cambio</th>
                        <th className="px-4 py-3">Hecho por</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Detalle</th>
                    </tr>
                </thead>
                <tbody>
                    {history?.map((entry) => {
                        const from = describeStatus(entry.from_status);
                        const to = describeStatus(entry.to_status);

                        return (
                            <tr key={entry.id} className="border-t align-top">
                                <td className="px-4 py-3 font-medium">{to.scope}</td>
                                <td className="px-4 py-3">
                                    <span className="text-muted-foreground">{from.label}</span>
                                    <span className="mx-2">→</span>
                                    <span className="font-medium">{to.label}</span>
                                </td>
                                <td className="px-4 py-3">{actorLabel(entry.changed_by_type)}</td>
                                <td className="px-4 py-3">{formatDate(entry.created_at, true)}</td>
                                <td className="px-4 py-3 text-muted-foreground">{entry.note || 'Sin observacion'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
