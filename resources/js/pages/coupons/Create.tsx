import { CouponForm } from '@/components/custom-ui/coupons/CouponForm';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BackButton } from '@/components/custom-ui/PageHeader';


export default function Create() {
    return (
        <AppLayout>
            <Head title="Crear Cupón" />
             <div className="mb-6 flex items-end gap-4">
                <BackButton></BackButton>
            </div>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                <CouponForm />
            </div>
        </AppLayout>
    );
}
