'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type SeoField =
    | 'meta_title'
    | 'meta_description'
    | 'canonical_url'
    | 'meta_keywords';

export interface SeoMetadataValues {
    meta_title?: string;
    meta_description?: string;
    canonical_url?: string;
    meta_keywords?: string;
}

interface SeoMetadataFieldsProps {
    values: SeoMetadataValues;
    errors?: Partial<Record<SeoField, string>>;
    onChange: (field: SeoField, value: string) => void;
    title?: string;
    showMetaKeywords?: boolean;
    limits?: {
        meta_title?: number;
        meta_description?: number;
        canonical_url?: number;
        meta_keywords?: number;
    };
}

function SeoCounter({ current, max }: { current: number; max: number }) {
    const isOver = current > max;
    const isNear = current >= Math.floor(max * 0.9);

    return (
        <p
            className={`mt-1 text-right text-xs ${
                isOver
                    ? 'text-red-600'
                    : isNear
                      ? 'text-amber-600'
                      : 'text-muted-foreground'
            }`}
        >
            {current}/{max}
        </p>
    );
}

export function SeoMetadataFields({
    values,
    errors,
    onChange,
    title = '● SEO & Metadatos',
    showMetaKeywords = false,
    limits,
}: SeoMetadataFieldsProps) {
    const max = {
        meta_title: limits?.meta_title ?? 160,
        meta_description: limits?.meta_description ?? 320,
        canonical_url: limits?.canonical_url ?? 500,
        meta_keywords: limits?.meta_keywords ?? 255,
    };

    return (
        <div className="space-y-4">
            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                {title}
            </p>

            <div>
                <Label className="mb-1 block text-sm font-medium text-slate-700">
                    Meta título
                </Label>
                <Input
                    value={values.meta_title ?? ''}
                    onChange={(e) => onChange('meta_title', e.target.value)}
                    placeholder={`Meta title (max ${max.meta_title})`}
                />
                {errors?.meta_title && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.meta_title}
                    </p>
                )}
                <SeoCounter
                    current={String(values.meta_title ?? '').length}
                    max={max.meta_title}
                />
            </div>

            <div>
                <Label className="mb-1 block text-sm font-medium text-slate-700">
                    Meta descripción
                </Label>
                <Textarea
                    value={values.meta_description ?? ''}
                    onChange={(e) =>
                        onChange('meta_description', e.target.value)
                    }
                    className="h-20 w-full rounded-xl border p-3 text-sm"
                    placeholder={`Meta description (max ${max.meta_description})`}
                />
                {errors?.meta_description && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.meta_description}
                    </p>
                )}
                <SeoCounter
                    current={String(values.meta_description ?? '').length}
                    max={max.meta_description}
                />
            </div>

            {showMetaKeywords && (
                <div>
                    <Label className="mb-1 block text-sm font-medium text-slate-700">
                        Palabras clave meta (por comas)
                    </Label>
                    <Input
                        value={values.meta_keywords ?? ''}
                        onChange={(e) =>
                            onChange('meta_keywords', e.target.value)
                        }
                        placeholder={`Meta keywords (max ${max.meta_keywords})`}
                    />
                    {errors?.meta_keywords && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.meta_keywords}
                        </p>
                    )}
                    <SeoCounter
                        current={String(values.meta_keywords ?? '').length}
                        max={max.meta_keywords}
                    />
                </div>
            )}

            <div>
                <Label className="mb-1 block text-sm font-medium text-slate-700">
                    URL canónica
                </Label>
                <Input
                    value={values.canonical_url ?? ''}
                    onChange={(e) => onChange('canonical_url', e.target.value)}
                    placeholder="https://ejemplo.com/recurso"
                />
                {errors?.canonical_url && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.canonical_url}
                    </p>
                )}
            </div>
        </div>
    );
}
