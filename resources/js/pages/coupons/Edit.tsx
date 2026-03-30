import { CouponForm } from '@/components/custom-ui/coupons/CouponForm';
import AppLayout from '@/layouts/app-layout';
import { CouponModel } from '@/types/coupons/coupon';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cupones', href: '/coupon' },
    { title: 'Editar Cupón', href: '/coupon/editar' },
];

export default function Edit() {
    const { coupon } = usePage<{ coupon: CouponModel }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Cupón" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <CouponForm coupon={coupon} />
            </div>
        </AppLayout>
    );
}