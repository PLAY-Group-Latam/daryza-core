import { OrderItem } from './types';

export default function OrderItemsTable({ items }: { items: OrderItem[] }) {
    return (
        <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm">
                <thead className="bg-muted/30 text-left">
                    <tr>
                        <th className="px-4 py-2">Producto</th>
                        <th className="px-4 py-2">SKU</th>
                        <th className="px-4 py-2">Cantidad</th>
                        <th className="px-4 py-2">Unitario</th>
                        <th className="px-4 py-2">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id} className="border-t">
                            <td className="px-4 py-2">{item.product_name}</td>
                            <td className="px-4 py-2">{item.variant_sku}</td>
                            <td className="px-4 py-2">{item.quantity}</td>
                            <td className="px-4 py-2">S/ {item.unit_price}</td>
                            <td className="px-4 py-2">S/ {item.line_total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
