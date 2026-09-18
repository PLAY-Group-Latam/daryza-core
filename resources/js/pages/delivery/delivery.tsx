import { TreeView } from '@/components/tree-view';
import AppLayout from '@/layouts/app-layout';
import { Department, ZoneType } from '@/models/Ubigeos';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { DeliveryZoneInfo } from '@/components/delivery-zone-info';
import { DeliverySetting } from '@/models/DeliverySetting';
import { Actions } from './components/actions';
import { ModalSetting } from './components/modal-setting';

interface DeliveryProps {
    departments: Department[];
    settings: DeliverySetting;
}

export default function Delivery({ departments, settings }: DeliveryProps) {
    const [data, setData] = useState<Department[]>(departments);

    useEffect(() => {
        setData(departments);
    }, [departments]);

    const dataTree = data.map((department) => {
        const provinceNodes = department.provinces.map((province) => {
            const districtNodes = province.districts.map((district) => ({
                id: district.id,
                name: district.name,
                isSelected: !!district.delivery_zone,
                actions: (
                    <Actions
                        key={district.id}
                        id={district.id}
                        zoneType={ZoneType.DISTRICT}
                        data={district.delivery_zone}
                    />
                ),
            }));

            // La provincia se mantiene abierta si ella misma tiene zona,
            // o si algún distrito suyo ya tiene zona configurada
            const provinceHasData =
                !!province.delivery_zone || districtNodes.some((d) => d.isSelected);

            return {
                id: province.id,
                name: province.name,
                isSelected: provinceHasData,
                actions: (
                    <Actions
                        key={province.id}
                        id={province.id}
                        zoneType={ZoneType.PROVINCE}
                        data={province.delivery_zone}
                    />
                ),
                children: districtNodes,
            };
        });

        // El departamento se mantiene abierto si él mismo tiene zona,
        // o si alguna provincia suya (o distrito debajo) tiene zona
        const departmentHasData =
            !!department.delivery_zone || provinceNodes.some((p) => p.isSelected);

        return {
            id: department.id,
            name: department.name,
            isSelected: departmentHasData,
            actions: (
                <Actions
                    key={department.id}
                    id={department.id}
                    zoneType={ZoneType.DEPARTMENT}
                    data={department.delivery_zone}
                />
            ),
            children: provinceNodes,
        };
    });

    return (
        <AppLayout>
            <Head title="Zonas de Delivery" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-lg font-bold lg:text-2xl">Zonas de Delivery</div>
                    <div className="flex items-center gap-2">
                        <DeliveryZoneInfo />
                        <ModalSetting settings={settings} />
                    </div>
                </div>

                <div className="max-w-2xl">
                    <TreeView data={dataTree} />
                </div>
            </div>
        </AppLayout>
    );
}