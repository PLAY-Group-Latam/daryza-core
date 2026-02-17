'use client';

import React, { ReactNode } from 'react';
import { 
    Mail, Phone, User, Hash, Download, 
    MapPin, Briefcase, UserCheck, 
    Layers, FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { formatDate } from '@/lib/helpers/formatDate';
import { JobApplication } from '@/types/leads/jobs';

interface ModalJobProps {
    item: JobApplication | null;
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

export const ModalJobDetails = ({ item, isOpen, onClose }: ModalJobProps) => {
    if (!item) return null;

    // Extraemos la data interna del formulario y los campos de archivo
    const { data, file_path, file_original_name } = item;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] w-full max-w-[95vw] overflow-y-auto border-none bg-white p-0 shadow-2xl lg:max-w-5xl dark:bg-zinc-950">
                <div className="flex h-full flex-col lg:flex-row">
                    
                    {/* PANEL IZQUIERDO: Perfil del Candidato */}
                    <aside className="w-full border-b border-slate-100 bg-slate-50/50 p-6 lg:w-[35%] lg:border-r lg:border-b-0 dark:border-zinc-800 dark:bg-zinc-900/30">
                        <div className="mb-8">
                            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                <UserCheck size={14} />
                                <span>Candidato</span>
                            </div>
                            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                                {/* Priorizamos firstName y lastName de la data */}
                                {data ? `${data.firstName} ${data.lastName}` : item.full_name}
                            </DialogTitle>
                            
                            <div className="mt-4">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold text-white uppercase">
                                    <FileCheck size={12} />
                                    Postulación {item.status === 'new' ? 'Nueva' : item.status}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <DetailItem label="Email" value={item.email} icon={<Mail size={16} />} />
                            <DetailItem label="Teléfono" value={item.phone} icon={<Phone size={16} />} />
                        </div>

                        <div className="mt-10 border-t border-slate-200 pt-6 dark:border-zinc-800">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registrado el</span>
                            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                                {formatDate(item.created_at)}
                            </p>
                        </div>
                    </aside>

                    {/* PANEL DERECHO: Detalles de la Postulación */}
                    <main className="flex w-full flex-col p-6 lg:w-[65%] lg:p-8">
                        <div className="mb-6 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                            <Hash size={14} />
                            <span>Detalles del Puesto</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <InfoCard 
                                label="Área" 
                                value={data?.area || '---'} 
                                icon={<Layers size={18} />} 
                            />
                            <InfoCard 
                                label="Puesto" 
                                value={data?.position || '---'} 
                                icon={<Briefcase size={18} />} 
                            />
                            <InfoCard 
                                label="Lugar" 
                                value={data?.location || '---'} 
                                icon={<MapPin size={18} />} 
                            />
                            <InfoCard 
                                label="Situación Actual" 
                                value={data?.employmentStatus || '---'} 
                                icon={<User size={18} />} 
                            />
                        </div>

                        {/* SECCIÓN DEL CV / ADJUNTOS */}
                        <footer className="mt-auto pt-12 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Curriculum Vitae</span>
                                <span className="text-[11px] font-medium text-slate-500 italic">
                                    {file_path ? (file_original_name || "cv_adjunto.pdf") : "No se adjuntó archivo"}
                                </span>
                            </div>
                            
                            {file_path && (
                                <Button asChild size="sm" className="bg-blue-600 text-white hover:bg-blue-700 transition-all">
                                    <a href={file_path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                        <Download size={14} />
                                        <span>Descargar CV</span>
                                    </a>
                                </Button>
                            )}
                        </footer>
                    </main>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- SUB-COMPONENTES INTERNOS (Sin cambios, solo tipos aplicados) ---

const InfoCard = ({ label, value, icon }: { label: string; value: string; icon: ReactNode }) => (
    <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mb-2 flex items-center gap-2 text-slate-400 group-hover:text-blue-500">
            <span>{icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
        </div>
        <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{value}</p>
    </div>
);

const DetailItem = ({ label, value, icon }: { label: string; value: string; icon: ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 dark:bg-zinc-800 dark:ring-zinc-700">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-200 break-words">{value}</p>
        </div>
    </div>
);