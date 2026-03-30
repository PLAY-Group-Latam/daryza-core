import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import TableList from '@/components/custom-ui/distributors/TableList';
import { Distributor } from '@/types/distributors/distributors';
import LogoPinModal from '@/components/custom-ui/distributors/LogoPinModal';
import { MapPin } from 'lucide-react';

interface MapPinSetting {
    url: string | null;
    path: string | null;
}

export default function Index() {
    const { paginatedDistributors, filters, mapPin } = usePage<{
        paginatedDistributors: Paginated<Distributor>;
        filters: { search?: string };
        mapPin: MapPinSetting;
    }>().props;

    const [pinModalOpen, setPinModalOpen] = useState(false);

    return (
        <AppLayout>
            <Head title="Distribuidores" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between px-4 pt-4">
                    <div>
                        <h1 className="text-lg font-bold lg:text-2xl">
                            Distribuidores Autorizados
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona las ubicaciones y puntos de venta.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Botón pin global */}
                        <Button
                            variant="outline"
                            className="gap-2 border-dashed"
                            onClick={() => setPinModalOpen(true)}
                        >
                            {/* Miniatura del pin actual */}
                            <span className="relative h-5 w-4 shrink-0">
                                {mapPin?.url ? (
                                    <span
                                        className="absolute inset-0 h-full w-full"
                                        style={{
                                            backgroundImage: `url('${mapPin.url}')`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            WebkitMaskImage: "url('/images/distributors/marker-icon.svg')",
                                            maskImage: "url('/images/distributors/marker-icon.svg')",
                                            WebkitMaskSize: 'contain',
                                            maskSize: 'contain',
                                            WebkitMaskRepeat: 'no-repeat',
                                            maskRepeat: 'no-repeat',
                                        }}
                                    />
                                ) : (
                                    <img
                                        src="/images/distributors/marker-icon.svg"
                                        className="absolute inset-0 h-full w-full opacity-50"
                                        alt="pin"
                                    />
                                )}
                            </span>
                            <MapPin className="h-3.5 w-3.5" />
                            Pin del Mapa
                        </Button>

                        {/* Botón crear distribuidor */}
                        <Button
                            className="bg-black shadow-md hover:bg-slate-800 transition-all"
                            onClick={() => router.get('/distributors/create')}
                        >
                            Crear Nuevo Distribuidor
                        </Button>
                    </div>
                </div>

                <TableList
                    data={paginatedDistributors}
                    filters={filters}
                />
            </div>

            <LogoPinModal
                open={pinModalOpen}
                onClose={() => setPinModalOpen(false)}
                currentPinUrl={mapPin?.url ?? null}
            />
        </AppLayout>
    );
}