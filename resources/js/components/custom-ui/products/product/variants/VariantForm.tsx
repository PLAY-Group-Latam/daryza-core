'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Toggle } from '@/components/ui/toggle';
import { Attribute } from '@/types/products/attributes';
import { Link } from '@inertiajs/react';
import { Boxes, PackagePlus, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { ProductFormValues } from '../schema';
import { VariantRow } from './VariantRow';
import { useVariantForm } from './hooks/useVariantForm';

interface Props {
    variantAttributes: Attribute[];
    specificationAttributes: Attribute[];
}

export function VariantForm({
    variantAttributes,
    specificationAttributes,
}: Props) {
    const {
        control,
        getValues,
        setValue,
        trigger,
        formState: { errors },
    } = useFormContext<ProductFormValues>();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingVariantIndex, setEditingVariantIndex] = useState<
        number | null
    >(null);
    const [sheetValidationMessage, setSheetValidationMessage] = useState<
        string | null
    >(null);
    const [variantCreationMessage, setVariantCreationMessage] = useState<
        string | null
    >(null);

    const variantsErrorMessage =
        (errors.variants as { root?: { message?: string } } | undefined)?.root
            ?.message ??
        (!Array.isArray(errors.variants)
            ? (errors.variants as { message?: string } | undefined)?.message
            : undefined);
    const variantAttributeErrorMessage = !Array.isArray(
        errors.variant_attribute_ids,
    )
        ? (
              errors.variant_attribute_ids as
                  | { message?: string }
                  | undefined
          )?.message
        : undefined;
    const {
        fields,
        remove,
        replace,
        appendFirst,
        appendNext,
        activeAttributes,
        selectedIds,
    } = useVariantForm(variantAttributes);
    const [isSingleProduct, setIsSingleProduct] = useState(
        (selectedIds?.length ?? 0) === 0,
    );
    const watchedVariants = useWatch({
        control,
        name: 'variants',
        defaultValue: [],
    });
    // Regla de negocio: si existen atributos de variante seleccionados,
    // no puede considerarse "producto único".
    useEffect(() => {
        if ((selectedIds?.length ?? 0) > 0 && isSingleProduct) {
            setIsSingleProduct(false);
        }
    }, [selectedIds, isSingleProduct]);

    const hasNestedError = (value: unknown): boolean => {
        if (!value || typeof value !== 'object') return false;

        const node = value as Record<string, unknown>;
        if (
            'message' in node &&
            typeof node.message === 'string' &&
            node.message.length > 0
        ) {
            return true;
        }

        return Object.values(node).some((child) => hasNestedError(child));
    };

    const collectErrorMessages = (value: unknown, bucket: string[]) => {
        if (!value || typeof value !== 'object') return;

        const node = value as Record<string, unknown>;
        if (
            'message' in node &&
            typeof node.message === 'string' &&
            node.message.length > 0
        ) {
            bucket.push(node.message);
        }

        Object.values(node).forEach((child) =>
            collectErrorMessages(child, bucket),
        );
    };

    const currentSheetErrorMessages: string[] = [];
    if (editingVariantIndex !== null) {
        if (variantsErrorMessage)
            currentSheetErrorMessages.push(variantsErrorMessage);
        if (variantAttributeErrorMessage)
            currentSheetErrorMessages.push(variantAttributeErrorMessage);

        const variantErrorNode = Array.isArray(errors.variants)
            ? errors.variants[editingVariantIndex]
            : undefined;
        collectErrorMessages(variantErrorNode, currentSheetErrorMessages);
    }
    const uniqueSheetErrorMessages = Array.from(
        new Set(currentSheetErrorMessages),
    );
    const hasGlobalVariantIssue = Boolean(
        variantsErrorMessage || variantAttributeErrorMessage,
    );

    const openSheetForCreate = (isFirst: boolean) => {
        if (isSingleProduct && fields.length > 0 && !isFirst) {
            setVariantCreationMessage(
                'Producto único activado: solo se permite una variante.',
            );
            return;
        }

        if (!isFirst && selectedIds.length === 0) {
            setVariantCreationMessage(
                variantAttributes.length === 0
                    ? 'Primero crea atributos de variante para pasar a producto configurable.'
                    : 'Selecciona al menos un atributo de variante para agregar otra variante.',
            );
            return;
        }

        setVariantCreationMessage(null);

        if (isFirst) {
            appendFirst();
        } else {
            appendNext();
        }

        setTimeout(() => {
            const variants = getValues('variants') ?? [];
            const newIndex = Math.max(variants.length - 1, 0);
            setEditingVariantIndex(newIndex);
            setIsSheetOpen(true);
        }, 0);
    };

    const openSheetForEdit = (index: number) => {
        setEditingVariantIndex(index);
        setSheetValidationMessage(null);
        setIsSheetOpen(true);
    };

    const handleRemoveVariant = (index: number) => {
        remove(index);
        if (editingVariantIndex === null) return;

        if (index === editingVariantIndex) {
            setIsSheetOpen(false);
            setEditingVariantIndex(null);
            return;
        }

        if (index < editingVariantIndex) {
            setEditingVariantIndex(editingVariantIndex - 1);
        }
    };

    const handleConfirmVariant = async () => {
        if (editingVariantIndex === null) return;

        setSheetValidationMessage(null);

        const variantPaths = [
            `variants.${editingVariantIndex}.sku`,
            `variants.${editingVariantIndex}.sku_supplier`,
            `variants.${editingVariantIndex}.price`,
            `variants.${editingVariantIndex}.stock`,
            `variants.${editingVariantIndex}.promo_price`,
            `variants.${editingVariantIndex}.promo_start_at`,
            `variants.${editingVariantIndex}.promo_end_at`,
            `variants.${editingVariantIndex}.is_main`,
            `variants.${editingVariantIndex}.attributes`,
            `variants.${editingVariantIndex}.specifications`,
            'variant_attribute_ids',
        ] as Parameters<typeof trigger>[0];

        const isCurrentVariantValid = await trigger(
            variantPaths,
            { shouldFocus: true },
        );
        const isVariantsRulesValid = await trigger('variants', {
            shouldFocus: true,
        });

        if (!isCurrentVariantValid || !isVariantsRulesValid) {
            setSheetValidationMessage(
                'Hay información por revisar. Te marqué en rojo el bloque y campo pendiente.',
            );
            setTimeout(() => {
                const scrollRoot = document.querySelector(
                    '[data-variant-sheet-scroll="true"]',
                );
                const firstInvalid = scrollRoot?.querySelector(
                    '[aria-invalid="true"]',
                );

                if (firstInvalid instanceof HTMLElement) {
                    firstInvalid.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                    firstInvalid.focus();
                }
            }, 0);
            return;
        }

        setIsSheetOpen(false);
        setEditingVariantIndex(null);
    };

    return (
        <section className="space-y-4">
            <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                ● Variantes
            </p>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div>
                    <p className="text-sm font-medium text-slate-700">
                        Producto único
                    </p>
                    <p className="text-xs text-slate-500">
                        Activa este modo para mantener solo una variante.
                    </p>
                </div>
                <Switch
                    checked={isSingleProduct}
                    onCheckedChange={(checked) => {
                        setIsSingleProduct(checked);
                        setVariantCreationMessage(null);
                        if (checked) {
                            const currentVariants = getValues('variants') ?? [];
                            if (currentVariants.length > 1) {
                                replace([
                                    {
                                        ...currentVariants[0],
                                        is_main: true,
                                    },
                                ]);
                            }
                            setValue('variant_attribute_ids', [], {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                        }
                    }}
                />
            </div>
            {variantsErrorMessage && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {variantsErrorMessage}
                </p>
            )}
            {variantCreationMessage && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {variantCreationMessage}
                </p>
            )}

            {/* Toggles — un solo Controller para el campo completo */}
            {variantAttributes.length > 0 && !isSingleProduct && (
                <Controller
                    name="variant_attribute_ids"
                    control={control}
                    render={({ field, fieldState }) => {
                        const current = field.value ?? [];
                        const toggle = (id: string) =>
                            field.onChange(
                                current.includes(id)
                                    ? current.filter((v) => v !== id)
                                    : [...current, id],
                            );

                        return (
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs font-medium text-slate-700">
                                    Seleccione Atributos:
                                </span>
                                {variantAttributes.map((attr) => (
                                    <Toggle
                                        key={attr.id}
                                        pressed={current.includes(attr.id)}
                                        onPressedChange={() => toggle(attr.id)}
                                        size="sm"
                                        className="border text-xs text-gray-600 data-[state=on]:bg-gray-800 data-[state=on]:text-white"
                                    >
                                        {attr.name}
                                    </Toggle>
                                ))}
                                {(fieldState.error?.message ??
                                    variantAttributeErrorMessage) && (
                                    <p className="w-full text-xs text-red-600">
                                        {fieldState.error?.message ??
                                            variantAttributeErrorMessage}
                                    </p>
                                )}
                            </div>
                        );
                    }}
                />
            )}
            {/* Estado vacío */}
            {fields.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                        <Boxes
                            className="h-6 w-6 text-emerald-500"
                            strokeWidth={1.5}
                        />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                        Aún no hay variantes creadas
                    </p>

                    <p className="mt-1 text-xs text-slate-500 italic">
                        Puedes iniciar como producto simple con una sola
                        variante.
                    </p>

                    <Button
                        type="button"
                        onClick={() => openSheetForCreate(true)}
                        className="mt-3 flex items-center gap-2 rounded-xl bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                    >
                        <PackagePlus className="h-4 w-4" /> Crear primera
                        variante
                    </Button>

                    {!variantAttributes.length && (
                        <Link
                            href="/productos/attributes"
                            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700 underline underline-offset-4"
                        >
                            <Settings className="h-3.5 w-3.5" /> Crear
                            atributos para producto configurable
                        </Link>
                    )}
                </div>
            )}

            {/* Tabla de variantes */}
            {fields.length > 0 && (
                <>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="w-14">#</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => {
                                    const row = watchedVariants?.[index];
                                    const skuError =
                                        errors.variants?.[index]?.sku?.message;
                                    const variantErrors = Array.isArray(
                                        errors.variants,
                                    )
                                        ? errors.variants[index]
                                        : undefined;
                                    const hasVariantError =
                                        hasNestedError(variantErrors);
                                    const shouldMarkRow =
                                        hasVariantError || hasGlobalVariantIssue;

                                    return (
                                        <TableRow
                                            key={field._fieldId}
                                            className={
                                                shouldMarkRow
                                                    ? 'bg-red-50/40'
                                                    : undefined
                                            }
                                        >
                                            <TableCell className="font-medium text-slate-600">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-medium text-slate-700">
                                                        {row?.sku || 'Sin SKU'}
                                                    </p>
                                                    {skuError && (
                                                        <p className="text-xs text-red-600">
                                                            {skuError}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-700">
                                                S/
                                                {Number(
                                                    row?.price ?? 0,
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-slate-700">
                                                {row?.stock ?? 0}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {shouldMarkRow && (
                                                        <Badge className="bg-red-600 text-white hover:bg-red-600">
                                                            Revisar
                                                        </Badge>
                                                    )}
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            row?.is_active
                                                                ? 'border-emerald-300 text-emerald-700'
                                                                : 'border-slate-300 text-slate-500'
                                                        }
                                                    >
                                                        {row?.is_active
                                                            ? 'Activa'
                                                            : 'Inactiva'}
                                                    </Badge>
                                                    {row?.is_main && (
                                                        <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                                                            Principal
                                                        </Badge>
                                                    )}
                                                    {row?.is_on_promo && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-orange-300 text-orange-700"
                                                        >
                                                            Promo
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            openSheetForEdit(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700"
                                                        disabled={
                                                            isSingleProduct &&
                                                            fields.length === 1
                                                        }
                                                        onClick={() =>
                                                            handleRemoveVariant(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    {!isSingleProduct && (
                        <div className="space-y-2">
                            <div className="flex justify-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => openSheetForCreate(false)}
                                    disabled={selectedIds.length === 0}
                                    className="flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-5 py-2 text-sm text-slate-600 hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <span>+</span> Agregar Variante
                                </Button>
                            </div>
                            {selectedIds.length === 0 && (
                                <p className="text-center text-xs text-slate-500">
                                    {variantAttributes.length === 0
                                        ? 'Primero crea atributos de variante para habilitar más variantes.'
                                        : 'Selecciona al menos un atributo para habilitar más variantes.'}
                                </p>
                            )}
                            {variantAttributes.length === 0 && (
                                <div className="flex justify-center">
                                    <Link
                                        href="/productos/attributes"
                                        className="text-xs font-medium text-emerald-700 underline underline-offset-4"
                                    >
                                        Ir a crear atributos
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <Sheet
                open={isSheetOpen && editingVariantIndex !== null}
                onOpenChange={(open) => {
                    setIsSheetOpen(open);
                    if (!open) {
                        setEditingVariantIndex(null);
                        setSheetValidationMessage(null);
                    }
                }}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-hidden p-0 sm:max-w-2xl"
                >
                    <SheetHeader className="border-b border-slate-200 px-5 py-4">
                        <SheetTitle>
                            {editingVariantIndex !== null
                                ? `Editar Variante ${editingVariantIndex + 1}`
                                : 'Editar Variante'}
                        </SheetTitle>
                        <SheetDescription>
                            Completa la información por bloques. Este panel
                            tiene scroll vertical para revisar toda la variante.
                        </SheetDescription>
                    </SheetHeader>
                    {sheetValidationMessage && (
                        <div className="mx-5 mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                            {sheetValidationMessage}
                        </div>
                    )}
                    {uniqueSheetErrorMessages.length > 0 && (
                        <div className="mx-5 mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                            {uniqueSheetErrorMessages.map((message, idx) => (
                                <p key={`${message}-${idx}`}>• {message}</p>
                            ))}
                        </div>
                    )}

                    <div
                        className="min-h-0 flex-1 overflow-y-auto px-5 pb-5"
                        data-variant-sheet-scroll="true"
                    >
                        {editingVariantIndex !== null &&
                            fields[editingVariantIndex] && (
                                <VariantRow
                                    index={editingVariantIndex}
                                    variantAttributes={activeAttributes}
                                    specificationAttributes={
                                        specificationAttributes
                                    }
                                />
                            )}
                    </div>
                    <SheetFooter className="border-t border-slate-200 px-5 py-4">
                        <div className="flex w-full justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsSheetOpen(false);
                                    setEditingVariantIndex(null);
                                    setSheetValidationMessage(null);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirmVariant}
                            >
                                Confirmar
                            </Button>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </section>
    );
}
