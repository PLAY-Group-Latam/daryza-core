'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    NativeSelect,
    NativeSelectOption,
} from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
import { Attribute } from '@/types/products/attributes';
import { Link } from '@inertiajs/react';
import { ClipboardList, Settings } from 'lucide-react';
import {
    Controller,
    useFieldArray,
    useFormContext,
    useWatch,
} from 'react-hook-form';
import { ProductFormValues } from './FormProduct';

interface SpecificationsAttributesProps {
    availableAttributes: Attribute[];
}

type SpecificationValue = string | number | boolean;

// ...imports iguales

export function SpecificationsAttributes({
    availableAttributes,
}: SpecificationsAttributesProps) {
    const { control, setValue } = useFormContext<ProductFormValues>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'specifications',
        keyName: 'id',
    });

    const specifications = useWatch({
        control,
        name: 'specifications',
    });

    // Genera el valor inicial según el tipo del atributo
    const createSpec = (attr: Attribute) => {
        let value: SpecificationValue;

        switch (attr.type) {
            case 'boolean':
                value = false;
                break;
            case 'number':
                value = 0;
                break;
            case 'select':
                // Si tiene valores, toma el primero como default
                value = attr.values?.[0]?.value ?? '';
                break;
            default:
                value = '';
                break;
        }

        return {
            attribute_id: attr.id,
            value,
        };
    };

    return (
        <div className="space-y-4">
            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                ● Especificaciones
            </p>

            {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                        <ClipboardList className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                        No hay atributos de especificación
                    </p>
                    {availableAttributes.length === 0 && (
                        <Link
                            href="/productos/attributes"
                            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-600 underline underline-offset-4 hover:text-indigo-500"
                        >
                            <Settings className="h-3.5 w-3.5" />
                            Ir a crear atributos
                        </Link>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">
                                    Atributo
                                </th>
                                <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">
                                    Valor
                                </th>
                                <th className="border px-4 py-2 text-right text-sm font-medium text-gray-600">
                                    Acción
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {fields.map((fieldSpec, index) => {
                                const attr = availableAttributes.find(
                                    (a) => a.id === fieldSpec.attribute_id,
                                );
                                if (!attr) return null;

                                return (
                                    <tr
                                        key={fieldSpec.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="border px-4 py-2 text-sm text-gray-700">
                                            {attr.name}
                                        </td>

                                        <td className="border px-4 py-2">
                                            <Controller
                                                name={`specifications.${index}.value`}
                                                control={control}
                                                render={({ field }) => {
                                                    if (
                                                        attr.type === 'boolean'
                                                    ) {
                                                        return (
                                                            <Switch
                                                                checked={Boolean(
                                                                    field.value,
                                                                )}
                                                                onCheckedChange={
                                                                    field.onChange
                                                                }
                                                            />
                                                        );
                                                    }

                                                    if (
                                                        attr.type === 'select'
                                                    ) {
                                                        return (
                                                            <NativeSelect
                                                                {...field}
                                                                value={
                                                                    field.value as string
                                                                } // TypeScript ya no se queja
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full rounded-xl border px-3 py-2 text-sm focus-visible:ring-0"
                                                            >
                                                                {attr.values?.map(
                                                                    (v) => (
                                                                        <NativeSelectOption
                                                                            key={
                                                                                v.id
                                                                            }
                                                                            value={
                                                                                v.value
                                                                            }
                                                                        >
                                                                            {
                                                                                v.value
                                                                            }
                                                                        </NativeSelectOption>
                                                                    ),
                                                                )}
                                                            </NativeSelect>
                                                        );
                                                    }

                                                    return (
                                                        <Input
                                                            type={
                                                                attr.type ===
                                                                'number'
                                                                    ? 'number'
                                                                    : 'text'
                                                            }
                                                            value={
                                                                field.value as
                                                                    | string
                                                                    | number
                                                            }
                                                            onChange={(e) => {
                                                                const v =
                                                                    e.target
                                                                        .value;
                                                                field.onChange(
                                                                    attr.type ===
                                                                        'number'
                                                                        ? Number(
                                                                              v,
                                                                          )
                                                                        : v,
                                                                );
                                                            }}
                                                            placeholder={`Ingresa ${attr.name}`}
                                                            className="w-full"
                                                        />
                                                    );
                                                }}
                                            />
                                        </td>

                                        <td className="border px-4 py-2 text-right">
                                            <Button
                                                type="button"
                                                variant="link"
                                                size="sm"
                                                className="text-xs text-red-500"
                                                onClick={() => remove(index)}
                                            >
                                                Eliminar
                                            </Button>

                                            <Controller
                                                name={`specifications.${index}.attribute_id`}
                                                control={control}
                                                render={({ field }) => (
                                                    <input
                                                        type="hidden"
                                                        {...field}
                                                    />
                                                )}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {availableAttributes.length > 0 && (
                <div className="flex items-center justify-center">
                    <Controller
                        name="specification_selector"
                        control={control}
                        render={({ field }) => (
                            <NativeSelect
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value);

                                    const attr = availableAttributes.find(
                                        (a) => a.id === value,
                                    );

                                    if (attr) {
                                        append(createSpec(attr));
                                        setValue('specification_selector', '');
                                    }
                                }}
                                className="mt-2 rounded-xl border px-3 py-2 text-sm focus-visible:ring-0"
                            >
                                <NativeSelectOption value="">
                                    + Agregar especificación
                                </NativeSelectOption>

                                {availableAttributes.map((attr) => (
                                    <NativeSelectOption
                                        key={attr.id}
                                        value={attr.id}
                                        disabled={specifications?.some(
                                            (s) => s.attribute_id === attr.id,
                                        )}
                                    >
                                        {attr.name}
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>
                        )}
                    />
                </div>
            )}
        </div>
    );
}
