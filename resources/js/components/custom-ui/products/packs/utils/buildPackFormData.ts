import { Media } from '@/types/products/media';

type PackMediaItem = File | Media;

interface PackFormDataInput {
    name: string;
    slug: string;
    price: number;
    promo_price?: number | null;
    is_on_promotion: boolean;
    show_on_home: boolean;
    is_active: boolean;
    promo_start_at?: Date;
    promo_end_at?: Date;
    brief_description?: string | null;
    stock: number;
    description?: string | null;
    media?: PackMediaItem[];
    items: Array<{
        variant_id: string;
        product_id: string;
        quantity: number;
    }>;
}

export function buildPackFormData(
    data: PackFormDataInput,
    isEdit: boolean,
): FormData {
    const fd = new FormData();

    fd.append('name', data.name);
    fd.append('slug', data.slug);
    fd.append('price', String(data.price));
    fd.append('stock', String(data.stock));
    fd.append('brief_description', data.brief_description ?? '');
    fd.append('description', data.description ?? '');
    fd.append('is_on_promotion', data.is_on_promotion ? '1' : '0');
    fd.append('show_on_home', data.show_on_home ? '1' : '0');
    fd.append('is_active', data.is_active ? '1' : '0');

    if (data.promo_price !== null && data.promo_price !== undefined) {
        fd.append('promo_price', String(data.promo_price));
    }
    if (data.promo_start_at) fd.append('promo_start_at', data.promo_start_at.toISOString());
    if (data.promo_end_at) fd.append('promo_end_at', data.promo_end_at.toISOString());

    data.items.forEach((item, i) => {
        fd.append(`items[${i}][variant_id]`, String(item.variant_id));
        fd.append(`items[${i}][product_id]`, String(item.product_id));
        fd.append(`items[${i}][quantity]`, String(item.quantity));
    });

    (data.media ?? []).forEach((item, i) => {
        if (item instanceof File) {
            fd.append(`media[${i}]`, item);
            return;
        }
        fd.append(`media[${i}][id]`, item.id);
        fd.append(`media[${i}][file_path]`, item.file_path);
        fd.append(`media[${i}][type]`, item.type);
        fd.append(`media[${i}][position]`, String(i));
    });

    if (isEdit) fd.append('_method', 'PUT');
    return fd;
}
