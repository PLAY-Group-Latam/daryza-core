import { Upload } from '@/components/custom-ui/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';

interface WhatsappSettingProps {
    setting: {
        icon_url: string | null;
        phone: string | null;
        welcome_message: string | null;
    };
}

export default function WhatsappSettings({ setting }: WhatsappSettingProps) {
    const normalizedPhone = (setting.phone ?? '').replace(/^\+?51/, '');

    const { data, setData, post, processing, errors } = useForm<{
        icon: File | string | null;
        phone: string;
        welcome_message: string;
    }>({
        icon: setting.icon_url,
        phone: normalizedPhone,
        welcome_message: setting.welcome_message ?? '',
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/whatsapp-settings', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Configuración WhatsApp" />

            <div className="flex h-full flex-1 flex-col gap-4">
                <h1 className="text-lg font-bold lg:text-2xl">
                    Configuración de WhatsApp
                </h1>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="flex flex-col gap-3.5">
                        <Label>Número de WhatsApp (Perú)</Label>
                        <div className="flex items-center gap-2">
                            <span className="rounded-md border bg-muted px-3 py-2 text-sm font-medium">
                                +51
                            </span>
                            <Input
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                inputMode="numeric"
                                maxLength={9}
                                placeholder="987654321"
                            />
                        </div>
                        {errors.phone && (
                            <p className="text-sm text-red-500">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3.5">
                        <Label>Mensaje de bienvenida</Label>
                        <textarea
                            value={data.welcome_message}
                            onChange={(e) =>
                                setData('welcome_message', e.target.value)
                            }
                            className="min-h-[120px] w-full rounded-md border p-3 text-sm"
                            placeholder="Hola, me gustaría recibir más información..."
                        />
                        {errors.welcome_message && (
                            <p className="text-sm text-red-500">
                                {errors.welcome_message}
                            </p>
                        )}
                    </div>
                    <div className="flex max-w-50 flex-col gap-3.5">
                        <Label>Ícono de WhatsApp</Label>
                        <Upload
                            value={data.icon}
                            onFileChange={(file) => setData('icon', file)}
                            accept="image/png,image/jpg,image/jpeg,image/webp,image/svg+xml"
                            placeholder="Subir ícono de WhatsApp"
                            previewClassName="h-36 "
                        />
                        {errors.icon && (
                            <p className="text-sm text-red-500">
                                {errors.icon}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Guardar configuración
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
