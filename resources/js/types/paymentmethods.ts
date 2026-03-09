export interface PaymentMethod {
    id: string;             
    company_type: string;    
    name: string;       
    account_number: string;  
    extra_info?: string; 
    is_active: boolean;   
    created_at?: string;   
    updated_at?: string;  
}