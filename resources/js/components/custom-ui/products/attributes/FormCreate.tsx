/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import attributes from '@/routes/products/attributes';
import { Attribute, AttributeTypeOption } from '@/types/products/attributes';
import { useForm } from '@inertiajs/react';
import { Info, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FormData {
    name: string;
    type: string;
    is_filterable: boolean;
    is_variant: boolean;
    values: string[];
}

interface Props {
    types: AttributeTypeOption[]; // Se mantiene por compatibilidad de interfaz, aunque ya no se usa el select
    attribute?: Attribute;
}

export default function FormCreate({ attribute }: Props) {
    const isEdit = Boolean(attribute?.id);
    const { data, setData, post, put, processing, errors } = useForm<FormData>({
        name: attribute?.name || '',
        type: attribute?.type || 'text',
        is_filterable: attribute?.is_filterable ?? false, // Por defecto false según pedido
        is_variant: attribute?.is_variant ?? false,
        values: attribute?.values?.map((v) => v.value) || [''],
    });

    const [useColor, setUseColor] = useState(false);

    useEffect(() => {
        if (isEdit && data.values.length > 0) {
            const isHex = /^#[0-9A-F]{6}$/i.test(data.values[0]);
            if (isHex) setUseColor(true);
        }
    }, [isEdit]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        isEdit && attribute
            ? put(attributes.update(attribute.id).url)
            : post(attributes.store().url);
    };

    const handlePurposeChange = (value: string) => {
        const isVariant = value === 'variant';
        setData((prev) => ({
            ...prev,
            is_variant: isVariant,
            // LÓGICA AUTOMÁTICA: Variante -> select | Especificación -> text
            type: isVariant ? 'select' : 'text',
        }));
    };

    const updateValue = (index: number, value: string) => {
        const newValues = [...data.values];
        newValues[index] = value;
        setData('values', newValues);
    };

    return (
        <form onSubmit={submit} className="max-w-3xl space-y-8">
            {/* --- BLOQUE PRINCIPAL: DEFINICIÓN --- */}
            <section className="grid grid-cols-1 gap-10 md:grid-cols-2">
                <div className="flex flex-col justify-between gap-3">
                    <Label htmlFor="name">Nombre del atributo</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ej: Color, Material, Talla..."
                    />
                    {errors.name && (
                        <p className="text-xs font-medium text-red-500">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <Label>Tipo de Atributo</Label>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-4 w-4 cursor-help text-slate-400" />
                            </TooltipTrigger>
                            <TooltipContent
                                side="right"
                                className="max-w-[240px] p-3"
                            >
                                <p className="text-xs leading-relaxed">
                                    <strong>Especificación:</strong> Texto libre
                                    para detalles técnicos.
                                    <br />
                                    <br />
                                    <strong>Variantes:</strong> Lista de
                                    opciones que el cliente debe seleccionar.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <RadioGroup
                        value={data.is_variant ? 'variant' : 'spec'}
                        onValueChange={handlePurposeChange}
                        className="flex h-9 w-max items-center gap-6 rounded-md border px-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="spec" id="spec" />
                            <Label htmlFor="spec" className="cursor-pointer">
                                Especificación
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="variant" id="variant" />
                            <Label htmlFor="variant" className="cursor-pointer">
                                Variante
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            </section>

            {/* --- BLOQUE DINÁMICO: VALORES (Solo para Variantes) --- */}
            {data.is_variant && (
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-slate-800">
                                Opciones de variante
                            </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="color-mode"
                                checked={useColor}
                                onCheckedChange={(checked) =>
                                    setUseColor(Boolean(checked))
                                }
                            />
                            <Label
                                htmlFor="color-mode"
                                className="cursor-pointer text-xs font-bold tracking-tight uppercase"
                            >
                                Usar Colores
                            </Label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {data.values.map((val, index) => (
                            <div
                                key={index}
                                className="group flex items-center gap-2"
                            >
                                <div className="relative h-full flex-1">
                                    <Input
                                        value={val}
                                        onChange={(e) =>
                                            updateValue(index, e.target.value)
                                        }
                                        placeholder={
                                            useColor
                                                ? '#HEX '
                                                : 'Ej: XL, Madera...'
                                        }
                                        className="pr-10 focus-visible:ring-blue-500"
                                    />
                                    {useColor && (
                                        <div className="absolute top-1/2 right-1.5 h-6 -translate-y-1/2">
                                            <input
                                                type="color"
                                                className="h-full w-6 cursor-pointer rounded-sm border"
                                                value={
                                                    val.startsWith('#')
                                                        ? val
                                                        : '#000000'
                                                }
                                                onChange={(e) =>
                                                    updateValue(
                                                        index,
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                                {data.values.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-9 border text-slate-300 hover:bg-red-50 hover:text-red-500"
                                        onClick={() =>
                                            setData(
                                                'values',
                                                data.values.filter(
                                                    (_, i) => i !== index,
                                                ),
                                            )
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setData('values', [...data.values, ''])}
                        className="h-10 border-dashed border-slate-300 text-muted-foreground hover:border-blue-200 hover:bg-transparent hover:text-blue-600"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Añadir otra opción
                    </Button>
                </section>
            )}

            {!isEdit && (
                <section className="rounded-xl border border-dashed border-gray-700 p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Este atributo se guardará como{' '}
                        <strong>Texto Libre</strong>.<br />
                        Podrás escribir cualquier especificación técnica al
                        crear el producto.
                    </p>
                </section>
            )}
            <footer className="flex justify-start">
                <Button
                    type="submit"
                    size="lg"
                    disabled={processing}
                    className="min-w-[250px] bg-slate-900 text-white shadow-xl transition-all hover:bg-black active:scale-95"
                >
                    {isEdit ? 'Actualizar Atributo' : 'Guardar Atributo'}
                </Button>
            </footer>
        </form>
    );
}
