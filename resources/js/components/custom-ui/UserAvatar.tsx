'use client';

import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils/getInitials';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type UserAvatarProps = {
    name: string;
    image?: string | null;
    size?: 'sm' | 'md' | 'lg';
};

export function UserAvatar({ name, image, size = 'md' }: UserAvatarProps) {
    const initials = getInitials(name);

    const sizes = {
        sm: 'h-7 w-7 text-xs',
        md: 'h-10 w-10 text-base',
        lg: 'h-14 w-14 text-lg',
    };

    return (
        <Avatar
            className={cn(
                'border border-gray-300 font-medium dark:border-gray-500',
                sizes[size],
            )}
        >
            {image ? (
                <AvatarImage src={image} alt={name} />
            ) : (
                <AvatarFallback className="bg-transparent">
                    {initials}
                </AvatarFallback>
            )}
        </Avatar>
    );
}
