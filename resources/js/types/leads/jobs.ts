import { Metadata } from '../metadata';

export interface JobsData {
  firstName: string;
  lastName: string;
  area: string;
  position: string;
  location: string;
  employmentStatus: string;
  acceptedPolicy: boolean;
}

export interface JobApplication {
  id: string;
  type: 'work_with_us';
  full_name: string; 
  email: string;
  phone: string;
  status: 'new' | 'pending' | 'resolved' | 'closed';
  data: JobsData; 
  file_path?: string | null;
  file_original_name?: string | null;
  created_at: string;
  updated_at: string;
  metadata?: Metadata;
}