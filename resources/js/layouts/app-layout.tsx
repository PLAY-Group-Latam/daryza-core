import { Toaster } from '@/components/ui/sonner';
import { useFlashMessage } from '@/hooks/use-flash-message';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    useFlashMessage(); // 👈 lo inicializas aquí

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster position="top-center" richColors theme="light" />
        </AppLayoutTemplate>
    );
};
