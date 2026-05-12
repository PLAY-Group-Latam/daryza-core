'use client';

import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, AlertCircle, Puzzle, ChevronRight } from 'lucide-react';

// Importación de los editores
import ModalEditor from '@/components/custom-ui/content/editors/home/ModalEditor';
import BannerDinamicoEditor from '@/components/custom-ui/content/editors/home/BanneDynamicEditor';
import BrandsEditor from '@/components/custom-ui/content/editors/home/BrandsEditor';
import ImagenPromocionalEditor from '@/components/custom-ui/content/editors/home/ImagePromEditor';
import ImagenesPromocionalesEditor from '@/components/custom-ui/content/editors/home/ImagesDynamicsEditor';
import AtributosEditor from '@/components/custom-ui/content/editors/home/AtributosEditor';
import TituloSectionEditor from '@/components/custom-ui/content/editors/home/TitleSectionEditor';
import LogoHeaderEditor from '@/components/custom-ui/content/editors/footer/LogoHeaderEditor';
import ContactInfoEditor from '@/components/custom-ui/content/editors/footer/ContanctInfoEdito';
import LogoFooterEditor from '@/components/custom-ui/content/editors/footer/LogoFooterEditor';
import SocialsEditor from '@/components/custom-ui/content/editors/footer/SocialsEditor';
import TermsConditionsEditor from '@/components/custom-ui/content/editors/legals/TermConditionEditor';
import PrivacyPoliticEditor from '@/components/custom-ui/content/editors/legals/PrivacyPoliticEditor';
import ComplaintsBookEditor from '@/components/custom-ui/content/editors/legals/ComplaintsBookEditor';
import CookiesEditor from '@/components/custom-ui/content/editors/legals/CookiesEditor';
import ContactIndexEditor from '@/components/custom-ui/content/editors/contact/ContactIndexEditor';
import HelpCenterEditor from '@/components/custom-ui/content/editors/contact/HelpCetnerEditor';
import CustomerServiceEditor from '@/components/custom-ui/content/editors/contact/CustomerServiceEditor';
import DistributorNetworkEditor from '@/components/custom-ui/content/editors/contact/DistribuitorNewtworkEditor';
import ContactAdviceEditor from '@/components/custom-ui/content/editors/contact/ContactAdviceEditor';
import ContactWorkEditor from '@/components/custom-ui/content/editors/contact/ContactWorkEditor';
import BannerPromotionalEditor from '@/components/custom-ui/content/editors/aboutus/BannerPromotionalEditor';
import IntroAboutusEditor from '@/components/custom-ui/content/editors/aboutus/IntroAboutusEditor';
import OurHistoryEditor from '@/components/custom-ui/content/editors/aboutus/OurHistoryEditor';
import OurPurposeEditor from '@/components/custom-ui/content/editors/aboutus/OurPurposeEditor';
import SustainabilityEditor from '@/components/custom-ui/content/editors/aboutus/SustainabilityEditor';
import ImageFormEditor from '@/components/custom-ui/content/editors/aboutus/ImageFormEditor';
import BannerIndexEditor from '@/components/custom-ui/content/editors/blog/BannerIndexEditor';
import ImagePromotionalEditor from '@/components/custom-ui/content/editors/blog/ImagePromotionalEditor';
import ProductListEditor from '@/components/custom-ui/content/editors/blog/ProductListEditor';
import PageImagePromotionalEditor from '@/components/custom-ui/content/editors/blog/PageImagePromtionalEditor';
import ProfileEditor from '@/components/custom-ui/content/editors/system-all/ProfileEditor';
import ProductInformativeEditor from '@/components/custom-ui/content/editors/system-all/ProductInformativeEditor';
import CheckoutEditor from '@/components/custom-ui/content/editors/system-all/CheckoutEditor';
import CartEditor from '@/components/custom-ui/content/editors/system-all/CartEditor';
import FilterProductoEditor from '@/components/custom-ui/content/editors/system-all/FilterProductEditor';
import { BackButton } from '@/components/custom-ui/PageHeader';
interface Props {
    section: {
        id: number;
        name: string;
        type: string;
        content: {
            content: any;
        };
        page?: {
            title: string;
            slug: string;
        };
    };
      searchResults?: any[]; 
}

