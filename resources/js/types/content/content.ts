export interface BrandItem {
image: File | string | null; // 👈
  name: string;
}

export interface BrandsContent {
  brands: BrandItem[];
}

export interface ImagenPromocionalContent {
  image: File | string | null;
}

export interface PromoGridItem {
  id: number;
  src: File | string | null;
  alt?: string;
  link?: string;
}

export interface ImagenesPromocionalesContent {
  items: PromoGridItem[];
}


export interface TitleItem {
  key: 'brands' | 'best_sellers' | 'pack' | 'blog';
  label: string;
}

export interface SectionTitlesContent {
  titles: TitleItem[];
}


export interface BankItem {
  id: number;
  image: File | string | null;
}

export interface BanksFooterContent {
  banks: BankItem[];
}


export interface ModalContent {
  image: File | string | null;
  start_date: string;
  end_date: string;
  is_visible: boolean;
}

export interface MediaItem {
  src: File | string | null;
  device?: 'desktop' | 'mobile' | 'both';
  type: 'image' | 'video';
  link_url?: string;
}

export interface BannerContent {
  media: MediaItem[];
  is_visible: boolean;
  link_url?: string;
}

export interface GenericContent {
  [key: string]: any;
}

export interface ContentSectionProps {
  section: {
    id: number;
    name: string;
    type: string;
    page: {
      slug: string;
      title?: string;
    };
    content: {
      content:
        | ModalContent
        | BannerContent
        | BrandsContent
        | ImagenesPromocionalesContent
        | SectionTitlesContent
        | BanksFooterContent
        | GenericContent;
    };
  };
}
