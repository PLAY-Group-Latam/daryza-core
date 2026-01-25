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
    visibility: boolean;
    featured: boolean;
    publication_date: string;
    created_at: string;
    updated_at: string;
}
