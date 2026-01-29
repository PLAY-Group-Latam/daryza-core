'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    NativeSelect,
    NativeSelectOption,
} from '@/components/ui/native-select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import attributes from '@/routes/products/attributes';
import { Attribute, AttributeTypeOption } from '@/types/products/attributes';
import { useForm } from '@inertiajs/react';
import { Info, Trash } from 'lucide-react';
import { useState } from 'react';

interface FormData {
    name: string;
    type: string;
    is_filterable: boolean;
    is_variant: boolean; // 👈 nuevo

    values: string[];
}

interface Props {
    types: AttributeTypeOption[];
    attribute?: Attribute;
}

export default function FormCreate({ types, attribute }: Props) {
    const isEdit = Boolean(attribute?.id);

    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        name: attribute?.name || '',
        type: attribute?.type || '',
        is_filterable: attribute?.is_filterable ?? true,
        is_variant: attribute?.is_variant ?? false,
        values: attribute?.values?.map((v) => v.value) || [''], // 👈 aquí mapeamos los valores
    });
    const [useColor, setUseColor] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && attribute) {
            // Actualización
            const action = attributes.update(attribute.id).url;
            put(action); // PUT para editar
        } else {
            // Creación
            const action = attributes.store().url;
            post(action); // POST para crear
        }
        console.log(data);
    };

    // helpers para values
    const updateValue = (index: number, value: string) => {
        const newValues = [...data.values];
        newValues[index] = value;
        setData('values', newValues);
    };

    const addValue = () => setData('values', [...data.values, '']);

    const removeValue = (index: number) => {
        setData(
            'values',
            data.values.filter((_, i) => i !== index),
        );
    };

    return (
        <form onSubmit={submit} className="space-y-8">
            {/* Sección básica */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Nombre */}
                <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium">Nombre</label>
                    <Input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ej: Color, Aroma, Talla, Peso"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Tipo */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <label className="block text-sm font-medium">
                            Tipo de Atributo
                        </label>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <Info size={16} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="top"
                                className="max-w-xs text-sm"
                            >
                                <strong>Ejemplos de tipos:</strong>
                                <ul className="mt-1 ml-4 list-disc">
                                    <li>
                                        <strong>Lista de opciones:</strong>{' '}
                                        Colores, Tallas
                                    </li>
                                    <li>
                                        <strong>Número:</strong> Peso, Largo
                                    </li>
                                    <li>
                                        <strong>Sí / No:</strong> Es vegano
                                    </li>
                                    <li>
                                        <strong>Texto libre:</strong> Notas
                                    </li>
                                </ul>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <NativeSelect
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className="focus-visible:ring-0"
                    >
                        <NativeSelectOption value="" disabled hidden>
                            Selecciona
                        </NativeSelectOption>

                        {types.map((t) => (
                            <NativeSelectOption key={t.value} value={t.value}>
                                {t.label}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>

                    {errors.type && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.type}
                        </p>
                    )}
                </div>
            </div>

            {/* Filtrable */}
            {/* Flags del atributo */}
            <div className="flex flex-col gap-4">
                {/* Filtrable */}
                <div className="flex items-center gap-3">
                    <Checkbox
                        checked={data.is_filterable}
                        onCheckedChange={(checked) =>
                            setData('is_filterable', Boolean(checked))
                        }
                    />
                    <span className="text-sm">
                        ¿Usar como filtro en el catálogo?
                    </span>
                </div>

                {/* Variante */}
                <div className="flex items-center gap-3">
                    <Checkbox
                        checked={data.is_variant}
                        onCheckedChange={(checked) =>
                            setData('is_variant', Boolean(checked))
                        }
                    />
                    <span className="text-sm">
                        ¿Este atributo define variantes del producto?
                    </span>
                </div>
            </div>

            {/* Valores solo si es select */}
            {data.type === 'select' && (
                <div className="max-w-md space-y-4">
                    {/* Activar paleta de color */}
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium">
                            Valores
                        </label>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={useColor}
                                onCheckedChange={(checked) =>
                                    setUseColor(Boolean(checked))
                                }
                            />
                            <label className="text-sm font-medium">
                                Usar paleta de color
                            </label>
                        </div>
                    </div>

                    {data.values.map((val, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                value={val}
                                onChange={(e) =>
                                    updateValue(index, e.target.value)
                                }
                                placeholder={
                                    useColor
                                        ? '#000000'
                                        : 'Ej: Rojo, Azul, Verde'
                                }
                                className="flex-1"
                            />

                            {useColor && (
                                <input
                                    type="color"
                                    value={val || '#000000'}
                                    onChange={(e) =>
                                        updateValue(index, e.target.value)
                                    }
                                />
                            )}

                            {data.values.length > 1 && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => removeValue(index)}
                                    title="Eliminar"
                                >
                                    <Trash />
                                </Button>
                            )}
                        </div>
                    ))}

                    <Button type="button" variant="outline" onClick={addValue}>
                        + Agregar valor
                    </Button>

                    {errors.values && (
                        <p className="mt-1 text-sm text-red-600">
                            Todos los valores son obligatorios.
                        </p>
                    )}
                </div>
            )}

            {/* Botón principal */}
            <div className="flex w-fit items-center justify-start">
                <Button type="submit" disabled={processing}>
                    Guardar atributo
                </Button>
            </div>
        </form>
    );
}
