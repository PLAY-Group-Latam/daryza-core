import { login } from '@/routes';
import { Head } from '@inertiajs/react';

import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    return (
        <AuthLayout
            title="Registro deshabilitado"
            description="El registro de cuentas está desactivado en este panel"
        >
            <Head title="Registro deshabilitado" />
            <div className="text-center text-sm text-muted-foreground">
                Esta sección no está disponible.{' '}
                <TextLink href={login()} tabIndex={1}>
                    Ir al inicio de sesión
                </TextLink>
            </div>
        </AuthLayout>
    );
}
