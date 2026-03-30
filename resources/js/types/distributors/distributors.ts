export interface Distributor {
    id: number;
    name: string;
    ruc?: string;
    region: string;
    address?: string;
    email?: string;
    phone?: string;
    note?: string;
    establishment_img?: string;

    coords: {
        lat: number;
        lng: number;
    };

    created_at: string;
    updated_at: string;
}

export interface MapPinSetting {
    url: string | null;
    path: string | null;
}