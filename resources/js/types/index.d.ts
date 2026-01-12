import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';
import { User } from './user';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}
interface BaseNavItem {
    title: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

interface ParentNavItem extends BaseNavItem {
    children: ChildNavItem[]; // Tiene hijos, no puede tener href
    href?: never; // href no puede existir en el padre
}

interface ChildNavItem extends BaseNavItem {
    href: NonNullable<InertiaLinkProps['href']>;
    children?: never; // No puede tener hijos
}

export type NavItem = ParentNavItem | ChildNavItem;


export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    flash: {
        type?: 'success' | 'error' | 'info' | 'warning';
        message: string;
    };
    [key: string]: unknown;
}
