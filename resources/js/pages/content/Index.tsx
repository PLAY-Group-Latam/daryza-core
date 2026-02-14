import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Edit3, 
    Globe, 
    Layers, 
    LayoutTemplate, 
    Search,
    CheckCircle2,
    XCircle,
    ChevronDown,
    Home,
    FileText,
    Briefcase,
    Store,
    ShoppingCart,
    Filter
} from 'lucide-react';
import { useState, useMemo } from 'react';
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

// Tipo para las categorías
interface CategoryConfig {
    label: string;
    icon: LucideIcon;
    slugs: string[];
}

// Categorías de páginas con tipo explícito
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
        slugs: ['trabaja-con-nosotros', 'pagina-contacto', 'servicio-al-cliente', 'contacta-con-un-asesor', 'centro-de-ayuda']
    },
    comercial: {
        label: 'Comercial',
        icon: Store,
        slugs: ['red-de-distribuidores', 'pagina-distribuidores', 'pagina-blog', 'pagina-nosotros']
    },
    ecommerce: {
        label: 'E-Commerce',
        icon: ShoppingCart,
        slugs: ['pagina-filtrado', 'pagina-carrito', 'pagina-checkout', 'pagina-perfil', 'pagina-informativa-producto']
    }
};

export default function Index() {
    const { pages } = usePage<{ pages: PageContent[] }>().props;
    
    const [activePageId, setActivePageId] = useState<number>(pages?.[0]?.id || 0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Filtrar páginas por categoría seleccionada
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

    // Filtrar secciones por búsqueda
    const filteredSections = useMemo(() => {
        if (!activePage) return [];
        if (!searchQuery.trim()) return activePage.sections;
        
        return activePage.sections.filter(section =>
            section.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [activePage, searchQuery]);

    // Helper para obtener badge de estado
    const getSectionStatus = (section: PageSection) => {
        if (!section.is_active) {
            return {
                icon: XCircle,
                text: 'Inactivo',
                className: 'text-muted-foreground bg-muted'
            };
        }
        return {
            icon: CheckCircle2,
            text: 'Activo',
            className: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'
        };
    };

    // Agrupar secciones por tipo
    const groupedSections = useMemo(() => {
        const groups: Record<string, PageSection[]> = {
            visuales: [],
            dinamico: [],
            configuracion: [],
            otros: []
        };

        filteredSections.forEach(section => {
            const type = section.type.toLowerCase();
            if (type.includes('banner') || type.includes('modal') || type.includes('imagen')) {
                groups.visuales.push(section);
            } else if (type.includes('dinamico') || type.includes('marcas') || type.includes('galeria')) {
                groups.dinamico.push(section);
            } else if (type.includes('atributo') || type.includes('config')) {
                groups.configuracion.push(section);
            } else {
                groups.otros.push(section);
            }
        });

        return groups;
    }, [filteredSections]);

    const selectedCategoryData = PAGE_CATEGORIES[selectedCategory];
    const SelectedIcon = selectedCategoryData?.icon || Globe;

    return (
        <AppLayout>
            <Head title="Contenido General" />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                        <LayoutTemplate className="text-primary" size={28} />
                        Contenido General
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona las secciones visuales y el contenido dinámico de tu plataforma.
                    </p>
                </div>

                {/* Dropdown de Categorías + Tabs */}
                <div className="flex flex-col gap-4">
                    {/* Dropdown de Filtro por Categoría */}
                    <div className="relative w-fit">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            <Filter size={16} className="text-muted-foreground" />
                            <SelectedIcon size={16} className="text-primary" />
                            <span>{selectedCategoryData?.label || 'Categoría'}</span>
                            <ChevronDown size={16} className={`text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {dropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setDropdownOpen(false)}
                                />
                                <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg">
                                    <div className="p-2">
                                        {Object.entries(PAGE_CATEGORIES).map(([key, category]) => {
                                            const CategoryIcon = category.icon;
                                            const isSelected = key === selectedCategory;
                                            
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => {
                                                        setSelectedCategory(key);
                                                        setDropdownOpen(false);
                                                        // Auto-seleccionar primera página de la categoría
                                                        const categoryPages = key === 'all' 
                                                            ? pages 
                                                            : pages?.filter(p => category.slugs.includes(p.slug));
                                                        if (categoryPages?.[0]) {
                                                            setActivePageId(categoryPages[0].id);
                                                        }
                                                    }}
                                                    className={`
                                                        flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors
                                                        ${isSelected 
                                                            ? 'bg-primary/10 text-primary font-medium' 
                                                            : 'text-foreground hover:bg-muted'
                                                        }
                                                    `}
                                                >
                                                    <CategoryIcon size={16} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                                                    <span className="flex-1 text-left">{category.label}</span>
                                                    {key !== 'all' && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {pages?.filter(p => category.slugs.includes(p.slug)).length || 0}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Tabs de Páginas Filtradas */}
                    <div className="border-b border-border">
                        <div className="flex gap-1 overflow-x-auto pb-px [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {filteredPages?.map((page) => {
                                const isActive = page.id === activePageId;
                                return (
                                    <button
                                        key={page.id}
                                        onClick={() => {
                                            setActivePageId(page.id);
                                            setSearchQuery('');
                                        }}
                                        className={`
                                            group relative flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors
                                            ${isActive 
                                                ? 'border-primary text-primary' 
                                                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                                            }
                                        `}
                                    >
                                        <Globe size={16} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
                                        <span>{page.title}</span>
                                        <span className={`
                                            rounded-full px-2 py-0.5 text-xs
                                            ${isActive 
                                                ? 'bg-primary/10 text-primary' 
                                                : 'bg-muted text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                                            }
                                        `}>
                                            {page.sections?.length || 0}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Barra de búsqueda */}
                {activePage && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={`Buscar en ${activePage.title}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{filteredSections.length} secciones</span>
                        </div>
                    </div>
                )}

                {/* Secciones Agrupadas */}
                {activePage && (
                    <div className="space-y-8">
                        {Object.entries(groupedSections).map(([groupKey, sections]) => {
                            if (sections.length === 0) return null;
                            
                            const groupTitles: Record<string, string> = {
                                visuales: 'Elementos Visuales',
                                dinamico: 'Contenido Dinámico',
                                configuracion: 'Configuración',
                                otros: 'Otros'
                            };

                            return (
                                <div key={groupKey}>
                                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                        {groupTitles[groupKey]} ({sections.length})
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {sections.map((section) => {
                                            const status = getSectionStatus(section);
                                            const StatusIcon = status.icon;
                                            
                                            return (
                                                <div
                                                    key={section.id}
                                                    className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                                                >
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                                    Sección
                                                                </span>
                                                                <h3 className="text-base font-semibold text-foreground">
                                                                    {section.name}
                                                                </h3>
                                                            </div>
                                                            <Layers
                                                                size={18}
                                                                className="text-muted-foreground transition-colors group-hover:text-primary"
                                                            />
                                                        </div>

                                                
                                                    </div>

                                                    <div className="mt-6 flex items-end justify-end">
                                                      

                                                        <Link
                                                            href={`/content/${activePage.slug}/${section.type}/${section.id}`}
                                                            className="inline-flex items-end gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                                        >
                                                            <Edit3 size={12} />
                                                            EDITAR
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Mensaje cuando no hay resultados */}
                {activePage && filteredSections.length === 0 && searchQuery && (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-20 text-center">
                        <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            No se encontraron secciones que coincidan con "<span className="font-medium text-foreground">{searchQuery}</span>"
                        </p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-4 text-sm text-primary hover:underline"
                        >
                            Limpiar búsqueda
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}