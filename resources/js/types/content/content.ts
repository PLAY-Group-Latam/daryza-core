export interface ModalContent {
    image: File | string | null;
    start_date: string;
    end_date: string;
    is_visible: boolean;
}

export interface BannerContent {
    media_desktop: File | string | null;
    media_mobile: File | string | null;
    type: 'image' | 'video';
    link_url?: string;
    is_visible: boolean;
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
            
            content: ModalContent & BannerContent & GenericContent;
        };
    };
}