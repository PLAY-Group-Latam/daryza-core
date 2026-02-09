'use client';

import React, { ReactNode, useMemo } from 'react';
import { 
    Mail, Phone, User, AlertCircle, Hash, 
    Download, MessageSquare, CreditCard, Tag, FileText, 
    Calendar, Building2, MapPin, Briefcase, Store 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { formatDate } from '@/lib/helpers/formatDate';
import { Contact, ContactConfigMap } from '@/types/leads/contacts';

// 1. Definimos qué puede hacer cada tipo de lead para ocultar elementos innecesarios
const TYPE_CAPABILITIES: Record<Contact['type'], { hasFiles: boolean }> = {
    help_center: { hasFiles: true },
    distributor_network: { hasFiles: false },
    customer_service: { hasFiles: false },
    sales_advisor: { hasFiles: false },
};

export const TYPE_LABELS: Record<Contact['type'], string> = {
    help_center: 'Centro de Ayuda',
    distributor_network: 'Red de Distribuidores',
    customer_service: 'Atención al Cliente',
    sales_advisor: 'Asesor de Ventas',
};

const STATUS_CONFIG: Record<Contact['status'], { label: string; className: string }> = {
    new: { label: 'Nuevo', className: 'bg-blue-600' },
    pending: { label: 'Pendiente', className: 'bg-amber-500' },
    resolved: { label: 'Resuelto', className: 'bg-emerald-600' },
    closed: { label: 'Cerrado', className: 'bg-slate-500' },
};

export const CONTACT_CONFIG: ContactConfigMap = {
    help_center: [
        { label: "DNI / RUC", keys: ['ruc_or_dni'], icon: <CreditCard size={18} /> },
        { label: "Motivo", keys: ['contact_reason'], icon: <Tag size={18} /> },
        { label: "Doc. Compra", keys: ['purchase_document'], icon: <FileText size={18} /> },
        { label: "Fecha Compra", keys: ['purchase_date'], icon: <Calendar size={18} /> },
        { label: "Comentarios", keys: ['comments'], isFullWidth: true },
    ],
    distributor_network: [
        { label: "Empresa", keys: ['company_name'], icon: <Building2 size={18} /> },
        { label: "DNI / RUC", keys: ['ruc_or_dni'], icon: <CreditCard size={18} /> },
        { label: "N° Vendedores", keys: ['number_of_sellers'], icon: <Briefcase size={18} /> },
       { label: "Ubicación", keys: ['department', 'province', 'district'], icon: <MapPin size={18} />, isLocation: true },
        { label: "Dirección", keys: ['address'], icon: <Store size={18} /> },
        { label: "Otros Productos", keys: ['other_products'], isFullWidth: true },
    ],
    customer_service: [
        { label: "DNI / RUC", keys: ['ruc_or_dni'], icon: <CreditCard size={18} /> },
        { label: "N° Doc. Compra", keys: ['purchase_document_number'], icon: <FileText size={18} /> },
        { label: "Comentarios", keys: ['comments'], isFullWidth: true },
    ],
    sales_advisor: [
        { label: "Empresa", keys: ['company_name'], icon: <Building2 size={18} /> },
        { label: "DNI / RUC", keys: ['ruc_or_dni'], icon: <CreditCard size={18} /> },
        { label: "Provincia", keys: ['province'], icon: <MapPin size={18} /> },
        { label: "Comentarios", keys: ['comments'], isFullWidth: true },
    ],
};

const getSafeValue = (claim: any, keys: string[]): string => {
    if (!claim) return '---';
    
    for (const key of keys) {
        const val = claim[key] ?? claim.data?.[key];
        if (val !== undefined && val !== null && val !== '' && typeof val !== 'object') {
            return String(val);
        }
    }
    return '---';
};
const formatLocation = (parts: string[]): string => {
    const validParts = parts.filter(p => p && p !== '---');
    return validParts.length > 0 ? validParts.join(', ') : '---';
};

interface ModalListProps {
    claim: Contact | null;
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

export const ModalContactList = ({ claim, isOpen, onClose }: ModalListProps) => {
    if (!claim) return null;

    const currentConfig = useMemo(() => CONTACT_CONFIG[claim.type] || [], [claim.type]);
    const statusInfo = STATUS_CONFIG[claim.status] || { label: claim.status, className: 'bg-slate-900' };
    const capabilities = TYPE_CAPABILITIES[claim.type];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] w-full max-w-[95vw] overflow-y-auto border-none bg-white p-0 shadow-2xl lg:max-w-6xl dark:bg-zinc-950">
                <div className="flex h-full flex-col lg:flex-row">
                    
                    {/* ASIDE IZQUIERDO */}
                    <aside className="w-full border-b border-slate-100 bg-slate-50/50 p-6 lg:w-[35%] lg:border-r lg:border-b-0 dark:border-zinc-800 dark:bg-zinc-900/30">
                        <div className="mb-8">
                            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                <User size={14} />
                                <span>Remitente</span>
                            </div>
                            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                                {claim.full_name}
                            </DialogTitle>
                            
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-white uppercase dark:bg-white dark:text-slate-900">
                                    <AlertCircle size={12} />
                                    {TYPE_LABELS[claim.type]}
                                </span>
                                <span className={`inline-flex items-center rounded-full ${statusInfo.className} px-3 py-1 text-[10px] font-bold text-white uppercase`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <DetailItem label="Email" value={claim.email} icon={<Mail size={16} />} />
                            <DetailItem label="Teléfono" value={claim.phone} icon={<Phone size={16} />} />
                        </div>

                        <div className="mt-10 border-t border-slate-200 pt-6 dark:border-zinc-800">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha de Registro</span>
                            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                                {formatDate(claim.created_at)}
                            </p>
                        </div>
                    </aside>

                    {/* MAIN DERECHO */}
                    <main className="flex w-full flex-col p-6 lg:w-[65%] lg:p-8">
                        <div className="mb-6 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                            <Hash size={14} />
                            <span>Detalle Técnico del Lead</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {currentConfig.map((field, idx) => {
    let rawValue = '---';

    if (field.isLocation) {
        // ✅ Forzamos a que busque cada llave por separado y luego las una
        const locationParts = field.keys.map(key => getSafeValue(claim, [key]));
        rawValue = formatLocation(locationParts);
    } else {
        rawValue = getSafeValue(claim, field.keys);
    }

    if (field.isFullWidth) {
        return <CommentBox key={idx} label={field.label} value={rawValue} />;
    }

    return (
        <InfoCard 
            key={idx}
            label={field.label} 
            value={rawValue} 
            icon={field.icon} 
        />
    );
})}
                        </div>

                        {/* RENDERIZADO CONDICIONAL DE ADJUNTOS: 
                            Solo se muestra si el tipo de contacto lo soporta O si mágicamente hay un archivo 
                        */}
                        {(capabilities.hasFiles || claim.file_path) && (
                            <footer className="mt-auto pt-12 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Adjuntos</span>
                                    <span className="text-[10px] font-medium text-slate-400 italic">
                                        {claim.file_path ? claim.file_original_name || "Documentación disponible" : "Sin archivos adjuntos"}
                                    </span>
                                </div>
                                
                                {claim.file_path && (
                                    <Button asChild size="sm" className="bg-slate-900 text-white hover:scale-105 transition-transform dark:bg-white dark:text-slate-900">
                                        <a href={claim.file_path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                            <Download size={14} />
                                            <span>Descargar</span>
                                        </a>
                                    </Button>
                                )}
                            </footer>
                        )}
                    </main>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- SUB-COMPONENTES ---
const InfoCard = ({ label, value, icon }: { label: string; value: string; icon: ReactNode }) => (
    <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mb-2 flex items-center gap-2 text-slate-400">
            <span className="transition-colors group-hover:text-slate-600">{icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
        </div>
        <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{value}</p>
    </div>
);

const CommentBox = ({ label, value }: { label: string; value: string }) => (
    <div className="col-span-full mt-2">
        <div className="mb-2 flex items-center gap-2 text-slate-400">
            <MessageSquare size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400 whitespace-pre-wrap">
                {value !== '---' ? value : 'Sin observaciones adicionales.'}
            </p>
        </div>
    </div>
);

const DetailItem = ({ label, value, icon }: { label: string; value: string; icon: ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 dark:bg-zinc-800 dark:ring-zinc-700">
            {icon}
        </div>
        <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-200">{value}</p>
        </div>
    </div>
);