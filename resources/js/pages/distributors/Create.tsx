import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { MapPin, Phone, Mail, ChevronLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from '@/components/custom-ui/upload';
import DistributorsMap from '@/components/custom-ui/distributors/DistributorsMap';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        region: '',
        lat: -12.0464,
        lng: -77.0428,
        ruc: '',
        address: '',
        email: '',
        phone: '',
        establishment_img: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/distributors');
    };

    return (
        <AppLayout>
            <Head title="Crear Distribuidor" />

            <form onSubmit={handleSubmit} className="flex h-[calc(100vh-64px)] flex-col gap-4 p-6 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild className="rounded-full">
                            <Link href="/distributors"><ChevronLeft className="h-5 w-5" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Nuevo Distribuidor</h1>
                            <p className="text-xs text-muted-foreground leading-none">Completa los datos y ubica en el mapa</p>
                        </div>
                    </div>
                    <Button type="submit" disabled={processing} className="bg-[#44AC34] hover:bg-[#388e2a] px-6">
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Registro
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">

                    {/* COLUMNA IZQUIERDA: FORMULARIO */}
                    <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-2 custom-scrollbar">

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Foto del Establecimiento</Label>
                            <Upload
                                value={data.establishment_img}
                                onFileChange={(file) => setData('establishment_img', file)}
                                placeholder="Foto del Local"
                                previewClassName="h-28 w-full bg-slate-50 border-dashed border-2"
                            />
                        </div>

                        <Card className="border-none shadow-sm ring-1 ring-slate-200">
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-slate-600">Nombre Comercial</Label>
                                    <Input
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Ej. Distribuidora San Juan S.A.C."
                                        className="h-9"
                                    />
                                    {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-slate-600">RUC</Label>
                                        <Input
                                            value={data.ruc}
                                            onChange={e => setData('ruc', e.target.value)}
                                            placeholder="20XXXXXXXXX"
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-slate-600">Ciudad / Región</Label>
                                        <Input
                                            value={data.region}
                                            onChange={e => setData('region', e.target.value)}
                                            placeholder="Ej. Lima, Arequipa..."
                                            className="h-9"
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
                                            placeholder="Av. Las Magnolias 123, Int 4..."
                                            className="pl-9 h-9"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-slate-600">Teléfono</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                value={data.phone}
                                                onChange={e => setData('phone', e.target.value)}
                                                placeholder="987654321"
                                                className="pl-9 h-9"
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
                                                className="pl-9 h-9"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* COLUMNA DERECHA: MAPA */}
                    <div className="lg:col-span-8 h-full rounded-2xl overflow-hidden border-2 border-white shadow-2xl relative bg-slate-200">
                        <DistributorsMap
                            onPositionChange={(latlng) => {
                                setData(prev => ({ ...prev, lat: latlng.lat, lng: latlng.lng }));
                            }}
                            initialCoords={{ lat: data.lat, lng: data.lng }}
                        />
                        <div className="absolute top-4 right-4 z-[1000] flex gap-2">
                            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white shadow-sm flex items-center gap-2">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">LAT</span>
                                <span className="text-xs font-mono font-bold">{data.lat.toFixed(5)}</span>
                            </div>
                            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white shadow-sm flex items-center gap-2">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">LNG</span>
                                <span className="text-xs font-mono font-bold">{data.lng.toFixed(5)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}