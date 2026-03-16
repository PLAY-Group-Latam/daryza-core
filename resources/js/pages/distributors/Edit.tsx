import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Store,MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Distributor } from '@/types/distributors/distributors';
import DistributorsMap from '@/components/custom-ui/distributors/DistributorsMap';

interface Props {
    // Recuerda que si usas DistributorsResource, los datos vienen en .data
   distributor: Distributor;
}

export default function Edit({ distributor }: Props) {
    const data = distributor;

    return (
        <AppLayout>
            <Head title={`Editar - ${data.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/distributors"><ChevronLeft className="h-4 w-4" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Editar Distribuidor</h1>
                            <p className="text-sm text-muted-foreground">Distribuidor Autorizado actual: <span className="font-semibold text-slate-700">{data.name}</span></p>
                        </div>
                    </div>
                </div>

                {/* Steppers de Instrucción */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border rounded-xl p-3 flex items-start gap-3 border-l-4 border-l-[#44AC34]">
                        <span className="bg-[#44AC34] text-white font-bold h-6 w-6 rounded-full flex items-center justify-center text-[10px]">1</span>
                        <p className="text-sm text-slate-500">Mueve el pin en el mapa si el local se ha mudado.</p>
                    </div>
                    <div className="bg-white border rounded-xl p-3 flex items-start gap-3 border-l-4 border-l-[#44AC34]">
                        <span className="bg-[#44AC34] text-white font-bold h-6 w-6 rounded-full flex items-center justify-center text-[10px]">2</span>
                        <p className="text-sm text-slate-500">Haz clic en el botón del globo para confirmar el punto.</p>
                    </div>
                    <div className="bg-white border rounded-xl p-3 flex items-start gap-3 border-l-4 border-l-[#44AC34]">
                        <span className="bg-[#44AC34] text-white font-bold h-6 w-6 rounded-full flex items-center justify-center text-[10px]">3</span>
                        <p className="text-sm text-slate-500">Actualiza los datos en el formulario y guarda.</p>
                    </div>
                </div>

                <div className="h-[650px] w-full overflow-hidden rounded-2xl shadow-xl border border-slate-200">
                    <DistributorsMap 
                        initialCoords={data.coords} 
                        distributor={data} 
                        readOnly={false} 
                    />
                </div>
            </div>
        </AppLayout>
    );
}