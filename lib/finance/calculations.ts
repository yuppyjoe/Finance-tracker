/**
 * Pure financial calculation functions
 * Deterministic and side-effect free
 */

import { Transaction, Fund, ProfitDistribution } from '@/types';

/**
 * Calculate profit from income and cost of production
 * @param income Total income amount
 * @param costOfProduction Cost of production amount
 * @returns Calculated profit
 */
export function calculateProfit(income: number, costOfProduction: number): number {
  if (income < 0) throw new Error('Income cannot be negative');
  if (costOfProduction < 0) throw new Error('Cost of production cannot be negative');
  if (costOfProduction > income) throw new Error('Cost of production cannot exceed income');
  
  return income - costOfProduction;
}

/**
 * Validate profit distribution percentages sum to exactly 100%
 * @param distributions Array of profit distributions
 * @returns Validation result with error message if invalid
 */
export function validateProfitDistribution(distributions: ProfitDistribution[]): {
  isValid: boolean;
  error?: string;
} {
  const total = distributions.reduce((sum, dist) => sum + dist.percentage, 0);
  
  if (Math.abs(total - 100) > 0.01) {
    return {
      isValid: false,
      error: `Profit distribution must sum to 100% (currently ${total.toFixed(2)}%)`
    };
  }
  
  return { isValid: true };
}

/**
 * Distribute profit to funds according to distribution percentages
 * @param profit Total profit to distribute
 * @param distributions Profit distribution settings
 * @returns Record of fundId to distribution amount
 */
export function distributeProfit(
  profit: number,
  distributions: ProfitDistribution[]
): Record<string, number> {
  const validation = validateProfitDistribution(distributions);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid profit distribution');
  }
  
  const result: Record<string, number> = {};
  let remaining = profit;
  
  // Distribute in order, handling rounding errors
  for (let i = 0; i < distributions.length; i++) {
    const { fundId, percentage } = distributions[i];
    
    if (i === distributions.length - 1) {
      // Last distribution gets remaining amount to avoid rounding errors
      result[fundId] = Math.round(remaining * 100) / 100;
    } else {
      const amount = Math.round((profit * percentage / 100) * 100) / 100;
      result[fundId] = amount;
      remaining -= amount;
    }
  }
  
  return result;
}

/**
 * Calculate lifetime totals for a set of funds
 * @param funds Funds to calculate totals for
 * @returns Object with total balance, inflow, and outflow
 */
export function calculateFundTotals(funds: Record<string, Fund>): {
  totalBalance: number;
  totalInflow: number;
  totalOutflow: number;
} {
  const totals = Object.values(funds).reduce(
    (acc, fund) => {
      acc.balance += fund.currentBalance;
      acc.inflow += fund.lifetimeInflow;
      acc.outflow += fund.lifetimeOutflow;
      return acc;
    },
    { balance: 0, inflow: 0, outflow: 0 }
  );
  
  return {
    totalBalance: totals.balance,
    totalInflow: totals.inflow,
    totalOutflow: totals.outflow,
  };
}

/**
 * Validate transaction for business rules
 * @param transaction Transaction to validate
 * @param funds Available funds
 * @returns Validation result
 */
export function validateTransaction(
  transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
  funds: Record<string, Fund>
): { isValid: boolean; error?: string } {
  // Basic validation
  if (transaction.amount <= 0) {
    return { isValid: false, error: 'Amount must be positive' };
  }
  
  if (transaction.date > new Date()) {
    return { isValid: false, error: 'Transaction date cannot be in the future' };
  }
  
  // Type-specific validation
  if (transaction.type === 'INCOME') {
    if (transaction.costOfProduction === undefined) {
      return { isValid: false, error: 'Cost of production is required for income' };
    }
    
    if (transaction.costOfProduction < 0) {
      return { isValid: false, error: 'Cost of production cannot be negative' };
    }
    
    if (transaction.costOfProduction > transaction.amount) {
      return { isValid: false, error: 'Cost of production cannot exceed income' };
    }
    
    const profit = calculateProfit(transaction.amount, transaction.costOfProduction);
    if (profit < 0) {
      return { isValid: false, error: 'Profit must be non-negative' };
    }
  }
  
  if (transaction.type === 'EXPENSE') {
    if (!transaction.sourceFundId) {
      return { isValid: false, error: 'Source fund is required for expenses' };
    }
    
    const sourceFund = funds[transaction.sourceFundId];
    if (!sourceFund) {
      return { isValid: false, error: 'Selected fund does not exist' };
    }
    
    if (sourceFund.currentBalance < transaction.amount) {
      return { isValid: false, error: 'Insufficient funds in selected account' };
    }
  }
  
  return { isValid: true };
}

/**
 * Apply transaction to funds (pure function)
 * @param funds Current funds state
 * @param transaction Transaction to apply
 * @param distributions Profit distribution settings
 * @returns Updated funds state
 */
export function applyTransactionToFunds(
  funds: Record<string, Fund>,
  transaction: Transaction,
  distributions: ProfitDistribution[]
): Record<string, Fund> {
  const updatedFunds = { ...funds };
  const now = new Date();
  
  if (transaction.type === 'INCOME') {
    const profit = calculateProfit(transaction.amount, transaction.costOfProduction!);
    const distributionsMap = distributeProfit(profit, distributions);
    
    // Apply distributions to funds
    Object.entries(distributionsMap).forEach(([fundId, amount]) => {
      if (updatedFunds[fundId]) {
        updatedFunds[fundId] = {
          ...updatedFunds[fundId],
          currentBalance: updatedFunds[fundId].currentBalance + amount,
          lifetimeInflow: updatedFunds[fundId].lifetimeInflow + amount,
          updatedAt: now,
        };
      }
    });
  }
  
  if (transaction.type === 'EXPENSE' && transaction.sourceFundId) {
    const fund = updatedFunds[transaction.sourceFundId];
    if (fund) {
      updatedFunds[transaction.sourceFundId] = {
        ...fund,
        currentBalance: fund.currentBalance - transaction.amount,
        lifetimeOutflow: fund.lifetimeOutflow + transaction.amount,
        updatedAt: now,
      };
    }
  }
  
  return updatedFunds;
        }
