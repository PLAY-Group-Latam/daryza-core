import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

interface Props {
    value: boolean | string | number | null | undefined;
    labelActive?: string;
    labelInactive?: string;
    showIcon?: boolean;
}

export function ActiveStatusBadge({
    value,
    labelActive = 'Visible',
    labelInactive = 'No visible',
    showIcon = true,
}: Props) {
    const isActive = value === true || value === 'true' || value === 1 || value === '1';

    return (
        <Badge className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 text-xs font-medium shadow-sm transition-colors',
            isActive
                ? 'bg-green-200 text-green-900 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-200 text-red-900 dark:bg-red-900/20 dark:text-red-300',
        )}>
            {isActive ? (
                <span className="flex items-center gap-2">
                    {showIcon && <CheckCircle className="size-4" />}
                    {labelActive}
                </span>
            ) : (
                <span className="flex items-center gap-2">
                    {showIcon && <XCircle className="size-4" />}
                    {labelInactive}
                </span>
            )}
        </Badge>
    );
}