/**
 * Core Financial Types
 */

export type FundId = string;

export interface Fund {
  id: FundId;
  name: string;
  description: string;
  currentBalance: number;
  lifetimeInflow: number;
  lifetimeOutflow: number;
  color?: string;
  isTaxFund?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: Date;
  description: string;
  // For INCOME transactions
  costOfProduction?: number;
  profit?: number;
  // For EXPENSE transactions
  sourceFundId?: FundId;
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfitDistribution {
  fundId: FundId;
  percentage: number; // 0-100
}

export interface FinancialState {
  // Funds
  funds: Record<FundId, Fund>;
  // Transactions
  transactions: Transaction[];
  // Profit distribution settings
  profitDistribution: ProfitDistribution[];
  // Tax fund enabled
  taxEnabled: boolean;
  // Last updated timestamp
  lastUpdated: Date;
}

/**
 * Budget Types (Phase 2)
 */
export type BudgetStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface BudgetAllocation {
  fundId: FundId;
  percentage: number; // 0-100
}

export interface Budget {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  status: BudgetStatus;
  allocations: BudgetAllocation[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Report Types (Phase 3)
 */
export type TimePeriod = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM' | 'LIFETIME';

export interface ReportFilter {
  period: TimePeriod;
  startDate?: Date;
  endDate?: Date;
}

export interface ReportData {
  income: number;
  expenses: number;
  profit: number;
  costOfProduction: number;
  fundDistributions: Record<FundId, number>;
  topExpenses: Array<{ description: string; amount: number; fundId: FundId }>;
}

/**
 * Storage Types
 */
export interface StoredData {
  version: number;
  state: FinancialState;
  budgets: Budget[];
  reportFilters: ReportFilter;
  }
