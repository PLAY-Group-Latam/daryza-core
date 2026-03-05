export interface Seo {
    id: string;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null; 
    og_type: 'website' | 'article' | 'product' | 'profile';
    canonical_url: string | null;
    noindex: boolean;
    nofollow: boolean;
    created_at: string;
    updated_at: string;

    metadatable?: {
        id: string | number;
        title?: string;
        slug?: string;
        [key: string]: any;
    };
}

export interface SeoForm {
    _method?: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    og_title: string;
    og_description: string;
    og_type: string;
    og_image: File | null;
    canonical_url: string;
    noindex: boolean;
    nofollow: boolean;
}