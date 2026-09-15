'use client';

import { RichTextEditor } from '@/components/custom-ui/rich-text-tiptap/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContentSectionProps as Props } from '@/types/content/content';
import { useForm } from '@inertiajs/react';
import { GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Estructura del Item de FAQ
export interface FaqItem {
    id: string | number;
    question: string;
    answer: string;
}

// Estructura global del contenido
export interface FaqsContent {
    title?: string;
    items: FaqItem[];
}

export default function FaqsEditor({ section }: Props) {
    const rawContent = section.content?.content as FaqsContent;

    // Garantizar que todos los ítems iniciales tengan un ID
    const initialItems = rawContent?.items?.map((item, idx) => ({
        ...item,
        id: item.id ?? `faq-${Date.now()}-${idx}`,
    })) ?? [{ id: `faq-${Date.now()}-0`, question: '', answer: '' }];

    const { data, setData, put, processing } = useForm<{
        content: FaqsContent;
    }>({
        content: {
            title: rawContent?.title ?? 'Preguntas frecuentes',
            items: initialItems,
        },
    });

    // 🎯 Estados para el control de Drag and Drop
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Manejar cambio en el título general
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('content', {
            ...data.content,
            title: e.target.value,
        });
    };

    // Agregar una nueva pregunta y hacer scroll al final
    const handleAddFaq = () => {
        const newFaq: FaqItem = {
            id:
                typeof crypto !== 'undefined' && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `faq-${Date.now()}`,
            question: '',
            answer: '',
        };

        const newItems = [...data.content.items, newFaq];
        setData('content', { ...data.content, items: newItems });

        setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth',
            });
        }, 100);
    };

    // Eliminar una pregunta
    const handleRemoveFaq = (index: number) => {
        if (data.content.items.length === 1) {
            toast.warning('Debe haber al menos una pregunta.');
            return;
        }
        const newItems = data.content.items.filter((_, i) => i !== index);
        setData('content', { ...data.content, items: newItems });
    };

    // Actualizar pregunta o respuesta específica
    const handleFaqChange = (
        index: number,
        field: keyof FaqItem,
        value: string,
    ) => {
        const newItems = [...data.content.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setData('content', { ...data.content, items: newItems });
    };

    // 🎯 Funciones de Drag & Drop
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault(); // Necesario para permitir drop
        if (draggedIndex === null || draggedIndex === index) return;
        setDragOverIndex(index);
    };

    const handleDrop = (targetIndex: number) => {
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        const updatedItems = [...data.content.items];
        const [movedItem] = updatedItems.splice(draggedIndex, 1);
        updatedItems.splice(targetIndex, 0, movedItem);

        setData('content', {
            ...data.content,
            items: updatedItems,
        });

        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Guardar en el servidor

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(
            `/content/update/${section.page.slug}/${section.type}/${section.id}`,
            {
                preserveScroll: true,
                onError: (errors) => {
                    console.error(errors);
                },
            },
        );
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-8 pb-12">
            {/* Título de la página */}
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">
                    Título de la página
                </h3>
                <Input
                    type="text"
                    value={data.content.title}
                    onChange={handleTitleChange}
                    placeholder="Ej. Preguntas frecuentes"
                    className="border-slate-200 bg-slate-50/50 py-5 text-base focus:bg-white"
                />
            </div>

            {/* Bloque Preguntas y Respuestas */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900">
                    Preguntas y respuestas
                </h3>

                {/* Grid de Preguntas */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {data.content.items.map((item, index) => {
                        const isDragging = draggedIndex === index;
                        const isOver = dragOverIndex === index;

                        return (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={() => setDragOverIndex(null)}
                                onDrop={() => handleDrop(index)}
                                onDragEnd={handleDragEnd}
                                className={`flex flex-col justify-between space-y-4 rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200 ${
                                    isDragging
                                        ? 'scale-95 border-dashed border-primary opacity-40'
                                        : isOver
                                          ? 'scale-[1.02] border-2 border-primary bg-primary/5 shadow-md'
                                          : 'border-slate-200'
                                }`}
                            >
                                {/* Cabecera de la Card */}
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                        <GripVertical
                                            size={18}
                                            className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing"
                                        />
                                        <span>Pregunta {index + 1}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFaq(index)}
                                        className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                                        title="Eliminar pregunta"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Input Pregunta */}
                                <div className="space-y-1.5">
                                    <Input
                                        type="text"
                                        value={item.question}
                                        onChange={(e) =>
                                            handleFaqChange(
                                                index,
                                                'question',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="¿Cuál es tu pregunta?"
                                        className="border-slate-200 bg-slate-50/50 text-sm focus:bg-white"
                                    />
                                </div>

                                {/* Input Respuesta (RichTextEditor) */}
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500">
                                        Respuesta
                                    </label>
                                    <RichTextEditor
                                        key={`editor-${item.id}`}
                                        value={item.answer ?? ''}
                                        onChange={(val) =>
                                            handleFaqChange(
                                                index,
                                                'answer',
                                                val,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Botón de Agregar Pregunta */}
                <div className="flex justify-center pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddFaq}
                        className="w-full gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-6 text-base font-semibold text-slate-600 hover:border-primary hover:bg-primary/5 hover:text-primary"
                    >
                        <Plus size={18} />
                        Agregar Nueva Pregunta
                    </Button>
                </div>
            </div>

            {/* Botón Guardar */}
            <div className="flex justify-end pt-4">
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
