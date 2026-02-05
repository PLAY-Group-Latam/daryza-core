export interface Metadata {
    id?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string | null;
    canonical_url?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string | null;
    og_type?: string;
    noindex: boolean;
    nofollow: boolean;
    created_at?: string;
    updated_at?: string;
}
