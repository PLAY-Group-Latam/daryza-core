'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface ToolbarButtonProps {
    command: () => void;
    isActive: () => boolean;
    icon: ReactNode;
    tooltip: string;
}

export function ToolbarButton({
    command,
    isActive,
    icon,
    tooltip,
}: ToolbarButtonProps) {
    const active = isActive();

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    size="icon"
                    variant={active ? 'default' : 'outline'}
                    onClick={command}
                >
                    {icon}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    );
}

export function ToolbarDivider() {
    return <div className="mx-1 h-5 w-[1px] bg-border" />;
}
