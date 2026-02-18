'use client';

import { useForm } from '@inertiajs/react';
import { Save, LayoutPanelTop, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload } from '@/components/custom-ui/upload';
import { ContentSectionProps as Props, BrandItem, BrandsContent } from '../../../../../types/content/content';

export default function BrandsEditor({ section }: Props) {
  const rawContent = section.content?.content;

  const initialContent: BrandsContent =
    rawContent && 'brands' in rawContent
      ? (rawContent as BrandsContent)
      : { brands: [] };

  const { data, setData, processing, put } = useForm<{ content: BrandsContent }>({
    content: initialContent,
  });

  const addBrand = () => {
    setData('content', {
      brands: [...data.content.brands, { image: null, name: '' }],
    });
  };

  const removeBrand = (index: number) => {
    setData('content', {
      brands: data.content.brands.filter((_, i) => i !== index),
    });
  };

  const updateBrand = (index: number, key: keyof BrandItem, value: any) => {
    const updated = [...data.content.brands];
    updated[index] = { ...updated[index], [key]: value };
    setData('content', { brands: updated });
  };

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  console.log('📤 data.content antes de enviar:', JSON.stringify(data.content, null, 2));
  console.log('🔗 URL:', `/content/update/${section.page.slug}/${section.type}/${section.id}`);

  data.content.brands.forEach((brand, i) => {
    console.log(`Brand ${i}:`, {
      image: brand.image,
      isFile: brand.image instanceof File,
      isString: typeof brand.image === 'string',
      name: brand.name,
    });
  });

  put(
    `/content/update/${section.page.slug}/${section.type}/${section.id}`,
    {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: (page) => {
        console.log('✅ Success, brands guardadas:', page.props.section);
        toast.success('¡Marcas guardadas!');
      },
      onError: (errors) => {
        console.error('❌ Errores:', errors);
        toast.error('Error de validación.');
      },
    }
  );
};
  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <LayoutPanelTop size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Configuración de {section.name}
              </h3>
              <p className="text-sm text-slate-500">
                Administra las marcas aliadas que se muestran en el home.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {data.content.brands.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center rounded-xl border-2 border-dashed border-slate-200">
              <p className="text-sm font-medium text-slate-400">
                No hay marcas agregadas aún
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {data.content.brands.map((brand, index) => (
                <div
                  key={index}
                  className="relative group flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50"
                >
                  <button
                    type="button"
                    onClick={() => removeBrand(index)}
                    className="absolute -top-2 -right-2 z-10 flex size-6 items-center justify-center rounded-full bg-red-500 text-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>

                  <Upload
                    value={brand.image}
                    onFileChange={(file) => updateBrand(index, 'image', file)}
                    previewClassName="!w-full !aspect-square !rounded-lg !object-contain !border-0 !bg-white"
                  />

                  <input
                    type="text"
                    placeholder="Nombre de la marca"
                    value={brand.name}
                    onChange={(e) => updateBrand(index, 'name', e.target.value)}
                    className="w-full text-center text-xs font-medium text-slate-700 bg-transparent border-b border-slate-200 focus:outline-none focus:border-primary pb-1"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addBrand}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm font-semibold text-slate-500 transition-colors hover:border-primary hover:text-primary"
          >
            <Plus size={18} />
            Agregar marca
          </button>
        </div>
      </div>

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