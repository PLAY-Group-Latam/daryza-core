'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { SeoMetadataFields } from '@/components/custom-ui/seo/SeoMetadataFields';
import { ProductFormValues } from '../schema';

export function SeoMetadataSection() {
    const {
        control,
        setValue,
        formState: { errors },
    } = useFormContext<ProductFormValues>();
    const metadata = useWatch({ control, name: 'metadata' });

    return (
        <SeoMetadataFields
            values={metadata}
            errors={{
                meta_title: errors.metadata?.meta_title?.message,
                meta_description: errors.metadata?.meta_description?.message,
                meta_keywords: errors.metadata?.meta_keywords?.message,
                canonical_url: errors.metadata?.canonical_url?.message,
            }}
            onChange={(field, value) =>
                setValue(`metadata.${field}` as never, value as never, {
                    shouldDirty: true,
                    shouldValidate: true,
                })
            }
            limits={{
                meta_title: 160,
                meta_description: 320,
                meta_keywords: 255,
                canonical_url: 500,
            }}
            showMetaKeywords
        />
    );
}
