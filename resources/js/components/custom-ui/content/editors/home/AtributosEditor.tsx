'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AtributoItem,
    AtributosContent,
    ContentSectionProps as Props,
} from '@/types/content/content';
import { useForm } from '@inertiajs/react';
import { ImagePlus, LayoutGrid, Save } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

const DEFAULT_ITEMS: AtributoItem[] = [
    {
        id: 1,
        icon: null,
        text: 'Productos certificados con respaldo técnico garantizado',
    },
    { id: 2, icon: null, text: 'Envíos a toda Lima Metropolitana' },
    { id: 3, icon: null, text: 'Servicio postventa comprometido contigo' },
    { id: 4, icon: null, text: 'Pagos 100% seguros y protegidos' },
];

function IconUpload({
    value,
    onChange,
}: {
    value: File | string | null;
    onChange: (file: File) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const preview =
        value instanceof File ? URL.createObjectURL(value) : (value ?? null);

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onChange(file);
                }}
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-primary/60 hover:bg-primary/5"
            >
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="icon"
                            className="h-full w-full object-contain p-1"
                            style={{
                                filter: 'drop-shadow(0px 0px 1px rgba(0,0,0,0.5))',
                            }}
                        />
                        {/* Overlay sutil solo al hacer hover */}
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <ImagePlus size={16} className="text-white" />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400 transition-colors group-hover:text-primary">
                        <ImagePlus size={18} />
                        <span className="text-[9px] font-semibold tracking-wide uppercase">
                            Subir
                        </span>
                    </div>
                )}
            </button>
        </>
    );
}

export default function AtributosEditor({ section }: Props) {
    const rawContent = section.content?.content;

    const isAtributosContent = (content: any): content is AtributosContent =>
        content && Array.isArray(content.items);

    const initialContent: AtributosContent = isAtributosContent(rawContent)
        ? rawContent
        : { items: DEFAULT_ITEMS };

    const { data, setData, put, processing } = useForm<{
        content: AtributosContent;
    }>({
        content: initialContent,
    });

    const updateItem = (index: number, newItem: Partial<AtributoItem>) => {
        const newItems = [...data.content.items];
        newItems[index] = { ...newItems[index], ...newItem };
        setData('content', { ...data.content, items: newItems });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                forceFormData: true,
                preserveScroll: true,
                onError: (errors) => {
                    console.error('Errores:', errors);
                    toast.error('Error al guardar los atributos');
                },
            },
        );
    };

    const items = data.content.items.slice(0, 4);

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Header */}
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <LayoutGrid size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Configuración de {section.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                                4 atributos fijos — edita el ícono y el texto de
                                cada uno.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Vista previa */}
                <div className="px-8 pt-6">
                    <p className="mb-3 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                        Vista previa
                    </p>
                    <div className="grid grid-cols-2 gap-3 overflow-hidden rounded-xl border border-slate-100 lg:grid-cols-4">
                        {items.map((item, i) => {
                            const preview =
                                item.icon instanceof File
                                    ? URL.createObjectURL(item.icon)
                                    : (item.icon ?? null);
                            return (
                                <div
                                    key={item.id}
                                    className={`flex items-center gap-3 px-4 py-4 ${
                                        i % 2 === 0
                                            ? 'bg-primary'
                                            : 'bg-slate-600'
                                    }`}
                                >
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/20">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt=""
                                                className="h-6 w-6 object-contain"
                                            />
                                        ) : (
                                            <div className="h-4 w-4 rounded bg-white/30" />
                                        )}
                                    </div>
                                    {/* ← Aquí el fix: whitespace normal + line-clamp */}
                                    <span className="line-clamp-3 text-xs leading-snug font-semibold break-words whitespace-normal text-white">
                                        {item.text || '…'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Items editor */}
                <div className="space-y-3 p-8">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                        >
                            {/* Número */}
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                                {index + 1}
                            </div>

                            {/* Icon upload limpio */}
                            <div className="flex flex-shrink-0 flex-col items-center gap-1">
                                <span className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                                    Ícono
                                </span>
                                <IconUpload
                                    value={item.icon}
                                    onChange={(file) =>
                                        updateItem(index, { icon: file })
                                    }
                                />
                            </div>

                            {/* Divider */}
                            <div className="h-12 w-px flex-shrink-0 bg-slate-200" />

                            {/* Texto */}
                            <div className="flex-1">
                                <Label className="mb-1.5 block text-[9px] font-semibold tracking-widest text-slate-400 uppercase">
                                    Texto del atributo
                                </Label>
                                <Input
                                    value={item.text}
                                    onChange={(e) =>
                                        updateItem(index, {
                                            text: e.target.value,
                                        })
                                    }
                                    placeholder="Ej: Envíos a toda Lima Metropolitana"
                                    className="text-sm font-medium"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Guardar */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={processing}
                    className="gap-2 rounded-xl px-10 py-6 text-base font-bold shadow-md"
                >
                    <Save size={20} />
                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    );
}
