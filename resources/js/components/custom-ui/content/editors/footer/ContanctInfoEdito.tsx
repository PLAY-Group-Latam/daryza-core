'use client';

import { useForm } from '@inertiajs/react';
import { Save, Phone, Smartphone, Mail, MapPin, Clock, ImagePlus, GripVertical, Trash2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ContentSectionProps as Props } from '@/types/content/content';
import { useRef, useState } from 'react';

// ── Tipos ───────────────────────────────────────────────────────────────────
interface BankItem {
    id: number;
    image: File | string | null;
}

interface ContactInfoContent {
    phone:          string;
    mobile:         string;
    email:          string;
    address_line1:  string;
    address_line2:  string;
    weekday_from:   string;
    weekday_to:     string;
    saturday_from:  string;
    saturday_to:    string;
    banks:          BankItem[];
}

// ── Utils ───────────────────────────────────────────────────────────────────
function formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// ── Sub-componentes ─────────────────────────────────────────────────────────
function Block({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{title}</p>
            {children}
        </div>
    );
}

function FieldRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-sm transition-all">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                <Icon size={16} />
            </div>
            <div className="w-px h-10 bg-slate-200 flex-shrink-0" />
            <div className="flex-1">
                <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</Label>
                {children}
            </div>
        </div>
    );
}

