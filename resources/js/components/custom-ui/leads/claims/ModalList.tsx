import React, { useState } from 'react';
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
    ShoppingCart,
    Tag,
    User,
    X,
    ChevronDown,
    ChevronUp,
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
            {/* 1. Quitamos overflow-y-auto de aquí y ponemos overflow-hidden */}
            <DialogContent className="max-h-[90vh] w-full max-w-[95vw] overflow-hidden border border-slate-200 bg-white p-0 shadow-2xl lg:max-w-7xl dark:border-zinc-800 dark:bg-zinc-950">
                
                {/* 2. Forzamos al contenedor flex a tener la altura máxima del modal */}
                <div className="flex flex-col lg:flex-row h-[90vh] lg:h-[85vh]">
                    
                    {/* Lado Izquierdo - Ahora con su propio scroll */}
                    <div className="w-full shrink-0 border-b border-slate-200 bg-slate-50 p-4 sm:p-6 lg:w-[35%] lg:border-r lg:border-b-0 lg:p-8 overflow-y-auto dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mb-6 lg:mb-8">
                            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase lg:mb-4 dark:text-zinc-500">
                                <User size={14} strokeWidth={2.5} />
                                <span>Datos del Solicitante</span>
                            </div>

                            <DialogTitle className="mb-1 text-2xl leading-tight font-bold text-slate-900 sm:text-3xl dark:text-white">
                                {claim.full_name}
                            </DialogTitle>

                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[10px] font-bold tracking-wide text-white uppercase dark:bg-white dark:text-slate-900">
                                <AlertCircle size={12} />
                                {claim.data.type_of_claim_id}
                            </div>
                        </div>

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

                        <div className="mb-4 border-slate-200 pb-4 lg:mb-6 lg:pb-6 dark:border-zinc-800">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-green-600 dark:text-green-500" />
                                <div>
                                    <p className="mb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-zinc-600">
                                        Términos y Condiciones
                                    </p>
                                    <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                                        {claim.data.terms_conditions ? 'Aceptados' : 'No aceptados'}
                                    </p>
                                </div>
                            </div>
                        </div>

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

                    {/* Lado derecho - El que querías con scroll interno */}
                    <div className="flex flex-1 min-w-0 flex-col bg-white dark:bg-zinc-950">
                        {/* 3. El contenido principal es el que scrollea */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                            
                            <div className="mb-6 lg:mb-8">
                                <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-zinc-500">
                                    <Hash size={14} strokeWidth={2.5} />
                                    <span>Expediente Digital</span>
                                </div>
                                <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-white break-all">
                                    Número de Reclamación: {claim.data.claim_code || '---'}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-zinc-400">
                                    Información detallada de la incidencia registrada
                                </p>
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mb-8 lg:gap-6">
                                <InfoCard label="Bien/Servicio" value={claim.data.well_hired_id} icon={<Package size={18} />} />
                                <InfoCard label="Producto Específico" value={claim.data.type_of_service_id} icon={<Tag size={18} />} />
                                <InfoCard label="Fecha de la Compra" value={claim.data.created_at_form} icon={<ShoppingCart size={18} />} />
                            </div>

                            <div className="space-y-6 lg:space-y-8">
                                <div className="min-w-0">
                                    <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                                        <FileText size={14} />
                                        <span>Pedido del Cliente</span>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                        <CollapsibleText text={claim.data.customer_request || 'Sin pedido específico.'} />
                                    </div>
                                </div>

                                <div className="min-w-0">
                                    <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                                        <FileText size={14} />
                                        <span>Detalle del Reclamo</span>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                        <CollapsibleText text={claim.data.description} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Fijo (opcional, si quieres que los botones no se muevan al hacer scroll) */}
                        <div className="shrink-0 border-t border-slate-200 p-4 lg:p-6 dark:border-zinc-800">
                            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                                <div className="text-xs text-slate-500 dark:text-zinc-500">Daryza - Sistema de Reclamaciones</div>
                                <div className="flex w-full gap-3 sm:w-auto">
                                    {claim.file_path ? (
                                        <Button asChild className="h-9 w-full bg-slate-900 text-white hover:bg-slate-800 sm:w-auto dark:bg-white dark:text-slate-900">
                                            <a href={`${claim.file_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                <Download size={16} />
                                                <span className="text-xs font-semibold">Descargar Adjunto</span>
                                            </a>
                                        </Button>
                                    ) : (
                                        <div className="flex h-9 items-center gap-2 rounded-md border border-slate-200 px-4 text-xs text-slate-400 dark:border-zinc-800">
                                            <X size={14} /> <span>Sin adjuntos</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const CollapsibleText = ({ text }: { text: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongText = text.length > 160;

    return (
        <div className="w-full">
            <p className={`text-sm leading-relaxed text-slate-700 dark:text-zinc-300 
                ${!isExpanded && isLongText ? 'line-clamp-3' : ''} 
                break-all whitespace-pre-wrap overflow-hidden`}
            >
                {text}
            </p>
            {isLongText && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                    {isExpanded ? (
                        <> <ChevronUp size={14} /> <span>Ver menos</span> </>
                    ) : (
                        <> <ChevronDown size={14} /> <span>Ver más</span> </>
                    )}
                </button>
            )}
        </div>
    );
};

const DetailItem = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
    <div className="space-y-2 min-w-0">
        <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-600">
            <span className="opacity-80">{icon}</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase">{label}</span>
        </div>
        <p className="pl-6 text-sm font-semibold break-words text-slate-900 dark:text-white">
            {value || '---'}
        </p>
    </div>
);

const InfoCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-900 min-w-0">
        <div className="mb-2 flex items-center gap-2 text-slate-400 dark:text-zinc-600">
            <span className="opacity-80">{icon}</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase">{label}</span>
        </div>
        <p className="text-sm font-semibold break-words text-slate-900 dark:text-white">
            {value || '---'}
        </p>
    </div>
);