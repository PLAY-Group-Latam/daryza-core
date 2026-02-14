import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import ModalEditor from '@/components/custom-ui/content/editors/home/ModalEditor';

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


const EDITOR_COMPONENTS: Record<string, React.ComponentType<any>> = {
    'home_modal': ModalEditor,
 
};

export default function EditSection({ section }: Props) {
   
    const EditorComponent = EDITOR_COMPONENTS[section.type];

    return (
        <AppLayout>
            <Head title={`Editar ${section.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/content/items" 
                            className="rounded-full p-2 transition-colors hover:bg-accent"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">
                                {section.name}
                            </h1>
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                {section.page?.title || 'Sección'} 
                            </p>
                        </div>
                    </div>
                </div>

                {/* Renderizar el editor dinámicamente */}
                <div className="mx-auto w-full max-w-4xl">
                    {EditorComponent ? (
                        <EditorComponent section={section} />
                    ) : (
                        <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-border bg-card py-20 text-center">
                            <div className="rounded-full bg-muted p-4">
                                <svg
                                    className="h-12 w-12 text-muted-foreground"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-foreground">
                                    Editor no configurado
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Aún no hay editor definido para el tipo:{' '}
                                    <span className="font-mono font-medium text-foreground">
                                        
                                    </span>
                                </p>
                               
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}