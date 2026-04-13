'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
    Apple,
    Boxes,
    CalendarIcon,
    DollarSign,
    DollarSignIcon,
    Layers,
    Package,
    Percent,
    ShoppingCart,
    Tag,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CouponModel } from '@/types/coupons/coupon';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { AsyncMultiSelectCustomers } from './AsyncMultiSelectCustomers';
import { AsyncMultiSelectProducts } from './AsyncMultiSelectProducts';

// ─── Schema ───────────────────────────────────────────────

const couponSchema = z
    .object({
        code: z
            .string({ error: 'El código del cupón es obligatorio' })
            .min(1, 'Debe ingresar un código válido')
            .max(50, 'El código no puede tener más de 50 caracteres'),

        description: z.string().optional(),

        discount_type: z.enum(['fixed', 'percentage'], {
            error: 'Debe seleccionar un tipo de descuento',
        }),

        discount_amount: z
            .string({ error: 'El monto de descuento es obligatorio' })
            .min(1, 'El monto debe ser mayor a 0'),

        maximum_discount_amount: z
            .string({ error: 'Debe ser un valor numérico válido' })
            .optional(),

        minimum_order_amount: z
            .string({ error: 'El monto mínimo es obligatorio' })
            .min(1, 'El monto mínimo debe ser mayor a 0'),

        scope: z.enum(
            [
                'global',
                'product',
                'category',
                'pack',
                'business_line',
                'customer',
            ],
            {
                error: 'Debe seleccionar el alcance del cupón',
            },
        ),

        is_active: z.boolean(),
        is_public: z.boolean(),

        valid_from: z
            .date({
                error: 'La fecha de inicio no es válida',
            })
            .optional(),

        valid_until: z
            .date({
                error: 'La fecha de fin no es válida',
            })
            .optional(),

        usage_limit: z
            .string()
            .optional()
            .refine(
                (v) => !v || (Number(v) > 0 && Number.isInteger(Number(v))),
                {
                    message: 'Debe ser un número entero positivo',
                },
            ),

        usage_limit_per_user: z
            .string()
            .optional()
            .refine(
                (v) => !v || (Number(v) > 0 && Number.isInteger(Number(v))),
                {
                    message: 'Debe ser un número entero positivo',
                },
            ),

        product_ids: z.array(z.string()).optional(),
        category_ids: z.array(z.string()).optional(),
        pack_ids: z.array(z.string()).optional(),
        business_line_ids: z.array(z.string()).optional(),
        customer_ids: z.array(z.string()).optional(),
    })

    // Fechas
    .refine(
        (data) =>
            !data.valid_from ||
            !data.valid_until ||
            data.valid_from < data.valid_until,
        {
            message: 'La fecha de inicio debe ser anterior a la fecha de fin',
            path: ['valid_from'],
        },
    )
    .refine(
        (data) =>
            !data.valid_from ||
            !data.valid_until ||
            data.valid_from < data.valid_until,
        {
            message: 'La fecha de fin debe ser posterior a la fecha de inicio',
            path: ['valid_until'],
        },
    )

    // Porcentaje máximo 100
    .refine(
        (data) =>
            data.discount_type !== 'percentage' ||
            Number(data.discount_amount) <= 100,
        {
            message: 'El porcentaje no puede ser mayor a 100%',
            path: ['discount_amount'],
        },
    )

    // Si es porcentaje debe tener máximo
    .refine(
        (data) =>
            data.discount_type !== 'percentage' ||
            !!data.maximum_discount_amount,
        {
            message:
                'Debe establecer un descuento máximo para descuentos porcentuales',
            path: ['maximum_discount_amount'],
        },
    )

    // IDs requeridos según scope
    .refine(
        (data) =>
            data.scope !== 'product' ||
            (data.product_ids && data.product_ids.length > 0),
        {
            message: 'Debe seleccionar al menos un producto',
            path: ['product_ids'],
        },
    )
    .refine(
        (data) =>
            data.scope !== 'category' ||
            (data.category_ids && data.category_ids.length > 0),
        {
            message: 'Debe seleccionar al menos una categoría',
            path: ['category_ids'],
        },
    )
    .refine(
        (data) =>
            data.scope !== 'pack' ||
            (data.pack_ids && data.pack_ids.length > 0),
        {
            message: 'Debe seleccionar al menos un pack',
            path: ['pack_ids'],
        },
    )
    .refine(
        (data) =>
            data.scope !== 'business_line' ||
            (data.business_line_ids && data.business_line_ids.length > 0),
        {
            message: 'Debe seleccionar al menos una línea de negocio',
            path: ['business_line_ids'],
        },
    )
    .refine(
        (data) =>
            data.scope !== 'customer' ||
            (data.customer_ids && data.customer_ids.length > 0),
        {
            message: 'Debe seleccionar al menos un cliente',
            path: ['customer_ids'],
        },
    )
    .refine(
        (data) => {
            if (!data.usage_limit || !data.usage_limit_per_user) return true;
            return (
                Number(data.usage_limit_per_user) <= Number(data.usage_limit)
            );
        },
        {
            message:
                'El límite por usuario no puede ser mayor al límite global',
            path: ['usage_limit_per_user'],
        },
    );

