export interface Distributor {
    id: number;
    name: string;   
    ruc?: string;
    region: string;
    address?: string; 
    email?: string;
    phone?: string;
    note?: string;
    logo_pin?: string; 
    establishment_img?: string; 

    coords: {
        lat: number;
        lng: number;
    };

    created_at: string;
    updated_at: string;
}