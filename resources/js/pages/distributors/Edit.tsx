'use client'

import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { MapPin, Phone, Mail, ChevronLeft, Save, RefreshCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload } from '@/components/custom-ui/upload';
import DistributorsMap from '@/components/custom-ui/distributors/DistributorsMap';
import { Distributor } from '@/types/distributors/distributors';

interface Props {
    distributor: Distributor;
}

export default function Edit({ distributor }: Props) {
    const initialLat = Number(distributor.coords?.lat) || -12.0464;
    const initialLng = Number(distributor.coords?.lng) || -77.0428;

    const { data, setData, put, processing, errors } = useForm({
        name: distributor.name || '',
        region: distributor.region || '',
        lat: initialLat,
        lng: initialLng,
        ruc: distributor.ruc || '',
        address: distributor.address || '',
        email: distributor.email || '',
        phone: distributor.phone || '',
        establishment_img: null as File | null,
        is_active: distributor.is_active ?? true,
    });

    const [establishmentPreviewUrl, setEstablishmentPreviewUrl] = useState<string | null>(
        distributor.establishment_img || null
    );

    const handleResetLocation = () => {
        setData(prev => ({ ...prev, lat: initialLat, lng: initialLng }));
    };

    const handleFileChange = (file: File | null) => {
        setData('establishment_img', file);
        if (file) {
            setEstablishmentPreviewUrl(URL.createObjectURL(file));
        } else {
            setEstablishmentPreviewUrl(distributor.establishment_img || null);
        }
    };

    useEffect(() => {
        return () => {
            if (establishmentPreviewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(establishmentPreviewUrl);
            }
        };
    }, [establishmentPreviewUrl]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/distributors/${distributor.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Editar - ${distributor.name}`} />

            {/* Ajuste de scroll calcado del Create para scroll global en móvil y fijo en Desktop */}
            <form onSubmit={handleSubmit} className="flex flex-col lg:h-[calc(100vh-64px)] gap-4 p-4 lg:p-6 overflow-y-auto lg:overflow-hidden">

                {/* BARRA DE ACCIONES SUPERIOR (Header Responsive Parcheado) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0">
                            <Link href="/distributors"><ChevronLeft className="h-5 w-5" /></Link>
                        </Button>
                        <div className="min-w-0">
                            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">Editar Distribuidor</h1>
                            <p className="text-[10px] sm:text-xs text-muted-foreground leading-none truncate">Actualiza la información y ubicación</p>
                        </div>
                    </div>
                    <Button type="submit" disabled={processing} className="bg-[#44AC34] hover:bg-[#388e2a] w-full md:w-auto px-6 shrink-0 text-sm h-10 transition-colors">
                        <Save className="h-4 w-4 mr-2" />
                        {processing ? 'Guardando...' : 'Actualizar Registro'}
                    </Button>
                </div>

                {/* CONTENEDOR PRINCIPAL: Grid que cambia de 1 columna a 12 en escritorio. Quitamos el reverse */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 lg:overflow-hidden">

                    {/* COLUMNA IZQUIERDA: FORMULARIO */}
                    <div className="lg:col-span-4 space-y-4 lg:overflow-y-auto lg:pr-2 custom-scrollbar">

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Foto del Establecimiento</Label>
                            <Upload
                                value={establishmentPreviewUrl}
                                onFileChange={handleFileChange}
                                placeholder="Cambiar Foto"
                                previewClassName="h-28 w-full bg-slate-50 border-dashed border-2 rounded-xl"
                            />
                            {errors.establishment_img && (
                                <p className="text-[10px] text-red-500">{errors.establishment_img}</p>
                            )}
                        </div>

                        {/* CAMPOS DE TEXTO */}
                        <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-xl">
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-slate-600">Nombre Comercial</Label>
                                    <Input
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Ej. Distribuidora San Juan S.A.C."
                                        className={errors.name ? 'border-red-500 h-9 rounded-lg' : 'h-9 rounded-lg'}
                                    />
                                    {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-slate-600">RUC</Label>
                                        <Input
                                            value={data.ruc}
                                            onChange={e => setData('ruc', e.target.value)}
                                            placeholder="20XXXXXXXXX"
                                            className="h-9 rounded-lg"
                                        />
                                        {errors.ruc && <p className="text-[10px] text-red-500">{errors.ruc}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-slate-600">Ciudad / Región</Label>
                                        <Input
                                            value={data.region}
                                            onChange={e => setData('region', e.target.value)}
                                            placeholder="Ej. Lima, Arequipa..."
                                            className="h-9 rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-slate-600">Dirección Exacta</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                            placeholder="Av. Las Magnolias 123..."
                                            className="pl-9 h-9 rounded-lg"
                                        />
                                    </div>
                                    {errors.address && <p className="text-[10px] text-red-500">{errors.address}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-slate-600">Teléfono</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                value={data.phone}
                                                onChange={e => setData('phone', e.target.value)}
                                                placeholder="987654321"
                                                className="pl-9 h-9 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-slate-600">Email de Contacto</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                placeholder="contacto@empresa.com"
                                                className="pl-9 h-9 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100 my-2" />

                                {/* CAMPO DE ESTADO ACTIVO/INACTIVO */}
                                <div className="flex items-center justify-between py-1">
                                    <div className="space-y-0.5">
                                        <Label className="text-[11px] font-semibold text-slate-700">Estado del Distribuidor</Label>
                                        <p className="text-[10px] text-slate-500 leading-none">Define si aparecerá en el mapa público</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold uppercase ${data.is_active ? 'text-black' : 'text-slate-400'}`}>
                                            {data.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                        <Switch
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                            className="data-[state=checked]:bg-black"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* COLUMNA DERECHA: MAPA RESPONSIVE */}
                    <div className="lg:col-span-8 min-h-[350px] lg:h-full rounded-2xl overflow-hidden border-2 border-white shadow-2xl relative bg-slate-200">
                        <DistributorsMap
                            onPositionChange={(latlng) => {
                                setData(prev => ({ ...prev, lat: latlng.lat, lng: latlng.lng }));
                            }}
                            initialCoords={{ lat: data.lat, lng: data.lng }}
                        />

                        {/* Coordenadas flotantes adaptadas al mockup exacto */}
                        <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
                            <div className="flex gap-1.5">
                                <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-200/50 shadow-sm flex items-center gap-1.5">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">LAT</span>
                                    <span className="text-xs font-mono font-bold text-slate-800">{data.lat.toFixed(5)}</span>
                                </div>
                                <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-200/50 shadow-sm flex items-center gap-1.5">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">LNG</span>
                                    <span className="text-xs font-mono font-bold text-slate-800">{data.lng.toFixed(5)}</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleResetLocation}
                                className="bg-white/95 backdrop-blur-sm text-slate-700 shadow-lg border border-slate-200/50 flex items-center gap-2 px-3 h-9 transition-all duration-300 hover:bg-[#44AC34] hover:text-white group hover:border-transparent rounded-lg"
                            >
                                <RefreshCcw className="h-3.5 w-3.5 text-[#44AC34] transition-colors group-hover:text-white" />
                                <span className="text-[11px] font-bold">Restablecer</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}