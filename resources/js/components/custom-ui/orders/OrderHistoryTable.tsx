import { formatDate } from '@/lib/helpers/formatDate';

import { getStateLabel } from './status';
import { OrderStatusHistory } from './types';

function describeStatus(raw: string | null | undefined) {
    if (!raw) return { scope: 'Sistema', label: 'Sin estado' };

    return { scope: 'Estado', label: getStateLabel(raw) };
}

// Actualizamos actorLabel para priorizar el nombre real si existe
function actorLabel(entry: OrderStatusHistory) {
    if (entry.changed_by_name) {
        return entry.changed_by_name;
    }

    if (entry.changed_by_type === 'admin') return 'Administrador';
    if (entry.changed_by_type === 'customer') return 'Cliente';
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
                        <th className="px-4 py-3">Acción</th>
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
                                <td className="px-4 py-3">{actorLabel(entry)}</td>
                                <td className="px-4 py-3">{formatDate(entry.created_at, true)}</td>
                                <td className="px-4 py-3 text-muted-foreground">{entry.note || 'Sin observación'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}