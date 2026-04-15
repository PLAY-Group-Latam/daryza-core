import { CouponForm } from '@/components/custom-ui/coupons/CouponForm';
import AppLayout from '@/layouts/app-layout';
import { CouponModel } from '@/types/coupons/coupon';
import { BackButton } from '@/components/custom-ui/PageHeader';
import { Head, usePage } from '@inertiajs/react';



export default function Edit() {
    const { coupon } = usePage<{ coupon: CouponModel }>().props;

    return (
        <AppLayout >
            <Head title="Editar Cupón" />
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <CouponForm coupon={coupon} />
            </div>
        </AppLayout>
    );
}