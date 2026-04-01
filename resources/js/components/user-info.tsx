import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { User } from '@/types/user';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    
    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                <div className="flex flex-col gap-1">
                    <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                    <div className="h-2 w-28 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
     
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user?.name ?? "")}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user?.email}
                    </span>
                )}
            </div>
        </>
    );
}