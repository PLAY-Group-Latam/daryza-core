import { useState, useEffect } from 'react'
import { X, MapPin, Phone, Mail, Hash, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Upload } from '@/components/custom-ui/upload'
import { useForm } from '@inertiajs/react'
import { Distributor } from '@/types/distributors/distributors'

interface DistributorFormProps {
    coords: { lat: number; lng: number };
    onClose: () => void;
    distributor?: Distributor; // Prop opcional para modo Edición
}

export default function DistributorForm({ coords, onClose, distributor }: DistributorFormProps) {
    // Definimos si estamos editando
    const isEditing = !!distributor;

    const { data, setData, post, processing, errors } = useForm({
        name: distributor?.name ?? '',
        region: distributor?.region ?? '',
        ruc: distributor?.ruc ?? '',
        address: distributor?.address ?? '',
        phone: distributor?.phone ?? '',
        email: distributor?.email ?? '',
        note: distributor?.note ?? '',
        img_info: null as File | null,
        lat: coords.lat,
        lng: coords.lng,
        // Hack para Laravel: Los archivos no viajan bien por PUT puro, 
        // así que mandamos POST con este campo para que Laravel lo entienda como PUT.
        _method: isEditing ? 'PUT' : 'POST',
    });

    // Estado para la miniatura (si estamos editando, podrías inicializarla con la URL de la imagen actual)
    const [preview, setPreview] = useState<string | null>(distributor?.img_info ?? null);

    // Actualizar coordenadas si el usuario mueve el pin mientras el form está abierto
    useEffect(() => {
        setData(prev => ({ ...prev, lat: coords.lat, lng: coords.lng }));
    }, [coords]);

    const handleFileChange = (file: File | null) => {
        setData('img_info', file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(distributor?.img_info ?? null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // La ruta cambia dependiendo de si creamos o editamos
        const url = isEditing ? `/distributors/${distributor.id}` : '/distributors';

        post(url, {
            onSuccess: () => {
                onClose();
                if (preview && !isEditing) URL.revokeObjectURL(preview);
            },
            forceFormData: true,
        });
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200"
            >
                {/* Header Dinámico */}
                <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <MapPin className="text-[#44AC34]" size={20} />
                        {isEditing ? 'Editar Distribuidor' : 'Nuevo Distribuidor'}
                    </h2>
                    <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-slate-200">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* Subida de Imagen */}
                        <div className="col-span-2 space-y-2 text-left">
                            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                                <ImageIcon size={12} /> Foto del Establecimiento
                            </label>
                            <Upload
                                value={preview}
                                onFileChange={handleFileChange}
                                placeholder="Haz clic para cambiar la imagen"
                                previewClassName="h-40 w-full object-cover rounded-lg"
                            />
                            {errors.img_info && <p className="text-xs text-red-500 font-medium mt-1">{errors.img_info}</p>}
                        </div>

                        {/* Nombre Comercial */}
                        <div className="col-span-2 space-y-1 text-left">
                            <label className="text-xs font-bold uppercase text-slate-500">Nombre Comercial</label>
                            <input
                                value={data.name}
                                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5 ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Ej: Central de Abastos S.A."
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        {/* Dirección */}
                        <div className="col-span-2 space-y-1 text-left">
                            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                                <MapPin size={12} /> Dirección Exacta
                            </label>
                            <input
                                value={data.address}
                                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5 ${errors.address ? 'border-red-500' : 'border-slate-200'}`}
                                onChange={e => setData('address', e.target.value)}
                                placeholder="Ej: Av. La Marina 2500, San Miguel"
                            />
                            {errors.address && <p className="text-xs text-red-500 font-medium">{errors.address}</p>}
                        </div>

                        {/* RUC */}
                        <div className="space-y-1 text-left">
                            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><Hash size={12} /> RUC</label>
                            <input
                                value={data.ruc}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-black"
                                onChange={e => setData('ruc', e.target.value)}
                                maxLength={11}
                            />
                        </div>

                        {/* Región */}
                        <div className="space-y-1 text-left">
                            <label className="text-xs font-bold uppercase text-slate-500">Región</label>
                            <input
                                value={data.region}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-black"
                                onChange={e => setData('region', e.target.value)}
                            />
                            {errors.region && <p className="text-xs text-red-500">{errors.region}</p>}
                        </div>

                        {/* Teléfono */}
                        <div className="space-y-1 text-left">
                            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><Phone size={12} /> Teléfono</label>
                            <input
                                value={data.phone}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                onChange={e => setData('phone', e.target.value)}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1 text-left">
                            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><Mail size={12} /> Email</label>
                            <input
                                type="email"
                                value={data.email}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                onChange={e => setData('email', e.target.value)}
                            />
                        </div>

                        {/* Coordenadas */}
                        <div className="col-span-2 mt-2 flex items-center justify-between rounded-xl bg-slate-100 p-3 border border-slate-200">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Posición Seleccionada</p>
                                <p className="text-xs font-mono font-bold text-slate-600">
                                    {data.lat.toFixed(6)}, {data.lng.toFixed(6)}
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] bg-[#44AC34]/10 text-[#44AC34] px-2 py-0.5 rounded-full font-bold uppercase">GPS Activo</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer con Botón Dinámico */}
                <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm font-medium text-slate-500 hover:text-black px-4"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={processing}
                        className="flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95"
                    >
                        {processing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            isEditing ? 'Actualizar Cambios' : 'Guardar Distribuidor'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}