import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Edit3, 
    Globe, 
    Layers, 
    LayoutTemplate, 
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Home,
    FileText,
    Briefcase,
    Store,
    ShoppingCart,
    Filter,
    X,
    ArrowRight
} from 'lucide-react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { LucideIcon } from 'lucide-react';

// Interfaces
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

interface CategoryConfig {
    label: string;
    icon: LucideIcon;
    slugs: string[];
}

// Resultado de búsqueda global
interface GlobalSearchResult {
    section: PageSection;
    page: PageContent;
}

const PAGE_CATEGORIES: Record<string, CategoryConfig> = {
    all: {
        label: 'Todas las páginas',
        icon: Globe,
        slugs: []
    },
    principal: {
        label: 'Principal',
        icon: Home,
        slugs: ['home', 'footer']
    },
    legales: {
        label: 'Legales',
        icon: FileText,
        slugs: ['terminos-condiciones', 'politicas-anticorrupcion', 'libro-reclamaciones']
    },
    servicio: {
        label: 'Servicio',
        icon: Briefcase,
        slugs: [
            'trabaja-con-nosotros',
            'contacto',
            'servicio-cliente',
            'contacta-asesor',
            'centro-ayuda'
        ]
    },
    comercial: {
        label: 'Comercial',
        icon: Store,
        slugs: [
            'red-distribuidores',
            'distribuidores',
            'blog',
            'nosotros'
        ]
    },
    ecommerce: {
        label: 'E-Commerce',
        icon: ShoppingCart,
        slugs: [
            'filtrado',
            'carrito',
            'checkout',
            'perfil',
            'producto-info'
        ]
    }
};

const groupTitles: Record<string, string> = {
    visuales: 'Elementos Visuales',
    dinamico: 'Contenido Dinámico',
    configuracion: 'Configuración',
    otros: 'Otros'
};

