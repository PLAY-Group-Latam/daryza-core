import DistributorsMap from '@/components/custom-ui/distributors/DistributorsMap';
import { Upload } from '@/components/custom-ui/upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Mail, MapPin, Phone, Save } from 'lucide-react';


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
        is_active: true,
    });

  

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/distributors');
    };

    return (
        <AppLayout>
            <Head title="Crear Distribuidor" />

            {/* Ajuste de scroll y altura para que en móvil sea scrollable global y en desktop sea fijo */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 overflow-y-auto p-4 lg:h-[calc(100vh-64px)] lg:overflow-hidden lg:p-6"
            >
                {/* Header Responsive Parcheado sin desbordes */}
                <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="shrink-0 rounded-full"
                        >
                            <Link href="/distributors">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="min-w-0">
                            <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg lg:text-xl">
                                Nuevo Distribuidor
                            </h1>
                            <p className="truncate text-[10px] leading-none text-muted-foreground sm:text-xs">
                                Completa los datos y ubica en el mapa
                            </p>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="h-10 w-full shrink-0 bg-[#44AC34] px-6 text-sm hover:bg-[#388e2a] md:w-auto"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Registro
                    </Button>
                </div>

                {/* Grid que cambia de 1 columna (móvil) a 12 columnas (escritorio) */}
                <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-12 lg:overflow-hidden">
                    {/* COLUMNA IZQUIERDA: FORMULARIO */}
                    <div className="custom-scrollbar space-y-4 lg:col-span-4 lg:overflow-y-auto lg:pr-2">
                        <div className="space-y-2">
                            <Label className="ml-1 text-[10px] font-bold text-slate-500 uppercase">
                                Foto del Establecimiento
                            </Label>
                            <Upload
                                value={data.establishment_img}
                                onFileChange={(file) =>
                                    setData('establishment_img', file)
                                }
                                placeholder="Foto del Local"
                                previewClassName="h-28 w-full bg-slate-50 border-dashed border-2"
                            />
                        </div>

                        <Card className="border-none shadow-sm ring-1 ring-slate-200">
                            <CardContent className="space-y-4 p-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-slate-600">
                                        Nombre Comercial
                                    </Label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="Ej. Distribuidora San Juan S.A.C."
                                        className="h-9"
                                    />
                                    {errors.name && (
                                        <p className="text-[10px] text-red-500">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-1">
                                    
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-slate-600">
                                            Departamento, Provincia o Distrito
                                        </Label>
                                        <Input
                                            value={data.region}
                                            onChange={(e) =>
                                                setData(
                                                    'region',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ej. Lima, Lima, Ate"
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-slate-600">
                                        Dirección Exacta
                                    </Label>
                                    <div className="relative">
                                        <MapPin className="absolute top-2.5 left-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            value={data.address}
                                            onChange={(e) =>
                                                setData(
                                                    'address',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Av. Las Magnolias 123, Int 4..."
                                            className="h-9 pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-slate-600">
                                            Teléfono
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute top-2.5 left-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        'phone',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="987654321"
                                                className="h-9 pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-slate-600">
                                            Email de Contacto
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute top-2.5 left-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="contacto@empresa.com"
                                                className="h-9 pl-9"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
                                    <div className="space-y-0.5">
                                        <Label className="text-[11px] font-semibold text-slate-600">
                                            Estado del Distribuidor
                                        </Label>
                                        <p className="text-[10px] text-muted-foreground">
                                            Define si el distribuidor aparecerá
                                            activo en el mapa público.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-[10px] font-bold uppercase ${data.is_active ? 'text-black' : 'text-slate-400'}`}
                                        >
                                            {data.is_active
                                                ? 'Activo'
                                                : 'Inactivo'}
                                        </span>
                                        <Switch
                                            checked={data.is_active}
                                            onCheckedChange={(checked) =>
                                                setData('is_active', checked)
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* COLUMNA DERECHA: MAPA RESPONSIVE */}
                    <div className="relative min-h-[350px] overflow-hidden rounded-2xl border-2 border-white bg-slate-200 shadow-2xl lg:col-span-8 lg:h-full">
                        <DistributorsMap
                            onPositionChange={(latlng) => {
                                setData('lat', latlng.lat);
                                setData('lng', latlng.lng);
                            }}
                            initialCoords={{ lat: data.lat, lng: data.lng }}
                        />

                        {/* Coordenadas flotantes ocultas en móviles muy pequeños */}
                        <div className="xs:flex absolute top-4 right-4 z-[1000] hidden gap-2">
                            <div className="flex items-center gap-2 rounded-lg border border-white bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">
                                    LAT
                                </span>
                                <span className="font-mono text-xs font-bold">
                                    {data.lat.toFixed(5)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border border-white bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">
                                    LNG
                                </span>
                                <span className="font-mono text-xs font-bold">
                                    {data.lng.toFixed(5)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
