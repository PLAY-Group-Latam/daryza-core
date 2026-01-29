'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    NativeSelect,
    NativeSelectOption,
} from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
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
}

type SpecificationValue = string | number | boolean;

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
            default:
                value = '';
                break;
        }

        return {
            attribute_id: attr.id, // string (ULID)
            value,
        };
    };

    return (
        <div className="space-y-4">
            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                ● Especificaciones
            </p>

            {/* TABLA O EMPTY STATE */}
            {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                        <ClipboardList className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                        No hay atributos de especificación
                    </p>
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
                                        {/* Nombre */}
                                        <td className="border px-4 py-2 text-sm text-gray-700">
                                            {attr.name}
                                        </td>

                                        {/* Valor */}
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

                                        {/* Acciones */}
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

                                            {/* attribute_id oculto */}
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

            {/* SELECT SIEMPRE VISIBLE */}
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
                                    (a) => a.id === value, // string vs string
                                );

                                if (attr) {
                                    // Agrega la especificación
                                    append(createSpec(attr));

                                    // Limpia el selector
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
        </div>
    );
}
