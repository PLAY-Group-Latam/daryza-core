'use client';

import { router } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import * as React from 'react';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Plus, Image as ImageIcon, Loader2 } from 'lucide-react';

// Define aquí la URL de tu imagen por defecto
const DEFAULT_IMAGE = 'https://placehold.co/400x400/f1f5f9/94a3b8?text=Sin+Imagen';

export function BlogProductSearch({ searchResults = [], onSelect }: any) {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const filteredResults = React.useMemo(() => {
        if (!searchTerm || searchTerm.length < 1) return searchResults;
        const lower = searchTerm.toLowerCase();
        return searchResults.filter((r: any) =>
            r.product_name?.toLowerCase().includes(lower) ||
            r.sku?.toLowerCase().includes(lower)
        );
    }, [searchResults, searchTerm]);

    const handleSearch = React.useMemo(
        () => debounce((q: string) => {
            if (q.length < 1) return;
            setIsLoading(true);
            router.get(window.location.pathname, { q }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['searchResults'],
                onFinish: () => setIsLoading(false),
            });
        }, 350), []
    );

    const handleChange = (val: string) => {
        setSearchTerm(val);
        setOpen(true);
        if (val.length === 0) setIsLoading(false);
        handleSearch(val);
    };

    const containerRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const showDropdown = open && searchTerm.length >= 1;

    return (
        <div ref={containerRef} className="relative w-full max-w-lg mx-auto mb-8">
            <Command shouldFilter={false} className="rounded-2xl border-2 border-slate-200 shadow-sm bg-white overflow-visible">
                <div className="relative">
                    <CommandInput
                        placeholder="Buscar por nombre"
                        value={searchTerm}
                        onValueChange={handleChange}
                        onFocus={() => setOpen(true)}
                        className="h-14 border-none focus:ring-0 text-base pr-10"
                    />
                    {isLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Loader2 size={18} className="animate-spin" />
                        </div>
                    )}
                </div>

                {showDropdown && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] max-h-[400px] overflow-hidden">
                        <CommandList className="max-h-[400px] overflow-y-auto">
                            {filteredResults.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 italic text-sm">
                                    {isLoading ? 'Buscando...' : 'No se encontraron productos'}
                                </div>
                            ) : (
                                <CommandGroup
                                    heading={`${filteredResults.length} resultado${filteredResults.length !== 1 ? 's' : ''}`}
                                    className="p-2"
                                >
                                    {filteredResults.map((res: any) => (
                                        <CommandItem
                                            key={res.product_id}
                                            value={`${res.product_name}-${res.product_id}`}
                                            onSelect={() => {
                                                onSelect(res);
                                                setOpen(false);
                                                setSearchTerm('');
                                            }}
                                            className="flex items-center gap-4 p-3 cursor-pointer hover:bg-slate-50 border-b last:border-0 border-slate-100 rounded-xl mb-1 group"
                                        >
                                            {/* CONTENEDOR DE IMAGEN MODIFICADO */}
                                            <div className="relative h-12 w-12 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                <img 
                                                    src={res.image || DEFAULT_IMAGE} 
                                                    alt={res.product_name} 
                                                    className="h-full w-full object-cover"
                                                    // Manejo de error por si la URL de la imagen está rota
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                                                    }}
                                                />
                                            </div>

                                            <div className="flex flex-col flex-1 text-left min-w-0">
                                                <span className="font-bold text-slate-900 truncate text-sm">
                                                    <Highlight text={res.product_name} query={searchTerm} />
                                                </span>
                                                <span className="text-xs font-bold text-primary">${res.active_price}</span>
                                            </div>

                                            <div className="bg-primary/10 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                                                <Plus size={16} />
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </div>
                )}
            </Command>
        </div>
    );
}

function Highlight({ text = '', query = '' }: { text: string; query: string }) {
    if (!query) return <>{text}</>;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase()
                    ? <mark key={i} className="bg-primary/20 text-primary rounded px-0.5 not-italic">{part}</mark>
                    : part
            )}
        </>
    );
}