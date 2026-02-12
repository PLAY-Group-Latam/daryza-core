import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    section: {
        id: number;
        name: string;
        type: string;
        content: {
            content: any; // El JSON del Seeder
        }
    }
}

interface ContentData {
    [key: string]: any;
}

export default function EditSection({ section }: Props) {
    // Inicializamos el formulario con la data que ya existe en el JSON
 const { data, setData, post, processing } = useForm<{ content: ContentData }>({
        content: section.content?.content || {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Ruta manual para evitar líos de librerías
        post(`/content/update/${section.id}`);
    };

    // Función para actualizar campos específicos del JSON sin borrar el resto
  const updateJson = (key: string, value: any) => {
        const newContent: ContentData = { ...data.content };
        newContent[key] = value;
        setData('content', newContent);
    };

    return (
        <AppLayout>
            <Head title={`Editar ${section.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8">
                {/* Header dinámico */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/content/items" 
                            className="p-2 hover:bg-accent rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{section.name}</h1>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">
                                Configuración de sección: {section.type}
                            </p>
                        </div>
                    </div>

                    <Button 
                        onClick={handleSubmit} 
                        disabled={processing}
                        className="gap-2"
                    >
                        <Save size={16} />
                        {processing ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>

                {/* Formulario Dinámico según el TYPE */}
                <div className="max-w-3xl w-full mx-auto bg-card border border-border rounded-xl p-6 shadow-sm">
                    {section.type === 'home_banner' && (
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Título Principal</label>
                                <input 
                                    className="w-full bg-background border border-input p-2 rounded-md focus:ring-2 ring-primary outline-none"
                                    value={data.content.title || ''}
                                    onChange={e => updateJson('title', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subtítulo</label>
                                <textarea 
                                    className="w-full bg-background border border-input p-2 rounded-md focus:ring-2 ring-primary outline-none"
                                    value={data.content.subtitle || ''}
                                    onChange={e => updateJson('subtitle', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {section.type === 'footer_phone' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Número de Contacto</label>
                                <input 
                                    type="tel"
                                    className="w-full bg-background border border-input p-2 rounded-md"
                                    value={data.content.phone || ''}
                                    onChange={e => updateJson('phone', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Caso por defecto si no has programado el TYPE aún */}
                    {!['home_banner', 'footer_phone'].includes(section.type) && (
                        <div className="flex flex-col items-center gap-4 py-10 text-center border-2 border-dashed border-border rounded-lg">
                            <Info className="text-muted-foreground" size={40} />
                            <div>
                                <p className="font-medium">Editor pendiente de diseño</p>
                                <p className="text-sm text-muted-foreground">
                                    Aún no hay inputs definidos para <strong>{section.type}</strong>.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}