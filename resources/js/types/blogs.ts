import { Metadata } from './metadata';

export interface BlogCategory {
    id: string;
    name: string;
    slug?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Blog {
    id: string;
    title: string;
    slug: string;
    author: string;
    categories: BlogCategory[];
    description: string;
    content: string;
    image: File | string | undefined;
    miniature: File | string | undefined;

    visibility: boolean;
    featured: boolean;
    publication_date: string;
    metadata: Metadata;
    created_at: string;
    updated_at: string;
}
