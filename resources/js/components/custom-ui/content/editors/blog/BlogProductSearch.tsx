'use client';

import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { router } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { Loader2, Plus } from 'lucide-react';
import * as React from 'react';
import { ProductLite } from '@/types/content/content-types';

// --- Interfaces ---

interface ProductResult {
    product_id: number | string;
    product_name: string;
    sku: string;
    image?: string | null;
    active_price: number | string;
  
}

interface BlogProductSearchProps {
    searchResults?: ProductLite[];
    onSelect: (product: ProductLite) => void;
}

const DEFAULT_IMAGE = 'https://placehold.co/400x400/f1f5f9/94a3b8?text=Sin+Imagen';

export function BlogProductSearch({ searchResults = [], onSelect }: BlogProductSearchProps) {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const filteredResults = React.useMemo(() => {
        if (!searchTerm || searchTerm.length < 1) return searchResults;
        const lower = searchTerm.toLowerCase();
        return searchResults.filter(
            (r) =>
                r.product_name?.toLowerCase().includes(lower) ||
                r.sku?.toLowerCase().includes(lower),
        );
    }, [searchResults, searchTerm]);

    const handleSearch = React.useMemo(
        () =>
            debounce((q: string) => {
                if (q.length < 1) return;
                setIsLoading(true);
                router.get(
                    window.location.pathname,
                    { q },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        only: ['searchResults'],
                        onFinish: () => setIsLoading(false),
                    },
                );
            }, 350),
        [],
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
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const showDropdown = open && searchTerm.length >= 1;

    return (
        <div
            ref={containerRef}
            className="relative mx-auto mb-8 w-full max-w-lg"
        >
            <Command
                shouldFilter={false}
                className="overflow-visible rounded-2xl border-2 border-slate-200 bg-white shadow-sm"
            >
                <div className="relative">
                    <CommandInput
                        placeholder="Buscar por nombre y  SKU DARYZA..."
                        value={searchTerm}
                        onValueChange={handleChange}
                        onFocus={() => setOpen(true)}
                        className="h-14 border-none pr-10 text-base focus:ring-0"
                    />
                    {isLoading && (
                        <div className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400">
                            <Loader2 size={18} className="animate-spin" />
                        </div>
                    )}
                </div>

                {showDropdown && (
                    <div className="absolute top-full left-0 z-[100] mt-2 max-h-100 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                        <CommandList className="max-h-100 overflow-y-auto">
                            {filteredResults.length === 0 ? (
                                <div className="p-8 text-center text-sm text-slate-500 italic">
                                    {isLoading
                                        ? 'Buscando...'
                                        : 'No se encontraron productos'}
                                </div>
                            ) : (
                                <CommandGroup
                                    heading={`${filteredResults.length} resultado${filteredResults.length !== 1 ? 's' : ''}`}
                                    className="p-2"
                                >
                                    {filteredResults.map((res) => (
                                        <CommandItem
                                            key={res.product_id}
                                            value={`${res.product_name}-${res.product_id}`}
                                            onSelect={() => {
                                                onSelect(res);
                                                setOpen(false);
                                                setSearchTerm('');
                                            }}
                                            className="group mb-1 flex cursor-pointer items-center gap-4 rounded-xl border-b border-slate-100 p-3 last:border-0 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                                <img
                                                    src={res.image || DEFAULT_IMAGE}
                                                    alt={res.product_name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                                                    }}
                                                />
                                            </div>

                                            <div className="flex min-w-0 flex-1 flex-col text-left">
                                                <span className="truncate text-sm font-bold text-slate-900">
                                                    <Highlight
                                                        text={res.product_name}
                                                        query={searchTerm}
                                                    />
                                                </span>
                                                <span className="text-xs font-bold text-primary">
                                                    S/ {res.active_price}
                                                </span>
                                                <span className="font-mono text-[10px] text-slate-400 uppercase">
                                                    SKU:{' '}
                                                    <Highlight
                                                        text={res.sku}
                                                        query={searchTerm}
                                                    />
                                                </span>
                                            </div>

                                            {/* CIRCULO DE PLUS MODIFICADO: Fondo negro y plus blanco al hacer hover */}
                                            <div className="flex-shrink-0 rounded-full bg-slate-100 p-2 text-white transition-all duration-200 group-hover:bg-slate-900 group-hover:text-white">
                                                <Plus size={16} strokeWidth={3} />
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
    const parts = text.split(
        new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
    );
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <mark
                        key={i}
                        className="rounded bg-primary/20 px-0.5 text-primary not-italic"
                    >
                        {part}
                    </mark>
                ) : (
                    part
                ),
            )}
        </>
    );
}