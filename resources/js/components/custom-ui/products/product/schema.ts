import { z } from 'zod';

// — Subschemas —

const VariantAttributeSchema = z.object({
    attribute_id: z.string().min(1),
    attribute_value_id: z.string().nullable().optional(),
    value: z.string().optional(),
});

const SpecificationSchema = z.object({
    attribute_id: z.string().min(1),
    value: z.string().max(1000),
});

const VariantSchema = z.object({
    sku: z.string().min(1, 'El SKU es obligatorio').max(100),
    sku_supplier: z.string().max(100).optional(),
    price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
    promo_price: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
    is_active: z.boolean(),
    is_on_promo: z.boolean(),
    is_main: z.boolean(),
    promo_start_at: z.date().optional(),
    promo_end_at: z.date().optional(),
    media: z.array(z.any()), // ✅ sin validación — File o Media, el backend decide
    attributes: z.array(VariantAttributeSchema),
    specifications: z.array(SpecificationSchema),
});

const MetadataSchema = z.object({
    meta_title: z.string().max(160).optional(),
    meta_description: z.string().max(320).optional(),
    canonical_url: z.string().optional(),
    og_title: z.string().max(160).optional(),
    og_description: z.string().max(320).optional(),
    noindex: z.boolean(),
    nofollow: z.boolean(),
});

// — Schema principal —

export const ProductSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio').max(255),
    slug: z.string().min(1, 'El slug es obligatorio').max(255),
    brief_description: z.string().max(500).optional(),
    description: z.string().optional(),
    is_active: z.boolean(),
    is_home: z.boolean(),
    categories: z.array(z.string()).min(1, 'Selecciona al menos una categoría'),
    business_lines: z.array(z.string()).optional(),
    variant_attribute_ids: z.array(z.string()),
    variants: z
        .array(VariantSchema)
        .min(1, 'El producto debe tener al menos una variante'),
    technicalSheets: z.array(z.any()), // ✅ igual
    metadata: MetadataSchema,
});

// — Tipos —

export type ProductFormValues = z.infer<typeof ProductSchema>;
export type VariantFormValues = z.infer<typeof VariantSchema>;
// export type MediaFormValue = z.infer<typeof MediaFieldSchema>;
export type SpecificationValues = z.infer<typeof SpecificationSchema>;

// — Default values —

export const defaultValues: ProductFormValues = {
    name: '',
    slug: '',
    brief_description: '',
    description: '',
    is_active: true,
    is_home: false,
    categories: [],
    business_lines: [],
    variant_attribute_ids: [],
    variants: [],
    technicalSheets: [],
    metadata: {
        meta_title: '',
        meta_description: '',
        canonical_url: '',
        og_title: '',
        og_description: '',
        noindex: false,
        nofollow: false,
    },
};
