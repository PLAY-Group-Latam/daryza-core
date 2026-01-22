// VariantAttributes.tsx
import { Label } from '@/components/ui/label';
import { Controller } from 'react-hook-form';

interface VariantAttributesProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: any;
    variantIndex: number;
    attributes: {
        id: number;
        name: string;
        options: {
            id: number;
            value: string;
        }[];
    }[];
}

export function VariantAttributes({
    control,
    variantIndex,
    attributes,
}: VariantAttributesProps) {
    return (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <Label className="text-xs text-slate-500">
                Configuración de atributos de la variante
            </Label>

            {attributes.length === 0 && (
                <p className="text-xs text-slate-400">
                    Primero debes definir los atributos del producto (Color,
                    Aroma, etc.)
                </p>
            )}

            {attributes.map((attr, i) => (
                <div
                    key={attr.id}
                    className="space-y-2 rounded-md border bg-white p-2"
                >
                    <div className="flex items-center gap-2">
                        {/* Checkbox para activar/desactivar el atributo en esta variante */}
                        <Controller
                            name={`variants.${variantIndex}.attributes.${i}.enabled`}
                            control={control}
                            defaultValue={false}
                            render={({ field }) => (
                                <input
                                    type="checkbox"
                                    checked={!!field.value}
                                    onChange={(e) =>
                                        field.onChange(e.target.checked)
                                    }
                                    className="h-4 w-4"
                                />
                            )}
                        />

                        <Label className="text-[11px] text-slate-600">
                            Usar atributo: {attr.name}
                        </Label>
                    </div>

                    {/* Selector de opción SOLO si está habilitado */}
                    <Controller
                        name={`variants.${variantIndex}.attributes.${i}.enabled`}
                        control={control}
                        render={({ field: enabledField }) => (
                            <>
                                {enabledField.value && (
                                    <div className="space-y-1">
                                        <Label className="text-[11px] text-slate-500">
                                            {attr.name}
                                        </Label>

                                        <Controller
                                            name={`variants.${variantIndex}.attributes.${i}.option_id`}
                                            control={control}
                                            render={({ field }) => (
                                                <select
                                                    {...field}
                                                    className="h-10 w-full rounded-lg border px-3 text-sm"
                                                >
                                                    <option value="">
                                                        Selecciona {attr.name}
                                                    </option>
                                                    {attr.options.map((opt) => (
                                                        <option
                                                            key={opt.id}
                                                            value={opt.id}
                                                        >
                                                            {opt.value}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        />

                                        {/* attribute_id fijo */}
                                        <Controller
                                            name={`variants.${variantIndex}.attributes.${i}.attribute_id`}
                                            control={control}
                                            defaultValue={attr.id}
                                            render={({ field }) => (
                                                <input
                                                    type="hidden"
                                                    {...field}
                                                    value={attr.id}
                                                />
                                            )}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    />
                </div>
            ))}
        </div>
    );
}
