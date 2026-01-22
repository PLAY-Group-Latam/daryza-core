import FormProduct from '@/components/custom-ui/products/items-table/FormProduct';
import AppLayout from '@/layouts/app-layout';
import { CategorySelect } from '@/types/products';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Create() {
    const { categories } = usePage<{
        categories: CategorySelect[];
    }>().props;

    return (
        <AppLayout>
            <Head title="Crear Producto" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold lg:text-2xl">
                        Crear Producto
                    </h1>

                    <Link className="text-sm text-muted-foreground hover:underline">
                        ← Volver a la lista
                    </Link>
                </div>

                <FormProduct categories={categories} />
                {/* 
                  Aquí después vamos a ir agregando:
                  - Formulario de información básica
                  - Variantes
                  - Imágenes
                  - SEO
                  - Especificaciones
                */}
            </div>
        </AppLayout>
    );
}
