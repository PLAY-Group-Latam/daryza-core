import { ReactNode } from 'react';

//Interfaces de datos de cada type de contacto
export interface HelpCenterData {
    contact_reason: string;
    purchase_document: string;
    ruc_or_dni: string;
    purchase_date: string;
    comments: string;
}

export interface DistributorData {
    address: string;
    department: string;
    province: string;
    district: string;
    number_of_sellers: string;
    ruc_or_dni: string;
    company_name: string;
    other_products: string;
    accepted_policy: boolean;
}

export interface CustomerServiceData {
    purchase_document_number: string;
    ruc_or_dni: string;
    comments: string;
}

export interface SalesAdvisorData {
    province: string;
    ruc_or_dni: string;
    company_name: string;
    comments: string;
}

// Interfaz prinicipal de contacto
export interface Contact {
    id: string;
    type: 'help_center' | 'distributor_network' | 'customer_service' | 'sales_advisor';
    full_name: string;
    email: string;
    phone: string;
    status: 'new' | 'pending' | 'resolved' | 'closed';
    data: HelpCenterData | DistributorData | CustomerServiceData | SalesAdvisorData;
    file_path?: string | null;
    file_original_name?: string | null;
    created_at: string;
    updated_at: string;
}

// Configuracion de Campos para el Modal 
export interface ContactFieldConfig {
    label: string;
    keys: string[]; 
    icon?: ReactNode;
    isFullWidth?: boolean;
    isLocation?: boolean;
}

//Mapeo del tipo de contacto a su configuración específica de campos para mostrar en el modal
export type ContactConfigMap = Record<Contact['type'], ContactFieldConfig[]>;