function TimeRangeRow({ label, from, to, onFromChange, onToChange }: {
    label: string; from: string; to: string;
    onFromChange: (v: string) => void; onToChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/30 hover:shadow-sm transition-all">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                <Clock size={16} />
            </div>
            <div className="hidden sm:block w-px h-10 bg-slate-200 flex-shrink-0" />
            <div className="flex-1">
                <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2 block">{label}</Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="flex flex-col gap-1 flex-1">
                            <span className="text-[9px] text-slate-400 uppercase tracking-wide">Desde</span>
                            <input type="time" value={from} onChange={(e) => onFromChange(e.target.value)}
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                        </div>
                        <span className="text-slate-400 font-medium mt-4">—</span>
                        <div className="flex flex-col gap-1 flex-1">
                            <span className="text-[9px] text-slate-400 uppercase tracking-wide">Hasta</span>
                            <input type="time" value={to} onChange={(e) => onToChange(e.target.value)}
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                        </div>
                    </div>
                    {from && to && (
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1.5 rounded-lg whitespace-nowrap self-end sm:self-auto">
                            {formatTime(from)} - {formatTime(to)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function BankImageUpload({ value, onChange }: { value: File | string | null; onChange: (f: File) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const preview = value instanceof File ? URL.createObjectURL(value) : value ?? null;
    return (
        <>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
            <button type="button" onClick={() => inputRef.current?.click()}
                className="group relative w-24 h-14 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:border-primary/60 hover:bg-primary/5 transition-all overflow-hidden flex items-center justify-center">
                {preview ? (
                    <>
                        <img src={preview} alt="bank" className="w-full h-full object-contain p-1.5" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                            <ImagePlus size={14} className="text-white" />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-primary transition-colors">
                        <ImagePlus size={16} />
                        <span className="text-[9px] font-semibold uppercase tracking-wide">Subir</span>
                    </div>
                )}
            </button>
        </>
    );
}

// ── Editor principal ────────────────────────────────────────────────────────
export default function ContactInfoEditor({ section }: Props) {
    const raw = section.content?.content as ContactInfoContent;

    const { data, setData, put, processing } = useForm<{ content: ContactInfoContent }>({
        content: {
            phone:         raw?.phone         ?? '(01) 315-3600',
            mobile:        raw?.mobile        ?? '+51 967 767 831',
            email:         raw?.email         ?? 'webmaster@daryza.com',
            address_line1: raw?.address_line1 ?? 'Granja 1 - Alt Km. 30',
            address_line2: raw?.address_line2 ?? 'Antigua Panamericana Sur, Lurín',
            weekday_from:  raw?.weekday_from  ?? '08:00',
            weekday_to:    raw?.weekday_to    ?? '17:00',
            saturday_from: raw?.saturday_from ?? '08:00',
            saturday_to:   raw?.saturday_to   ?? '12:00',
            banks:         raw?.banks         ?? [],
        },
    });

    const set = (field: keyof ContactInfoContent) => (val: string) =>
        setData('content', { ...data.content, [field]: val });

    // Banks handlers
    const dragIndex = useRef<number | null>(null);
    const [dragOver, setDragOver] = useState<number | null>(null);

    const addBank = () =>
        setData('content', { ...data.content, banks: [...data.content.banks, { id: Date.now(), image: null }] });

    const removeBank = (i: number) =>
        setData('content', { ...data.content, banks: data.content.banks.filter((_, idx) => idx !== i) });

    const updateBank = (i: number, image: File) => {
        const banks = [...data.content.banks];
        banks[i] = { ...banks[i], image };
        setData('content', { ...data.content, banks });
    };

    const handleDragStart = (i: number) => { dragIndex.current = i; };
    const handleDragOver  = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i); };
    const handleDragEnd   = () => { dragIndex.current = null; setDragOver(null); };
    const handleDrop      = (e: React.DragEvent, dropIdx: number) => {
        e.preventDefault();
        if (dragIndex.current === null || dragIndex.current === dropIdx) { setDragOver(null); return; }
        const banks = [...data.content.banks];
        const dragged = banks[dragIndex.current];
        banks.splice(dragIndex.current, 1);
        banks.splice(dropIdx, 0, dragged);
        setData('content', { ...data.content, banks });
        dragIndex.current = null;
        setDragOver(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('¡Información de contacto actualizada!'),
            onError: () => toast.error('Error al guardar'),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><Phone size={20} /></div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Información de Contacto</h3>
                            <p className="text-sm text-slate-500">Teléfonos, correo, dirección, horarios y bancos del footer.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8">

                    {/* Teléfonos */}
                    <Block title="Teléfonos">
                        <FieldRow icon={Phone} label="Teléfono fijo">
                            <Input value={data.content.phone} onChange={(e) => set('phone')(e.target.value)} placeholder="(01) 315-3600" className="text-sm font-medium" />
                        </FieldRow>
                        <FieldRow icon={Smartphone} label="Celular / WhatsApp">
                            <Input value={data.content.mobile} onChange={(e) => set('mobile')(e.target.value)} placeholder="+51 967 767 831" className="text-sm font-medium" />
                        </FieldRow>
                    </Block>

                    {/* Correo */}
                    <Block title="Correo electrónico">
                        <FieldRow icon={Mail} label="Email">
                            <Input type="email" value={data.content.email} onChange={(e) => set('email')(e.target.value)} placeholder="contacto@daryza.com" className="text-sm font-medium" />
                        </FieldRow>
                    </Block>

                    {/* Oficina */}
                    <Block title="Oficina central">
                        <FieldRow icon={MapPin} label="Dirección — Línea 1">
                            <Input value={data.content.address_line1} onChange={(e) => set('address_line1')(e.target.value)} placeholder="Granja 1 - Alt Km. 30" className="text-sm font-medium" />
                        </FieldRow>
                        <FieldRow icon={MapPin} label="Dirección — Línea 2">
                            <Input value={data.content.address_line2} onChange={(e) => set('address_line2')(e.target.value)} placeholder="Antigua Panamericana Sur, Lurín" className="text-sm font-medium" />
                        </FieldRow>
                    </Block>

                    {/* Horarios */}
                    <Block title="Horarios de atención">
                        <TimeRangeRow label="Lunes - Viernes"
                            from={data.content.weekday_from} to={data.content.weekday_to}
                            onFromChange={set('weekday_from')} onToChange={set('weekday_to')} />
                        <TimeRangeRow label="Sábado"
                            from={data.content.saturday_from} to={data.content.saturday_to}
                            onFromChange={set('saturday_from')} onToChange={set('saturday_to')} />
                    </Block>

                    {/* Bancos */}
                    <Block title="Métodos de pago / Bancos">

                        {/* Preview */}
                        {data.content.banks.length > 0 && (
                            <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                                {data.content.banks.map((bank) => {
                                    const preview = bank.image instanceof File ? URL.createObjectURL(bank.image) : bank.image ?? null;
                                    return (
                                        <div key={bank.id} className="w-14 h-10 rounded-md overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                                            {preview
                                                ? <img src={preview} alt="" className="w-full h-full object-contain p-1" />
                                                : <div className="w-6 h-4 bg-slate-200 rounded" />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Lista */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                                    Imágenes ({data.content.banks.length})
                                </Label>
                                <p className="text-[10px] text-slate-400">Arrastra para reordenar</p>
                            </div>

                            {data.content.banks.length === 0 && (
                                <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                                    No hay imágenes. Agrega una abajo.
                                </div>
                            )}

                            {data.content.banks.map((bank, index) => (
                                <div key={bank.id} draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`flex items-center gap-4 p-3 rounded-xl border bg-white transition-all cursor-grab active:cursor-grabbing
                                        ${dragOver === index ? 'border-primary/50 bg-primary/5 shadow-md scale-[1.01]' : 'border-slate-200 hover:border-primary/30 hover:shadow-sm'}`}>
                                    <div className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors"><GripVertical size={18} /></div>
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">{index + 1}</div>
                                    <BankImageUpload value={bank.image} onChange={(file) => updateBank(index, file)} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-400 truncate">
                                            {bank.image instanceof File ? bank.image.name : bank.image ? 'Imagen guardada' : 'Sin imagen'}
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => removeBank(index)}
                                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}

                            <button type="button" onClick={addBank}
                                className="w-full mt-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-medium">
                                <ImagePlus size={16} />
                                Agregar banco
                            </button>
                        </div>
                    </Block>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={processing} className="w-full sm:w-auto px-10 py-6 rounded-xl shadow-md gap-2 text-base font-bold">
                    <Save size={20} />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}