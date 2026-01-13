'use client';

import { CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface RootItemProps {
    selectedValue?: string;
    onSelect: (id: string) => void;
}

export function RootItem({ selectedValue, onSelect }: RootItemProps) {
    return (
        <CommandItem
            value="root"
            onSelect={() => onSelect('')}
            className={cn(
                'flex items-center rounded-none py-1.5 pl-3 text-sm',
                selectedValue === '' && 'font-medium text-primary',
            )}
        >
            Principal
            {selectedValue === '' && <Check className="ml-auto h-4 w-4" />}
        </CommandItem>
    );
}
