import { z } from 'zod';

// — Subschemas —

const parseOptionalNumber = (value: unknown) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
};

const isFileLike = (value: unknown): value is File =>
    typeof File !== 'undefined' && value instanceof File;

const FileSchema = z.custom<File>(isFileLike, {
    message: 'Archivo inválido',
});

const ExistingMediaSchema = z
    .object({
        id: z.string().optional(),
        mediable_id: z.string().optional(),
        mediable_type: z.string().optional(),
        file_path: z.string().min(1),
        type: z.enum(['image', 'video', 'technical_sheet']).optional(),
        folder: z.string().optional(),
        is_main: z.boolean().optional(),
        order: z.number().optional(),
        created_at: z.string().optional(),
        updated_at: z.string().optional(),
    })
    .strict();

const VariantAttributeSchema = z.object({
    attribute_id: z.string().min(1),
    attribute_value_id: z.string().nullable().optional(),
    value: z.string().optional(),
});

const SpecificationSchema = z.object({
    attribute_id: z.string().min(1),
    value: z.string().trim().max(1000),
});

const VariantSchema = z.object({
    id: z.string().optional(),
    sku: z.string().trim().min(1, 'El SKU es obligatorio').max(100),
    sku_supplier: z.string().trim().max(100).optional(),
    price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
    promo_price: z.preprocess(
        parseOptionalNumber,
        z.coerce
            .number()
            .min(0, 'El precio promocional no puede ser negativo')
            .optional(),
    ),
    stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
    is_active: z.boolean(),
    is_on_promo: z.boolean(),
    is_main: z.boolean(),
    promo_start_at: z.date().optional(),
    promo_end_at: z.date().optional(),
    media: z.array(z.union([FileSchema, ExistingMediaSchema])),
    attributes: z.array(VariantAttributeSchema),
    specifications: z.array(SpecificationSchema),
});

const MetadataSchema = z.object({
    meta_title: z
        .string()
        .max(160, 'El meta título no puede superar los 160 caracteres.')
        .optional(),
    meta_description: z
        .string()
        .max(320, 'La meta descripción no puede superar los 320 caracteres.')
        .optional(),
    meta_keywords: z
        .string()
        .max(255, 'Las palabras clave no pueden superar los 255 caracteres.')
        .optional(),
    canonical_url: z
        .string()
        .max(500, 'La URL canónica no puede superar los 500 caracteres.')
        .optional(),
});

// — Schema principal —

export const ProductSchema = z
    .object({
        name: z.string().trim().min(1, 'El nombre es obligatorio').max(255),
        slug: z.string().trim().min(1, 'El slug es obligatorio').max(255),
        brief_description: z.string().trim().optional(),
        description: z.string().optional(),
        is_active: z.boolean(),
        is_home: z.boolean(),
        parent_category_id: z.string().min(1, 'Selecciona una categoría padre'),
        categories: z
            .array(z.string())
            .min(1, 'Selecciona al menos una subcategoría'),
        business_lines: z.array(z.string()).optional(),
        recommended_product_ids: z.array(z.string()).optional(),
        variant_attribute_ids: z.array(z.string()),
        variants: z
            .array(VariantSchema)
            .min(1, 'El producto debe tener al menos una variante'),
        technicalSheets: z.array(z.union([FileSchema, ExistingMediaSchema])),
        metadata: MetadataSchema,
    })
    .superRefine((data, ctx) => {
        const canonicalUrl = data.metadata.canonical_url?.trim();
        if (canonicalUrl) {
            try {
                const url = new URL(canonicalUrl);
                if (!['http:', 'https:'].includes(url.protocol)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['metadata', 'canonical_url'],
                        message:
                            'La URL canónica debe iniciar con http:// o https://',
                    });
                }
            } catch {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['metadata', 'canonical_url'],
                    message: 'La URL canónica no tiene un formato válido.',
                });
            }
        }

        data.variants.forEach((variant, index) => {
            if (!variant.is_active && variant.is_main) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['variants', index, 'is_main'],
                    message: 'Una variante inactiva no puede ser principal.',
                });
            }
        });

        const activeMainCount = data.variants.filter(
            (v) => v.is_active && v.is_main,
        ).length;
        if (activeMainCount !== 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['variants'],
                message:
                    'Debe existir exactamente una variante principal activa.',
            });
        }

        const skuMap = new Map<string, number>();
        data.variants.forEach((variant, index) => {
            const normalizedSku = variant.sku.trim().toLowerCase();
            if (!normalizedSku) return;

            if (skuMap.has(normalizedSku)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['variants', index, 'sku'],
                    message: 'El SKU está repetido en el formulario.',
                });
            } else {
                skuMap.set(normalizedSku, index);
            }
        });

        data.variants.forEach((variant, index) => {
            if (!variant.is_on_promo) return;

            if (variant.promo_price === undefined) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['variants', index, 'promo_price'],
                    message: 'Debes indicar precio promocional.',
                });
            }

            if (
                variant.promo_price !== undefined &&
                variant.promo_price > variant.price
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['variants', index, 'promo_price'],
                    message:
                        'El precio promocional no puede ser mayor al precio base.',
                });
            }

            if (
                variant.promo_start_at &&
                variant.promo_end_at &&
                variant.promo_end_at <= variant.promo_start_at
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['variants', index, 'promo_end_at'],
                    message:
                        'La fecha fin debe ser posterior a la fecha inicio.',
                });
            }
        });

        const selectedAttributeIds = new Set(data.variant_attribute_ids);
        const combinationSignatures = new Map<string, number>();

        data.variants.forEach((variant, index) => {
            const uniqueAttributeIds = new Set<string>();
            const selectedValues: string[] = [];

            variant.attributes.forEach((attr, attrIndex) => {
                if (uniqueAttributeIds.has(attr.attribute_id)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: [
                            'variants',
                            index,
                            'attributes',
                            attrIndex,
                            'attribute_id',
                        ],
                        message: 'El atributo está repetido en la variante.',
                    });
                }
                uniqueAttributeIds.add(attr.attribute_id);

                if (
                    selectedAttributeIds.has(attr.attribute_id) &&
                    !attr.attribute_value_id
                ) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: [
                            'variants',
                            index,
                            'attributes',
                            attrIndex,
                            'attribute_value_id',
                        ],
                        message:
                            'Debes seleccionar un valor para este atributo.',
                    });
                }

                if (attr.attribute_value_id) {
                    selectedValues.push(attr.attribute_value_id);
                }
            });

            for (const requiredAttributeId of selectedAttributeIds) {
                if (!uniqueAttributeIds.has(requiredAttributeId)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['variants', index, 'attributes'],
                        message: 'Faltan atributos de variante obligatorios.',
                    });
                    break;
                }
            }

            const signature =
                selectedValues.sort().join('|') || '__no_variant_attributes__';
            if (combinationSignatures.has(signature)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['variants', index, 'attributes'],
                    message: 'La combinación de atributos está duplicada.',
                });
            } else {
                combinationSignatures.set(signature, index);
            }
        });
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
    parent_category_id: '',
    categories: [],
    business_lines: [],
    recommended_product_ids: [],
    variant_attribute_ids: [],
    variants: [],
    technicalSheets: [],
    metadata: {
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        canonical_url: '',
    },
};
