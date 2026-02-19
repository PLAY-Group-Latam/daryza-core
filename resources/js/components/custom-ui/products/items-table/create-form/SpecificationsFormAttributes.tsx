'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Attribute } from '@/types/products/attributes';
import { ClipboardList } from 'lucide-react';
import {
    Controller,
    useFieldArray,
    useFormContext,
    useWatch,
} from 'react-hook-form';
import { ProductFormValues } from './FormProduct';

interface SpecificationsAttributesProps {
    availableAttributes: Attribute[];
    variantIndex: number;
}

export function SpecificationsAttributes({
    availableAttributes,
    variantIndex,
}: SpecificationsAttributesProps) {
    const { control, setValue } = useFormContext<ProductFormValues>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: `variants.${variantIndex}.specifications`,
    });

    const specifications = useWatch({
        control,
        name: `variants.${variantIndex}.specifications`,
    });

    const addSpecification = (attrId: string) => {
        const attr = availableAttributes.find((a) => a.id === attrId);
        if (!attr) return;

        // Siempre inicializa como string vacío
        append({ attribute_id: attr.id, value: '' });
        setValue(`variants.${variantIndex}.specification_selector`, '');
    };

    return (
        <div className="space-y-4 rounded-xl border bg-slate-50/30 p-4">
            <p className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase">
                ● Especificaciones Técnicas
            </p>

            {fields.length === 0 ? (
                <div className="flex flex-col items-center py-4 text-slate-400">
                    <ClipboardList className="mb-1 h-5 w-5 opacity-20" />
                    <p className="text-xs">Sin especificaciones</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {fields.map((fieldSpec, index) => {
                        const attr = availableAttributes.find(
                            (a) => a.id === fieldSpec.attribute_id,
                        );
                        if (!attr) return null;

                        return (
                            <div
                                key={fieldSpec.id}
                                className="flex items-center gap-3 rounded-lg border bg-white p-2 shadow-sm"
                            >
                                <div className="min-w-[120px] flex-1">
                                    <p className="text-xs font-semibold text-slate-700">
                                        {attr.name}
                                    </p>
                                </div>

                                <div className="flex-[2]">
                                    <Controller
                                        name={`variants.${variantIndex}.specifications.${index}.value`}
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                type="text"
                                                className="h-8 text-xs"
                                                placeholder="Escribe el valor..."
                                                // Aseguramos que el valor siempre sea al menos un string vacío
                                                value={
                                                    (field.value as string) ??
                                                    ''
                                                }
                                            />
                                        )}
                                    />
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-600"
                                    onClick={() => remove(index)}
                                >
                                    ×
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Selector de Atributos */}
            <Controller
                name={`variants.${variantIndex}.specification_selector`}
                control={control}
                render={({ field }) => (
                    <NativeSelect
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => addSpecification(e.target.value)}
                        className="h-8 w-full border-dashed text-xs"
                    >
                        <option value="">
                            + Añadir especificación técnica
                        </option>
                        {availableAttributes.map((attr) => (
                            <option
                                key={attr.id}
                                value={attr.id}
                                disabled={specifications?.some(
                                    (s) => s.attribute_id === attr.id,
                                )}
                            >
                                {attr.name}
                            </option>
                        ))}
                    </NativeSelect>
                )}
            />
        </div>
    );
}
