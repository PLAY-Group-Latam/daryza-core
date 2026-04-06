'use client';

import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Attribute } from '@/types/products/attributes';
import { ProductFormValues } from '../schema';

// ─────────────────────────────────────────────
// Helper: detecta si un string es color hex
// Soporta: #fff  #ffffff  #FFFFFF  #ffffffff
// ─────────────────────────────────────────────
export function isHexColor(value: string): boolean {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(
        value?.trim() ?? '',
    );
}

// ─────────────────────────────────────────────
// Chip de color (hex)
// ─────────────────────────────────────────────
function ColorChip({
    color,
    label,
    isSelected,
    onClick,
}: {
    color: string;
    label: string;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                isSelected
                    ? 'scale-110 border-slate-900 shadow-md'
                    : 'border-transparent hover:border-slate-300'
            }`}
        >
            <span
                className="h-6 w-6 rounded-full border border-slate-300"
                style={{ backgroundColor: color }}
            />
            {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                        className="h-3.5 w-3.5 drop-shadow"
                        viewBox="0 0 12 12"
                        fill="none"
                    >
                        <path
                            d="M2 6l3 3 5-5"
                            stroke="#fff"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            )}
        </button>
    );
}

// ─────────────────────────────────────────────
// Chip de texto (valor normal)
// ─────────────────────────────────────────────
function TextChip({
    label,
    isSelected,
    onClick,
}: {
    label: string;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                isSelected
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
            }`}
        >
            {label}
        </button>
    );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
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
            <div className="space-y-3">
                {attributes.map((attr, attrIndex) => (
                    <Controller
                        key={attr.id}
                        name={`variants.${variantIndex}.attributes.${attrIndex}.attribute_value_id`}
                        control={control}
                        render={({ field, fieldState }) => {
                            if (attr.type === 'select') {
                                return (
                                    <div>
                                        <Label className="mb-2 block text-xs">
                                            {attr.name}
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {attr.values?.map((v) => {
                                                const isSelected =
                                                    field.value === v.id;
                                                const toggle = () =>
                                                    field.onChange(
                                                        isSelected
                                                            ? null
                                                            : v.id,
                                                    );

                                                // Si el value es hex → chip de color
                                                // Si no              → chip de texto
                                                return isHexColor(v.value) ? (
                                                    <ColorChip
                                                        key={v.id}
                                                        color={v.value}
                                                        label={
                                                            v.label ?? v.value
                                                        }
                                                        isSelected={isSelected}
                                                        onClick={toggle}
                                                    />
                                                ) : (
                                                    <TextChip
                                                        key={v.id}
                                                        label={v.value}
                                                        isSelected={isSelected}
                                                        onClick={toggle}
                                                    />
                                                );
                                            })}
                                        </div>
                                        {fieldState.error?.message && (
                                            <p className="mt-2 text-xs text-red-500">
                                                {fieldState.error.message}
                                            </p>
                                        )}
                                    </div>
                                );
                            }

                            // boolean y text — sin cambios
                            return (
                                <Controller
                                    name={`variants.${variantIndex}.attributes.${attrIndex}.value`}
                                    control={control}
                                    render={({ field: valueField }) => {
                                        if (attr.type === 'boolean') {
                                            return (
                                                <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-3">
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

                                        return (
                                            <div className="rounded-lg border border-slate-200 p-3">
                                                <Label className="text-xs">
                                                    {attr.name}
                                                </Label>
                                                <Input
                                                    {...valueField}
                                                    value={
                                                        valueField.value ?? ''
                                                    }
                                                    className="mt-2"
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
