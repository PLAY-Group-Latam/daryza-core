import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import customers from '@/routes/customers';
import users from '@/routes/users';
import { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Apple,
    CreditCard,
    FileCode,
    Headset,
    LayoutGrid,
    Newspaper,
    SearchCheck,
    Store,
    Truck,
    User,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Clientes',
        href: customers.index(),
        icon: User,
    },
    {
        title: 'Usuarios',
        href: users.index(),
        icon: Users,
    },
    {
        title: 'Productos',
        icon: Apple,
        children: [
            {
                title: 'Lista de productos',
                href: '/productos/items',
            },
            {
                title: 'Categorías',
                href: '/productos/categorias',
            },
            {
                title: 'Atributos',
                href: '/productos/attributes',
            },
            {
                title: 'Líneas de Negocio',
                href: '/productos/lineas-de-negocio',
            },
            {
                title: 'Dinámicas de Negocio',
                href: '/productos/categorias-dinamicas',
            },
        ],
    },
    {
        title: 'Blogs',
        icon: Newspaper,
        children: [
            {
                title: 'Lista de blogs',
                href: '/blogs/items',
            },
            {
                title: 'Lista de Categoría',
                href: '/blogs/categorias',
            },
        ],
    },
    {
        title: 'Leads',
        icon: Headset,
        children: [
            {
                title: 'Lista de Reclamaciones',
                href: '/claims/items',
            },
        ],
    },
    {
        title: 'Configuración',
        icon: Store,
        children: [
            {
                title: 'Delivery Zonas',
                href: '/delivery-zones',
                icon: Truck,
            },
            {
                title: 'Cuentas Bancarias',
                href: '/cuentas-bancarias',
                icon: CreditCard,
            },
            {
                title: 'Seo',
                href: '/seo',
                icon: SearchCheck,
            },
            {
                title: 'Scripts',
                href: '/scripts',
                icon: FileCode,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
