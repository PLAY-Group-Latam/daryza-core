export interface DestinationEmail {
    id: string;
    name: string;
    email: string;
    page_keys: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface DestinationEmailPageOption {
    key: string;
    label: string;
    fallback_env?: string | null;
}
