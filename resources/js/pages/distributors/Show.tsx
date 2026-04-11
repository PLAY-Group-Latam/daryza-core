'use client'

import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    MapPin, Phone, Mail, FileText,
    ChevronLeft, Globe,
    Edit3, Calendar, CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Distributor } from '@/types/distributors/distributors';
import DistributorsMap from '@/components/custom-ui/distributors/DistributorsMap';

interface Props {
    distributor: Distributor;
}

export default function Show({ distributor }: Props) {
    const lat = Number(distributor.coords?.lat) || -12.0464;
    const lng = Number(distributor.coords?.lng) || -77.0428;

    return (
        <AppLayout>
            <Head title={`Distribuidor - ${distributor.name}`} />

            {/* Ajuste de scroll calcado del Create/Edit para scroll global en móvil y fijo en Desktop */}
            <div className="flex flex-col lg:h-[calc(100vh-64px)] gap-4 p-4 lg:p-6 overflow-y-auto lg:overflow-hidden">

                {/* BARRA DE ACCIONES SUPERIOR */}
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0">
                            <Link href="/distributors"><ChevronLeft className="h-5 w-5" /></Link>
                        </Button>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">{distributor.name}</h1>
                                
                                {distributor.is_active ? (
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex items-center gap-1 text-[10px] uppercase font-bold py-0.5 shrink-0">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Activo
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 flex items-center gap-1 text-[10px] uppercase font-bold py-0.5 shrink-0">
                                        <XCircle className="h-3 w-3" />
                                        Inactivo
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <p className="text-[10px] sm:text-xs text-muted-foreground leading-none">
                                    Actualizado el {new Date(distributor.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button asChild className="bg-[#44AC34] hover:bg-[#388e2a] w-full md:w-auto px-6 shrink-0 text-sm h-10 transition-colors">
                        <Link href={`/distributors/${distributor.id}/edit`}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Editar Información
                        </Link>
                    </Button>
                </div>

                {/* CONTENEDOR PRINCIPAL: Quitamos el reverse para que en móvil sea Formulario -> Mapa */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 lg:overflow-hidden">

                    {/* PANEL IZQUIERDO: INFORMACIÓN */}
                    <div className="lg:col-span-4 space-y-4 lg:overflow-y-auto lg:pr-2 custom-scrollbar">

                        {/* FACHADA */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Foto del Establecimiento</Label>
                            <div className="h-28 w-full bg-slate-100 rounded-xl overflow-hidden relative shadow-sm border-2 border-white">
                                {distributor.establishment_img ? (
                                    <img
                                        src={distributor.establishment_img}
                                        alt="Fachada"
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                        <Globe className="h-6 w-6 opacity-20" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* INFORMACIÓN */}
                        <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-xl">
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-slate-400">Nombre Comercial</Label>
                                    <div className="text-sm font-bold text-slate-800 bg-slate-50/50 p-2 rounded-md border border-slate-100">
                                        {distributor.name}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-slate-400">RUC</Label>
                                        <div className="text-sm font-mono font-bold text-slate-700 bg-slate-50/50 p-2 rounded-md border border-slate-100">
                                            {distributor.ruc || '---'}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-slate-400">Ciudad / Región</Label>
                                        <div className="text-sm font-semibold text-slate-700 bg-slate-50/50 p-2 rounded-md border border-slate-100">
                                            {distributor.region}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-slate-400">Dirección Exacta</Label>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50/50 p-2 rounded-md border border-slate-100">
                                        <MapPin className="h-3.5 w-3.5 text-[#44AC34] shrink-0" />
                                        <span className="break-words">{distributor.address || 'No especificada'}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-slate-400">Teléfono</Label>
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50/50 p-2 rounded-md border border-slate-100">
                                            <Phone className="h-3.5 w-3.5 text-[#44AC34] shrink-0" />
                                            {distributor.phone || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-slate-400">Email</Label>
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50/50 p-2 rounded-md border border-slate-100 overflow-hidden text-ellipsis whitespace-nowrap">
                                            <Mail className="h-3.5 w-3.5 text-[#44AC34] shrink-0" />
                                            <span className="truncate">{distributor.email || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100 my-2" />

                                {/* CAMPO DE ESTADO ACTIVO/INACTIVO (Agregado para calcar el Edit) */}
                                <div className="flex items-center justify-between py-1">
                                    <div className="space-y-0.5">
                                        <Label className="text-[11px] font-semibold text-slate-700">Estado del Distribuidor</Label>
                                        <p className="text-[10px] text-slate-500 leading-none">Visibilidad actual en el mapa público</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold uppercase ${distributor.is_active ? 'text-black' : 'text-slate-400'}`}>
                                            {distributor.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                        {/* Switch deshabilitado para vista de solo lectura */}
                                        <div className={`w-11 h-6 flex items-center rounded-full p-1 cursor-not-allowed ${distributor.is_active ? 'bg-black' : 'bg-slate-200'}`}>
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${distributor.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {distributor.note && (
                            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl flex gap-3 items-center shadow-lg border-l-4 border-[#44AC34]">
                                <FileText className="h-5 w-5 text-[#44AC34] shrink-0" />
                                <p className="text-[11px] italic leading-relaxed">"{distributor.note}"</p>
                            </div>
                        )}
                    </div>
                    
                    {/* COLUMNA DERECHA: MAPA RESPONSIVE */}
                    <div className="lg:col-span-8 min-h-[350px] lg:h-full rounded-2xl overflow-hidden border-2 border-white shadow-2xl relative bg-slate-200">
                        <DistributorsMap
                            initialCoords={{ lat, lng }}
                            readOnly={true}
                        />

                        {/* Coordenadas flotantes adaptadas al mockup exacto */}
                        <div className="absolute top-4 right-4 z-[1000] flex gap-2">
                            <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-200/50 shadow-sm flex items-center gap-1.5">
                                <span className="text-[8px] font-bold text-slate-400 uppercase">LAT</span>
                                <span className="text-xs font-mono font-bold text-slate-800">{lat.toFixed(5)}</span>
                            </div>
                            <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-200/50 shadow-sm flex items-center gap-1.5">
                                <span className="text-[8px] font-bold text-slate-400 uppercase">LNG</span>
                                <span className="text-xs font-mono font-bold text-slate-800">{lng.toFixed(5)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}