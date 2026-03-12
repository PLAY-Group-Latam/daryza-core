/**
 * Convierte un número o string a formato de moneda peruana (Soles)
 * Ejemplo: 1250.5 -> S/ 1,250.50
 */
export const parseSoles = (amount: number | string): string => {
  // Convertimos a número en caso de que venga como string desde la base de datos
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Si no es un número válido, retornamos un valor por defecto
  if (isNaN(value)) {
    return 'S/ 0.00';
  }

  // Usamos el formateador nativo de JavaScript para moneda peruana
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};