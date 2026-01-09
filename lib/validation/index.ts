/**
 * Validation utilities
 */

export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}

export function isValidAmount(value: number): boolean {
  return !isNaN(value) && value >= 0;
}

export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function validateAllocationSum(allocations: Array<{ percentage: number }>): boolean {
  const total = allocations.reduce((sum, a) => sum + a.percentage, 0);
  return Math.abs(total - 100) < 0.01;
}
