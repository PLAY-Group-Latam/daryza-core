import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Claim } from '@/types/leads/claim';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    CreditCard,
    Download,
    FileText,
    Hash,
    Mail,
    MapPin,
    Package,
    Phone,
    Tag,
    User,
    X,
} from 'lucide-react';

interface ModalListProps {
    claim: Claim | null;
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

export const ModalClaimList = ({ claim, isOpen, onClose }: ModalListProps) => {
    if (!claim) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] w-full max-w-[95vw] overflow-y-auto border border-slate-200 bg-white p-0 shadow-2xl lg:max-w-7xl dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex h-full flex-col lg:flex-row">
                    {/* Lado Izquierdo*/}
                    <div className="w-full border-b border-slate-200 bg-slate-50 p-4 sm:p-6 lg:w-[38%] lg:border-r lg:border-b-0 lg:p-8 dark:border-zinc-800 dark:bg-zinc-900">
                        {/* Header del Cliente */}
                        <div className="mb-6 lg:mb-8">
                            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase lg:mb-4 dark:text-zinc-500">
                                <User size={14} strokeWidth={2.5} />
                                <span>Datos del Solicitante</span>
                            </div>

                            <DialogTitle className="mb-1 text-2xl leading-tight font-bold text-slate-900 sm:text-3xl dark:text-white">
                                {claim.full_name}
                            </DialogTitle>

                            {/* Badge de estado */}
                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[10px] font-bold tracking-wide text-white uppercase dark:bg-white dark:text-slate-900">
                                <AlertCircle size={12} />
                                {claim.data.type_of_claim_id}
                            </div>
                        </div>

                        {/* Información de Contacto */}
                        <div className="mb-6 space-y-4 lg:mb-8 lg:space-y-5">
                            <DetailItem
                                label="Documento"
                                value={`${claim.data.document_type_id} ${claim.data.document_number}`}
                                icon={<CreditCard size={16} />}
                            />
                            <DetailItem
                                label="Email"
                                value={claim.email}
                                icon={<Mail size={16} />}
                            />
                            <DetailItem
                                label="Teléfono"
                                value={claim.phone}
                                icon={<Phone size={16} />}
                            />
                            <DetailItem
                                label="Dirección"
                                value={`${claim.data.address}, ${claim.data.district}`}
                                icon={<MapPin size={16} />}
                            />
                        </div>

                        {/* Términos y Condiciones */}
                        <div className="mb-4  border-slate-200 pb-4 lg:mb-6 lg:pb-6 dark:border-zinc-800">
                            <div className="flex items-start gap-3">
                                <CheckCircle2
                                    size={18}
                                    className="mt-0.5 flex-shrink-0 text-green-600 dark:text-green-500"
                                />
                                <div>
                                    <p className="mb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-zinc-600">
                                        Términos y Condiciones
                                    </p>
                                    <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                                        {claim.data.terms_conditions
                                            ? 'Aceptados'
                                            : 'No aceptados'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Fecha de Registro */}
                        <div className="border-t border-slate-200 pt-2 lg:pt-4 dark:border-zinc-800">
                            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-zinc-600">
                                <Calendar size={12} />
                                <span>Fecha de Registro</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                                {claim.data.created_at_form}
                            </p>
                        </div>
                    </div>

                    {/* Lado derecho */}
                    <div className="flex w-full flex-col p-4 sm:p-6 lg:w-[62%] lg:p-8">
                        {/* Header del Expediente */}
                        <div className="mb-6 lg:mb-8">
                            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-zinc-500">
                                <Hash size={14} strokeWidth={2.5} />
                                <span>Expediente Digital</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-zinc-400">
                                Información detallada de la incidencia
                                registrada
                            </p>
                        </div>

                        {/* Información del Producto/Servicio */}
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mb-8 lg:gap-6">
                            <InfoCard
                                label="Bien/Servicio"
                                value={claim.data.well_hired_id}
                                icon={<Package size={18} />}
                            />
                            <InfoCard
                                label="Producto Específico"
                                value={claim.data.type_of_service_id}
                                icon={<Tag size={18} />}
                            />
                        </div>

                        {/* Descripción del Reclamo */}
                        <div className="mb-6 flex-1 lg:mb-8">
                            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-zinc-500">
                                <FileText size={14} strokeWidth={2.5} />
                                <span>Detalle del Hecho</span>
                            </div>

                            <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 sm:text-base dark:text-zinc-300">
                                    {claim.data.description}
                                </p>
                            </div>
                        </div>

                        {/* Footer con Acciones */}
                        <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center lg:gap-4 lg:pt-6 dark:border-zinc-800">
                            <div className="text-xs text-slate-500 dark:text-zinc-500"></div>

                            <div className="flex w-full gap-3 sm:w-auto">
                                {claim.file_path ? (
                                    <Button
                                        asChild
                                        className="h-9 w-full bg-slate-900 px-5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
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
                                    <div className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-xs font-medium text-slate-400 sm:w-auto dark:border-zinc-800 dark:text-zinc-600">
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

const DetailItem = ({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-600">
            <span className="opacity-80">{icon}</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase">
                {label}
            </span>
        </div>
        <p className="pl-6 text-sm font-semibold break-words text-slate-900 dark:text-white">
            {value || '---'}
        </p>
    </div>
);

const InfoCard = ({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) => (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-2 flex items-center gap-2 text-slate-400 dark:text-zinc-600">
            <span className="opacity-80">{icon}</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase">
                {label}
            </span>
        </div>
        <p className="text-sm font-semibold break-words text-slate-900 dark:text-white">
            {value || '---'}
        </p>
    </div>
);
