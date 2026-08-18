import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { BackButton } from '@/components/custom-ui/PageHeader';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { Loader2 } from 'lucide-react';

interface Props {
    currencies: string[]; // Recibido desde el Controller via Inertia
}

const paymentMethodSchema = z.object({
    company_type: z.string().min(1, 'Debe haber una marca'),
    bank_name: z.string().min(1, 'Ingresa el nombre del banco'),
    currency: z.string().min(1, 'Selecciona una moneda'), // Agregado
    account_number: z.string().min(5, 'El número de cuenta es demasiado corto'),
    interbank_account_number: z.string().optional().or(z.literal('')),
    is_active: z.boolean(),
});

type PaymentFormValues = z.infer<typeof paymentMethodSchema>;

export default function Create({ currencies }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentMethodSchema),
        defaultValues: {
            company_type: '',
            bank_name: '',
            currency: '', // Inicializado vacío
            account_number: '',
            interbank_account_number: '',
            is_active: true,
        },
    });

    function onSubmit(data: PaymentFormValues) {
        router.post('/metodos-de-pago', data, {
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
        <AppLayout>
            <Head title="Crear nueva cuenta bancaria" />
            <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>

            <div className="flex justify-center p-4">
                <div className="w-full max-w-xl space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold">
                            Crear nueva cuenta bancaria
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Completa los datos para registrar un nuevo método.
                        </p>
                    </div>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Marca / company_type */}
                                <FormField
                                    control={form.control}
                                    name="company_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Marca</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Daryza"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Moneda / currency (Dinámico del Enum) */}
                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Moneda</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Moneda" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {currencies?.map(
                                                        (currency) => (
                                                            <SelectItem
                                                                key={currency}
                                                                value={currency}
                                                            >
                                                                {currency}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Entidad Bancaria / bank_name */}
                            <FormField
                                control={form.control}
                                name="bank_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Entidad Bancaria</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: BCP, BBVA, Interbank"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Número de cuenta / account_number */}
                            <FormField
                                control={form.control}
                                name="account_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de cuenta</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Número de cuenta"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* CCI / interbank_account_number */}
                            <FormField
                                control={form.control}
                                name="interbank_account_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CCI (opcional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Código de Cuenta Interbancario"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Cuenta activa / is_active */}
                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Cuenta activa</FormLabel>
                                            <p className="text-xs text-muted-foreground">
                                                La cuenta será visible para
                                                operaciones.
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
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => window.history.back()}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="min-w-[120px]"
                                >
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Guardar Cuenta
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}
