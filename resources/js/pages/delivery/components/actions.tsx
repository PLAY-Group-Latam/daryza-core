import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DeliveryZone, ZoneType } from '@/models/Ubigeos';
import deliveryZones from '@/routes/delivery-zones';
import { reset } from '@/routes/password';
import { router, useForm } from '@inertiajs/react';
import { SaveIcon, Trash2Icon } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface ActionsProps {
    id: string;
    zoneType: ZoneType;
    data?: DeliveryZone;
}
interface FormData {
    zone_type: ZoneType;
    zone_id: string;
    is_main: boolean;
    delivery_cost: string;
    [key: string]: string | boolean | ZoneType;
}

export function Actions({ id, zoneType, data: dataZone }: ActionsProps) {
    // console.log('dataZone dnetro', dataZone);
    const {
        data,
        setData,
        errors,
        post,
        reset,
    } = useForm<FormData>({
        zone_type: zoneType,
        zone_id: id,
        is_main: dataZone?.is_main ?? false,
        delivery_cost: dataZone?.delivery_cost ?? '',
    });

    useEffect(() => {
        setData({
            zone_type: zoneType,
            zone_id: id,
            is_main: dataZone?.is_main ?? false,
            delivery_cost: dataZone?.delivery_cost ?? '',
        });
    }, [dataZone, id, zoneType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const storeRoute = deliveryZones.store();

        router.visit(storeRoute.url, {
            method: storeRoute.method,
            data,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Zona de entrega guardada correctamente');
            },
            onError: (errors) => {
                console.error(errors);
            },
        });
    };

    // router.delete(route(routeName, id), {
    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!dataZone?.id) return;

        const deleteRoute = deliveryZones.destroy({ id: dataZone.id });

        router.visit(deleteRoute.url, {
            method: deleteRoute.method,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Zona de entrega eliminada correctamente');
            },
            onError: (errors) => {
                console.error('Error:', errors);
            },
        });
    };

    return (
        <form className="flex items-center gap-2">
            <div className="grid gap-0.5">
                <Input
                    value={data.delivery_cost}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setData('delivery_cost', e.target.value)}
                    type="number"
                    placeholder="Monto"
                    className={`w-32 ${errors.delivery_cost ? 'border-red-500' : ''}`}
                />
                {/* <InputError className="mt-0.5" message={errors.delivery_cost} /> */}
            </div>
            {zoneType === ZoneType.DISTRICT && (
                <div className="flex items-center space-x-2">
                    <Switch id="principal-toggle" checked={data.is_main} onCheckedChange={(e) => setData('is_main', e)} />
                    <Label htmlFor="principal-toggle">Principal</Label>
                </div>
            )}
            <Button
                type="button"
                onClick={handleSubmit}
                // onClick={(e) => e.stopPropagation()}
                asChild
                variant="default"
                size="icon"
                className="h-8 w-8"
            >
                <SaveIcon className="h-4 w-4 p-1" />
            </Button>
            <Button type="button" onClick={handleDelete} asChild variant="destructive" size="icon" className="h-8 w-8">
                <Trash2Icon className="h-4 w-4 p-1 text-white" />
            </Button>
        </form>
    );
}

