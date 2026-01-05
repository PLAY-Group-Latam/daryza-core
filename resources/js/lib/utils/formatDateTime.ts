// utils/formatDateTime.ts
import { format } from 'date-fns';

/**
 * Formatea una fecha en formato dd-MM-yyyy HH:mm
 * Recibe un string, Date o undefined/null
 * Retorna 'N/A' si no hay fecha válida
 */
export function formatDateTime(date?: string | Date | null): string {
    if (!date) return 'N/A';

    let dt: Date;
    if (typeof date === 'string') {
        dt = new Date(date);
        if (isNaN(dt.getTime())) return 'N/A'; // si string no es fecha válida
    } else if (date instanceof Date) {
        dt = date;
    } else {
        return 'N/A';
    }

    return format(dt, 'dd/MM/yyyy hh:mm a');
}
