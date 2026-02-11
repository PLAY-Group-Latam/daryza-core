// attribute.ts
export type AttributeType = 'select' | 'number' | 'boolean' | 'text';
export interface AttributeTypeOption {
    value: AttributeType;
    label: string;
}

export interface Attribute {
    id: string;
    name: string;
    type: AttributeType;
    is_filterable: boolean;
    is_variant: boolean;
    created_at: string;
    updated_at: string;
    values: AttributeValue[];
}

export interface AttributeValue {
    id: string;
    attribute_id: string;
    value: string;
    created_at: string;
    updated_at: string;
}
export type PaginatedAttributes = Paginated<Attribute>;

// export interface ProductSpecification {
//     attribute_id: Attribute['id'];
//     value: string | number | boolean;
// }
