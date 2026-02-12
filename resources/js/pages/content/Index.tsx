import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Edit3, Globe, Layers, LayoutTemplate } from 'lucide-react';

// Interfaces para tipar la data que viene del PageSeeder
interface PageSection {
    id: number;
    name: string;
    type: string;
    is_active: boolean;
}

interface PageContent {
    id: number;
    title: string;
    slug: string;
    sections: PageSection[];
}

export default function Index() {
    // Extraemos 'pages' de las props de Inertia
    const { pages } = usePage<{ pages: PageContent[] }>().props;

    return (
        <AppLayout>
            <Head title="Contenido General" />

            <div className="flex flex-1 flex-col gap-8 p-4 lg:p-8">
                {/* Cabecera Principal - Usa text-foreground para adaptarse */}
                <div className="flex flex-col gap-2">
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                        <LayoutTemplate className="text-primary" size={28} />
                        Contenido General
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona las secciones visuales y el contenido dinámico
                        de tu plataforma.
                    </p>
                </div>

                {/* Contenedor de Páginas */}
                <div className="flex flex-col gap-10">
                    {pages && pages.length > 0 ? (
                        pages.map((page) => (
                            <div key={page.id} className="flex flex-col gap-4">
                                {/* Titulo de la Página - Border dinámico */}
                                <div className="flex items-center gap-3 border-b border-border pb-2">
                                    <Globe
                                        size={18}
                                        className="text-primary/70"
                                    />
                                    <h2 className="text-lg font-bold tracking-widest text-foreground/90 uppercase">
                                        {page.title}
                                        <span className="ml-2 text-xs font-normal text-muted-foreground lowercase">
                                            ({page.sections?.length || 0}{' '}
                                            secciones)
                                        </span>
                                    </h2>
                                </div>

                                {/* Grid de Secciones - bg-card es la clave para Light/Dark */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {page.sections?.map((section) => (
                                        <div
                                            key={section.id}
                                            className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-sm"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold tracking-tighter text-muted-foreground uppercase">
                                                        Sección
                                                    </span>
                                                    <Layers
                                                        size={14}
                                                        className="text-muted-foreground transition-colors group-hover:text-primary"
                                                    />
                                                </div>
                                                <h3 className="text-sm font-semibold text-foreground">
                                                    {section.name}
                                                </h3>
                                            </div>

                                            <div className="mt-6 flex items-center justify-between">
                                                <div className="flex flex-col"></div>

                                                {/* Botón con estilo dinámico y URL descriptiva validable */}
                                                <Link
                                                    href={`/content/${page.slug}/${section.id}`}
                                                    className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold ..."
                                                >
                                                    <Edit3 size={12} />
                                                    EDITAR
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-xl border border-dashed border-border bg-muted/30 py-20 text-center">
                            <p className="text-muted-foreground">
                                No se encontraron páginas. Asegúrate de ejecutar
                                el Seeder.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
