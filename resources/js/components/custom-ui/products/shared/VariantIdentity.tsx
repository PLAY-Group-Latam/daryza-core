interface VariantIdentityProps {
    productName: string;
    variantName?: string | null;
    sku: string;
    image?: string | null;
    fallbackImage?: string;
    nameClassName?: string;
    skuClassName?: string;
}

const HEX_COLOR_REGEX = /#([0-9A-F]{3,6})/i;

function parseVariantName(variantName?: string | null) {
    if (!variantName) {
        return { colorHex: null, label: null };
    }

    const normalized = variantName.trim();
    const colorMatch = normalized.match(HEX_COLOR_REGEX);
    const colorHex = colorMatch ? colorMatch[0] : null;
    const label = normalized
        .replace(HEX_COLOR_REGEX, '')
        .replace(/[()]/g, '')
        .replace(/^\s*-\s*/, '')
        .replace(/\s*-\s*$/, '')
        .trim();

    return {
        colorHex,
        label: label.length > 0 ? label : null,
    };
}

export function VariantIdentity({
    productName,
    variantName,
    sku,
    image,
    fallbackImage = '/image-not-found.jpg',
    nameClassName = 'text-sm font-bold text-slate-900',
    skuClassName = 'font-mono text-xs',
}: VariantIdentityProps) {
    const { colorHex, label } = parseVariantName(variantName);

    return (
        <div className="flex items-start gap-3">
            <img
                src={image || fallbackImage}
                alt={productName}
                className="h-12 w-12 rounded-md border object-cover"
            />
            <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex items-center gap-2">
                    <span className={nameClassName}>{productName}</span>
                    {colorHex && (
                        <>
                            <div
                                className="h-3.5 w-3.5 rounded-full"
                                style={{ backgroundColor: colorHex }}
                            />
                            <span>-</span>
                        </>
                    )}
                    {label && <span className="text-xs">({label})</span>}
                </div>
                <p className={skuClassName}>Sku daryza: {sku}</p>
            </div>
        </div>
    );
}
