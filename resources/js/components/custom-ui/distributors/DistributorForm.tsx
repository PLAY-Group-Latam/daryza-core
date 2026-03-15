import { useState, useRef } from 'react'
import { X, MapPin, Phone, Mail, FileText, Hash, Image as ImageIcon} from 'lucide-react'
import { Upload } from '@/components/custom-ui/upload'
import { Distributor } from '@/types/distributors/distributors'

interface DistributorFormProps {
    coords: { lat: number; lng: number };
    onClose: () => void;
    // Opcional: una función para cuando se guarde exitosamente
    onSubmit?: (data: Omit<Distributor, 'id'>) => void; 
}

export default function DistributorForm({ coords, onClose, onSubmit }: DistributorFormProps) {
    const [form, setForm] = useState({
        name: '',
        region: '',
        ruc: '',
        address: '',
        phone: '',
        email: '',
        note: '',
        img_info: null as string | null
    })

    const fileInputRef = useRef<HTMLInputElement>(null)

   const handleFileChange = (file: File | null) => {
        if (file) {
            setForm(prev => ({ ...prev, img_info: URL.createObjectURL(file) }));
        } else {
            setForm(prev => ({ ...prev, img_info: '' }));
        }
    }

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <MapPin className="text-black" size={20} />
                        Nuevo Distribuidor
                    </h2>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-200 transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="max-h-[75vh] overflow-y-auto px-6 py-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        
                        {/* Subir Imagen */}
                       <div className="col-span-2 space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                                <ImageIcon size={12}/> Imagen del Distribuidor
                            </label>
                            <Upload 
                                value={form.img_info}
                                onFileChange={handleFileChange}
                                placeholder="Subir foto del local"
                                previewClassName="h-40 w-full"
                            />
                        </div>

                        {/* Nombre y Región */}
                        <div className="col-span-2 space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 text-left block">Nombre Comercial</label>
                            <input 
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="Ej: Distribuidora El Inca"
                                onChange={(e)=>setForm({...form, name: e.target.value})}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><Hash size={12}/> RUC</label>
                            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="10..." onChange={(e)=>setForm({...form, ruc: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 block text-left">Región</label>
                            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Amazonas, Lima..." onChange={(e)=>setForm({...form, region: e.target.value})} />
                        </div>

                        {/* Contacto */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><Phone size={12}/> Teléfono</label>
                            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" onChange={(e)=>setForm({...form, phone: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><Mail size={12}/> Email</label>
                            <input type="email" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" onChange={(e)=>setForm({...form, email: e.target.value})} />
                        </div>

                        <div className="col-span-2 space-y-1 text-left">
                            <label className="text-xs font-bold uppercase text-slate-500 block">Dirección Física</label>
                            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" onChange={(e)=>setForm({...form, address: e.target.value})} />
                        </div>

                        <div className="col-span-2 space-y-1 text-left">
                            <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1"><FileText size={12}/> Notas</label>
                            <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-[60px]" onChange={(e)=>setForm({...form, note: e.target.value})} />
                        </div>
                    </div>

                    {/* Coordenadas */}
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-100 p-4 text-white">
                        <div>
                            <p className="text-[10px] font-black uppercase text-black">Coordenadas Exactas</p>
                            <p className="text-xs font-mono text-black">{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</p>
                        </div>
                        <MapPin className="text-black" size={20} />
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4">
                    <button onClick={onClose} className="text-sm font-medium text-slate-600">Cancelar</button>
                    <button className="rounded-lg bg-black px-6 py-2 text-sm font-bold text-white shadow-lg hover:bg-gray-500 transition-all">Guardar</button>
                </div>
            </div>
        </div>
    )
}