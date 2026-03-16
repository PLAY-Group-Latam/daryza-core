import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import DistributorsMap from '@/components/custom-ui/distributors/DistributorsMap'

export default function Index() {

    return (

        <AppLayout>

            <Head title="Distribuidores Autorizados" />

            <div className="flex flex-1 flex-col gap-6">

                <h1 className="text-xl font-semibold">
                    Crear un Distribuidor Autorizado
                </h1>

                <DistributorsMap />

            </div>

        </AppLayout>

    )
}