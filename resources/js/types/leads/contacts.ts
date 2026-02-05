export interface Contact {
    id: string;
    type: 'help_center' | 'distributor_network' | 'customer_service' | 'sales_advisor';
    full_name: string; 
    email: string;
    phone: string;
    status: 'new' | 'pending' | 'resolved' | 'closed';
    data: HelpCenterData | DistributorData | CustomerServiceData | SalesAdvisorData; // Cambiado nombre para consistencia
    file_path?: string | null;
    file_original_name?: string | null;
    created_at: string;
}

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