/**
 * Genera las iniciales a partir del nombre completo.
 * Ejemplo: "Juan Pérez García" → "JP"
 */
export function getInitials(fullName?: string | null): string {
  if (!fullName) return '';

  // Divide el nombre por espacios
  const parts = fullName.trim().split(' ').filter(Boolean);

  if (parts.length === 0) return '';

  // Toma la primera letra del primer nombre y del último apellido
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';

  return (first + last).toUpperCase();
}
