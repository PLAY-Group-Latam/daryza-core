import { Metadata } from './metadata';

export interface LandingSlide {
    id: string;
    is_active: boolean;
    type: 'image' | 'video';
    src_desktop: string | null;
    src_mobile: string | null;
    src_video: string | null;
    link_url: string | null;
}

export interface LandingFeatureItem {
    title: string;
    description: string;
    image?: string;
}

export interface LandingKnowMoreItem {
    id: string;
    title: string;
    description: string;
    image: string;
}

export interface LandingSections {
    banner?: { slides: LandingSlide[] };
    brandStory?: {
        title: string;
        subtitle?: string | null;
        description: string;
        media: {
            type: 'image' | 'video';
            src_desktop: string | null;
            src_mobile: string | null;
            src_video: string | null;
        };
    };
    features?: {
        title: string;
        items: LandingFeatureItem[];
    };
    knowMore?: {
        title: string;
        items: LandingKnowMoreItem[];
    };
}

export interface Landing {
    id: string;
    title: string;
    slug: string;
    sections: LandingSections;
    is_active: boolean;
    metadata?: Metadata;
    leads_count?: number;
    created_at: string;
    updated_at: string;
}
