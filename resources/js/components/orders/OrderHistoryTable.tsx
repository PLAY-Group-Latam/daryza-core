import { formatDate } from '@/lib/helpers/formatDate';

import { getStateLabel } from './status';
import { OrderStatusHistory } from './types';

function describeStatus(raw: string | null | undefined) {
    if (!raw) return { scope: 'Sistema', label: 'Sin estado' };

    return { scope: 'Estado', label: getStateLabel(raw) };
}

function actorLabel(actor: string) {
    if (actor === 'admin') return 'Administrador';
    if (actor === 'customer') return 'Cliente';
    return 'Sistema';
}

function changeLabel(entry: OrderStatusHistory): string {
    const to = describeStatus(entry.to_status);
    const from = describeStatus(entry.from_status);
    if (!entry.from_status) return `${to.scope}: ${to.label}`;
    return `${to.scope}: ${from.label} -> ${to.label}`;
}

export default function OrderHistoryTable({ history }: { history: OrderStatusHistory[] }) {
    return (
        <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm">
                <thead className="bg-muted/30 text-left">
                    <tr>
                        <th className="px-4 py-3">Accion</th>
                        <th className="px-4 py-3">Hecho por</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Motivo</th>
                    </tr>
                </thead>
                <tbody>
                    {history?.map((entry) => {
                        return (
                            <tr key={entry.id} className="border-t align-top">
                                <td className="px-4 py-3 font-medium">{changeLabel(entry)}</td>
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
