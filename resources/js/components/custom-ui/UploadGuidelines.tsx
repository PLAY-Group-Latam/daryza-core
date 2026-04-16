import React from 'react';
import { Info, FileVideo, FileImage } from 'lucide-react';

const UploadGuidelines = () => {
    return (
        <div className="flex flex-wrap gap-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
            <div className="flex items-center gap-2 text-[11px] font-medium text-blue-700">
                <Info size={14} strokeWidth={2.5} />
                <span>RESTRICCIONES DE CARGA:</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <FileImage size={13} className="text-slate-400" />
                <span className="font-bold">Imágenes:</span> Máx. 1 MB (JPG, PNG, WEBP)
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <FileVideo size={13} className="text-slate-400" />
                <span className="font-bold">Video:</span> Máx. 15 MB (MP4, WEBM)
            </div>
        </div>
    );
};

export default UploadGuidelines;