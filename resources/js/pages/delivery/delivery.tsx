import AppLayout from '@/layouts/app-layout';
import { Department } from '@/models/Ubigeos';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { ModalSetting } from './components/modal-setting';
import { DeliveryZoneInfo } from '@/components/delivery-zone-info';
import { ZoneColumns } from './components/zone-column';
import { DeliverySetting } from '@/models/DeliverySetting';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lista de Zonas de Delivery',
        href: '/delivery-zones',
    },
];

interface DeliveryProps {
    departments: Department[];
    settings: DeliverySetting;
}

export default function Delivery({ departments, settings }: DeliveryProps) {
    const [data, setData] = useState<Department[]>(departments);

    useEffect(() => {
        setData(departments);
    }, [departments]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zonas de Delivery" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                {/* Header — stack en mobile, row en desktop */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-lg font-bold lg:text-2xl">Zonas de Delivery</div>
                    <div className="flex items-center gap-2">
                        <DeliveryZoneInfo />
                        <ModalSetting settings={settings} />
                    </div>
                </div>

                <ZoneColumns departments={data} />

            </div>
        </AppLayout>
    );
}