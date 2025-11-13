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
import users from '@/routes/users';
import { User } from '@/types/user';
import { Form } from '@inertiajs/react';
import { ChevronDown, LoaderCircle, Lock } from 'lucide-react';
import { useState } from 'react';

interface UserModalProps {
    user?: User | null;
    trigger: React.ReactNode;
}

export function CreateOrUpdateUserModal({ user, trigger }: UserModalProps) {
    const isEdit = Boolean(user);
    const [open, setOpen] = useState(false); // 👈 estado de apertura del modal

    const action = isEdit ? users.update(user!.id).url : users.store().url;
    const method = isEdit
        ? users.update(user!.id).method
        : users.store().method;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader className="mb-2 gap-1.5">
                    <DialogTitle>
                        {isEdit ? 'Editar Usuario' : 'Crear Usuario'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Actualiza la información del usuario existente.'
                            : 'Formulario para registrar un nuevo usuario.'}
                    </DialogDescription>
                </DialogHeader>

                <Form
                    method={method}
                    action={action}
                    onSuccess={() => {
                        setOpen(false);
                    }}
                    resetOnSuccess={!isEdit}
                >
                    {({ processing, errors, isDirty }) => (
                        <div className="space-y-4">
                            {/* Nombre */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    defaultValue={user?.name ?? ''}
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="example@email.com"
                                    defaultValue={user?.email ?? ''}
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password solo para creación */}
                            {!isEdit && (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="password">
                                            Contraseña
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            placeholder="••••••••"
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
                                </>
                            )}
                            {isEdit && (
                                <details className="group relative">
                                    <summary className="flex w-max cursor-default items-center justify-center gap-2 rounded-md border border-input bg-transparent px-3.5 py-2 text-sm text-black transition-colors hover:bg-transparent dark:text-white">
                                        <Lock className="size-4" />
                                        Cambiar Contraseña
                                        <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" />
                                    </summary>

                                    <div className="mt-3 flex flex-col gap-2">
                                        <Label htmlFor="password">
                                            Nueva contraseña
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            placeholder="••••••••"
                                        />
                                        <InputError message={errors.password} />

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
                                </details>
                            )}

                            {/* Acciones */}
                            <DialogFooter className="mt-6">
                                <Button
                                    type="submit"
                                    disabled={processing || !isDirty} // 👈 deshabilitado si no hay cambios
                                    className="h-11 w-full"
                                >
                                    {processing && (
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {isEdit
                                        ? 'Guardar Cambios'
                                        : 'Crear Cuenta'}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
