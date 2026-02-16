export interface ModalContent {
    image: File | string | null;
    start_date: string;
    end_date: string;
    is_visible: boolean;
}

export interface MediaItem {
    src: File | string | null;
    device?: 'desktop' | 'mobile' | 'both'; // opcional, por si quieres filtrar
    type: 'image' | 'video';
    link_url?: string;
}

export interface BannerContent {
    media: MediaItem[];   // 🔥 Lista dinámica de medios
    is_visible: boolean;
    link_url?: string;   // 🔥 URL opcional para todo el banner
}

export interface ModalContent {
    image: File | string | null;
    start_date: string;
    end_date: string;
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
            content: ModalContent | BannerContent | GenericContent;
        };
    };
}
