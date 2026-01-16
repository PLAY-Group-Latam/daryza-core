import { TreeView } from '@/components/tree-view';
import AppLayout from '@/layouts/app-layout';
import { Department, ZoneType } from '@/models/Ubigeos';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import { Actions } from './components/actions';
import { ModalSetting } from './components/modal-setting';
import { useFlashMessage } from '@/hooks/use-flash-message';
import { useEffect, useState } from 'react';
import { DeliverySetting } from '@/models/DeliverySetting';
import { DeliveryZoneInfo } from '@/components/delivery-zone-info';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lista de Zonas de Delivery',
        href: '/delivery-zones',
    },
];

interface DeliveryProps {
    departments: Department[];
    settings: DeliverySetting; // Define the type for setting if needed
}

export default function Delivery({ departments, settings }: DeliveryProps) {
    const [data, setData] = useState<Department[]>(departments);

    useFlashMessage();

    useEffect(() => {
        // This effect can be used to update the component state if needed
        setData(departments);
    }, [departments]);


    const dataTree = data.map((department) => ({
        id: department.id,
        name: department.name,
        actions: <Actions key={department.id} id={department.id} zoneType={ZoneType.DEPARTMENT} data={department.delivery_zone} />,
        isSelected: !!department?.delivery_zone,
        children: department.provinces.map((province) => ({
            id: province.id,
            name: province.name,
            isSelected: !!province?.delivery_zone,
            actions: <Actions key={province.id} id={province.id} zoneType={ZoneType.PROVINCE} data={province.delivery_zone} />,
            children: province.districts.map((district) => ({
                id: district.id,
                name: district.name,
                isSelected: !!district?.delivery_zone,
                actions: <Actions key={district.id} id={district.id} zoneType={ZoneType.DISTRICT} data={district.delivery_zone} />,
            })),
        })),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zonas de Delivery" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <div className="text-lg font-bold lg:text-2xl">Zonas de Delivery</div>

                    <div className="flex gap-4">
                        <DeliveryZoneInfo />
                        <ModalSetting settings={settings} />
                    </div>
                </div>

                <div className="max-w-2xl">
                    <TreeView data={dataTree} />
                </div>
                {/* <TableList data={customers} meta={meta}/> */}
            </div>
        </AppLayout>
    );
}

