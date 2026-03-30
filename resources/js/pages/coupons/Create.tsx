import { CouponForm } from '@/components/custom-ui/coupons/CouponForm';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cupones', href: '/coupon' },
    { title: 'Crear Cupón', href: '/coupon/crear' },
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Cupón" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <CouponForm />
            </div>
        </AppLayout>
    );
}