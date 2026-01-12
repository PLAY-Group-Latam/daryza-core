// components/slug-input.tsx
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils'; // Asegúrate de tener esta utilidad (clsx + tailwind-merge)
import { Link, Lock, RotateCcw, Unlock } from 'lucide-react';
import * as React from 'react';

interface SlugInputProps
    extends Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        'onChange' | 'value'
    > {
    source: string; // Texto origen (ej: nombre del producto)
    value: string; // Valor controlado
    onChange: (value: string) => void;
    error?: string;
    label?: string; // Ahora es opcional y personalizable
}

// 1. Usamos forwardRef para compatibilidad total
export const SlugInput = React.forwardRef<HTMLInputElement, SlugInputProps>(
    (
        {
            source,
            value,
            onChange,
            error,
            disabled,
            className,
            label = 'Slug ', // Valor por defecto
            placeholder = 'url-amigable', // Valor por defecto genérico
            id = 'slug', // ID por defecto
            ...props // Resto de props (onBlur, onFocus, name, etc.)
        },
        ref,
    ) => {
        const [isManuallyEdited, setIsManuallyEdited] = React.useState(false);

        const generateSlug = (text: string) => {
            return text
                .toString()
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
        };

        React.useEffect(() => {
            if (!isManuallyEdited && source) {
                const newSlug = generateSlug(source);
                if (newSlug !== value) {
                    onChange(newSlug);
                }
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [source, isManuallyEdited]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setIsManuallyEdited(true);
            const rawValue = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, '');
            onChange(rawValue);
        };

        const handleReset = () => {
            setIsManuallyEdited(false);
            if (source) onChange(generateSlug(source));
        };

        return (
            <div className={cn('space-y-2', className)}>
                <div className="flex items-center justify-between">
                    <Label htmlFor={id} className="text-sm font-medium">
                        {label}
                    </Label>
                    {isManuallyEdited && (
                        <span className="flex animate-in items-center gap-1 text-[10px] text-amber-600 fade-in">
                            <Unlock className="h-3 w-3" /> Manual
                        </span>
                    )}
                </div>

                <div className="relative flex items-center">
                    <div className="absolute left-3 text-muted-foreground">
                        <Link className="h-4 w-4 opacity-50" />
                    </div>

                    <Input
                        {...props} // Pasamos props nativas (name, onBlur, etc.)
                        ref={ref} // Conectamos la referencia
                        id={id}
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                        placeholder={placeholder} // Placeholder dinámico
                        className={cn(
                            'pr-10 pl-9 font-mono text-sm transition-colors',
                            isManuallyEdited
                                ? 'border-amber-200 focus-visible:ring-amber-200'
                                : '',
                        )}
                    />

                    <div className="absolute top-1/2 right-1 -translate-y-1/2">
                        {isManuallyEdited ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-primary"
                                onClick={handleReset}
                                title="Restaurar automático"
                            >
                                <RotateCcw className="h-3 w-3" />
                            </Button>
                        ) : (
                            <div
                                className="p-2 text-muted-foreground/40"
                                title="Sincronizado"
                            >
                                <Lock className="h-3 w-3" />
                            </div>
                        )}
                    </div>
                </div>
                <InputError message={error} />
            </div>
        );
    },
);

SlugInput.displayName = 'SlugInput';
