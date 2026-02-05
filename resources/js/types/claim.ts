import { Metadata } from './metadata';

export interface DocumentType {
    id: string;
    name: string;
}

export interface WellHired {
    id: string;
    name: string;
}

export interface TypeOfService {
    id: string;
    name: string;
}

export interface TypeOfClaim {
    id: string;
    name: string;
}

export interface ClaimData {
    document_type_id: string;
    document_number: string;
    address: string;
    district: string;
    well_hired_id: string;
    type_of_service_id: string;
    type_of_claim_id: string;
    description: string;
    terms_conditions: string | number;
    created_at_form: string;
}

export interface Claim {
  
    id: string;
    type: string;
    full_name: string; 
    email: string;
    phone: string;
    status: 'new' | 'pending' | 'resolved' | 'closed' | string;
   
    data: ClaimData;

    file_path: string | null;
    file_original_name: string | null;

    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    document_type?: DocumentType;
    well_hired?: WellHired;
    type_of_service?: TypeOfService;
    type_of_claim?: TypeOfClaim;
}