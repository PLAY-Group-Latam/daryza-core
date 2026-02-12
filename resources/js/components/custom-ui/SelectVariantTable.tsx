import { Button } from '@/components/ui/button';
import { SelectableVariant } from '@/types/products/dynamicCategories';
import { ChevronLeft, ChevronRight, PackageSearch, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
    variants: SelectableVariant[];
    onRemove: (id: string | number) => void;
    pageSize?: number;
}

export function SelectedVariantsTable({
    variants,
    onRemove,
    pageSize = 5,
}: Props) {
    const [currentPage, setCurrentPage] = useState(1);

    // Lógica de paginación simple en memoria
    const totalPages = Math.ceil(variants.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentItems = variants.slice(startIndex, startIndex + pageSize);

    const renderVariantName = (name: string) => {
        const isHex = /^#([A-Fa-f0-9]{3,6})$/.test(name);
        if (isHex) {
            return (
                <div
                    className="h-4 w-4 rounded-full border border-slate-200 shadow-sm"
                    style={{ backgroundColor: name }}
                />
            );
        }
        return <span>{name}</span>;
    };

    return (
        <div className="overflow-hidden rounded-xl border bg-white">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                    <tr>
                        <th className="p-3 text-left">Producto / Variante</th>
                        <th className="p-3 text-left">SKU DARYZA</th>
                        <th className="p-3 text-center">Promo</th>
                        <th className="p-3 text-right">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {currentItems.length > 0 ? (
                        currentItems.map((variant) => (
                            <tr
                                key={variant.id}
                                className="hover:bg-slate-50/50"
                            >
                                <td className="p-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                                            {variant.product_name}
                                        </span>
                                        <div className="font-bold">
                                            {renderVariantName(
                                                variant.variant_name,
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 font-mono text-xs text-slate-500">
                                    {variant.sku}
                                </td>
                                <td className="p-3 text-center">
                                    {variant.is_on_promo ? 'Si' : 'No'}
                                </td>
                                <td className="p-3 text-right">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onRemove(variant.id)}
                                        className="hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={4}
                                className="p-8 text-center text-slate-400"
                            >
                                <PackageSearch className="mx-auto mb-2 h-8 w-8 opacity-20" />
                                No hay productos seleccionados
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Paginación Simple */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t bg-slate-50/50 px-4 py-2">
                    <span className="text-xs text-slate-500">
                        Página {currentPage} de {totalPages}
                    </span>
                    <div className="flex gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
