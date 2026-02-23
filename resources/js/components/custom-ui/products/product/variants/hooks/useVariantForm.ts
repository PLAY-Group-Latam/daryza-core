import { useCallback } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { Attribute } from '@/types/products/attributes';
import { ProductFormValues, VariantFormValues } from '../../schema';
import { buildAttributeDefault } from '../utils/buildAttributeDefault';

export function useVariantForm(variantAttributes: Attribute[]) {
    const { control } = useFormContext<ProductFormValues>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'variants',
        keyName: '_fieldId',
    });

    const selectedIds = useWatch({
        control,
        name: 'variant_attribute_ids',
        defaultValue: [],
    });

    const activeAttributes = variantAttributes.filter((a) =>
        selectedIds.includes(a.id),
    );

    const buildEmptyVariant = useCallback(
        (isFirst = false): VariantFormValues => ({
            sku: '',
            sku_supplier: '',
            price: 0,
            promo_price: undefined,
            stock: 0,
            is_active: true,
            is_on_promo: false,
            is_main: isFirst,
            promo_start_at: undefined,
            promo_end_at: undefined,
            media: [],
            specifications: [],
            attributes: activeAttributes.map(buildAttributeDefault),
        }),
        [activeAttributes],
    );

    const appendFirst = useCallback(
        () => append(buildEmptyVariant(true)),
        [append, buildEmptyVariant],
    );

    const appendNext = useCallback(
        () => append(buildEmptyVariant(false)),
        [append, buildEmptyVariant],
    );

    return {
        fields,
        remove,
        appendFirst,
        appendNext,
        activeAttributes,
        selectedIds,
    };
}
