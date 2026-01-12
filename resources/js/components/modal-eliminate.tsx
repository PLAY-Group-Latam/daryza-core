import { router } from '@inertiajs/react';
import { Loader2, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { route } from '@/lib/helpers/route';

interface DeleteModalProps {
    title: string;
    messageDelete: string;
    id: number | string;
    routeName: string;
}

export default function ModalDelete({ title, messageDelete, id, routeName }: DeleteModalProps) {
    const [textConfirmed, setTextConfirmed] = useState<string>('');
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = () => {
        if (!isConfirmed) {
            return;
        }
        setLoading(true);
        router.delete(route(routeName, {id}), {
            preserveScroll: false,
            onSuccess: () => {
                setOpen(false);
                toast.success('Se eliminó exitosamente.');
                setTextConfirmed('');
                setIsConfirmed(false);
            },
            onError: (error) => {
                console.log(error);
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTextConfirmed(value);
        if (value === 'ELIMINAR') {
            setIsConfirmed(true);
        } else {
            setIsConfirmed(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <Trash />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{title}?</DialogTitle>
                <DialogDescription>{messageDelete}, una vez que realice esta acción no se puede deshacer</DialogDescription>
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Escribe <span className="font-bold">ELIMINAR</span> para confirmar
                        </p>

                        <Input
                            id="confirmed"
                            type="text"
                            name="confirmed"
                            // ref={passwordConfirmed}
                            value={textConfirmed}
                            onChange={handleChange}
                            placeholder="Confirmar eliminación"
                            autoComplete="off"
                        />

                        {/* <InputError message={errors.password} /> */}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button onClick={() => setOpen(false)} variant="secondary">
                            Cancelar
                        </Button>

                        <Button type="button" onClick={handleDelete} variant="destructive" disabled={!isConfirmed || loading}>
                            {loading && <Loader2 className="animate-spin" />}
                            Eliminar
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

