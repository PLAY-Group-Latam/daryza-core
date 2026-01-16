import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DeliverySetting } from '@/models/DeliverySetting';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Settings2Icon } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

interface DeliveryForm {
    minimum_order_amount: string;
    order_amount_threshold: string;
}

interface ModalSettingProps {
    settings?: DeliverySetting;
}

export function ModalSetting({ settings }: ModalSettingProps) {
    const { data, setData, post, errors, processing, recentlySuccessful,reset } = useForm<Required<DeliveryForm>>('', {
        minimum_order_amount: settings?.minimum_order_amount?.toString() || '',
        order_amount_threshold: settings?.order_amount_threshold?.toString() || '',
    });

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const amountInput = useRef<HTMLInputElement>(null);

    // const isEditMode = !!settings;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        //ver los valores de los inputs

        post(route('delivery-settings.store'), {
            preserveScroll: true,
            onSuccess: () => { setIsOpen(false)},
            onError: (error) => {
                if (error.minimum_order_amount) {
                    reset('minimum_order_amount');
                    amountInput.current?.focus();
                }

                if (error.order_amount_threshold) {
                    reset('order_amount_threshold');
                    amountInput.current?.focus();
                }
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => setIsOpen((prev) => !prev)}>
            <Button type="button" onClick={() => setIsOpen(true)} variant={'default'}>
                <Settings2Icon className="mr-2 h-4 w-4" />
                Configurar
            </Button>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configuración de Delivery</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="minimum_order_amount">Monto mínimo del pedido para delivery gratis</Label>

                        <Input
                            id="minimum_order_amount"
                            ref={amountInput}
                            className="mt-1 block w-full"
                            value={data.minimum_order_amount}
                            type="number"
                            min={0}
                            onChange={(e) => setData('minimum_order_amount', e.target.value)}
                            required
                            placeholder="Monto mínimo del pedido"
                        />
                        <InputError className="mt-2" message={errors.minimum_order_amount} />

                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="order_amount_threshold">Monto mínimo del pedido para su compra</Label>

                        <Input
                            id="order_amount_threshold"
                            ref={amountInput}
                            className="mt-1 block w-full"
                            value={data.order_amount_threshold}
                            type="number"
                            min={0}
                            onChange={(e) => setData('order_amount_threshold', e.target.value)}
                            required
                            placeholder="Monto mínimo del pedido para su compra"
                        />
                        <InputError className="mt-2" message={errors.order_amount_threshold} />

                    </div>
                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Guardar</Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Guardando</p>
                        </Transition>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

