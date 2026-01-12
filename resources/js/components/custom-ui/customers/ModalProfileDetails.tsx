'use client';

import { BarChart3, Eye, Home, User } from 'lucide-react';

import { CopyButton } from '@/components/CopyButton';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Customer } from '@/types/customers';
import { UserAvatar } from '../UserAvatar';

interface ModalProfileDetailsProps {
    customer: Customer;
}

export const ModalProfileDetails = ({ customer }: ModalProfileDetailsProps) => {
    console.log('clientessssssssss', customer);
    const metrics = [
        {
            label: 'Total de pedidos',
            value: customer.metrics?.total_orders ?? '—',
        },
        { label: 'Total gastado', value: customer.metrics?.total_spent ?? '—' },
        {
            label: 'Ticket promedio',
            value: customer.metrics?.average_order_value ?? '—',
        },
    ];

    const address = customer.addresses?.[0] ?? null;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" title="Ver detalle">
                    <Eye className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="md:max-w-4xl">
                <div className="mb-1 flex items-center gap-4">
                    <UserAvatar
                        image={customer.photo} // avatar del usuario
                        name={customer.full_name ?? 'Usuario'}
                        size="lg"
                    />
                    <DialogHeader className="gap-1">
                        <DialogTitle>
                            Detalle del cliente {customer.full_name}
                        </DialogTitle>
                        <DialogDescription>
                            Puedes ver la información de este cliente y cambiar
                            la contraseña si no tiene inicio de sesión con
                            cuenta de Google.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <ScrollArea className="max-h-[40vh] w-full pr-6">
                    {/* MÉTRICAS */}
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        {metrics.map(({ label, value }) => (
                            <div
                                key={label}
                                className="flex items-start gap-2 rounded-xl border bg-muted/20 p-3"
                            >
                                <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                                    <BarChart3 className="size-5 text-muted-foreground" />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase dark:text-white">
                                        {label}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CONTENIDO */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* INFORMACIÓN PERSONAL */}
                        <section className="space-y-4">
                            <h3 className="flex items-center gap-2 font-bold">
                                <User className="size-4" />
                                Información Personal
                            </h3>

                            <div className="space-y-3">
                                {/* Nombre */}
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Nombre
                                    </p>
                                    <p className="flex items-center justify-between rounded-md bg-gray-100 p-2 text-sm font-medium dark:bg-muted/20">
                                        {customer.full_name}
                                        <CopyButton
                                            textToCopy={customer.full_name}
                                        />
                                    </p>
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Email
                                    </p>
                                    <p className="flex items-center justify-between rounded-md bg-gray-100 p-2 text-sm font-medium dark:bg-muted/20">
                                        {customer.email}
                                        <CopyButton
                                            textToCopy={customer.email}
                                        />
                                    </p>
                                </div>

                                {/* DNI */}
                                {customer.dni && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            DNI del cliente
                                        </p>
                                        <p className="flex items-center justify-between rounded-md bg-gray-100 p-2 text-sm font-medium dark:bg-muted/20">
                                            {customer.dni}
                                            <CopyButton
                                                textToCopy={customer.dni}
                                            />
                                        </p>
                                    </div>
                                )}

                                {/* Teléfono */}
                                {customer.phone && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            Teléfono
                                        </p>
                                        <p className="flex items-center justify-between rounded-md bg-gray-100 p-2 text-sm font-medium dark:bg-muted/20">
                                            {customer.phone}
                                            <CopyButton
                                                textToCopy={customer.phone}
                                            />
                                        </p>
                                    </div>
                                )}
                                {customer.billing_profile?.ruc && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            RUC
                                        </p>
                                        <p className="flex items-center justify-between rounded-md bg-gray-100 p-2 text-sm font-medium dark:bg-muted/20">
                                            {customer.billing_profile?.ruc}
                                            <CopyButton
                                                textToCopy={
                                                    customer.billing_profile
                                                        ?.ruc
                                                }
                                            />
                                        </p>
                                    </div>
                                )}

                                {customer.billing_profile?.social_reason && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            Razón Social
                                        </p>
                                        <p className="flex items-center justify-between rounded-md bg-gray-100 p-2 text-sm font-medium dark:bg-muted/20">
                                            {
                                                customer.billing_profile
                                                    ?.social_reason
                                            }
                                            <CopyButton
                                                textToCopy={
                                                    customer.billing_profile
                                                        ?.social_reason
                                                }
                                            />
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* DIRECCIÓN */}
                        <section className="space-y-4">
                            <h3 className="flex items-center gap-2 font-bold">
                                <Home className="size-4" />
                                Información de Dirección
                            </h3>

                            {!address ? (
                                <p className="text-sm text-gray-400 italic">
                                    No se encontró ninguna dirección registrada.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Dirección
                                        </p>
                                        <p className="flex flex-col font-medium">
                                            {address.address}
                                            <span> {address.label}</span>
                                        </p>
                                    </div>
                                    {address.postal_code && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Código Postal
                                            </p>
                                            <p className="font-medium">
                                                {address.postal_code}
                                            </p>
                                        </div>
                                    )}
                                    {address.reference && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Referencia
                                            </p>
                                            <p className="font-medium">
                                                {address.reference}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
