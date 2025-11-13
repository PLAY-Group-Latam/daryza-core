// src/common/helpers/formatDate.ts

/**
 * Formatea una fecha según el formato local de Perú (es-PE).
 *
 * @param date - Fecha a formatear (string, Date o null)
 * @param withTime - Si true, incluye la hora (HH:mm)
 * @returns string formateado o "-" si no hay fecha válida
 */
export function formatDate(
    date?: string | Date | null,
    withTime = false,
): string {
    if (!date) return '-';

    const d = new Date(date);

    if (isNaN(d.getTime())) return '-';

    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };

    if (withTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return new Intl.DateTimeFormat('es-PE', options).format(d);
}
