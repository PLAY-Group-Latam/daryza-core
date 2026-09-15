export interface Subscription {
  id: string;
  type: string;
  email: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}