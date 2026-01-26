/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Attribute } from '@/types/products';
import { Controller } from 'react-hook-form';

interface VariantAttributesProps {
    control: any;
    variantIndex: number;
    attributes: Attribute[];
}
// Función helper para detectar si un string es un color hexadecimal válido

export function VariantAttributes({
    control,
    variantIndex,
    attributes,
}: VariantAttributesProps) {
    if (!attributes || attributes.length === 0) return null;
    function isHexColor(value: string) {
        return /^#([0-9A-F]{3}){1,2}$/i.test(value);
    }
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

                    {attr.type === 'boolean' && (
                        <Controller
                            name={`variants.${variantIndex}.attributes.${i}.option_value`}
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <span className="text-sm text-slate-600">
                                        Activado
                                    </span>
                                </div>
                            )}
                        />
                    )}

                    {attr.type === 'number' && (
                        <Controller
                            name={`variants.${variantIndex}.attributes.${i}.option_value`}
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="number"
                                    placeholder={`Ingresa ${attr.name}`}
                                    className="w-full"
                                />
                            )}
                        />
                    )}

                    {attr.type === 'text' && (
                        <Controller
                            name={`variants.${variantIndex}.attributes.${i}.option_value`}
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder={`Ingresa ${attr.name}`}
                                    className="w-full"
                                />
                            )}
                        />
                    )}
                    {attr.type === 'select' && (
                        <Controller
                            name={`variants.${variantIndex}.attributes.${i}.option_id`}
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <div className="flex flex-wrap gap-2">
                                    {attr.values.map((opt) => {
                                        const isSelected =
                                            field.value === opt.id;
                                        const isColor = isHexColor(opt.value);

                                        if (isColor) {
                                            // Botón como círculo de color
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() =>
                                                        field.onChange(opt.id)
                                                    }
                                                    className={cn(
                                                        'h-8 w-8 rounded-full border transition',
                                                        isSelected
                                                            ? 'border-primary ring-2 ring-primary'
                                                            : 'border-slate-300',
                                                    )}
                                                    style={{
                                                        backgroundColor:
                                                            opt.value,
                                                    }}
                                                    aria-label={opt.value}
                                                />
                                            );
                                        }

                                        // Botón de texto normal
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() =>
                                                    field.onChange(opt.id)
                                                }
                                                className={cn(
                                                    'flex items-center justify-center rounded-full border px-3 py-1 text-sm transition',
                                                    !isSelected
                                                        ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                        : 'border-primary bg-primary text-white',
                                                )}
                                            >
                                                {opt.value}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        />
                    )}

                    {/* Hidden attribute_id */}
                    <Controller
                        name={`variants.${variantIndex}.attributes.${i}.attribute_id`}
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
