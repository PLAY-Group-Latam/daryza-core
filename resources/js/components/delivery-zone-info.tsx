import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export function DeliveryZoneInfo() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Como funciona ?</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>¿Cómo funciona?</DialogTitle>
                    <DialogDescription>
                        El sistema permite definir precios de delivery por <strong>departamento</strong>, <strong>provincia</strong> o{' '}
                        <strong>distrito</strong>. Solo se mostrará al cliente lo que tenga cobertura configurada.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-2 space-y-2 text-sm">
                    <p>
                        Si configuras un departamento, aparecerán todas sus provincias y distritos. Si configuras una provincia, aparecerá solo esa
                        provincia y sus distritos. Si configuras un distrito, solo ese será visible.
                    </p>
                    <p>
                        Si hay precios en distintos niveles, el sistema aplicará el <strong>más específico disponible</strong>.
                    </p>
                    <p>
                        Solo puedes marcar <strong>un distrito</strong> como <em>sede principal</em>. Esta opción indica tu centro de operaciones.
                    </p>
                    <p className="text-muted-foreground italic">
                        Ejemplo: Si Lima (dpto) cuesta S/ 20, Lima (provincia) S/ 15 y Miraflores S/ 10, se cobrará S/ 10 para Miraflores, S/ 15 para
                        San Isidro y S/ 20 para Huaral.
                    </p>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

