'use client';

import { useEffect, useRef } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Attribute } from '@/types/products/attributes';
import { ProductFormValues } from '../schema';

interface Props {
    variantIndex: number;
    availableAttributes: Attribute[];
    selectorValue: string;
    onSelectorChange: (val: string) => void;
    brands?: { id: string; name: string }[];
    brandId?: string;
}

export function SpecificationsAttributes({
    variantIndex,
    availableAttributes,
    selectorValue,
    onSelectorChange,
    brands = [],
    brandId,
}: Props) {
    const { control } = useFormContext<ProductFormValues>();

    const { fields, append } = useFieldArray({
        control,
        name: `variants.${variantIndex}.specifications`,
    });

    

    // Precarga TODOS los atributos disponibles si la variante no tiene specs aún
   useEffect(() => {
    if (!availableAttributes.length) return;

    // Agrega solo los atributos que aún no tienen field
    const existingIds = fields.map((f) => f.attribute_id);
    const missing = availableAttributes.filter(
        (attr) => !existingIds.includes(attr.id),
    );

    if (missing.length > 0) {
        append(
            missing.map((attr) => ({
                attribute_id: attr.id,
                value: '',
            })),
        );
    }
}, [availableAttributes, fields, append]);

    // Siempre renderizamos todos los availableAttributes en orden,
    // buscando su field correspondiente si ya existe
    return (
        <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">
                Especificaciones Técnicas
            </p>

            <div className="space-y-2">
                {availableAttributes.map((attr) => {
                    const specIndex = fields.findIndex(
                        (f) => f.attribute_id === attr.id,
                    );

                    const isMarca = attr.name.toLowerCase() === 'marca';
                    const brandName = isMarca
                        ? (brands.find((b) => b.id === brandId)?.name ?? '')
                        : undefined;

                    // Si aún no hay field para este atributo (edge case),
                    // no renderizamos hasta que el useEffect lo agregue
                    if (specIndex === -1) return null;

                    return (
                        <div key={attr.id} className="flex items-center gap-2">
                            <span className="w-32 shrink-0 text-xs text-slate-500">
                                {attr.name}
                            </span>

                            <Controller
                                name={`variants.${variantIndex}.specifications.${specIndex}.value`}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <div className="flex flex-1 flex-col gap-1">
                                        <Input
                                            {...field}
                                            value={isMarca ? brandName : field.value}
                                            readOnly={isMarca}
                                            placeholder={`Valor para ${attr.name}`}
                                            className={`h-8 text-xs ${isMarca ? 'cursor-default bg-slate-50 text-slate-500' : ''}`}
                                        />
                                        {fieldState.error && (
                                            <p className="text-xs text-red-500">
                                                {fieldState.error.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}