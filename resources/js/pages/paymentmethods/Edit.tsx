import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import AppLayout from '@/layouts/app-layout';
import { PaymentMethod } from '@/types/paymentmethods';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

/* ------------------------------------------------------------------
   BREADCRUMBS, PROPS Y SCHEMA
------------------------------------------------------------------- */
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Métodos de Pago', href: '/metodos-de-pago' },
    { title: 'Editar cuenta', href: '#' },
];

interface Props {
    paymentMethod: PaymentMethod;
    currencies: string[]; // Recibimos el array de strings del Enum
}

const paymentMethodSchema = z.object({
    company_type: z.string().min(1, 'Debes seleccionar una marca'),
    bank_name: z.string().min(1, 'Ingresa el nombre del banco'),
    currency: z.string().min(1, 'Selecciona una moneda'), // Agregado
    account_number: z.string().min(5, 'El número de cuenta es demasiado corto'),
    interbank_account_number: z.string().optional().or(z.literal('')),
    is_active: z.boolean(),
});

type PaymentFormValues = z.infer<typeof paymentMethodSchema>;

export default function Edit({ paymentMethod, currencies }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentMethodSchema),
        defaultValues: {
            company_type: paymentMethod.company_type,
            bank_name: paymentMethod.name || '',
            currency: paymentMethod.currency || '', // Mapeamos el valor actual
            account_number: paymentMethod.account_number || '',
            interbank_account_number: paymentMethod.extra_info || '',
            is_active: !!paymentMethod.is_active,
        },
    });

    function onSubmit(values: PaymentFormValues) {
        router.put(`/metodos-de-pago/${paymentMethod.id}`, values, {
            onStart: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
            onError: (errors) => {
                Object.keys(errors).forEach((key) => {
                    form.setError(key as keyof PaymentFormValues, {
                        type: 'server',
                        message: errors[key],
                    });
                });
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${paymentMethod.name}`} />
            
            <div className="flex justify-center p-4">
                <div className="w-full max-w-xl space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold">Editar cuenta bancaria</h2>
                        <p className="text-sm text-muted-foreground">
                            Modifica los detalles para la marca <span className="capitalize font-semibold">{paymentMethod.company_type}</span>.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Marca */}
                                <FormField
                                    control={form.control}
                                    name="company_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Marca</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Marca" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="daryza">Daryza</SelectItem>
                                                    <SelectItem value="itp">ITP</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Moneda (Dinámico) */}
                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Moneda</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Moneda" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {currencies?.map((currency) => (
                                                        <SelectItem key={currency} value={currency}>
                                                            {currency}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Banco */}
                            <FormField
                                control={form.control}
                                name="bank_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Entidad Bancaria</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: BCP, BBVA, Interbank" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Número de cuenta */}
                            <FormField
                                control={form.control}
                                name="account_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de cuenta</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Número de cuenta" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* CCI */}
                            <FormField
                                control={form.control}
                                name="interbank_account_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CCI (opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Código de Cuenta Interbancario" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Estado Activo */}
                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Cuenta activa</FormLabel>
                                            <p className="text-xs text-muted-foreground">
                                                {field.value ? 'La cuenta está visible.' : 'La cuenta está oculta.'}
                                            </p>
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

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => window.history.back()}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Actualizar Cuenta
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}