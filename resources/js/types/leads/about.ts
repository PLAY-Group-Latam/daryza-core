import { Metadata } from '../metadata';

export interface AboutUsData {

    last_name: string;    
    company_name: string;     
    ruc_or_dni: string;         
    comments: string;        

    created_at_form: string;  
}

export interface AboutUs {
    id: string;
    type: string;           
    full_name: string;        
    email: string;
    phone: string;            
    status: 'new' | 'pending' | 'resolved' | 'closed' | string;

    data: AboutUsData;

    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    metadata?: Metadata;
}