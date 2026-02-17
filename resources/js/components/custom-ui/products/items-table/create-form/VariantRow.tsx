'use client';

import { DatePicker } from '@/components/custom-ui/DatePicker';
import { UploadMultiple } from '@/components/custom-ui/UploadMultiple';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Attribute } from '@/types/products/attributes';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { ProductFormValues } from './FormProduct';
import { SpecificationsAttributes } from './SpecificationsFormAttributes';
import { VariantAttributes } from './VariantAttributes';
import { VariantMainSwitch } from './VariantMainSwitch';

interface Props {
    index: number;
    remove: (index: number) => void;
    variantAttributes: Attribute[];
    specificationAttributes: Attribute[]; // 👈 Atributos para la ficha técnica (Material, etc)
}

export function VariantRow({
    index,
    remove,
    variantAttributes,
    specificationAttributes,
}: Props) {
    const { control } = useFormContext<ProductFormValues>();

    // Observamos si la variante está en promo
    const isOnPromo = useWatch({
        control,
        name: `variants.${index}.is_on_promo`,
        defaultValue: false,
    });

    return (
        <Card className="space-y-4 rounded-2xl border border-slate-200 p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700">
                    Variante {index + 1}
                </h4>
                <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-0 text-xs text-red-500"
                    onClick={() => remove(index)}
                >
                    Eliminar
                </Button>
            </div>

            {/* Imagen + Inputs */}
            <div className="flex flex-col gap-4">
                {/* Imagen */}
                <Controller
                    name={`variants.${index}.media`}
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                        <UploadMultiple
                            value={field.value}
                            onFilesChange={field.onChange} // directo, solo File
                            previewClassName="h-24 w-24"
                        />
                    )}
                />

                {/* Inputs básicos */}
                <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                    <Controller
                        name={`variants.${index}.sku`}
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <div>
                                <Label className="text-xs">Sku Dariza</Label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                    <Controller
                        name={`variants.${index}.sku_supplier`}
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <div>
                                <Label className="text-xs font-medium text-slate-500">
                                    Sku Proveedor
                                </Label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                    <Controller
                        name={`variants.${index}.price`}
                        control={control}
                        defaultValue={0}
                        render={({ field }) => (
                            <div>
                                <Label className="text-xs">Precio</Label>
                                <Input {...field} type="number" />
                            </div>
                        )}
                    />
                    <Controller
                        name={`variants.${index}.stock`}
                        control={control}
                        defaultValue={0}
                        render={({ field }) => (
                            <div>
                                <Label className="text-xs">Stock</Label>
                                <Input {...field} type="number" />
                            </div>
                        )}
                    />

                    <Controller
                        name={`variants.${index}.is_active`}
                        control={control}
                        defaultValue={true}
                        render={({ field }) => (
                            <div className="mt-2 flex items-end gap-2 md:mt-0">
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <span className="text-xs">
                                    {field.value ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        )}
                    />

                    {/* Otros inputs */}
                    <VariantMainSwitch index={index} />
                    <Controller
                        name={`variants.${index}.is_on_promo`}
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                            <div className="mt-2 flex h-9 items-end gap-2 md:mt-0">
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <span className="text-xs">
                                    {field.value
                                        ? 'En promoción'
                                        : 'Sin promoción'}
                                </span>
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* Campos de promoción (render condicional usando useWatch) */}
            {isOnPromo && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Controller
                        name={`variants.${index}.promo_price`}
                        control={control}
                        defaultValue={0}
                        render={({ field }) => (
                            <div className="flex flex-col gap-1">
                                <Label className="text-xs">
                                    Precio Promocional
                                </Label>
                                <Input
                                    {...field}
                                    type="number"
                                    placeholder="Precio promocional"
                                />
                            </div>
                        )}
                    />

                    <Controller
                        name={`variants.${index}.promo_start_at`}
                        control={control}
                        render={({ field }) => (
                            <div className="flex flex-col gap-1">
                                <Label className="text-xs">
                                    Inicio Promoción
                                </Label>
                                <DatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Seleccionar fecha"
                                />
                            </div>
                        )}
                    />

                    <Controller
                        name={`variants.${index}.promo_end_at`}
                        control={control}
                        render={({ field }) => (
                            <div className="flex flex-col gap-1">
                                <Label className="text-xs">Fin Promoción</Label>
                                <DatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Seleccionar fecha"
                                />
                            </div>
                        )}
                    />
                </div>
            )}

            {/* Atributos */}
            <VariantAttributes
                control={control}
                variantIndex={index}
                attributes={variantAttributes}
            />

            <SpecificationsAttributes
                variantIndex={index}
                availableAttributes={specificationAttributes}
            />
        </Card>
    );
}