type CouponFormValues = z.infer<typeof couponSchema>;

// ─── Props ────────────────────────────────────────────────

interface CouponFormProps {
    coupon?: CouponModel;
}

// ─── Component ────────────────────────────────────────────

export function CouponForm({ coupon }: CouponFormProps) {
    const isEditing = !!coupon;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            code: coupon?.code ?? '',
            description: coupon?.description ?? '',
            discount_type: coupon?.discount_type ?? 'fixed',
            discount_amount: String(coupon?.discount_amount ?? ''),
            maximum_discount_amount: coupon?.maximum_discount_amount
                ? String(coupon.maximum_discount_amount)
                : '',
            minimum_order_amount: String(coupon?.minimum_order_amount ?? ''),
            scope: coupon?.scope ?? undefined,
            is_active: coupon?.is_active ?? false,
            is_public: coupon?.is_public ?? false,
            usage_limit: coupon?.usage_limit ? String(coupon.usage_limit) : '',
            usage_limit_per_user: coupon?.usage_limit_per_user
                ? String(coupon.usage_limit_per_user)
                : '',
            valid_from: coupon?.valid_from
                ? new Date(coupon.valid_from)
                : undefined,
            valid_until: coupon?.valid_until
                ? new Date(coupon.valid_until)
                : undefined,
            product_ids: coupon?.products?.map((p) => p.id) ?? [],
            category_ids: coupon?.categories?.map((c) => c.id) ?? [],
            pack_ids: coupon?.packs?.map((p) => p.id) ?? [],
            business_line_ids: coupon?.business_lines?.map((b) => b.id) ?? [],
            customer_ids: coupon?.customers?.map((c) => c.id) ?? [],
        },
    });

    const discountType = form.watch('discount_type');
    const scope = form.watch('scope');
    const isActive = form.watch('is_active');

    function onSubmit(data: CouponFormValues) {
        setIsSubmitting(true);
        const payload = {
            ...data,
            valid_from: data.valid_from ? data.valid_from.toISOString() : null,
            valid_until: data.valid_until
                ? data.valid_until.toISOString()
                : null,
            product_ids: data.scope === 'product' ? data.product_ids : [],
            category_ids: data.scope === 'category' ? data.category_ids : [],
            pack_ids: data.scope === 'pack' ? data.pack_ids : [],
            business_line_ids:
                data.scope === 'business_line' ? data.business_line_ids : [],
            customer_ids: data.scope === 'customer' ? data.customer_ids : [],
            maximum_discount_amount:
                data.discount_type === 'percentage'
                    ? data.maximum_discount_amount
                    : '',
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    isEditing
                        ? 'Cupón actualizado exitosamente'
                        : 'Cupón creado exitosamente',
                );
                if (!isEditing) form.reset();
            },
            onError: (errors: Record<string, string>) => {
                toast.error(
                    <ul className="list-none p-0">
                        {Object.values(errors).map((msg, i) => (
                            <li key={i}>{msg}</li>
                        ))}
                    </ul>,
                );
            },
            onFinish: () => setIsSubmitting(false),
        };

        if (isEditing) {
            router.put(`/coupon/${coupon.id}`, payload, options);
        } else {
            router.post('/coupon', payload, options);
        }
    }

    return (
        <Card className="w-full border-none p-0! shadow-none">
            <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    {isEditing ? 'Editar Cupón' : 'Crear Cupón'}
                </CardTitle>
                <CardDescription>
                    Configure los detalles del cupón de descuento
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* Código */}
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código del Cupón *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: DESCUENTO2024"
                                            {...field}
                                            className="uppercase"
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Código único que los usuarios utilizarán
                                        para aplicar el descuento
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tipo de descuento */}
                        <FormField
                            control={form.control}
                            name="discount_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Descuento *</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            <Label
                                                htmlFor="fixed"
                                                className="flex cursor-pointer items-center space-x-4 rounded-lg border p-4 hover:bg-gray-100 dark:hover:bg-transparent"
                                            >
                                                <RadioGroupItem
                                                    value="fixed"
                                                    id="fixed"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-semibold">
                                                        S/
                                                    </span>
                                                    <span>Monto Fijo</span>
                                                </div>
                                            </Label>
                                            <Label
                                                htmlFor="percentage"
                                                className="flex cursor-pointer items-center space-x-4 rounded-lg border p-4 hover:bg-gray-100 dark:hover:bg-transparent"
                                            >
                                                <RadioGroupItem
                                                    value="percentage"
                                                    id="percentage"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <Percent className="h-5 w-5" />
                                                    <span>Porcentaje</span>
                                                </div>
                                            </Label>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Monto de descuento */}
                        <FormField
                            control={form.control}
                            name="discount_amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {discountType === 'percentage'
                                            ? 'Porcentaje de Descuento *'
                                            : 'Monto de Descuento *'}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                min="0"
                                                max={
                                                    discountType ===
                                                    'percentage'
                                                        ? '100'
                                                        : undefined
                                                }
                                                placeholder={
                                                    discountType ===
                                                    'percentage'
                                                        ? '0'
                                                        : '0.00'
                                                }
                                                {...field}
                                                className="no-arrows-input-number"
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                {discountType ===
                                                'percentage' ? (
                                                    <Percent className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <span className="text-sm font-semibold text-gray-500">
                                                        S/
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Descuento máximo — solo porcentaje */}
                        {discountType === 'percentage' && (
                            <FormField
                                control={form.control}
                                name="maximum_discount_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Descuento Máximo *
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="50.00"
                                                    {...field}
                                                    value={field.value || ''}
                                                    className="no-arrows-input-number"
                                                />
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <DollarSign className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Ej: 20% de descuento con máximo S/50
                                            — en una compra de S/500 el
                                            descuento será S/50, no S/100.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Alcance + Monto mínimo */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="scope"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col gap-2">
                                        <FormLabel>Alcance *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar alcance" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="global">
                                                    <div className="flex items-center gap-2">
                                                        <ShoppingCart className="h-4 w-4" />
                                                        Global
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="product">
                                                    <div className="flex items-center gap-2">
                                                        <Apple className="h-4 w-4" />
                                                        Producto
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="category">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4" />
                                                        Categoría
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="pack">
                                                    <div className="flex items-center gap-2">
                                                        <Boxes className="h-4 w-4" />
                                                        Pack
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="business_line">
                                                    <div className="flex items-center gap-2">
                                                        <Layers className="h-4 w-4" />
                                                        Línea de Negocio
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="customer">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        Cliente
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="minimum_order_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Monto Mínimo de Pedido
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0.00"
                                                    {...field}
                                                    className="no-arrows-input-number"
                                                />
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <DollarSignIcon className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Monto mínimo requerido para aplicar
                                            el cupón
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Selección dinámica según scope */}
                        {scope === 'category' && (
                            <FormField
                                control={form.control}
                                name="category_ids"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categorías *</FormLabel>
                                        <FormDescription>
                                            Seleccione las categorías donde se
                                            aplicará el cupón
                                        </FormDescription>
                                        <AsyncMultiSelectProducts
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Buscar categoría por nombre"
                                            requestPath="/coupon/search-categories"
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {scope === 'product' && (
                            <FormField
                                control={form.control}
                                name="product_ids"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Productos *</FormLabel>
                                        <FormDescription>
                                            Busque y seleccione los productos
                                            aplicables
                                        </FormDescription>
                                        <AsyncMultiSelectProducts
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Buscar producto por nombre"
                                            requestPath="/coupon/search-products"
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {scope === 'pack' && (
                            <FormField
                                control={form.control}
                                name="pack_ids"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Packs *</FormLabel>
                                        <FormDescription>
                                            Busque y seleccione los packs
                                            aplicables
                                        </FormDescription>
                                        <AsyncMultiSelectProducts
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Buscar pack por nombre"
                                            requestPath="/coupon/search-packs"
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {scope === 'business_line' && (
                            <FormField
                                control={form.control}
                                name="business_line_ids"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Líneas de Negocio *
                                        </FormLabel>
                                        <FormDescription>
                                            Busque y seleccione las líneas de
                                            negocio aplicables
                                        </FormDescription>
                                        <AsyncMultiSelectProducts
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Buscar línea de negocio por nombre"
                                            requestPath="/coupon/search-business-lines"
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {scope === 'customer' && (
                            <FormField
                                control={form.control}
                                name="customer_ids"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Clientes *</FormLabel>
                                        <FormDescription>
                                            Busque y seleccione los clientes
                                            aplicables
                                        </FormDescription>
                                        <AsyncMultiSelectCustomers
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Buscar cliente por nombre o email"
                                            requestPath="/coupon/search-customers"
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Fechas */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="valid_from"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Válido Desde</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full pl-3 text-left font-normal',
                                                            !field.value &&
                                                                'text-muted-foreground',
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(
                                                                field.value,
                                                                'PPP',
                                                                { locale: es },
                                                            )
                                                        ) : (
                                                            <span>
                                                                Seleccionar
                                                                fecha
                                                            </span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="valid_until"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Válido Hasta</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full pl-3 text-left font-normal',
                                                            !field.value &&
                                                                'text-muted-foreground',
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(
                                                                field.value,
                                                                'PPP',
                                                                { locale: es },
                                                            )
                                                        ) : (
                                                            <span>
                                                                Seleccionar
                                                                fecha
                                                            </span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Límites de uso */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="usage_limit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Límite de Uso Global
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="Ej: 100"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Número máximo de veces que se puede
                                            usar el cupón
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="usage_limit_per_user"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Límite por Usuario
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="Ej: 1"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Número máximo de veces que un
                                            usuario puede usar el cupón
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Descripción */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descripción del cupón..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Descripción opcional para uso interno
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Switches */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Cupón Activo
                                            </FormLabel>
                                            <FormDescription>
                                                Determina si el cupón está
                                                disponible para su uso
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_public"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Cupón Público
                                            </FormLabel>
                                            <FormDescription>
                                                Determina si será visible en la
                                                tienda
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={!isActive}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Botones */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? isEditing
                                        ? 'Actualizando...'
                                        : 'Creando...'
                                    : isEditing
                                      ? 'Actualizar Cupón'
                                      : 'Crear Cupón'}
                            </Button>
                            {!isEditing && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => form.reset()}
                                    disabled={isSubmitting}
                                >
                                    Limpiar
                                </Button>
                            )}
                            {isEditing && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="border border-gray-300"
                                    onClick={() => history.back()}
                                >
                                    Volver
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
