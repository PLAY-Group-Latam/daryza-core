'use client';

import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, AlertCircle } from 'lucide-react';

// Importación de los editores
import ModalEditor from '@/components/custom-ui/content/editors/home/ModalEditor';
import BannerDinamicoEditor from '@/components/custom-ui/content/editors/home/BannerDinamicoEditor';

interface Props {
    section: {
        id: number;
        name: string;
        type: string;
        content: {
            content: any;
        };
        page?: {
            title: string;
            slug: string;
        };
    };
}

/**
 * Mapeo de componentes según el tipo de sección.
 * IMPORTANTE: La llave debe coincidir EXACTAMENTE con el 'type' de la BD.
 */
const EDITOR_COMPONENTS: Record<string, React.ComponentType<any>> = {
    'home_modal': ModalEditor,
    'home_banner': BannerDinamicoEditor, // Cambiado de 'home_banner_dinamico' a 'home_banner'
};

export default function EditSection({ section }: Props) {
    // Si section.type es "home_banner", ahora sí encontrará el componente
    const EditorComponent = EDITOR_COMPONENTS[section.type];

    return (
        <AppLayout>
            <Head title={`Editar ${section.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8">
                
                {/* Cabecera de la Página */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/content/items" 
                            className="rounded-full p-2 transition-colors hover:bg-slate-100 text-slate-500"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                {section.name}
                            </h1>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                {section.page?.title || 'Sección de Contenido'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Renderizado del Editor Correspondiente */}
                <div className="mx-auto w-full max-w-5xl">
                    {EditorComponent ? (
                        <EditorComponent section={section} />
                    ) : (
                        /* Estado vacío: Cuando no existe un editor registrado para el 'type' */
                        <div className="flex flex-col items-center gap-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-24 text-center">
                            <div className="rounded-2xl bg-white p-4 shadow-sm text-slate-400">
                                <AlertCircle size={40} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-bold text-slate-900">
                                    Editor no configurado
                                </p>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                    Aún no hay un componente definido para el tipo: 
                                    <code className="ml-1 px-2 py-1 bg-slate-200 rounded text-slate-700 font-mono text-xs text-red-500 font-bold">
                                        {section.type}
                                    </code>
                                </p>
                            </div>
                            <Link 
                                href="/content/items"
                                className="text-sm font-bold text-slate-900 underline underline-offset-4 hover:text-slate-700"
                            >
                                Volver al listado
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}