'use client';

import { router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  className?: string;
  showText?: boolean;
  refresh?: boolean; // Opcional (boolean)
  fallbackUrl?: string; // Por si no hay historial
}

export function BackButton({
  className,
  showText = true,
  refresh = false,
  fallbackUrl,
}: BackButtonProps) {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();

      if (refresh) {
        // Ejecuta un refresh del estado de Inertia en la página anterior
        setTimeout(() => {
          router.reload();
        }, 100);
      }
    } else if (fallbackUrl) {
      router.visit(fallbackUrl);
    } else {
      router.visit('/');
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        'group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground',
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background transition-colors group-hover:bg-muted">
        <ArrowLeft size={16} />
      </div>

      {showText && <span className="text-sm font-medium">Volver</span>}
    </button>
  );
}