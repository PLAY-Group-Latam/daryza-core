import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { CircleHelp } from 'lucide-react';

export default function OrderStateGuideDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="gap-2">
                    <CircleHelp className="h-4 w-4" /> Guia de estados
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Como funcionan los estados de una orden</DialogTitle>
                    <DialogDescription>
                        Esta guia explica que significa cada estado y que cambios estan permitidos para evitar confusiones.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 text-sm md:grid-cols-3">
                    <div className="space-y-2 rounded-md border p-3">
                        <p className="font-semibold">Estado de la orden</p>
                        <p><b>pending:</b> orden creada.</p>
                        <p><b>confirmed:</b> validada para preparacion.</p>
                        <p><b>preparing:</b> en armado.</p>
                        <p><b>shipped:</b> despacho iniciado.</p>
                        <p><b>delivered:</b> entrega finalizada.</p>
                        <p><b>cancelled:</b> orden cancelada.</p>
                        <p className="text-muted-foreground">
                            Reglas: hay avance y retroceso controlado. Ejemplos de correccion: delivered → shipped/preparing/confirmed,
                            shipped → preparing/confirmed y cancelled → pending.
                        </p>
                    </div>

                    <div className="space-y-2 rounded-md border p-3">
                        <p className="font-semibold">Estado de pago</p>
                        <p><b>pending:</b> por validar.</p>
                        <p><b>approved:</b> pago aceptado.</p>
                        <p><b>rejected:</b> pago rechazado.</p>
                        <p><b>failed:</b> fallo tecnico.</p>
                        <p><b>refunded:</b> pago devuelto.</p>
                        <p className="text-muted-foreground">
                            Reglas: pending → approved/rejected/failed, approved → pending/refunded,
                            rejected/failed → pending, refunded → pending/approved.
                        </p>
                    </div>

                    <div className="space-y-2 rounded-md border p-3">
                        <p className="font-semibold">Estado de envio</p>
                        <p><b>pending:</b> aun no asignado.</p>
                        <p><b>assigned:</b> asignado a reparto.</p>
                        <p><b>in_transit:</b> en ruta.</p>
                        <p><b>delivered:</b> entregado.</p>
                        <p><b>failed:</b> intento fallido.</p>
                        <p className="text-muted-foreground">
                            Reglas: hay avance y retroceso controlado. Ejemplos de correccion: delivered → assigned/in_transit,
                            in_transit → pending/assigned y failed → pending/assigned/in_transit.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
