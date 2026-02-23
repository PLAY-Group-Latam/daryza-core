'use client';

import { Toggle } from '@/components/ui/toggle';
import { Attribute } from '@/types/products/attributes';
import { Link } from '@inertiajs/react';
import { Boxes, PackagePlus, Settings } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';

import { ProductFormValues } from '../schema';
import { VariantRow } from './VariantRow';
import { useVariantForm } from './hooks/useVariantForm';

interface Props {
    variantAttributes: Attribute[];
    specificationAttributes: Attribute[];
}

export function VariantForm({
    variantAttributes,
    specificationAttributes,
}: Props) {
    const { control } = useFormContext<ProductFormValues>();
    const {
        fields,
        remove,
        appendFirst,
        appendNext,
        activeAttributes,
        selectedIds,
    } = useVariantForm(variantAttributes);

    return (
        <section className="space-y-4">
            <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                ● Variantes
            </p>

            {/* Toggles — un solo Controller para el campo completo */}
            {variantAttributes.length > 0 && (
                <Controller
                    name="variant_attribute_ids"
                    control={control}
                    render={({ field }) => {
                        const current = field.value ?? [];
                        const toggle = (id: string) =>
                            field.onChange(
                                current.includes(id)
                                    ? current.filter((v) => v !== id)
                                    : [...current, id],
                            );

                        return (
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs font-medium text-slate-700">
                                    Seleccione Atributos:
                                </span>
                                {variantAttributes.map((attr) => (
                                    <Toggle
                                        key={attr.id}
                                        pressed={current.includes(attr.id)}
                                        onPressedChange={() => toggle(attr.id)}
                                        size="sm"
                                        className="border text-xs text-gray-600 data-[state=on]:bg-gray-800 data-[state=on]:text-white"
                                    >
                                        {attr.name}
                                    </Toggle>
                                ))}
                            </div>
                        );
                    }}
                />
            )}

            {/* Estado vacío */}
            {fields.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                        <Boxes
                            className="h-6 w-6 text-indigo-400"
                            strokeWidth={1.5}
                        />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                        Aún no hay variantes creadas
                    </p>

                    {!variantAttributes.length ? (
                        <Link
                            href="/productos/attributes"
                            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-600 underline underline-offset-4"
                        >
                            <Settings className="h-3.5 w-3.5" /> Ir a crear
                            atributos
                        </Link>
                    ) : !selectedIds.length ? (
                        <p className="mt-1 text-xs text-slate-500 italic">
                            Selecciona al menos un atributo para continuar
                        </p>
                    ) : (
                        <button
                            type="button"
                            onClick={appendFirst}
                            className="mt-3 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                        >
                            <PackagePlus className="h-4 w-4" /> Crear primera
                            variante
                        </button>
                    )}
                </div>
            )}

            {/* Lista de variantes */}
            {fields.length > 0 && (
                <>
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <VariantRow
                                key={field._fieldId}
                                index={index}
                                onRemove={remove}
                                variantAttributes={activeAttributes}
                                specificationAttributes={
                                    specificationAttributes
                                }
                            />
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={appendNext}
                            className="flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-5 py-2 text-sm text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
                        >
                            <span>+</span> Agregar Variante
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}
