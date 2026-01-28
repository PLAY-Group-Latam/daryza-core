'use client';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Attribute } from '@/types/products';
import { Control, Controller } from 'react-hook-form';
import { ProductFormValues } from '../FormProduct';

interface VariantAttributesProps {
    control: Control<ProductFormValues>;
    variantIndex: number;
    attributes: Attribute[];
}

function isHexColor(value: string) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(value);
}

export function VariantAttributes({
    control,
    variantIndex,
    attributes,
}: VariantAttributesProps) {
    if (!attributes || attributes.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-4">
            {attributes.map((attr, i) => (
                <div
                    key={attr.id}
                    className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                >
                    <span className="text-xs font-medium text-slate-700">
                        {attr.name}
                    </span>

                    {/* BOOLEAN */}
                    {attr.type === 'boolean' && (
                        <Controller
                            name={
                                `variants.${variantIndex}.attributes.${i}` as const
                            }
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={Boolean(field.value?.value)}
                                        onCheckedChange={(checked) =>
                                            field.onChange({
                                                ...field.value,
                                                value: checked,
                                                attribute_value_id: null, // 👈 limpia
                                            })
                                        }
                                    />
                                    <span className="text-sm text-slate-600">
                                        Activado
                                    </span>
                                </div>
                            )}
                        />
                    )}

                    {/* NUMBER / TEXT */}
                    {(attr.type === 'number' || attr.type === 'text') && (
                        <Controller
                            name={
                                `variants.${variantIndex}.attributes.${i}` as const
                            }
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type={attr.type}
                                    placeholder={`Ingresa ${attr.name}`}
                                    className="w-full"
                                    value={
                                        typeof field.value?.value === 'number'
                                            ? field.value.value
                                            : String(field.value?.value ?? '')
                                    }
                                    onChange={(e) =>
                                        field.onChange({
                                            ...field.value,
                                            value:
                                                attr.type === 'number'
                                                    ? Number(e.target.value)
                                                    : e.target.value,
                                            attribute_value_id: null,
                                        })
                                    }
                                />
                            )}
                        />
                    )}

                    {/* SELECT */}
                    {attr.type === 'select' && (
                        <Controller
                            name={
                                `variants.${variantIndex}.attributes.${i}` as const
                            }
                            control={control}
                            render={({ field }) => (
                                <div className="flex flex-wrap gap-2">
                                    {attr.values.map((opt) => {
                                        const isSelected =
                                            field.value?.attribute_value_id ===
                                            opt.id;
                                        const isColor = isHexColor(opt.value);

                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() =>
                                                    field.onChange({
                                                        ...field.value,
                                                        attribute_value_id:
                                                            opt.id,
                                                        value: undefined, // ✅ correcto
                                                    })
                                                }
                                                className={cn(
                                                    isColor
                                                        ? 'h-8 w-8 rounded-full border transition'
                                                        : 'flex items-center justify-center rounded-full border px-3 py-1 text-sm transition',
                                                    isSelected
                                                        ? 'border-primary bg-primary text-white ring-2 ring-primary'
                                                        : 'border-slate-300 bg-slate-100 text-slate-700',
                                                )}
                                                style={
                                                    isColor
                                                        ? {
                                                              backgroundColor:
                                                                  opt.value,
                                                          }
                                                        : undefined
                                                }
                                            >
                                                {!isColor && opt.value}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        />
                    )}

                    {/* Hidden attribute_id */}
                    <Controller
                        name={
                            `variants.${variantIndex}.attributes.${i}.attribute_id` as const
                        }
                        control={control}
                        defaultValue={attr.id}
                        render={({ field }) => (
                            <input type="hidden" {...field} value={attr.id} />
                        )}
                    />
                </div>
            ))}
        </div>
    );
}
