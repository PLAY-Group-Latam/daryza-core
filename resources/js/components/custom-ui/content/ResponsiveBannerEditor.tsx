import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
    Monitor, 
    Smartphone, 
    Link2, 
    Image as ImageIcon, 
    MousePointerClick,
    Info,
    FileVideo,
    FileImage 
} from 'lucide-react';
import { Upload } from '../upload'; // Ajusta la ruta según tu estructura

// ── SUB-COMPONENTE DE GUÍAS DINÁMICO ────────────────────────────────
// Recibe el tipo para saber qué restricción mostrar
const UploadGuidelines = ({ type }: { type: 'image' | 'video' | 'both' }) => (
    <div className="flex flex-wrap gap-4 p-3 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-700">
            <Info size={14} strokeWidth={2.5} />
            <span>RESTRICCIONES:</span>
        </div>
        
        {(type === 'image' || type === 'both') && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <FileImage size={13} className="text-slate-400" />
                <span className="font-bold">Imágenes:</span> Máx. 1 MB (JPG, PNG)
            </div>
        )}

        {(type === 'video' || type === 'both') && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <FileVideo size={13} className="text-slate-400" />
                <span className="font-bold">Video:</span> Máx. 15 MB (MP4)
            </div>
        )}
    </div>
);

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────
interface BannerData {
    type?: 'image' | 'url';
    src_desktop: string | File | null;
    src_mobile: string | File | null;
    link_url?: string;
}

interface Props {
    title: string;
    description: string;
    data: BannerData;
    onChange: (updates: Partial<BannerData>) => void;
    showTypeTabs?: boolean;
    allowedType?: 'image' | 'video' | 'both'; // Nueva prop para controlar el modo
}

const ResponsiveBannerEditor: React.FC<Props> = ({ 
    title, 
    description, 
    data, 
    onChange,
    showTypeTabs = true,
    allowedType = 'image' // Por defecto solo imagen
}) => {
    
    const TYPE_TABS = [
        { key: 'image', label: 'Imagen Estática', Icon: ImageIcon },
        { key: 'url', label: 'Imagen con Enlace', Icon: MousePointerClick },
    ] as const;

    // Determinar qué "accept" pasarle al componente Upload
    const getAccept = () => {
        if (allowedType === 'video') return 'video/*';
        if (allowedType === 'both') return 'image/*,video/*';
        return 'image/*';
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                        {allowedType === 'video' ? <FileVideo size={22} /> : <ImageIcon size={22} />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Selector de Tipo (URL o Estático) */}
                {showTypeTabs && (
                    <div className="flex p-1 bg-slate-100 rounded-xl w-fit min-w-[320px]">
                        {TYPE_TABS.map(({ key, label, Icon }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => onChange({ type: key })}
                                className={`flex flex-1 items-center justify-center gap-2 py-2 px-4 text-sm font-semibold rounded-lg transition-all
                                    ${data.type === key
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Icon size={16} />
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Desktop */}
                    <div className="lg:col-span-8 space-y-3">
                        <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                            <Monitor size={14} className="text-primary" />
                            Vista Desktop
                        </Label>
                        <Upload
                            type={allowedType === 'video' ? 'video' : 'image'}
                            accept={getAccept()}
                            value={data.src_desktop}
                            onFileChange={(file) => onChange({ src_desktop: file })}
                            previewClassName="w-full aspect-[21/9] lg:aspect-[3/1]"
                        />
                    </div>

                    {/* Mobile */}
                    <div className="lg:col-span-4 space-y-3">
                        <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                            <Smartphone size={14} className="text-primary" />
                            Vista Móvil
                        </Label>
                        <div className="flex justify-center lg:justify-start">
                            <Upload
                                type={allowedType === 'video' ? 'video' : 'image'}
                                accept={getAccept()}
                                value={data.src_mobile}
                                onFileChange={(file) => onChange({ src_mobile: file })}
                                previewClassName="w-[140px] aspect-[9/16]"
                            />
                        </div>
                    </div>
                </div>

                {/* Campo URL */}
                {(data.type === 'url' || !showTypeTabs) && (
                    <div className="pt-6 border-t border-slate-100 space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Enlace de redirección</Label>
                        <div className="relative group">
                            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" size={18} />
                            <Input
                                value={data.link_url || ''}
                                onChange={(e) => onChange({ link_url: e.target.value })}
                                placeholder="https://..."
                                className="pl-11 h-12 bg-slate-50 rounded-xl"
                            />
                        </div>
                    </div>
                )}

                {/* Footer Dinámico con las restricciones correctas */}
                <div className="pt-2">
                    <UploadGuidelines type={allowedType} />
                </div>
            </div>
        </div>
    );
};

export default ResponsiveBannerEditor;