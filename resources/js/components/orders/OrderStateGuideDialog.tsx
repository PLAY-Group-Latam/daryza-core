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

            <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Leyenda de estados</DialogTitle>
                    <DialogDescription>
                        Ordenado según el flujo y reglas actuales del backend.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[calc(85vh-110px)] space-y-4 overflow-y-auto pr-1">
                    <div className="rounded-md border p-3 text-sm">
                        <p><b>1) Pendiente de pago:</b> pedido creado, esperando pago.</p>
                        <p><b>2) Pago recibido:</b> pago confirmado.</p>
                        <p><b>3) En preparación:</b> pedido en alistamiento.</p>
                        <p><b>4) En envío:</b> pedido en ruta.</p>
                        <p><b>5) Entregado:</b> pedido entregado.</p>
                        <p><b>6) Entrega fallida:</b> no se pudo entregar.</p>
                        <p><b>7) Pago no exitoso:</b> pago rechazado o fallido.</p>
                        <p><b>8) Reembolsado:</b> pago devuelto al cliente.</p>
                        <p><b>9) Cancelado:</b> pedido anulado.</p>
                    </div>

                    <div className="rounded-md border p-3 text-sm">
                        <p className="font-semibold">Cambios permitidos por estado (backend)</p>
                        <div className="mt-2 space-y-2 text-muted-foreground">
                            <p><b>Pendiente de pago</b> → Pago recibido, Pago no exitoso, Cancelado.</p>
                            <p><b>Pago recibido</b> → En preparación, Pendiente de pago, Reembolsado, Cancelado.</p>
                            <p><b>En preparación</b> → En envío, Pago recibido, Cancelado.</p>
                            <p><b>En envío</b> → Entregado, Entrega fallida, En preparación, Cancelado.</p>
                            <p><b>Entregado</b> → En envío, En preparación.</p>
                            <p><b>Entrega fallida</b> → En envío, En preparación, Cancelado.</p>
                            <p><b>Pago no exitoso</b> → Pendiente de pago, Pago recibido, Cancelado.</p>
                            <p><b>Reembolsado</b> → Pendiente de pago, Pago recibido.</p>
                            <p><b>Cancelado</b> → Pendiente de pago, Pago recibido, En preparación.</p>
                        </div>
                    </div>

                    <div className="rounded-md border p-3 text-sm">
                        <p className="font-semibold">Reglas adicionales</p>
                        <div className="mt-2 space-y-2 text-muted-foreground">
                            <p>
                                <b>1) No verás acciones que no cambian nada:</b> si el pedido ya está en ese estado,
                                esa opción se oculta. Ejemplo: si ya está en “En envío”, no aparece “Cambiar a En envío”.
                            </p>
                            <p>
                                <b>2) “Regresar a …” solo aparece cuando el sistema permite volver atrás:</b> esta opción
                                no siempre existe, solo se muestra si backend permite ese retroceso para el estado actual.
                            </p>
                            <p>
                                <b>3) Las acciones siempre indican el estado final:</b> todas las opciones usan el formato
                                “Cambiar a …”. Ejemplo: “Cambiar a Entregado” deja el pedido en estado “Entregado”.
                            </p>
                            <p>
                                <b>4) Regla especial de Niubiz confirmado:</b> si el pago Niubiz ya fue confirmado, no se permite
                                “Cambiar a Pendiente de pago” ni “Cambiar a Pago no exitoso”.
                            </p>
                            <p>
                                <b>5) Hay cambios que requieren pasos previos:</b> no se puede saltar etapas del flujo.
                                Ejemplo: para usar “Cambiar a Entregado”, primero debe estar en “En envío”.
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
