import { 
  FileText, User, Mail, Phone, MapPin, 
  CreditCard, Package, Calendar, Download, X, Hash, Tag, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from '@/lib/helpers/formatDate';
import { Claim } from '@/types/claim';

interface ModalListProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

export const ModalClaimList = ({ claim, isOpen, onClose }: ModalListProps) => {
  if (!claim) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-0 shadow-2xl">
        
        <div className="flex flex-col lg:flex-row h-full">
          
          {/* Lado Izquierdo*/}
          <div className="w-full lg:w-[38%] bg-slate-50 dark:bg-zinc-900 p-4 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-800">
            
            {/* Header del Cliente */}
            <div className="mb-6 lg:mb-8">
              <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-3 lg:mb-4">
                <User size={14} strokeWidth={2.5} />
                <span>Datos del Solicitante</span>
              </div>
              
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-1">
                {claim.full_name}
              </DialogTitle>
              
              {/* Badge de estado */}
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-wide">
                <AlertCircle size={12} />
                {claim.data.type_of_claim_id}
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4 lg:space-y-5 mb-6 lg:mb-8">
              <DetailItem 
                label="Documento" 
                value={`${claim.data.document_type_id} ${claim.data.document_number}`} 
                icon={<CreditCard size={16}/>} 
              />
              <DetailItem 
                label="Email" 
                value={claim.email} 
                icon={<Mail size={16}/>} 
              />
              <DetailItem 
                label="Teléfono" 
                value={claim.phone} 
                icon={<Phone size={16}/>} 
              />
              <DetailItem 
                label="Dirección" 
                value={`${claim.data.address}, ${claim.data.district}`} 
                icon={<MapPin size={16}/>} 
              />
            </div>

            {/* Términos y Condiciones */}
            <div className="mb-4 lg:mb-6 pb-4 lg:pb-6 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-600 uppercase tracking-wider mb-1">
                    Términos y Condiciones
                  </p>
                  <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                    {claim.data.terms_conditions ? 'Aceptados' : 'No aceptados'}
                  </p>
                </div>
              </div>
            </div>

            {/* Fecha de Registro */}
            <div className="pt-4 lg:pt-6 border-t border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-600 text-[10px] font-semibold uppercase tracking-wider mb-2">
                <Calendar size={12}/>
                <span>Fecha de Registro</span>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                {claim.data.created_at_form}
              </p>
            </div>
          </div>

          {/* Lado derecho */}
          <div className="w-full lg:w-[62%] p-4 sm:p-6 lg:p-8 flex flex-col">
            
            {/* Header del Expediente */}
            <div className="mb-6 lg:mb-8">
              <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-2">
                <Hash size={14} strokeWidth={2.5} />
                <span>Expediente Digital</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Información detallada de la incidencia registrada
              </p>
            </div>

            {/* Información del Producto/Servicio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <InfoCard 
                label="Bien/Servicio" 
                value={claim.data.well_hired_id} 
                icon={<Package size={18}/>} 
              />
              <InfoCard 
                label="Producto Específico" 
                value={claim.data.type_of_service_id} 
                icon={<Tag size={18}/>} 
              />
            </div>

            {/* Descripción del Reclamo */}
            <div className="flex-1 mb-6 lg:mb-8">
              <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-3">
                <FileText size={14} strokeWidth={2.5} />
                <span>Detalle del Hecho</span>
              </div>
              <div className="p-4 sm:p-6 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg">
                <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-zinc-300">
                  {claim.data.description}
                </p>
              </div>
            </div>

            {/* Footer con Acciones */}
            <div className="pt-4 lg:pt-6 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
              <div className="text-xs text-slate-500 dark:text-zinc-500">
                <span className="font-medium">Sincronizado: </span>
                <span className="font-mono">{formatDate(claim.created_at)}</span>
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                {claim.file_path ? (
                  <Button 
                    asChild 
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold text-xs px-5 h-9 shadow-sm w-full sm:w-auto"
                  >
                    <a 
                      href={`${claim.file_path}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      <span>Descargar Adjunto</span>
                    </a>
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400 dark:text-zinc-600 border border-slate-200 dark:border-zinc-800 px-4 h-9 rounded-md w-full sm:w-auto">
                    <X size={14} />
                    <span>Sin archivos adjuntos</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DetailItem = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-600">
      <span className="opacity-80">{icon}</span>
      <span className="text-[10px] uppercase font-semibold tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-semibold text-slate-900 dark:text-white pl-6 break-words">
      {value || '---'}
    </p>
  </div>
);

const InfoCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="p-3 sm:p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg">
    <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-600 mb-2">
      <span className="opacity-80">{icon}</span>
      <span className="text-[10px] uppercase font-semibold tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-semibold text-slate-900 dark:text-white break-words">
      {value || '---'}
    </p>
  </div>
);