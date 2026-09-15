import { StatusBadge } from './status';
import { OrderDetail } from './types';

interface OrderStatusManagerProps {
    order: OrderDetail;
}

export default function OrderStatusManager({ order }: OrderStatusManagerProps) {
    return <StatusBadge status={order.state} />;
}