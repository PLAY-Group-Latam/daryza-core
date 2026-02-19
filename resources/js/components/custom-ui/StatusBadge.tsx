interface StatusBadgeProps {
    status: boolean | string | number;
    labels?: {
        trueLabel?: string;
        falseLabel?: string;
    };
}

export function StatusBadge({
    status,
    labels = { trueLabel: 'Activo', falseLabel: 'Inactivo' },
}: StatusBadgeProps) {
    // Convertimos a booleano por si recibes 1/0 del backend
    const isActive = Boolean(status);

    return (
        <div className="flex items-center">
            {isActive ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
                    {labels.trueLabel}
                </span>
            ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    <span className="mr-1.5 h-2 w-2 rounded-full bg-gray-400"></span>
                    {labels.falseLabel}
                </span>
            )}
        </div>
    );
}
