import { useMemo } from "react";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";

interface ProductLite {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
}

interface ProductItem {
  id: string;
}

interface Props {
  section: any;
  products?: ProductLite[];
}

export default function ProductListEditor({
  section,
  products = [],
}: Props) {

  const safeProducts = Array.isArray(products) ? products : [];

 const initialItems: ProductItem[] = section.content?.content?.items ?? [];

 const { data, setData, put, processing, transform } = useForm({
  items: initialItems,
});

  const selectedIds = useMemo(
    () => new Set(data.items.map((p) => p.id)),
    [data.items]
  );

  const availableProducts = useMemo(
    () => safeProducts.filter((p) => !selectedIds.has(p.id)),
    [safeProducts, selectedIds]
  );

  const addProduct = (product: ProductLite) => {
    if (selectedIds.has(product.id)) return;
    setData("items", [...data.items, { id: product.id }]);
  };

  const removeProduct = (id: string) => {
    setData("items", data.items.filter((item) => item.id !== id));
  };

  const selectedProducts = useMemo(() => {
    return data.items
      .map((item) => safeProducts.find((p) => p.id === item.id))
      .filter(Boolean) as ProductLite[];
  }, [data.items, safeProducts]);


  transform((values) => ({
  content: {
    items: values.items,
  },
}));
const handleSubmit = () => {
    console.log("Enviando productos:", data.items);
  put(`/content/update/${section.page.slug}/${section.type}/${section.id}`, {
    preserveScroll: true,
    onSuccess: () => toast.success("Productos actualizados correctamente"),
    onError: (errors) => {
      console.log(errors);
      toast.error("Error al guardar los productos");
    },
  });
};

  return (
    <div className="space-y-8">

      {/* Productos Disponibles */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Productos Activos</h3>

        {availableProducts.length === 0 && (
          <p className="text-sm text-gray-500">No hay más productos disponibles.</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg overflow-hidden flex flex-col justify-between"
            >
              <div className="h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">Sin imagen</span>
                )}
              </div>

              <div className="p-3 flex flex-col gap-1 flex-1 justify-between">
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">/{product.slug}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addProduct(product)}
                  className="mt-2 text-sm bg-black text-white px-3 py-1 rounded w-full"
                >
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Productos Seleccionados */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Productos Seleccionados</h3>

        {selectedProducts.length === 0 && (
          <p className="text-sm text-gray-500">No hay productos seleccionados.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg overflow-hidden relative bg-gray-50"
            >
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                className="absolute top-2 right-2 text-xs text-red-500 bg-white px-2 py-0.5 rounded shadow z-10"
              >
                Quitar
              </button>

              <div className="h-36 bg-gray-200 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">Sin imagen</span>
                )}
              </div>

              <div className="p-3">
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-gray-500">/{product.slug}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guardar */}
      <div className="pt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={processing}
          className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {processing ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}