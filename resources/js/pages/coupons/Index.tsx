import TableList from '@/components/custom-ui/coupons/TableList';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { CouponModel } from '@/types/coupons/coupon';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function Index() {
    const { coupons } = usePage<{
        coupons: Paginated<CouponModel>;
    }>().props;

    return (
        <AppLayout>
            <Head title="Lista de Cupones" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Lista de Cupones
                    </h1>
                    <Button asChild>
                        <Link href="/coupon/crear">
                            <Plus className="mr-2 h-4 w-4" />
                            Crear Cupón
                        </Link>
                    </Button>
                </div>
                <TableList data={coupons} />
            </div>
        </AppLayout>
    );
}