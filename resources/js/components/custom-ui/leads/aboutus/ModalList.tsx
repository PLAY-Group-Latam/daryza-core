'use client';

import React, { ReactNode } from 'react';
import { 
    Mail, Phone, User, MessageSquare, 
    Calendar, Hash, ArrowRight, Building2, CreditCard 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { formatDate } from '@/lib/helpers/formatDate';
import { AboutUs } from '@/types/leads/about';

interface ModalAboutUsProps {
    item: AboutUs | null;
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

export const ModalAboutUs = ({ item, isOpen, onClose }: ModalAboutUsProps) => {
    if (!item) return null;

    const extraData = item.data || {};

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] w-full max-w-[95vw] overflow-hidden border-none bg-white p-0 shadow-2xl lg:max-w-6xl dark:bg-zinc-950 rounded-[2rem]">
                <div className="flex h-full flex-col lg:flex-row min-h-[550px]">
                    
                    {/* --- ASIDE IZQUIERDO: Identidad del Remitente --- */}
                    <aside className="w-full border-b border-slate-100 bg-[#FDFDFD] p-8 lg:w-[35%] lg:border-r lg:border-b-0 dark:border-zinc-800 dark:bg-zinc-900/40 flex flex-col justify-between">
                        <div>
                            
                            
                            <div className="mb-10">
                                <DialogTitle className="text-2xl font-black leading-[0.9] tracking-tighter text-slate-900 dark:text-white lg:text-3xl">
                                    {item.full_name}
                                </DialogTitle>
                                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                                    Contacto / Nosotros
                                </p>
                            </div>

                            <div className="space-y-6">
                                <DetailItem label="Correo Electrónico" value={item.email} icon={<Mail size={18} />} />
                                <DetailItem label="Número de Teléfono" value={item.phone || '---'} icon={<Phone size={18} />} />
                            </div>
                        </div>

                        <div className="mt-10 border-t border-slate-100 pt-6 dark:border-zinc-800 flex items-center gap-3 text-slate-400">
                            <Calendar size={16} />
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Recibido el</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                                    {formatDate(item.created_at)}
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* --- MAIN DERECHO: Detalle de la Consulta --- */}
                    <main className="flex w-full flex-col p-8 lg:w-[65%] lg:p-12 bg-white dark:bg-zinc-950">
                        <div className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <Hash size={14} className="text-blue-500" />
                            <span>Información Adicional</span>
                        </div>

                        {/* Grid de Cards de información rápida */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <InfoCard 
                                label="Empresa / Organización" 
                                value={extraData.company_name || 'No especificado'} 
                                icon={<Building2 size={18} />} 
                            />
                            <InfoCard 
                                label="DNI / RUC" 
                                value={extraData.ruc_dni || '---'} 
                                icon={<CreditCard size={18} />} 
                            />
                        </div>

                        {/* Caja de Mensaje Estilo Comentario */}
                        <div className="mt-8 flex-1">
                            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight text-slate-400">
                                <MessageSquare size={14} />
                                <span>Mensaje o Consulta</span>
                            </div>
                            <div className="relative rounded-[2rem] border border-slate-100 bg-slate-50/50 p-8 dark:border-zinc-800 dark:bg-zinc-900/60 overflow-hidden group">
                                <span className="absolute -top-4 -left-2 text-2xl text-slate-200/40 font-serif select-none dark:text-zinc-800/20 group-hover:text-blue-200/40 transition-colors">“</span>
                                <p className="relative text-lg font-medium leading-relaxed italic text-slate-600 dark:text-zinc-400">
                                    {extraData.comments || 'El remitente no incluyó un mensaje detallado.'}
                                </p>
                            </div>
                        </div>

                        {/* Footer con Acción Principal */}
                        <footer className="mt-10 flex items-center justify-between">
                            <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 dark:bg-zinc-900">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estado: Pendiente</span>
                            </div>
                            
                         
                        </footer>
                    </main>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- COMPONENTES INTERNOS ESTILIZADOS ---

const InfoCard = ({ label, value, icon }: { label: string; value: string; icon: ReactNode }) => (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-blue-100 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mb-2 flex items-center gap-2 text-slate-400">
            {icon}
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
);

const DetailItem = ({ label, value, icon }: { label: string; value: string; icon: ReactNode }) => (
    <div className="flex items-start gap-4 group">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all group-hover:text-blue-600 group-hover:ring-blue-200 dark:bg-zinc-800 dark:ring-zinc-700">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">{label}</p>
            <p className="truncate text-sm font-bold text-slate-800 dark:text-zinc-200">{value}</p>
        </div>
    </div>
);