/**
 * Zustand store for financial state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FinancialState, Transaction, Fund, ProfitDistribution, Budget } from '@/types';
import { calculateProfit, validateTransaction, applyTransactionToFunds } from '@/lib/finance/calculations';
import { v4 as uuidv4 } from 'uuid';

// Default funds (pre-configured)
const DEFAULT_FUNDS: Record<string, Fund> = {
  'business-savings': {
    id: 'business-savings',
    name: 'Business Savings',
    description: 'Operational buffer',
    currentBalance: 0,
    lifetimeInflow: 0,
    lifetimeOutflow: 0,
    color: '#3B82F6', // blue
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'reinvestment': {
    id: 'reinvestment',
    name: 'Reinvestment / Growth',
    description: 'Business expansion',
    currentBalance: 0,
    lifetimeInflow: 0,
    lifetimeOutflow: 0,
    color: '#10B981', // emerald
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'personal': {
    id: 'personal',
    name: 'Personal',
    description: "Owner's salary",
    currentBalance: 0,
    lifetimeInflow: 0,
    lifetimeOutflow: 0,
    color: '#8B5CF6', // violet
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'emergency': {
    id: 'emergency',
    name: 'Emergency Fund',
    description: 'Unexpected needs',
    currentBalance: 0,
    lifetimeInflow: 0,
    lifetimeOutflow: 0,
    color: '#EF4444', // red
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'baby': {
    id: 'baby',
    name: 'Baby Fund',
    description: 'Child-related expenses',
    currentBalance: 0,
    lifetimeInflow: 0,
    lifetimeOutflow: 0,
    color: '#F59E0B', // amber
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'general-savings': {
    id: 'general-savings',
    name: 'General Savings',
    description: 'Long-term goals',
    currentBalance: 0,
    lifetimeInflow: 0,
    lifetimeOutflow: 0,
    color: '#6366F1', // indigo
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'misc': {
    id: 'misc',
    name: 'Misc / Flex',
    description: 'Discretionary spending',
    currentBalance: 0,
    lifetimeInflow: 0,
    lifetimeOutflow: 0,
    color: '#EC4899', // pink
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'taxes': {
    id: 'taxes',
    name: 'Taxes',
    description: 'Tax obligations',
    currentBalance: 0,
    lifetimeInflow: 0,
    lifetimeOutflow: 0,
    color: '#6B7280', // gray
    isTaxFund: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

// Default profit distribution (without taxes)
const DEFAULT_DISTRIBUTION: ProfitDistribution[] = [
  { fundId: 'business-savings', percentage: 20 },
  { fundId: 'reinvestment', percentage: 15 },
  { fundId: 'personal', percentage: 25 },
  { fundId: 'emergency', percentage: 10 },
  { fundId: 'baby', percentage: 5 },
  { fundId: 'general-savings', percentage: 10 },
  { fundId: 'misc', percentage: 10 },
  { fundId: 'taxes', percentage: 5 },
];

// Default profit distribution (with taxes)
const DEFAULT_DISTRIBUTION_WITH_TAXES: ProfitDistribution[] = [
  { fundId: 'business-savings', percentage: 20 },
  { fundId: 'reinvestment', percentage: 15 },
  { fundId: 'personal', percentage: 25 },
  { fundId: 'emergency', percentage: 10 },
  { fundId: 'baby', percentage: 5 },
  { fundId: 'general-savings', percentage: 10 },
  { fundId: 'misc', percentage: 10 },
  { fundId: 'taxes', percentage: 5 },
];

interface FinanceStore extends FinancialState {
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFund: (fundId: string, updates: Partial<Fund>) => void;
  createFund: (fund: Omit<Fund, 'id' | 'currentBalance' | 'lifetimeInflow' | 'lifetimeOutflow' | 'createdAt' | 'updatedAt'>) => void;
  deleteFund: (fundId: string) => void;
  updateProfitDistribution: (distributions: ProfitDistribution[]) => void;
  toggleTaxFund: (enabled: boolean) => void;
  resetToDefaults: () => void;
  
  // Budgets (Phase 2)
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'currentAmount' | 'status'>) => void;
  updateBudget: (budgetId: string, updates: Partial<Budget>) => void;
  deleteBudget: (budgetId: string) => void;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      // Initial state
      funds: DEFAULT_FUNDS,
      transactions: [],
      profitDistribution: DEFAULT_DISTRIBUTION,
      taxEnabled: false,
      lastUpdated: new Date(),
      budgets: [],
      
      // Actions
      addTransaction: (transactionData) => {
        const { funds, profitDistribution, transactions } = get();
        
        // Validate transaction
        const validation = validateTransaction(transactionData, funds);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }
        
        // Create complete transaction object
        const now = new Date();
        const transaction: Transaction = {
          id: uuidv4(),
          ...transactionData,
          profit: transactionData.type === 'INCOME' 
            ? calculateProfit(transactionData.amount, transactionData.costOfProduction!)
            : undefined,
          createdAt: now,
          updatedAt: now,
        };
        
        // Apply transaction to funds
        const updatedFunds = applyTransactionToFunds(
          funds,
          transaction,
          profitDistribution
        );
        
        // Update state
        set((state) => ({
          funds: updatedFunds,
          transactions: [...state.transactions, transaction],
          lastUpdated: now,
        }));
      },
      
      updateFund: (fundId, updates) => {
        set((state) => ({
          funds: {
            ...state.funds,
            [fundId]: {
              ...state.funds[fundId],
              ...updates,
              updatedAt: new Date(),
            },
          },
          lastUpdated: new Date(),
        }));
      },
      
      createFund: (fundData) => {
        const newFund: Fund = {
          id: uuidv4(),
          currentBalance: 0,
          lifetimeInflow: 0,
          lifetimeOutflow: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...fundData,
        };
        
        set((state) => ({
          funds: {
            ...state.funds,
            [newFund.id]: newFund,
          },
          lastUpdated: new Date(),
        }));
      },
      
      deleteFund: (fundId) => {
        const { funds, transactions } = get();
        
        // Check if fund has any balance
        if (funds[fundId].currentBalance > 0) {
          throw new Error('Cannot delete fund with remaining balance');
        }
        
        // Check if fund is referenced in any transaction
        const hasReferences = transactions.some(
          t => t.type === 'EXPENSE' && t.sourceFundId === fundId
        );
        
        if (hasReferences) {
          throw new Error('Cannot delete fund referenced in transactions');
        }
        
        // Remove from profit distribution if present
        const newDistribution = get().profitDistribution.filter(
          d => d.fundId !== fundId
        );
        
        set((state) => {
          const { [fundId]: removed, ...remainingFunds } = state.funds;
          
          return {
            funds: remainingFunds,
            profitDistribution: newDistribution,
            lastUpdated: new Date(),
          };
        });
      },
      
      updateProfitDistribution: (distributions) => {
        set({
          profitDistribution: distributions,
          lastUpdated: new Date(),
        });
      },
      
      toggleTaxFund: (enabled) => {
        if (enabled) {
          // Add tax fund to distribution
          const currentDistribution = get().profitDistribution;
          const totalWithoutTaxes = currentDistribution.reduce(
            (sum, d) => sum + d.percentage,
            0
          );
          
          // Scale down existing percentages to make room for taxes
          const scaledDistribution = currentDistribution.map(d => ({
            ...d,
            percentage: (d.percentage / totalWithoutTaxes) * 95, // 95% for non-tax funds
          }));
          
          set({
            taxEnabled: true,
            profitDistribution: [
              ...scaledDistribution,
              { fundId: 'taxes', percentage: 5 },
            ],
            lastUpdated: new Date(),
          });
        } else {
          // Remove tax fund from distribution and redistribute
          const currentDistribution = get().profitDistribution.filter(
            d => d.fundId !== 'taxes'
          );
          
          const totalWithoutTaxes = currentDistribution.reduce(
            (sum, d) => sum + d.percentage,
            0
          );
          
          // Scale up to 100%
          const scaledDistribution = currentDistribution.map(d => ({
            ...d,
            percentage: (d.percentage / totalWithoutTaxes) * 100,
          }));
          
          set({
            taxEnabled: false,
            profitDistribution: scaledDistribution,
            lastUpdated: new Date(),
          });
        }
      },
      
      resetToDefaults: () => {
        set({
          funds: DEFAULT_FUNDS,
          transactions: [],
          profitDistribution: DEFAULT_DISTRIBUTION,
          taxEnabled: false,
          budgets: [],
          lastUpdated: new Date(),
        });
      },
      
      // Budget actions (Phase 2)
      addBudget: (budgetData) => {
        const newBudget: Budget = {
          id: uuidv4(),
          currentAmount: 0,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
          ...budgetData,
        };
        
        set((state) => ({
          budgets: [...state.budgets, newBudget],
          lastUpdated: new Date(),
        }));
      },
      
      updateBudget: (budgetId, updates) => {
        set((state) => ({
          budgets: state.budgets.map(budget =>
            budget.id === budgetId
              ? { ...budget, ...updates, updatedAt: new Date() }
              : budget
          ),
          lastUpdated: new Date(),
        }));
      },
      
      deleteBudget: (budgetId) => {
        set((state) => ({
          budgets: state.budgets.filter(b => b.id !== budgetId),
          lastUpdated: new Date(),
        }));
      },
    }),
    {
      name: 'finance-tracker-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        funds: state.funds,
        transactions: state.transactions,
        profitDistribution: state.profitDistribution,
        taxEnabled: state.taxEnabled,
        budgets: state.budgets,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
