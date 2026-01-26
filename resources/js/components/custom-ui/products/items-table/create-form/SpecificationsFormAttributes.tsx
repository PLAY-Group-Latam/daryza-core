'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    NativeSelect,
    NativeSelectOption,
} from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
import { Attribute } from '@/types/products';
import { ClipboardList, Plus } from 'lucide-react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { ProductFormValues } from '../FormProduct';

interface SpecificationsAttributesProps {
    availableAttributes: Attribute[];
}

export function SpecificationsAttributes({
    availableAttributes,
}: SpecificationsAttributesProps) {
    const { control, watch } = useFormContext<ProductFormValues>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'specifications',
        keyName: 'id',
    });

    const specifications = watch('specifications');

    const createSpec = (attr: Attribute) => ({
        attribute_id: attr.id,
        name: attr.name,
        value: attr.type === 'boolean' ? false : '',
    });

    const addSpecification = (attr: Attribute) => {
        if (!specifications?.some((f) => f.attribute_id === attr.id)) {
            append(createSpec(attr));
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
                ● Especificación
            </p>

            <div>
                {fields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                            <ClipboardList className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                            No hay atributos de especificación
                        </p>
                        {availableAttributes.length > 0 && (
                            <Button
                                variant="default"
                                className="mt-2 flex items-center gap-2 rounded-xl bg-green-600 hover:bg-green-600/90"
                                onClick={() =>
                                    addSpecification(availableAttributes[0])
                                }
                            >
                                <Plus /> Agregar primera especificación
                            </Button>
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
                                            {/* Nombre del atributo */}
                                            <td className="border px-4 py-2 text-sm text-gray-700">
                                                {attr.name}
                                            </td>

                                            {/* Input o Switch según tipo */}
                                            <td className="border px-4 py-2">
                                                <Controller
                                                    name={`specifications.${index}.value`}
                                                    control={control}
                                                    defaultValue={
                                                        attr.type === 'boolean'
                                                            ? false
                                                            : ''
                                                    }
                                                    render={({ field }) =>
                                                        attr.type ===
                                                        'boolean' ? (
                                                            <Switch
                                                                checked={
                                                                    field.value as boolean
                                                                }
                                                                onCheckedChange={
                                                                    field.onChange
                                                                }
                                                            />
                                                        ) : (
                                                            <Input
                                                                {...field}
                                                                placeholder={`Ingresa ${attr.name}`}
                                                                className="w-full"
                                                            />
                                                        )
                                                    }
                                                />
                                            </td>

                                            {/* Botón eliminar */}
                                            <td className="border px-4 py-2 text-right">
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="text-xs text-red-500"
                                                    onClick={() =>
                                                        remove(index)
                                                    }
                                                >
                                                    Eliminar
                                                </Button>

                                                {/* Hidden para attribute_id */}
                                                <Controller
                                                    name={`specifications.${index}.attribute_id`}
                                                    control={control}
                                                    defaultValue={attr.id}
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

                        {/* Selector para agregar más especificaciones */}
                        <div className="flex items-center justify-center">
                            {availableAttributes.length > 0 && (
                                <NativeSelect
                                    value=""
                                    onChange={(e) => {
                                        const attr = availableAttributes.find(
                                            (a) =>
                                                a.id === Number(e.target.value),
                                        );
                                        if (attr) addSpecification(attr);
                                    }}
                                    className="mt-2 rounded-xl border px-3 py-2 text-sm focus-visible:ring-0"
                                >
                                    <NativeSelectOption value="">
                                        + Agregar especificación
                                    </NativeSelectOption>
                                    {availableAttributes.map((attr) => (
                                        <NativeSelectOption
                                            key={attr.id}
                                            value={String(attr.id)}
                                            disabled={specifications?.some(
                                                (f) =>
                                                    f.attribute_id === attr.id,
                                            )}
                                        >
                                            {attr.name}
                                        </NativeSelectOption>
                                    ))}
                                </NativeSelect>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
