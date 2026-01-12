import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>

            <SidebarMenu>
                {items.map((item) => {
                    // 🟢 Grupo (tiene children)
                    if (item.children && item.children.length > 0) {
                        const isOpen = item.children.some(
                            (sub) => resolveUrl(sub.href) === page.url,
                        );

                        return (
                            <SidebarMenuItem key={item.title}>
                                <Collapsible defaultOpen={isOpen}>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <SidebarMenuBadge>
                                                {item.children.length}
                                            </SidebarMenuBadge>
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.children.map((child) => {
                                                const childUrl = resolveUrl(
                                                    child.href,
                                                );

                                                return (
                                                    <SidebarMenuSubItem
                                                        key={child.title}
                                                    >
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={
                                                                childUrl ===
                                                                page.url
                                                            }
                                                        >
                                                            <Link
                                                                href={
                                                                    child.href
                                                                }
                                                                prefetch
                                                            >
                                                                <span>
                                                                    {
                                                                        child.title
                                                                    }
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>
                            </SidebarMenuItem>
                        );
                    }

                    // 🔵 Item normal (tiene href)
                    const itemUrl = resolveUrl(item.href!);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={itemUrl === page.url}
                            >
                                <Link href={item.href!} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
