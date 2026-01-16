export interface Department {
    id:string;
    ubigeo_id:string;
    name:string;
    code:string;
    label:string;
    searchable:string;
    children_count:number;
    code_ISO_3166:string;
    created_at:string;
    updated_at:string;
    provinces: Province[];
    delivery_zone?:DeliveryZone;
}

export interface Province {
    id:string;
    ubigeo_id:string;
    name:string;
    code:string;
    label:string;
    searchable:string;
    children_count:number;
    created_at:string;
    updated_at:string;
    districts: District[];
    delivery_zone?:DeliveryZone;
}

export interface District {
    id:string;
    ubigeo_id:string;
    name:string;
    code:string;
    label:string;
    searchable:string;
    created_at:string;
    updated_at:string;
    delivery_zone?:DeliveryZone;
}

export enum ZoneType {
    DEPARTMENT = 'department',
    PROVINCE = 'province',
    DISTRICT = 'district',
}

export interface DeliveryZone {
    id: string;
    zone_type: ZoneType;
    zone_id: string;
    is_main: boolean;
    delivery_cost: string;
    created_at: string;
    updated_at: string;
}

