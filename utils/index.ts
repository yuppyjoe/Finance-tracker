/**
 * Utility functions
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return ${value.toFixed(1)}%;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function getColorForFund(index: number): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#8B5CF6', // violet
    '#EF4444', // red
    '#F59E0B', // amber
    '#6366F1', // indigo
    '#EC4899', // pink
    '#6B7280', // gray
    '#84CC16', // lime
    '#F97316', // orange
  ];
  return colors[index % colors.length];
}
