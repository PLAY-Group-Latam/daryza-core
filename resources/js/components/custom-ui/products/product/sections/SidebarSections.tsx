'use client';

import { Controller, useFormContext } from 'react-hook-form';

import { MultiSelect } from '@/components/custom-ui/MultiSelect';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { BusinessLine } from '@/types/products/businessLines';
import { CategorySelect } from '@/types/products/categories';

import { ProductRecommendable } from '@/types/products/productEdit';
import { CategoryTreeSelect } from '../components/CategoryArrayTreeSelect';
import { ProductFormValues } from '../schema';
import { RecommendedProductsField } from './RecommendedProductsField';

interface Props {
    categories: CategorySelect[];
    businessLines: BusinessLine[];
    initialRecommendedProducts: ProductRecommendable[];
    recommendableSearchResults: ProductRecommendable[];
    recommendedSearchUrl: string;
    isSubmitting: boolean;
    isEdit: boolean;
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
                    <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                        ● {sectionLabel}
                    </p>
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
    initialRecommendedProducts,
    recommendableSearchResults,
    recommendedSearchUrl,
    isSubmitting,
    isEdit,
}: Props) {
    const {
        control,
        formState: { errors },
    } = useFormContext<ProductFormValues>();

    return (
        <aside className="sticky top-24 space-y-8">
            <ProductSwitch
                name="is_active"
                sectionLabel="Producto Público"
                title="Visibilidad"
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
                        <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                            ● Líneas de Negocio
                        </p>
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

            {/* Categorías */}
            <Controller
                name="categories"
                control={control}
                render={({ field }) => (
                    <div className="space-y-2">
                        <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                            ● Categoría
                        </p>
                        <CategoryTreeSelect
                            categories={categories}
                            value={field.value}
                            onChange={field.onChange}
                        />
                        {errors.categories && (
                            <p className="text-sm text-red-500">
                                {errors.categories.message}
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

            {/* SEO */}
            <div className="space-y-4">
                <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                    ● SEO & Metadatos
                </p>

                <Controller
                    name="metadata.meta_title"
                    control={control}
                    render={({ field }) => (
                        <Input {...field} placeholder="Meta title (max 160)" />
                    )}
                />

                <Controller
                    name="metadata.meta_description"
                    control={control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            className="h-20 w-full rounded-xl border p-3 text-sm"
                            placeholder="Meta description (max 320)"
                        />
                    )}
                />

                <Controller
                    name="metadata.og_title"
                    control={control}
                    render={({ field }) => (
                        <Input {...field} placeholder="OG title" />
                    )}
                />

                <Controller
                    name="metadata.og_description"
                    control={control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            className="h-20 w-full rounded-xl border p-3 text-sm"
                            placeholder="OG description"
                        />
                    )}
                />

                <Controller
                    name="metadata.canonical_url"
                    control={control}
                    render={({ field }) => (
                        <div>
                            <Input
                                {...field}
                                placeholder="https://ejemplo.com/producto"
                            />
                            {errors.metadata?.canonical_url && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.metadata.canonical_url.message}
                                </p>
                            )}
                        </div>
                    )}
                />
            </div>

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
