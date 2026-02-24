// ─────────────────────────────────────────────────────────────────────────────
// SHARED / PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

export type FileOrString = File | string | null;

export interface BannerStatic {
  type:        'image' | 'url';
  src_desktop: FileOrString;
  src_mobile:  FileOrString;
  link_url:    string | null;
}

export interface PromoBlock {
  src_desktop: FileOrString;
  src_mobile:  FileOrString;
  link_url:    string | null;
}
export interface BannerContent {
  type:        BannerType;
  src_desktop: File | string | null;
  src_mobile:  File | string | null;
  link_url:    string;
}

export interface BannerContentAll{
  src_desktop: File | string | null;
  src_mobile:  File | string | null;
  link_url:    string;
}

export type BannerType = 'image' | 'url';

// ─────────────────────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────────────────────

export interface ModalContent {
  image:      FileOrString;
  start_date: string;
  end_date:   string;
  is_visible: boolean;
}

export interface BannerSlide {
  id:           string;
  type:         'image' | 'video' | 'url';
  is_active:    boolean;
  link_url:     string | null;
  src_video?:   string | null;
  src_desktop?: FileOrString;
  src_mobile?:  FileOrString;
}

export interface BannerDynamicContent {
  slides: BannerSlide[];
}

export interface BrandItem {
  image: FileOrString;
  name:  string;
}

export interface BrandsContent {
  brands: BrandItem[];
}

export interface ImagenPromocionalContent {
  link_url:      string | null;
  image_desktop: FileOrString;
  image_mobile:  FileOrString;
}

export interface PromoGridItem {
  id:    string;
  src:   FileOrString;
  alt?:  string | null;
  link?: string | null;
}

export interface ImagenesPromocionalesContent {
  items: PromoGridItem[];
}

export interface AttributeItem {
  id:   string;
  text: string;
  icon: FileOrString;
}

export interface AttributesContent {
  items: AttributeItem[];
}

export interface TitleItem {
  key:   'brands' | 'best_sellers' | 'pack' | 'blog';
  label: string;
}

export interface SectionTitlesContent {
  titles: TitleItem[];
}

export interface AtributoItem {
  id: number;
  icon: File | string | null;
  text: string;
}

export interface AtributosContent {
  items: AtributoItem[];
}

export interface BannerContentSlides { slides: Slide[] }


export type SlideType = 'image' | 'video' | 'url';

export interface Slide {
    id:          number;
    type:        SlideType;
    is_active:   boolean;
    src_desktop: File | string | null;  
    src_mobile:  File | string | null; 
    src_video:   File | string | null;  
    link_url:    string;                
}

export interface PromoItem {
  id: number;
  src: File | string | null;
  alt?: string;
  link?: string;
}

export interface TitleItem {
  key: 'brands' | 'best_sellers' | 'pack' | 'blog';
  label: string;
}

export interface SectionTitlesContent {
  titles: TitleItem[];
}


// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────

export interface LogoContent {
  image: FileOrString;
}

export interface BankItem {
  id:    string;
  image: FileOrString;
}

export interface FooterContactContent {
  phone:          string;
  mobile:         string;
  email:          string;
  address_line1:  string;
  address_line2:  string;
  weekday_from:   string;
  weekday_to:     string;
  saturday_from:  string;
  saturday_to:    string;
  banks:          BankItem[];
}

export interface SocialItem {
  id:    number;
  image: FileOrString;
  url:   string;
}

export interface FooterSocialsContent {
  socials: SocialItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGALES
// ─────────────────────────────────────────────────────────────────────────────

export interface ComplaintsContent {
  body: string;
}

export interface PrivacyContent {
  body: string;
}

export interface TermsContent {
  body: string;
}


export interface LegalEditorContent {
  text: string;
  body: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ABOUTUS
// ─────────────────────────────────────────────────────────────────────────────

export interface BannerPromotionalContent {
  banner: BannerStatic;
}

export interface ImageFormContent {
  imagen: FileOrString;
}

export interface IntroAboutusContent {
  video:       File | string | null;
  subtitulo:   string;
  titulo_bold: string;
  descripcion: string;
}

export interface HistoryYear {
  anio:   string;
  imagen: File | string | null;
  texto:  string;
}

export interface OurHistoryContent {
  titulo:      string;
  descripcion: string;
  years:       HistoryYear[];
}

export interface PurposeCard {
  imagen: FileOrString;
  nombre: string;
}

export interface OurPurposeContent {
  titulo:      string;
  descripcion: string;
  cards:       PurposeCard[];
}

export interface SustainabilityCard {
  imagen: FileOrString;
  nombre: string;
}

export interface SustainabilityContent {
  titulo:      string;
  descripcion: string;
  cards:       SustainabilityCard[];
}


export interface BannerIndexContent {
  banner: BannerStatic; 
}

export interface PromotionalItem {
  id:          string;
  src_desktop: FileOrString;
  src_mobile:  FileOrString;
  link_url:    string | null;
}

export interface ImagePromotionalContent {
  items: PromotionalItem[];
}


// ─────────────────────────────────────────────────────────────────────────────
// CONTACTOS
// ─────────────────────────────────────────────────────────────────────────────

export interface ConsultaItem {
  texto: string;
}

export interface ConsultaCard {
  titulo_normal: string;
  titulo_bold:   string;
  imagen:        FileOrString;
  items:         ConsultaItem[];
}

export interface ContactGeneralContent {
  banner: BannerStatic;
  cards:  ConsultaCard[]; // 👈 array normal, no tupla fija
}

// Estos 4 comparten la misma forma — un solo tipo los cubre a todos
export interface ContactFormContent {
  banner:     BannerStatic;
  form_image: FileOrString;
}

export interface DistributorCard {
  imagen: FileOrString;
  titulo: string;
  texto:  string;
}

export interface DistributorNetworkContent {
  banner:     BannerStatic;
  form_image: FileOrString;
  cards:      DistributorCard[];
}

export interface ContactAdviceContent {
  banner:     BannerContent;
  form_image: File | string | null;
}

export interface ConsultaCard {
    titulo_normal: string;
    titulo_bold: string;
    imagen: File | string | null;
    items: ConsultaItem[];
}

export interface ContactWorkContent {
  banner:     BannerContent;
  form_image: File | string | null;
}

export interface ContactContent {
    banner: BannerContent;
    cards: [ConsultaCard, ConsultaCard, ConsultaCard, ConsultaCard];
}
export interface CustomerServiceContent {
  banner:     BannerContent;
  form_image: File | string | null;
}
export interface HelpCenterContent {
  banner:     BannerContent;
  form_image: File | string | null;
}

export interface SocialsContent {
  socials: SocialItem[];
}

export interface ContactInfoContent {
    phone:          string;
    mobile:         string;
    email:          string;
    address_line1:  string;
    address_line2:  string;
    weekday_from:   string;
    weekday_to:     string;
    saturday_from:  string;
    saturday_to:    string;
    banks:          BankItem[];
}
// ─────────────────────────────────────────────────────────────────────────────
// SHARED MISC
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductLite {
  product_id:     string;
  variant_id?:    string;
  product_name:   string;
  sku:            string;
  image?:         string | null;
  price:          number | string;
  promo_price?:   number | string;
  active_price:   number | string;
  has_valid_promo: boolean;
}

export interface GenericContent {
  [key: string]: any;
}