export default function Index() {
    const { pages } = usePage<{ pages: PageContent[] }>().props;

    const [activePageId, setActivePageId] = useState<number>(pages?.[0]?.id || 0);
    const [globalSearch, setGlobalSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const tabsRef = useRef<HTMLDivElement>(null);

    // Detectar si se puede scrollear en las tabs
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
    }, [checkScroll, selectedCategory]);

    const scrollTabs = (dir: 'left' | 'right') => {
        const el = tabsRef.current;
        if (!el) return;
        el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    };

    // Filtrar páginas por categoría
    const filteredPages = useMemo(() => {
        if (selectedCategory === 'all') return pages;
        const category = PAGE_CATEGORIES[selectedCategory];
        if (!category) return pages;
        return pages?.filter(page => category.slugs.includes(page.slug)) || [];
    }, [pages, selectedCategory]);

    // Página activa
    const activePage = useMemo(
        () => pages?.find(p => p.id === activePageId),
        [activePageId, pages]
    );

    // Búsqueda global — recorre TODAS las páginas
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

    // Agrupar secciones de la página activa
    const groupedSections = useMemo(() => {
        const groups: Record<string, PageSection[]> = {
            visuales: [],
            dinamico: [],
            configuracion: [],
            otros: []
        };

        activePage?.sections?.forEach(section => {
            const type = section.type.toLowerCase();
            if (type.includes('banner') || type.includes('modal') || type.includes('imagen') || type.includes('image') || type.includes('logo') || type.includes('video')) {
                groups.visuales.push(section);
            } else if (type.includes('dinamico') || type.includes('dynamic') || type.includes('brands') || type.includes('marcas') || type.includes('galeria') || type.includes('promo')) {
                groups.dinamico.push(section);
            } else if (type.includes('atributo') || type.includes('attributes') || type.includes('config') || type.includes('titles') || type.includes('editor')) {
                groups.configuracion.push(section);
            } else {
                groups.otros.push(section);
            }
        });

        return groups;
    }, [activePage]);

    const selectedCategoryData = PAGE_CATEGORIES[selectedCategory];
    const SelectedIcon = selectedCategoryData?.icon || Globe;

    return (
        <AppLayout>
            <Head title="Contenido General" />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-8">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            <LayoutTemplate className="text-primary" size={26} />
                            Contenido General
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona las secciones visuales y el contenido dinámico de tu plataforma.
                        </p>
                    </div>

                    {/* Buscador global — lado derecho del header */}
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

                        {/* Dropdown de resultados */}
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
                                                <div className="flex shrink-0 items-center gap-2">
                                                   
                                                    <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Dropdown + Tabs */}
                {!isGlobalSearchActive && (
                    <div className="flex flex-col gap-3">
                        {/* Dropdown de categoría */}
                        <div className="relative w-fit">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                <Filter size={15} className="text-muted-foreground" />
                                <SelectedIcon size={15} className="text-primary" />
                                <span>{selectedCategoryData?.label || 'Categoría'}</span>
                                <ChevronDown size={15} className={`text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                                    <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-border bg-card shadow-xl">
                                        <div className="p-2">
                                            {Object.entries(PAGE_CATEGORIES).map(([key, category]) => {
                                                const CategoryIcon = category.icon;
                                                const isSelected = key === selectedCategory;
                                                const count = key === 'all'
                                                    ? pages?.length || 0
                                                    : pages?.filter(p => category.slugs.includes(p.slug)).length || 0;

                                                return (
                                                    <button
                                                        key={key}
                                                        onClick={() => {
                                                            setSelectedCategory(key);
                                                            setDropdownOpen(false);
                                                            const categoryPages = key === 'all'
                                                                ? pages
                                                                : pages?.filter(p => category.slugs.includes(p.slug));
                                                            if (categoryPages?.[0]) {
                                                                setActivePageId(categoryPages[0].id);
                                                            }
                                                        }}
                                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                                            isSelected
                                                                ? 'bg-primary/10 text-primary font-medium'
                                                                : 'text-foreground hover:bg-muted'
                                                        }`}
                                                    >
                                                        <CategoryIcon size={15} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                                                        <span className="flex-1 text-left">{category.label}</span>
                                                        <span className={`text-xs tabular-nums ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                                                            {count}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Tabs con flechas de scroll */}
                        <div className="relative flex items-center border-b border-border">
                            {/* Flecha izquierda */}
                            <button
                                onClick={() => scrollTabs('left')}
                                className={`
                                    absolute left-0 z-10 flex h-full items-center px-1 transition-all
                                    ${canScrollLeft
                                        ? 'opacity-100 pointer-events-auto'
                                        : 'opacity-0 pointer-events-none'
                                    }
                                `}
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-colors">
                                    <ChevronLeft size={14} />
                                </span>
                            </button>

                            {/* Tabs */}
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
                                {filteredPages?.map((page) => {
                                    const isActive = page.id === activePageId;
                                    return (
                                        <button
                                            key={page.id}
                                            onClick={() => {
                                                setActivePageId(page.id);
                                            }}
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
                                                isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {page.sections?.length || 0}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Flecha derecha */}
                            <button
                                onClick={() => scrollTabs('right')}
                                className={`
                                    absolute right-0 z-10 flex h-full items-center px-1 transition-all
                                    ${canScrollRight
                                        ? 'opacity-100 pointer-events-auto'
                                        : 'opacity-0 pointer-events-none'
                                    }
                                `}
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-colors">
                                    <ChevronRight size={14} />
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Info de página activa */}
                {!isGlobalSearchActive && activePage && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Globe size={14} />
                            <span className="font-medium text-foreground">{activePage.title}</span>
                            <span>·</span>
                            <span>{activePage.sections?.length || 0} secciones</span>
                        </div>
                    </div>
                )}

                {/* Secciones de la página activa */}
                {!isGlobalSearchActive && activePage && (
                    <div className="space-y-8">
                        {Object.entries(groupedSections).map(([groupKey, sections]) => {
                            if (sections.length === 0) return null;

                            return (
                                <div key={groupKey}>
                                    <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        {groupTitles[groupKey]} <span className="font-normal opacity-60">({sections.length})</span>
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {sections.map((section) => (
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
                                                    <Layers
                                                        size={16}
                                                        className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary mt-0.5"
                                                    />
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
                                </div>
                            );
                        })}
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
                                                {/* Proviene de */}
                                                <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Globe size={10} />
                                                    <span>Proviene de</span>
                                                    <span className="font-semibold text-primary">{page.title}</span>
                                                </div>
                                            </div>
                                            <Layers size={16} className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary mt-0.5" />
                                        </div>

                                        <div className="mt-5 flex items-center justify-between">
                                         

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