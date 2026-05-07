'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';

import { MultiSelect } from '@/components/custom-ui/MultiSelect';
import { Switch } from '@/components/ui/switch';
import { BusinessLine } from '@/types/products/businessLines';
import { CategorySelect } from '@/types/products/categories';

import { ProductRecommendable } from '@/types/products/productEdit';
import { ProductFormValues } from '../schema';
import { RecommendedProductsField } from './RecommendedProductsField';
import { SeoMetadataSection } from './SeoMetadataSection';

interface Props {
    categories: CategorySelect[];
    businessLines: BusinessLine[];
    brands?: { id: string; name: string }[];
    initialRecommendedProducts: ProductRecommendable[];
    recommendableSearchResults: ProductRecommendable[];
    recommendedSearchUrl: string;
    isSubmitting: boolean;
    isEdit: boolean;
}

function SectionTitle({ children }: { children: ReactNode }) {
    return (
        <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
            ● {children}
        </p>
    );
}

// Átomo para los dos switches idénticos estructuralmente
function ProductSwitch({
    name,
    sectionLabel,
    title,
    description,
}: {
    name: 'is_active' | 'is_home';
    sectionLabel: string;
    title: string;
    description: string;
}) {
    const { control } = useFormContext<ProductFormValues>();
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <div className="space-y-3">
                    <SectionTitle>{sectionLabel}</SectionTitle>
                    <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
                        <div className="space-y-0.5">
                            <h3 className="text-sm font-medium">{title}</h3>
                            <p className="text-xs text-muted-foreground">
                                {description}
                            </p>
                        </div>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </div>
                </div>
            )}
        />
    );
}

