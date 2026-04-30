'use client';

import { useEffect, useRef } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Attribute } from '@/types/products/attributes';
import { ProductFormValues } from '../schema';

interface Props {
    variantIndex: number;
    availableAttributes: Attribute[];
    selectorValue: string;
    onSelectorChange: (val: string) => void;
}

export function SpecificationsAttributes({
    variantIndex,
    availableAttributes,
    selectorValue,
    onSelectorChange,
}: Props) {
    const { control } = useFormContext<ProductFormValues>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: `variants.${variantIndex}.specifications`,
    });

    const didBootstrapDefaults = useRef(false);

    // Si la variante no tiene especificaciones, precarga todas para que
    // el usuario solo complete los valores.
    useEffect(() => {
        if (didBootstrapDefaults.current) return;
        if (!availableAttributes.length) return;
        if (fields.length > 0) {
            didBootstrapDefaults.current = true;
            return;
        }

        append(
            availableAttributes.map((attr) => ({
                attribute_id: attr.id,
                value: '',
            })),
        );
        didBootstrapDefaults.current = true;
    }, [append, availableAttributes, fields.length]);

    // Atributos que aún no fueron agregados como especificación
    const usedIds = fields.map((f) => f.attribute_id);
    const available = availableAttributes.filter(
        (a) => !usedIds.includes(a.id),
    );

    const handleAdd = () => {
        if (!selectorValue) return;
        append({ attribute_id: selectorValue, value: '' });
        onSelectorChange('');
    };

    if (!availableAttributes.length) return null;

    return (
        <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">
                Especificaciones Técnicas
            </p>

            {/* Especificaciones ya agregadas */}
            {fields.length > 0 && (
                <div className="space-y-2">
                    {fields.map((spec, specIndex) => {
                        const attr = availableAttributes.find(
                            (a) => a.id === spec.attribute_id,
                        );

                        return (
                            <div
                                key={spec.id}
                                className="flex items-center gap-2"
                            >
                                <span className="w-32 shrink-0 text-xs text-slate-500">
                                    {attr?.name ?? spec.attribute_id}
                                </span>

                                <Controller
                                    name={`variants.${variantIndex}.specifications.${specIndex}.value`}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <div className="flex flex-1 flex-col gap-1">
                                            <Input
                                                {...field}
                                                placeholder={`Valor para ${attr?.name ?? ''}`}
                                                className="h-8 text-xs"
                                            />
                                            {fieldState.error && (
                                                <p className="text-xs text-red-500">
                                                    {fieldState.error.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs text-red-400 hover:text-red-600"
                                    onClick={() => remove(specIndex)}
                                >
                                    ✕
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Selector para agregar nueva especificación */}
            {available.length > 0 && (
                <div className="flex items-center gap-2">
                    <Select
                        value={selectorValue}
                        onValueChange={onSelectorChange}
                    >
                        <SelectTrigger className="h-8 flex-1 text-xs">
                            <SelectValue placeholder="Agregar especificación..." />
                        </SelectTrigger>
                        <SelectContent>
                            {available.map((attr) => (
                                <SelectItem key={attr.id} value={attr.id}>
                                    {attr.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        disabled={!selectorValue}
                        onClick={handleAdd}
                    >
                        + Agregar
                    </Button>
                </div>
            )}
        </div>
    );
}
