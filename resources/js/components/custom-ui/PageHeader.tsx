import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
  showText?: boolean;
}

export function BackButton({ className, showText = true }: BackButtonProps) {
  
  
  const handleBack = () => {
    window.history.back();
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        "group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      {/* Círculo contenedor de la flecha similar a la imagen */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background transition-colors group-hover:bg-muted">
        <ArrowLeft size={16} />
      </div>
      
      {showText && (
        <span className="text-sm font-medium">Volver</span>
      )}
    </button>
  );
}