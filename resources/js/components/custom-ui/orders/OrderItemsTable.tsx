import { OrderItem } from './types';

export default function OrderItemsTable({ items }: { items: OrderItem[] }) {
    console.log('OrderItemsTable rendered with items:', items);
    const toNumber = (
        value: number | string | null | undefined,
    ): number | null => {
        if (value === null || value === undefined || value === '') return null;
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : null;
    };

    const formatPen = (value: number | string | null | undefined): string => {
        const numericValue = toNumber(value);
        return numericValue === null ? '-' : numericValue.toFixed(2);
    };

    const COLOR_VALUE_REGEX =
        /^(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(?:0|1|0?\.\d+)\s*\)|hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)|hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*(?:0|1|0?\.\d+)\s*\))$/;

    return (
        <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-sm">
                <thead className="bg-muted/30 text-left">
                    <tr>
                        <th className="px-4 py-2">Nombre</th>
                        <th className="px-4 py-2">Sku Daryza</th>
                        <th className="px-4 py-2">Cantidad</th>
                        <th className="px-4 py-2">Unitario</th>
                        <th className="px-4 py-2">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        const isOnPromo = Boolean(item.metadata?.is_on_promo);
                        const regularPrice = toNumber(
                            item.metadata?.regular_price,
                        );
                        const isPack = item.item_type === 'product_pack';
                        const unitPrice = toNumber(item.unit_price);
                        const variantAttributes = (
                            item.metadata?.variant_attributes ?? []
                        )
                            .filter(
                                (attribute) =>
                                    typeof attribute === 'string' &&
                                    attribute.trim() !== '',
                            )
                            .map((attribute) => {
                                const [rawName, ...rawValueParts] =
                                    attribute.split(':');
                                const attributeName = (rawName ?? '').trim();
                                const attributeValue = rawValueParts
                                    .join(':')
                                    .trim();
                                const isColorAttribute =
                                    attributeName.toLowerCase() === 'color' &&
                                    COLOR_VALUE_REGEX.test(attributeValue);

                                return {
                                    raw: attribute,
                                    attributeName,
                                    attributeValue,
                                    isColorAttribute,
                                };
                            });

                        return (
                            <tr key={item.id} className="border-t">
                                <td className="px-4 py-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="flex items-center gap-2">
                                            {item.product_name}{' '}
                                            {isOnPromo && (
                                                <span className="inline-flex w-fit items-center rounded-full bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                                                    En promo
                                                </span>
                                            )}
                                        </span>
                                        {variantAttributes.length > 0 && (
                                            <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                {variantAttributes.map(
                                                    (attribute, index) => (
                                                        <span
                                                            key={`${item.id}-attr-${index}`}
                                                            className="inline-flex items-center gap-1"
                                                        >
                                                            {attribute.isColorAttribute ? (
                                                                <>
                                                                    <span>
                                                                        {
                                                                            attribute.attributeName
                                                                        }
                                                                        :
                                                                    </span>
                                                                    <span
                                                                        className="inline-block h-3 w-3 rounded-full border border-border"
                                                                        style={{
                                                                            backgroundColor:
                                                                                attribute.attributeValue,
                                                                        }}
                                                                        title={
                                                                            attribute.attributeValue
                                                                        }
                                                                    />
                                                                </>
                                                            ) : (
                                                                <span>
                                                                    {
                                                                        attribute.raw
                                                                    }
                                                                </span>
                                                            )}
                                                            {index <
                                                            variantAttributes.length -
                                                                1 ? (
                                                                <span className="text-muted-foreground/60">
                                                                    |
                                                                </span>
                                                            ) : null}
                                                        </span>
                                                    ),
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    {isPack ? (
                                        <span className="inline-flex items-center rounded border border-blue-200 bg-blue-100 px-2 py-0.5 text-[11px] font-bold tracking-tight text-blue-800 uppercase">
                                            Pack Daryza
                                        </span>
                                    ) : (
                                        <span className="font-mono text-xs text-gray-600">
                                            {item.variant_sku}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-2">{item.quantity}</td>
                                <td className="px-4 py-2">
                                    <div className="flex flex-col gap-1">
                                        <span>S/ {formatPen(unitPrice)}</span>
                                        {isOnPromo && (
                                            <span className="text-xs text-muted-foreground">
                                                {regularPrice !== null && (
                                                    <span className="mr-2 line-through">
                                                        S/{' '}
                                                        {formatPen(
                                                            regularPrice,
                                                        )}
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    S/ {formatPen(item.line_total)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