/**
 * Mapeo de componentes según el tipo de sección.
 * IMPORTANTE: La llave debe coincidir EXACTAMENTE con el 'type' de la BD.
 */
const EDITOR_COMPONENTS: Record<string, React.ComponentType<any>> = {
    // Home
    'home_modal':           ModalEditor,
    'home_banner':          BannerDinamicoEditor,
    'home_brands':          BrandsEditor,
    'home_promo_image':     ImagenPromocionalEditor,
    'home_promo_dynamic':   ImagenesPromocionalesEditor,
    'home_attributes':      AtributosEditor,
    'home_section_title':  TituloSectionEditor,
    // Footer
    'footer_logo_header':   LogoHeaderEditor,
    'footer_logo_footer':   LogoFooterEditor,
    'footer_contact_info':  ContactInfoEditor,
    'footer_socials':       SocialsEditor,
   
    // Legales
    'tyc_editor':           TermsConditionsEditor,
    'anticorrupcion_editor':PrivacyPoliticEditor,
    'libro_editor':         ComplaintsBookEditor,
    'cookies_editor':       CookiesEditor,
    // Contact
    'contact_general':     ContactIndexEditor,
    'contact_help':        HelpCenterEditor,
    'contact_service':      CustomerServiceEditor,
    'contact_distributors': DistributorNetworkEditor,
    'contact_advisor':       ContactAdviceEditor,
    'contact_work':         ContactWorkEditor,
    

    //Aboutus
    'nosotros_banner': BannerPromotionalEditor,
    'nosotros_intro' :IntroAboutusEditor,
    'nosotros_historia':OurHistoryEditor,
    'nosotros_proposito': OurPurposeEditor,
    'nosotros_sostenibilidad':SustainabilityEditor,
    'nosotros_formulario': ImageFormEditor,


    //Blog
    'blog_banner':BannerIndexEditor,
    'blog_promos':ImagePromotionalEditor,
    'blog_products':ProductListEditor,
    'blog_post_promos':PageImagePromotionalEditor,
    

    //System

    'sistema_perfil':ProfileEditor,
    'sistema_producto':ProductInformativeEditor,
    'sistema_checkout':CheckoutEditor,
    'sistema_carrito':CartEditor,
    'sistema_filtrado':FilterProductoEditor,


    


};

export default function EditSection({ section , searchResults = []}: Props) {
    const EditorComponent = EDITOR_COMPONENTS[section.type];

    return (
        <AppLayout>
            <Head title={`Editar · ${section.name}`} />

            <div className="flex flex-1 flex-col gap-0">

                {/* ── Topbar ──────────────────────────────────────────── */}
              <div className="sticky top-0 z-20 flex items-center gap-4 bg-background/80 px-4 py-3 backdrop-blur-sm lg:px-8 ">
                    
                    {/* Solo el botón de volver atrás */}
                    <BackButton />

                    {/* Separador visual sutil */}
                    <div className="h-4 w-[1px]" />

                
                </div>

                {/* ── Contenido ───────────────────────────────────────── */}
                <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8">

                    {/* Título de sección */}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            {section.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {section.page?.title
                                ? `Editando sección de la página "${section.page.title}"`
                                : 'Editando sección de contenido'}
                        </p>
                    </div>

                    {/* Editor o estado vacío */}
                    <div className="mx-auto w-full max-w-5xl">
                        {EditorComponent ? (
                            <EditorComponent section={section} searchResults={searchResults} />
                        ) : (
                            <NotConfigured type={section.type} />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

/* ── Estado vacío ─────────────────────────────────────────────────────────── */
function NotConfigured({ type }: { type: string }) {
    return (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-muted/30 py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
                <Puzzle size={26} className="text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1.5">
                <p className="text-base font-semibold text-foreground">
                    Editor no configurado
                </p>
                <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                    No existe un componente registrado para el tipo:
                </p>
                <code className="mx-auto mt-1 rounded-lg border border-border bg-muted px-3 py-1 font-mono text-xs text-destructive">
                    {type}
                </code>
            </div>
            <Link
                href="/content/items"
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
                <ArrowLeft size={14} />
                Volver al listado
            </Link>
        </div>
    );
}