'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { formatDate } from '@/lib/helpers/formatDate';
import { Contact } from '@/types/leads/contacts';
import {
    AlertCircle,
    Briefcase,
    Building2,
    Calendar,
    CreditCard,
    Download,
    FileText,
    Hash,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    User,
    ClipboardCheck,
    Store,
    Tag
} from 'lucide-react';

// --- CONFIGURACIÓN DE CAMPOS DINÁMICOS ---
// Definimos qué mostrar según el tipo de lead sin ensuciar el componente
const CONTACT_CONFIG: Record<string, any[]> = {
    help_center: [
        { label: "DNI / RUC", keys: ['ruc_or_dni', 'rucOrDni'], icon: <CreditCard size={18} /> },
        { label: "Motivo", keys: ['contact_reason', 'contactReason'], icon: <Tag size={18} /> },
        { label: "Doc. Compra", keys: ['purchase_document', 'purchaseDocument'], icon: <FileText size={18} /> },
        { label: "Fecha Compra", keys: ['purchase_date', 'purchaseDate'], icon: <Calendar size={18} /> },
        { label: "Comentarios", keys: ['comments', 'message'], isFullWidth: true },
    ],
    distributor_network: [
        { label: "Empresa", keys: ['company_name', 'companyName'], icon: <Building2 size={18} /> },
        { label: "DNI / RUC", keys: ['ruc_or_dni', 'rucOrDni'], icon: <CreditCard size={18} /> },
        { label: "N° Vendedores", keys: ['number_of_sellers', 'numberOfSellers'], icon: <Briefcase size={18} /> },
        { label: "Ubicación", keys: ['district', 'province'], icon: <MapPin size={18} />, isLocation: true },
        { label: "Dirección", keys: ['address'], icon: <Store size={18} /> },
        { label: "Otros Productos", keys: ['other_products', 'comments'], isFullWidth: true },
    ],
    customer_service: [
        { label: "DNI / RUC", keys: ['ruc_or_dni', 'rucOrDni'], icon: <CreditCard size={18} /> },
        { label: "N° Doc. Compra", keys: ['purchase_document_number', 'purchaseDocumentNumber'], icon: <FileText size={18} /> },
        { label: "Comentarios", keys: ['comments'], isFullWidth: true },
    ],
    sales_advisor: [
        { label: "Empresa", keys: ['company_name', 'companyName', 'companyOrFullName'], icon: <Building2 size={18} /> },
        { label: "DNI / RUC", keys: ['ruc_or_dni', 'rucOrDni'], icon: <CreditCard size={18} /> },
        { label: "Provincia", keys: ['province'], icon: <MapPin size={18} /> },
        { label: "Comentarios", keys: ['comments'], isFullWidth: true },
    ],
};

const TYPE_LABELS: Record<string, string> = {
    help_center: 'Centro de Ayuda',
    distributor_network: 'Red de Distribuidores',
    customer_service: 'Atención al Cliente',
    sales_advisor: 'Asesor de Ventas',
};

interface ModalListProps {
    claim: Contact | null;
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

export const ModalContactList = ({ claim, isOpen, onClose }: ModalListProps) => {
    if (!claim) return null;

    // Helper para extraer valores de forma segura (raíz o .data)
    const getVal = (keys: string[]): string => {
        for (const key of keys) {
            const val = (claim as any)[key] ?? claim.data?.[key as keyof typeof claim.data];
            if (val !== undefined && val !== null && val !== '') return String(val);
        }
        return '---';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] w-full max-w-[95vw] overflow-y-auto border-none bg-white p-0 shadow-2xl lg:max-w-6xl dark:bg-zinc-950">
                <div className="flex h-full flex-col lg:flex-row">
                    
                    {/* SECCIÓN IZQUIERDA: Perfil Principal */}
                    <div className="w-full border-b border-slate-100 bg-slate-50/50 p-6 lg:w-[35%] lg:border-r lg:border-b-0 dark:border-zinc-800 dark:bg-zinc-900/30">
                        <div className="mb-8">
                            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                <User size={14} />
                                <span>Remitente</span>
                            </div>
                            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                                {claim.full_name}
                            </DialogTitle>
                            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-white uppercase dark:bg-white dark:text-slate-900">
                                <AlertCircle size={12} />
                                {TYPE_LABELS[claim.type] || 'Contacto'}
                            </div>
                        </div>

                        <div className="space-y-5">
                            <DetailItem label="Email" value={claim.email} icon={<Mail size={16} />} />
                            <DetailItem label="Teléfono" value={claim.phone} icon={<Phone size={16} />} />
                            <DetailItem label="Estado Actual" value={claim.status.toUpperCase()} icon={<ClipboardCheck size={16} />} />
                        </div>

                        <div className="mt-10 border-t border-slate-200 pt-6 dark:border-zinc-800">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha de Registro</span>
                            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                                {formatDate(claim.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* SECCIÓN DERECHA: Detalles Dinámicos */}
                    <div className="flex w-full flex-col p-6 lg:w-[65%] lg:p-8">
                        <div className="mb-6 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                            <Hash size={14} />
                            <span>Detalle Técnico del Lead</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {CONTACT_CONFIG[claim.type]?.map((field, idx) => {
                                const value = field.isLocation 
                                    ? `${getVal([field.keys[0]])}, ${getVal([field.keys[1]])}`
                                    : getVal(field.keys);

                                if (field.isFullWidth) {
                                    return <CommentBox key={idx} label={field.label} value={value} />;
                                }

                                return (
                                    <InfoCard 
                                        key={idx}
                                        label={field.label} 
                                        value={value} 
                                        icon={field.icon} 
                                    />
                                );
                            })}
                        </div>

                        <div className="mt-auto pt-12 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                            <span className="text-[10px] font-medium text-slate-400 italic">
                                {!claim.file_path && "Sin archivos adjuntos"}
                            </span>
                            
                            {claim.file_path && (
                                <Button asChild size="sm" className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                                    <a href={claim.file_path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                        <Download size={14} />
                                        <span>Descargar Adjunto</span>
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- COMPONENTES AUXILIARES (Internal) ---

const InfoCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
    <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mb-2 flex items-center gap-2 text-slate-400">
            <span className="transition-colors group-hover:text-slate-600">{icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
        </div>
        <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
            {value === '---, ---' ? '---' : value}
        </p>
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

const DetailItem = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
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