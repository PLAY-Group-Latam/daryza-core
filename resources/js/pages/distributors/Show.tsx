import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { 
    MapPin, Phone, Mail, FileText, Hash, 
    ChevronLeft, Globe, Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Distributor } from '@/types/distributors/distributors';
import DistributorsMap from '@/components/custom-ui/distributors/DistributorsMap';

interface Props {
    distributor: Distributor;
}

export default function Show({ distributor }: Props) {
    return (
        <AppLayout>
            <Head title={`Distribuidor - ${distributor.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                
                {/* Header con botón Volver */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/distributors">
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{distributor.name}</h1>
                            <p className="text-sm text-muted-foreground">Detalles del Distribuidor Autorizado</p>
                        </div>
                    </div>
                    <Button asChild className="bg-black">
                        <Link href={`/distributors/${distributor.id}/edit`}>Editar</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Panel de Información */}
                    <div className="space-y-4">
                        {/* Foto del Local */}
                        <Card className="overflow-hidden border-none shadow-md">
                            <div className="h-52 bg-slate-100 relative">
                                {distributor.img_info ? (
                                    <img 
                                        src={distributor.img_info} 
                                        alt={distributor.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                        <Globe className="h-10 w-10 mb-2 opacity-20" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Sin Imagen</span>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Detalles Técnicos */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Info className="h-4 w-4 text-[#44AC34]" />
                                    Información General
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4  ">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Región / RUC</label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{distributor.region}</Badge>
                                        <span className="text-sm font-mono text-slate-600">{distributor.ruc || 'Sin RUC'}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 border-t pt-4">
                                    <MapPin className="h-4 w-4 text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Dirección Física</p>
                                        <p className="text-sm text-slate-500">{distributor.address || 'No registrada'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 border-t pt-4">
                                    <Phone className="h-4 w-4 text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Teléfono de Contacto</p>
                                        <p className="text-sm text-slate-500">{distributor.phone || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 border-t pt-4">
                                    <Mail className="h-4 w-4 text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Correo Electrónico</p>
                                        <p className="text-sm text-slate-500">{distributor.email || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notas adicionales */}
                        {distributor.note && (
                            <div className="rounded-lg bg-amber-50 p-4 border border-amber-100">
                                <div className="flex gap-2">
                                    <FileText className="h-4 w-4 text-amber-600" />
                                    <p className="text-xs text-amber-800 leading-relaxed italic">"{distributor.note}"</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mapa a pantalla completa en el grid */}
                    <div className="lg:col-span-2 min-h-[500px] rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner bg-slate-50">
                        {/* Aquí pasamos las coordenadas al mapa. 
                            Asegúrate que DistributorsMap acepte props de lat/lng 
                            para centrarse automáticamente.
                        */}
                        <DistributorsMap 
                            initialCoords={distributor.coords} 
                            readOnly={true} 
                        />
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}