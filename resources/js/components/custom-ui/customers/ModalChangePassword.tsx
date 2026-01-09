'use client';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import customers from '@/routes/customers';
import { Customer } from '@/types/customers';
import { Form } from '@inertiajs/react';
import { LoaderCircle, Lock } from 'lucide-react';
import { useState } from 'react';

interface Props {
    customer: Customer;
}

export function ModalChangePassword({ customer }: Props) {
    const [open, setOpen] = useState(false);

    const action = customers.password.update(customer.id).url;
    const method = customers.password.update(customer.id).method;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    title="Cambio de contraseña"
                >
                    <Lock className="size-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Cambiar contraseña</DialogTitle>
                    <DialogDescription>
                        Actualiza la contraseña del cliente{' '}
                        <strong>{customer.full_name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    method={method}
                    action={action}
                    onSuccess={() => setOpen(false)}
                    resetOnSuccess
                >
                    {({ processing, errors, isDirty }) => (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="password">
                                    Nueva contraseña
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    autoFocus
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar contraseña
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    placeholder="••••••••"
                                />
                            </div>

                            <DialogFooter className="mt-6">
                                <Button
                                    type="submit"
                                    disabled={processing || !isDirty}
                                    className="h-11 w-full"
                                >
                                    {processing && (
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Guardar contraseña
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
