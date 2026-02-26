// utils/buildFormData.ts
import { Media } from '@/types/products/media';
import { ProductFormValues } from '../../schema';

export function buildFormData(
    data: ProductFormValues,
    isEdit: boolean,
): FormData {
    const fd = new FormData();

    // — Campos simples —
    fd.append('name', data.name);
    fd.append('slug', data.slug);
    fd.append('brief_description', data.brief_description ?? '');
    fd.append('description', data.description ?? '');
    fd.append('is_active', data.is_active ? '1' : '0');
    fd.append('is_home', data.is_home ? '1' : '0');

    if (isEdit) fd.append('_method', 'PUT');

    // — Arrays simples —
    data.categories.forEach((id) => fd.append('categories[]', id));
    data.business_lines?.forEach((id) => fd.append('business_lines[]', id));
    data.recommended_product_ids?.forEach((id) =>
        fd.append('recommended_product_ids[]', id),
    );
    data.variant_attribute_ids.forEach((id) =>
        fd.append('variant_attribute_ids[]', id),
    );

    // — Metadata —
    fd.append('metadata[meta_title]', data.metadata.meta_title ?? '');
    fd.append(
        'metadata[meta_description]',
        data.metadata.meta_description ?? '',
    );
    fd.append('metadata[canonical_url]', data.metadata.canonical_url ?? '');
    fd.append('metadata[og_title]', data.metadata.og_title ?? '');
    fd.append('metadata[og_description]', data.metadata.og_description ?? '');
    fd.append('metadata[noindex]', data.metadata.noindex ? '1' : '0');
    fd.append('metadata[nofollow]', data.metadata.nofollow ? '1' : '0');

    // — Variantes —
    data.variants.forEach((variant, vi) => {
        const p = `variants[${vi}]`;

        if (variant.id) fd.append(`${p}[id]`, variant.id);
        fd.append(`${p}[sku]`, variant.sku);
        fd.append(`${p}[sku_supplier]`, variant.sku_supplier ?? '');
        fd.append(`${p}[price]`, String(variant.price));
        fd.append(`${p}[stock]`, String(variant.stock));
        fd.append(`${p}[is_active]`, variant.is_active ? '1' : '0');
        fd.append(`${p}[is_on_promo]`, variant.is_on_promo ? '1' : '0');
        fd.append(`${p}[is_main]`, variant.is_main ? '1' : '0');

        if (variant.promo_price !== undefined)
            fd.append(`${p}[promo_price]`, String(variant.promo_price));
        if (variant.promo_start_at)
            fd.append(
                `${p}[promo_start_at]`,
                variant.promo_start_at.toISOString(),
            );
        if (variant.promo_end_at)
            fd.append(`${p}[promo_end_at]`, variant.promo_end_at.toISOString());

        // — Media —
        // El índice `mi` representa la posición tras el drag & drop.
        // El array ya viene reordenado desde el estado del form.
        variant.media.forEach((item, mi) => {
            if (item instanceof File) {
                // Archivo nuevo: se envía como binario
                fd.append(`${p}[media][${mi}]`, item);
            } else {
                // Imagen/video ya existente: se envía como objeto con metadatos
                const media = item as Media;
                if (media.id) fd.append(`${p}[media][${mi}][id]`, media.id);
                fd.append(`${p}[media][${mi}][file_path]`, media.file_path);
                fd.append(`${p}[media][${mi}][type]`, media.type);
                fd.append(`${p}[media][${mi}][position]`, String(mi)); // ← posición drag & drop
            }
        });

        // — Atributos —
        variant.attributes.forEach((attr, ai) => {
            fd.append(
                `${p}[attributes][${ai}][attribute_id]`,
                attr.attribute_id,
            );
            if (attr.attribute_value_id)
                fd.append(
                    `${p}[attributes][${ai}][attribute_value_id]`,
                    attr.attribute_value_id,
                );
            if (attr.value !== undefined)
                fd.append(`${p}[attributes][${ai}][value]`, String(attr.value));
        });

        // — Especificaciones —
        variant.specifications.forEach((spec, si) => {
            fd.append(
                `${p}[specifications][${si}][attribute_id]`,
                spec.attribute_id,
            );
            fd.append(`${p}[specifications][${si}][value]`, spec.value);
        });
    });

    // — Fichas técnicas —
    data.technicalSheets.forEach((sheet, i) => {
        if (sheet instanceof File) {
            fd.append(`technicalSheets[${i}]`, sheet);
        } else {
            const media = sheet as Media;
            if (media.id) fd.append(`technicalSheets[${i}][id]`, media.id);
            fd.append(`technicalSheets[${i}][file_path]`, media.file_path);
        }
    });

    return fd;
}
