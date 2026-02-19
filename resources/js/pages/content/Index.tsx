import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Edit3, 
    Globe, 
    Layers, 
    LayoutTemplate, 
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    ArrowRight
} from 'lucide-react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';

interface PageSection {
    id: number;
    name: string;
    type: string;
    is_active: boolean;
}

interface PageContent {
    id: number;
    title: string;
    slug: string;
    sections: PageSection[];
}

interface GlobalSearchResult {
    section: PageSection;
    page: PageContent;
}

const TAB_ORDER = ['home', 'footer', 'legales', 'contactos', 'nosotros', 'blog', 'sistema'];

export default function Index() {
    const { pages } = usePage<{ pages: PageContent[] }>().props;

    const orderedPages = useMemo(() => {
        return TAB_ORDER
            .map(slug => pages?.find(p => p.slug === slug))
            .filter(Boolean) as PageContent[];
    }, [pages]);

    const [activePageId, setActivePageId] = useState<number>(orderedPages?.[0]?.id || 0);
    const [globalSearch, setGlobalSearch] = useState('');
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const tabsRef = useRef<HTMLDivElement>(null);

    const checkScroll = useCallback(() => {
        const el = tabsRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }, []);

    useEffect(() => {
        const el = tabsRef.current;
        if (!el) return;
        checkScroll();
        el.addEventListener('scroll', checkScroll);
        const ro = new ResizeObserver(checkScroll);
        ro.observe(el);
        return () => {
            el.removeEventListener('scroll', checkScroll);
            ro.disconnect();
        };
    }, [checkScroll]);

    const scrollTabs = (dir: 'left' | 'right') => {
        const el = tabsRef.current;
        if (!el) return;
        el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    };

    const activePage = useMemo(
        () => pages?.find(p => p.id === activePageId),
        [activePageId, pages]
    );

    const globalResults = useMemo((): GlobalSearchResult[] => {
        if (!globalSearch.trim()) return [];
        const q = globalSearch.toLowerCase();
        const results: GlobalSearchResult[] = [];
        pages?.forEach(page => {
            page.sections?.forEach(section => {
                if (
                    section.name.toLowerCase().includes(q) ||
                    section.type.toLowerCase().includes(q)
                ) {
                    results.push({ section, page });
                }
            });
        });
        return results;
    }, [globalSearch, pages]);

    const isGlobalSearchActive = globalSearch.trim().length > 0;

    return (
        <AppLayout>
            <Head title="Contenido General" />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-8">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            <LayoutTemplate className="text-primary" size={26} />
                            Contenido General
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona las secciones visuales y el contenido dinámico de tu plataforma.
                        </p>
                    </div>

                    {/* Buscador global */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Buscar sección en todas las páginas..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        {globalSearch && (
                            <button
                                onClick={() => setGlobalSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}

                        {isGlobalSearchActive && (
                            <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
                                {globalResults.length === 0 ? (
                                    <div className="flex flex-col items-center py-8 text-sm text-muted-foreground">
                                        <Search size={24} className="mb-2 opacity-40" />
                                        <span>Sin resultados para "<span className="font-medium text-foreground">{globalSearch}</span>"</span>
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            {globalResults.length} resultado{globalResults.length !== 1 ? 's' : ''}
                                        </p>
                                        {globalResults.map(({ section, page }) => (
                                            <Link
                                                key={`${page.id}-${section.id}`}
                                                href={`/content/${page.slug}/${section.type}/${section.id}`}
                                                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted group"
                                                onClick={() => setGlobalSearch('')}
                                            >
                                                <div className="flex min-w-0 flex-col gap-0.5">
                                                    <span className="truncate text-sm font-medium text-foreground">
                                                        {section.name}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                        <Globe size={10} />
                                                        <span>Proviene de</span>
                                                        <span className="font-semibold text-primary">{page.title}</span>
                                                    </div>
                                                </div>
                                                <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                {!isGlobalSearchActive && (
                    <div className="relative flex items-center border-b border-border">
                        <button
                            onClick={() => scrollTabs('left')}
                            className={`absolute left-0 z-10 flex h-full items-center px-1 transition-all ${canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-colors">
                                <ChevronLeft size={14} />
                            </span>
                        </button>

                        <div
                            ref={tabsRef}
                            className={`
                                flex gap-0.5 overflow-x-auto pb-px
                                [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
                                transition-all
                                ${canScrollLeft ? 'pl-9' : 'pl-0'}
                                ${canScrollRight ? 'pr-9' : 'pr-0'}
                            `}
                        >
                            {orderedPages.map((page) => {
                                const isActive = page.id === activePageId;
                                return (
                                    <button
                                        key={page.id}
                                        onClick={() => setActivePageId(page.id)}
                                        className={`
                                            group relative flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors
                                            ${isActive
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                                            }
                                        `}
                                    >
                                        <Globe size={14} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
                                        <span>{page.title}</span>
                                        <span className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                                            isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                        }`}>
                                            {page.sections?.length || 0}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => scrollTabs('right')}
                            className={`absolute right-0 z-10 flex h-full items-center px-1 transition-all ${canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-colors">
                                <ChevronRight size={14} />
                            </span>
                        </button>
                    </div>
                )}

                {/* Secciones — en orden exacto del seeder (sort_order) */}
                {!isGlobalSearchActive && activePage && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {activePage.sections?.map((section) => (
                            <div
                                key={section.id}
                                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Sección
                                        </span>
                                        <h3 className="text-sm font-semibold text-foreground leading-snug">
                                            {section.name}
                                        </h3>
                                    </div>
                                    <Layers size={16} className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary mt-0.5" />
                                </div>
                                <div className="mt-5 flex items-end justify-end">
                                    <Link
                                        href={`/content/${activePage.slug}/${section.type}/${section.id}`}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        <Edit3 size={11} />
                                        EDITAR
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Resultados búsqueda global */}
                {isGlobalSearchActive && (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            {globalResults.length === 0
                                ? 'Sin resultados'
                                : <><span className="font-semibold text-foreground">{globalResults.length}</span> resultado{globalResults.length !== 1 ? 's' : ''} para "<span className="font-semibold text-foreground">{globalSearch}</span>"</>
                            }
                        </p>

                        {globalResults.length > 0 && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {globalResults.map(({ section, page }) => (
                                    <div
                                        key={`${page.id}-${section.id}`}
                                        className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                    Sección
                                                </span>
                                                <h3 className="text-sm font-semibold text-foreground leading-snug">
                                                    {section.name}
                                                </h3>
                                                <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Globe size={10} />
                                                    <span>Proviene de</span>
                                                    <span className="font-semibold text-primary">{page.title}</span>
                                                </div>
                                            </div>
                                            <Layers size={16} className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary mt-0.5" />
                                        </div>
                                        <div className="mt-5 flex items-end justify-end">
                                            <Link
                                                href={`/content/${page.slug}/${section.type}/${section.id}`}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                                            >
                                                <Edit3 size={11} />
                                                EDITAR
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {globalResults.length === 0 && (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-20 text-center">
                                <Search className="mb-3 h-10 w-10 text-muted-foreground opacity-40" />
                                <p className="text-sm text-muted-foreground">
                                    No se encontraron secciones que coincidan con "<span className="font-medium text-foreground">{globalSearch}</span>"
                                </p>
                                <button
                                    onClick={() => setGlobalSearch('')}
                                    className="mt-4 text-sm text-primary hover:underline"
                                >
                                    Limpiar búsqueda
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}