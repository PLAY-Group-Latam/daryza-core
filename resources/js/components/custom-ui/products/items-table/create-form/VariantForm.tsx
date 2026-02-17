'use client';

import { Toggle } from '@/components/ui/toggle';
import { Attribute } from '@/types/products/attributes';
import { Link } from '@inertiajs/react';
import { Boxes, PackagePlus, Settings } from 'lucide-react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { ProductFormValues } from './FormProduct';
import { VariantRow } from './VariantRow';

interface Props {
    variantAttributes: Attribute[];
    specificationAttributes: Attribute[]; // 👈 Atributos para la ficha técnica (Material, etc)
}

export function VariantForm({
    variantAttributes,
    specificationAttributes,
}: Props) {
    const { control, watch } = useFormContext<ProductFormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'variants',
    });

    const selectedVariantAttributeIds = watch('variant_attribute_ids') ?? [];
    const activeVariantAttributes = variantAttributes.filter((attr) =>
        selectedVariantAttributeIds.includes(attr.id),
    );

    const createEmptyVariant = (
        isFirst = false,
    ): ProductFormValues['variants'][number] => ({
        sku: '',
        price: 0,
        promo_price: undefined,
        is_on_promo: false,
        promo_start_at: undefined,
        promo_end_at: undefined,
        stock: 0,
        is_active: true,
        attributes: activeVariantAttributes.map((attr) => {
            if (attr.type === 'select') {
                return {
                    attribute_id: attr.id,
                    attribute_value_id: null,
                    value: undefined,
                };
            }

            return {
                attribute_id: attr.id,
                attribute_value_id: null,
                value:
                    attr.type === 'boolean'
                        ? false
                        : attr.type === 'number'
                          ? 0
                          : '',
            };
        }),
        media: [],
        is_main: isFirst, // 👈 aquí está la clave
        specifications: [], // 👈 Inicializamos el array vacío para la nueva variante
        specification_selector: '', // 👈 Inicializamos el selector
    });

    const handleToggleAttribute = (
        field: { value: string[]; onChange: (ids: string[]) => void },
        attrId: string,
    ) => {
        const current = field.value ?? [];
        const updated = current.includes(attrId)
            ? current.filter((id) => id !== attrId)
            : [...current, attrId];

        field.onChange(updated);
    };

    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                <Boxes className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-slate-700">
                Aún no hay variantes creadas
            </p>

            {!variantAttributes.length ? (
                <Link
                    href="/productos/attributes"
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-600 underline underline-offset-4 hover:text-indigo-500"
                >
                    <Settings className="h-3.5 w-3.5" /> Ir a crear atributos
                </Link>
            ) : !selectedVariantAttributeIds.length ? (
                <p className="mt-0.5 text-xs text-slate-500 italic">
                    Selecciona al menos un atributo para continuar
                </p>
            ) : (
                <button
                    type="button"
                    onClick={() => append(createEmptyVariant(true))}
                    className="mt-2 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 hover:shadow-sm"
                >
                    <PackagePlus className="h-4 w-4" /> Crear primera variante
                </button>
            )}
        </div>
    );

    return (
        <div className="space-y-4">
            <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                ● Variantes
            </p>

            {variantAttributes.length > 0 && (
                <div className="flex items-center gap-4">
                    <h4 className="text-xs font-medium text-slate-700">
                        Seleccione Atributos:
                    </h4>

                    <div className="flex flex-wrap gap-2">
                        {variantAttributes.map((attr) => (
                            <Controller
                                key={attr.id}
                                name="variant_attribute_ids"
                                control={control}
                                render={({ field }) => {
                                    const pressed = (
                                        field.value ?? []
                                    ).includes(attr.id);

                                    return (
                                        <Toggle
                                            pressed={pressed}
                                            onPressedChange={() =>
                                                handleToggleAttribute(
                                                    field,
                                                    attr.id,
                                                )
                                            }
                                            size="sm"
                                            className="border text-xs text-gray-600 hover:text-gray-600 data-[state=on]:bg-gray-800 data-[state=on]:text-white"
                                        >
                                            {attr.name}
                                        </Toggle>
                                    );
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {fields.length === 0 ? (
                renderEmptyState()
            ) : (
                <>
                    <div className="space-y-4">
                        {fields.map((variant, index) => (
                            <VariantRow
                                key={variant.id}
                                index={index}
                                remove={remove}
                                variantAttributes={activeVariantAttributes}
                                specificationAttributes={
                                    specificationAttributes
                                }
                            />
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={() => append(createEmptyVariant(false))}
                            className="flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-5 py-2 text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
                        >
                            <span>+</span> Agregar Variante
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
