'use client';

import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { DatePicker } from '@/components/custom-ui/DatePicker';
import { UploadMultiple } from '@/components/custom-ui/UploadMultiple';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Attribute } from '@/types/products/attributes';

import { ProductFormValues } from '../schema';
import { SpecificationsAttributes } from './Specificationsattributes';
import { VariantAttributes } from './Variantattributes';

interface Props {
    index: number;
    onRemove: (index: number) => void;
    variantAttributes: Attribute[];
    specificationAttributes: Attribute[];
}

export function VariantRow({
    index,
    onRemove,
    variantAttributes,
    specificationAttributes,
}: Props) {
    const {
        control,
        setValue,
        getValues,
        formState: { errors },
    } =
        useFormContext<ProductFormValues>();
    const attributesRootError = errors.variants?.[index]?.attributes?.root;
    const isMainError = errors.variants?.[index]?.is_main;

    // Estado UI local — no pertenece al schema del form
    const [specSelector, setSpecSelector] = useState('');

    const isOnPromo = useWatch({
        control,
        name: `variants.${index}.is_on_promo`,
        defaultValue: false,
    });
    const isActive = useWatch({
        control,
        name: `variants.${index}.is_active`,
        defaultValue: true,
    });
    const isMain = useWatch({
        control,
        name: `variants.${index}.is_main`,
        defaultValue: false,
    });

    const handleSetMain = (checked: boolean) => {
        if (!checked) return;
        getValues('variants').forEach((_, i) => {
            setValue(`variants.${i}.is_main`, i === index, {
                shouldDirty: true,
                shouldTouch: false,
                shouldValidate: false,
            });
        });
    };

    const handleSetActive = (checked: boolean) => {
        setValue(`variants.${index}.is_active`, checked, {
            shouldDirty: true,
            shouldTouch: false,
            shouldValidate: true,
        });

        if (!checked && isMain) {
            // Una variante inactiva no puede ser principal.
            setValue(`variants.${index}.is_main`, false, {
                shouldDirty: true,
                shouldTouch: false,
                shouldValidate: true,
            });

            const variants = getValues('variants');
            const fallbackIndex = variants.findIndex(
                (variant, i) => i !== index && variant.is_active,
            );

            if (fallbackIndex >= 0) {
                variants.forEach((_, i) => {
                    setValue(`variants.${i}.is_main`, i === fallbackIndex, {
                        shouldDirty: true,
                        shouldTouch: false,
                        shouldValidate: false,
                    });
                });
            }
        }
    };

    return (
        <Card className="space-y-5 rounded-2xl border border-slate-200 p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700">
                    Variante {index + 1}
                </h4>
                <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-red-500"
                    onClick={() => onRemove(index)}
                >
                    Eliminar
                </Button>
            </div>

            {/* Media */}
            <Controller
                name={`variants.${index}.media`}
                control={control}
                render={({ field }) => (
                    <UploadMultiple
                        value={field.value}
                        onFilesChange={field.onChange}
                        previewClassName="h-24 w-24"
                    />
                )}
            />

            {/* Campos básicos */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Controller
                    name={`variants.${index}.sku`}
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs">SKU Dariza *</Label>
                            <Input {...field} />
                            {fieldState.error && (
                                <p className="text-xs text-red-500">
                                    {fieldState.error.message}
                                </p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name={`variants.${index}.sku_supplier`}
                    control={control}
                    render={({ field }) => (
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs text-slate-500">
                                SKU Proveedor
                            </Label>
                            <Input {...field} />
                        </div>
                    )}
                />

                <Controller
                    name={`variants.${index}.price`}
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs">Precio *</Label>
                            <Input
                                {...field}
                                type="number"
                                min={0}
                                step="0.01"
                            />
                            {fieldState.error && (
                                <p className="text-xs text-red-500">
                                    {fieldState.error.message}
                                </p>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name={`variants.${index}.stock`}
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs">Stock *</Label>
                            <Input {...field} type="number" min={0} />
                            {fieldState.error && (
                                <p className="text-xs text-red-500">
                                    {fieldState.error.message}
                                </p>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* Switches */}
            <div className="flex flex-wrap gap-6">
                <Controller
                    name={`variants.${index}.is_active`}
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={field.value}
                                onCheckedChange={handleSetActive}
                            />
                            <span className="text-xs">
                                {field.value ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    )}
                />

                <div className="flex items-center gap-2">
                    <Switch
                        checked={!!isMain}
                        disabled={!isActive}
                        onCheckedChange={handleSetMain}
                    />
                    <span className="text-xs">Principal</span>
                </div>

                <Controller
                    name={`variants.${index}.is_on_promo`}
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <span className="text-xs">
                                {field.value ? 'En promoción' : 'Sin promoción'}
                            </span>
                        </div>
                    )}
                />
            </div>
            {isMainError?.message && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {isMainError.message}
                </p>
            )}

            {/* Campos de promoción — render condicional */}
            {isOnPromo && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Controller
                        name={`variants.${index}.promo_price`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1">
                                <Label className="text-xs">
                                    Precio Promocional
                                </Label>
                                <Input
                                    {...field}
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder="0.00"
                                />
                                {fieldState.error && (
                                    <p className="text-xs text-red-500">
                                        {fieldState.error.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />

                    <Controller
                        name={`variants.${index}.promo_start_at`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1">
                                <Label className="text-xs">
                                    Inicio Promoción
                                </Label>
                                <DatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Seleccionar fecha"
                                />
                                {fieldState.error && (
                                    <p className="text-xs text-red-500">
                                        {fieldState.error.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />

                    <Controller
                        name={`variants.${index}.promo_end_at`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1">
                                <Label className="text-xs">Fin Promoción</Label>
                                <DatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Seleccionar fecha"
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
            )}

            {/* Atributos de variante */}
            {attributesRootError?.message && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {attributesRootError.message}
                </p>
            )}
            <VariantAttributes
                control={control}
                variantIndex={index}
                attributes={variantAttributes}
            />

            {/* Especificaciones técnicas — specSelector es estado UI local */}
            <SpecificationsAttributes
                variantIndex={index}
                availableAttributes={specificationAttributes}
                selectorValue={specSelector}
                onSelectorChange={setSpecSelector}
            />
        </Card>
    );
}
