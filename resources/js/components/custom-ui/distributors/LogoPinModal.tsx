import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload } from '@/components/custom-ui/upload';
import { Save, MapPin } from 'lucide-react';

interface Props {
    open: boolean;
    onClose: () => void;
    currentPinUrl?: string | null;
}

export default function LogoPinModal({ open, onClose, currentPinUrl }: Props) {
    const { data, setData, post, processing, reset } = useForm<{
        logo_pin: File | null;
    }>({ logo_pin: null });

    const [previewUrl, setPreviewUrl] = useState<string | null>(currentPinUrl ?? null);

    // Sync preview con el pin actual cuando se abre el modal
    useEffect(() => {
        if (open) setPreviewUrl(currentPinUrl ?? null);
    }, [open, currentPinUrl]);

    // Limpiar blob URL al desmontar
    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileChange = (file: File | null) => {
        setData('logo_pin', file);
        if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(file ? URL.createObjectURL(file) : (currentPinUrl ?? null));
    };

    const handleClose = () => {
        reset();
        setPreviewUrl(currentPinUrl ?? null);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Cambiamos la URL aquí:
        post('/distributors/map-pin', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-sm">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="mb-4">
                        <DialogTitle className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#44AC34]" />
                            Pin Global del Mapa
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            Este pin se mostrará en todos los distribuidores del mapa público.
                        </p>
                    </DialogHeader>

                    {/* Upload + preview del marcador */}
                    <div className="relative mb-6">
                        <Upload
                            value={data.logo_pin}
                            onFileChange={handleFileChange}
                            placeholder="Subir imagen (PNG, SVG, JPG, WEBP)"
                            previewClassName="h-36 w-full bg-slate-50 border-dashed border-2"
                        />

                        {/* Simulador del pin con máscara SVG */}
                        <div className="absolute -top-2 -right-2 bg-white shadow-lg p-1.5 rounded-full border border-slate-100 z-10 pointer-events-none">
                            <div className="relative h-12 w-10">
                                {previewUrl ? (
                                    <div
                                        className="absolute inset-0 w-full h-full"
                                        style={{
                                            backgroundImage: `url('${previewUrl}')`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            WebkitMaskImage: "url('/images/distributors/marker-icon.svg')",
                                            maskImage: "url('/images/distributors/marker-icon.svg')",
                                            WebkitMaskSize: 'contain',
                                            maskSize: 'contain',
                                            WebkitMaskRepeat: 'no-repeat',
                                            maskRepeat: 'no-repeat',
                                        }}
                                    />
                                ) : (
                                    <img
                                        src="/images/distributors/marker-icon.svg"
                                        className="absolute inset-0 w-full h-full opacity-40"
                                        alt="pin por defecto"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Aviso si ya hay pin configurado */}
                    {currentPinUrl && !data.logo_pin && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mb-4">
                            <MapPin className="h-3 w-3 shrink-0" />
                            Ya tienes un pin configurado. Sube uno nuevo para reemplazarlo.
                        </p>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.logo_pin}
                            className="bg-[#44AC34] hover:bg-[#388e2a]"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Pin
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}