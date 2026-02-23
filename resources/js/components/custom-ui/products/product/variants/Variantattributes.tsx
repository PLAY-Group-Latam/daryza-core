'use client';

import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Attribute } from '@/types/products/attributes';
import { ProductFormValues } from '../schema';

interface Props {
    control: Control<ProductFormValues>;
    variantIndex: number;
    attributes: Attribute[];
}

export function VariantAttributes({
    control,
    variantIndex,
    attributes,
}: Props) {
    if (!attributes.length) return null;

    return (
        <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">Atributos</p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {attributes.map((attr, attrIndex) => (
                    <Controller
                        key={attr.id}
                        name={`variants.${variantIndex}.attributes.${attrIndex}.attribute_value_id`}
                        control={control}
                        render={({ field }) => {
                            // Select — usa attribute_value_id
                            if (attr.type === 'select') {
                                return (
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-xs">
                                            {attr.name}
                                        </Label>
                                        <Select
                                            value={field.value ?? ''}
                                            onValueChange={(val) =>
                                                field.onChange(val || null)
                                            }
                                        >
                                            <SelectTrigger className="h-9 text-xs">
                                                <SelectValue
                                                    placeholder={`Seleccionar ${attr.name}`}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {attr.values?.map((v) => (
                                                    <SelectItem
                                                        key={v.id}
                                                        value={v.id}
                                                    >
                                                        {v.value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            }

                            // Para boolean y text usamos el campo value
                            return (
                                <Controller
                                    name={`variants.${variantIndex}.attributes.${attrIndex}.value`}
                                    control={control}
                                    render={({ field: valueField }) => {
                                        if (attr.type === 'boolean') {
                                            return (
                                                <div className="flex items-center gap-2 pt-5">
                                                    <Switch
                                                        checked={
                                                            valueField.value ===
                                                            'true'
                                                        }
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            valueField.onChange(
                                                                String(checked),
                                                            )
                                                        }
                                                    />
                                                    <Label className="text-xs">
                                                        {attr.name}
                                                    </Label>
                                                </div>
                                            );
                                        }

                                        // default: text / string
                                        return (
                                            <div className="flex flex-col gap-1">
                                                <Label className="text-xs">
                                                    {attr.name}
                                                </Label>
                                                <Input
                                                    {...valueField}
                                                    value={
                                                        valueField.value ?? ''
                                                    }
                                                    placeholder={attr.name}
                                                />
                                            </div>
                                        );
                                    }}
                                />
                            );
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
