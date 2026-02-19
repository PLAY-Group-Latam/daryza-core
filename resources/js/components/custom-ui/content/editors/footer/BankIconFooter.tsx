'use client';

import { useForm } from '@inertiajs/react';
import { Save, ImagePlus, GripVertical, Trash2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ContentSectionProps as Props, BanksFooterContent, BankItem } from '@/types/content/content';
import { useRef, useState } from 'react';

function BankImageUpload({
  value,
  onChange,
}: {
  value: File | string | null;
  onChange: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = value instanceof File ? URL.createObjectURL(value) : value ?? null;

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
        className="group relative w-24 h-14 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50
                   hover:border-primary/60 hover:bg-primary/5 transition-all overflow-hidden flex items-center justify-center"
      >
        {preview ? (
          <>
            <img src={preview} alt="bank" className="w-full h-full object-contain p-1.5" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity
                            flex items-center justify-center rounded-md">
              <ImagePlus size={14} className="text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-primary transition-colors">
            <ImagePlus size={16} />
            <span className="text-[9px] font-semibold uppercase tracking-wide">Subir</span>
          </div>
        )}
      </button>
    </>
  );
}

export default function BanksEditor({ section }: Props) {
  const rawContent = section.content?.content as BanksFooterContent;

  const initialContent: BanksFooterContent = {
    banks: rawContent?.banks ?? [],
  };

  const { data, setData, put, processing } = useForm<{ content: BanksFooterContent }>({
    content: initialContent,
  });

  // Drag and drop state
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const addBank = () => {
    const newItem: BankItem = {
      id: Date.now(),
      image: null,
    };
    setData('content', { banks: [...data.content.banks, newItem] });
  };

  const removeBank = (index: number) => {
    const newBanks = data.content.banks.filter((_, i) => i !== index);
    setData('content', { banks: newBanks });
  };

  const updateBank = (index: number, image: File) => {
    const newBanks = [...data.content.banks];
    newBanks[index] = { ...newBanks[index], image };
    setData('content', { banks: newBanks });
  };

  // Drag handlers
  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === dropIndex) {
      setDragOver(null);
      return;
    }

    const newBanks = [...data.content.banks];
    const dragged = newBanks[dragIndex.current];
    newBanks.splice(dragIndex.current, 1);
    newBanks.splice(dropIndex, 0, dragged);

    setData('content', { banks: newBanks });
    dragIndex.current = null;
    setDragOver(null);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    setDragOver(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(
      `/content/update/${section.page.slug}/${section.type}/${section.id}`,
      {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => toast.success('¡Bancos actualizados!'),
        onError: () => toast.error('Error al guardar'),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Configuración de {section.name}
              </h3>
              <p className="text-sm text-slate-500">
                Agrega, elimina y reordena los métodos de pago arrastrando.
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        {data.content.banks.length > 0 && (
          <div className="px-8 pt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Vista previa
            </p>
            <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              {data.content.banks.map((bank, i) => {
                const preview = bank.image instanceof File
                  ? URL.createObjectURL(bank.image)
                  : bank.image ?? null;
                return (
                  <div key={bank.id} className="w-14 h-10 rounded-md overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                    {preview
                      ? <img src={preview} alt="" className="w-full h-full object-contain p-1" />
                      : <div className="w-6 h-4 bg-slate-200 rounded" />
                    }
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="p-8 space-y-2">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
              Imágenes ({data.content.banks.length})
            </Label>
            <p className="text-[10px] text-slate-400">Arrastra para reordenar</p>
          </div>

          {data.content.banks.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
              No hay imágenes. Agrega una abajo.
            </div>
          )}

          {data.content.banks.map((bank, index) => (
            <div
              key={bank.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-4 p-3 rounded-xl border bg-white transition-all cursor-grab active:cursor-grabbing
                ${dragOver === index
                  ? 'border-primary/50 bg-primary/5 shadow-md scale-[1.01]'
                  : 'border-slate-200 hover:border-primary/30 hover:shadow-sm'
                }`}
            >
              {/* Drag handle */}
              <div className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors">
                <GripVertical size={18} />
              </div>

              {/* Número */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                {index + 1}
              </div>

              {/* Upload */}
              <BankImageUpload
                value={bank.image}
                onChange={(file) => updateBank(index, file)}
              />

              {/* Nombre del archivo */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 truncate">
                  {bank.image instanceof File
                    ? bank.image.name
                    : bank.image
                      ? 'Imagen guardada'
                      : 'Sin imagen'}
                </p>
              </div>

              {/* Eliminar */}
              <button
                type="button"
                onClick={() => removeBank(index)}
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Agregar */}
          <button
            type="button"
            onClick={addBank}
            className="w-full mt-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400
                       hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all
                       flex items-center justify-center gap-2 text-sm font-medium"
          >
            <ImagePlus size={16} />
            Agregar imagen
          </button>
        </div>
      </div>

      {/* Guardar */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={processing}
          className="px-10 py-6 rounded-xl shadow-md gap-2 text-base font-bold"
        >
          <Save size={20} />
          {processing ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}