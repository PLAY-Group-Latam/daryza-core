import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import DistributorsMap from '@/components/custom-ui/distributors/DistributorsMap'
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
export default function Index() {

    return (

        <AppLayout>

            <Head title="Distribuidores Autorizados" />

            <div className="flex flex-1 flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/distributors"><ChevronLeft className="h-4 w-4" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Crear Distribuidor Autorizado</h1>

                        </div>
                    </div>
                </div>



                <DistributorsMap />

            </div>

        </AppLayout>

    )
}