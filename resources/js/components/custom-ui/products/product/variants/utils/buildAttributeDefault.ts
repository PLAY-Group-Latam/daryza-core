import { Attribute } from '@/types/products/attributes';
import { VariantFormValues } from '../../schema';

type VariantAttribute = VariantFormValues['attributes'][number];

export function buildAttributeDefault(attr: Attribute): VariantAttribute {
    switch (attr.type) {
        case 'select':
            return {
                attribute_id: attr.id,
                attribute_value_id: null,
                value: undefined,
            };
        default:
            // boolean, text, number — todos como string en el form
            return {
                attribute_id: attr.id,
                attribute_value_id: undefined,
                value: '',
            };
    }
}
