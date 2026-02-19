export interface Media {
    id: string; // ULID
    mediable_id?: string;
    mediable_type?: string;
    type: 'image' | 'video' | 'technical_sheet';
    file_path: string;
    folder?: string;
    is_main?: boolean;
    order?: number;
    created_at?: string;
    updated_at?: string;
}
