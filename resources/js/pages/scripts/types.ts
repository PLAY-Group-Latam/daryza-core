export interface Script {
    id: string;
    name: string;
    placement: 'head' | 'body';
    consent_type: 'necessary' | 'analytics' | 'marketing';
    active: boolean;
    content: string;
    created_at?: string;
}