export function SidebarSection({
    categories,
    businessLines,
    brands = [],
    initialRecommendedProducts,
    recommendableSearchResults,
    recommendedSearchUrl,
    isSubmitting,
    isEdit,
}: Props) {
    const {
        control,
        setValue,
        clearErrors,
        formState: { errors },
    } = useFormContext<ProductFormValues>();

    const rawParentCategoryId = useWatch({
        control,
        name: 'parent_category_id',
    });
    const parentCategoryId =
        typeof rawParentCategoryId === 'string' ? rawParentCategoryId : '';

    const selectedParent = categories.find(
        (category) => String(category.id) === String(parentCategoryId),
    );
    const subcategoryOptions = useMemo(
        () =>
            (selectedParent?.children ?? []).map((child) => ({
                label: child.name,
                value: String(child.id),
            })),
        [selectedParent],
    );
    const watchedCategories = useWatch({
        control,
        name: 'categories',
    });

    const selectedSubcategoryIds = useMemo(
        () => watchedCategories ?? [],
        [watchedCategories]
    );

    useEffect(() => {
        const current = (selectedSubcategoryIds ?? []).map((id) => String(id));

        if (!parentCategoryId) {
            if (current.length > 0) {
                setValue('categories', [], {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            }
            return;
        }

        const validIds = new Set(subcategoryOptions.map((option) => option.value));
        const filtered = current.filter((id) => validIds.has(String(id)));

        if (filtered.length !== current.length) {
            setValue('categories', filtered, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }

        if (filtered.length > 0) {
            clearErrors('categories');
        }
    }, [
        parentCategoryId,
        selectedSubcategoryIds,
        subcategoryOptions,
        setValue,
        clearErrors,
    ]);

    return (
        <aside className="sticky top-24 space-y-8">
            <ProductSwitch
                name="is_active"
                sectionLabel="Producto Público"
                title="Activo"
                description="Visible para los clientes"
            />

            <ProductSwitch
                name="is_home"
                sectionLabel="Destacado Home"
                title="Home"
                description="Mostrar en la página principal"
            />

            {/* Líneas de negocio */}
            <Controller
                name="business_lines"
                control={control}
                render={({ field }) => (
                    <div className="space-y-2">
                        <SectionTitle>Líneas de Negocio</SectionTitle>
                        <MultiSelect
                            options={businessLines.map((l) => ({
                                label: l.name,
                                value: l.id,
                            }))}
                            value={field.value ?? []}
                            onChange={field.onChange}
                            placeholder="Seleccionar líneas..."
                            searchPlaceholder="Buscar línea de negocio..."
                        />
                    </div>
                )}
            />

            <Controller
                name="brand_id"
                control={control}
                render={({ field }) => (
                    <div className="space-y-2">
                        <SectionTitle>Marca</SectionTitle>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || null)} className="h-10 w-full rounded-xl border bg-background px-3 text-sm">
                            <option value="">Seleccionar marca...</option>
                            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                        </select>
                    </div>
                )}
            />
            {/* Categorías */}
            <Controller
                name="parent_category_id"
                control={control}
                render={() => (
                    <div className="space-y-2">
                        <SectionTitle>Categoría Padre</SectionTitle>
                        <select
                            value={parentCategoryId}
                            onChange={(e) => {
                                const nextParentId = e.target.value;
                                setValue('parent_category_id', nextParentId, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                                setValue('categories', [], {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                                clearErrors('categories');
                            }}
                            className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
                        >
                            <option value="">
                                Seleccionar categoría padre...
                            </option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.parent_category_id && (
                            <p className="text-sm text-red-500">
                                {errors.parent_category_id.message}
                            </p>
                        )}
                    </div>
                )}
            />

            <Controller
                name="categories"
                control={control}
                render={({ field, fieldState }) => (
                    <div className="space-y-2">
                        <SectionTitle>Subcategorías</SectionTitle>
                        {!parentCategoryId && (
                            <p className="rounded-xl border border-dashed px-3 py-2 text-sm text-muted-foreground">
                                Primero selecciona una categoría padre.
                            </p>
                        )}

                        {parentCategoryId &&
                            subcategoryOptions.length === 0 && (
                                <p className="rounded-xl border border-dashed px-3 py-2 text-sm text-muted-foreground">
                                    Esta categoría padre no tiene subcategorías
                                    activas.
                                </p>
                            )}

                        {parentCategoryId && subcategoryOptions.length > 0 && (
                            <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border p-3">
                                {subcategoryOptions.map((option) => {
                                    const currentValues = (field.value ?? []).map(
                                        (id) => String(id),
                                    );
                                    const checked = currentValues.includes(
                                        String(option.value),
                                    );
                                    return (
                                        <label
                                            key={option.value}
                                            className="flex cursor-pointer items-center gap-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    const current = (
                                                        field.value ?? []
                                                    ).map((id) => String(id));
                                                    let nextValues: string[] = [];
                                                    if (e.target.checked) {
                                                        nextValues = Array.from(
                                                            new Set([
                                                                ...current,
                                                                String(
                                                                    option.value,
                                                                ),
                                                            ]),
                                                        );
                                                    } else {
                                                        nextValues = current.filter(
                                                            (id) =>
                                                                id !==
                                                                String(
                                                                    option.value,
                                                                ),
                                                        );
                                                    }

                                                    setValue(
                                                        'categories',
                                                        nextValues,
                                                        {
                                                            shouldDirty: true,
                                                            shouldValidate: true,
                                                        },
                                                    );

                                                    if (nextValues.length > 0) {
                                                        clearErrors(
                                                            'categories',
                                                        );
                                                    }
                                                }}
                                            />
                                            <span>{option.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}

                        {fieldState.error && (
                            <p className="text-sm text-red-500">
                                {fieldState.error.message}
                            </p>
                        )}
                    </div>
                )}
            />

            <RecommendedProductsField
                initialSelected={initialRecommendedProducts}
                searchResults={recommendableSearchResults}
                searchUrl={recommendedSearchUrl}
            />

            <SeoMetadataSection />

            <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-gray-800 px-6 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting
                    ? 'Guardando...'
                    : isEdit
                        ? 'Actualizar producto'
                        : 'Crear producto'}
            </button>
        </aside>
    );
}
