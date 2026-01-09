/**
 * localStorage abstraction for financial data
 */

import { StoredData, FinancialState, Budget } from '@/types';

const STORAGE_KEY = 'finance_tracker_data';
const CURRENT_VERSION = 1;

/**
 * Load data from localStorage
 * @returns Parsed data or null if not found/corrupted
 */
export function loadFromStorage(): StoredData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    
    const data = JSON.parse(raw);
    
    // Version migration would go here
    if (data.version !== CURRENT_VERSION) {
      console.warn(`Data version mismatch: ${data.version} != ${CURRENT_VERSION}`);
      return null;
    }
    
    // Convert date strings back to Date objects
    return {
      ...data,
      state: {
        ...data.state,
        lastUpdated: new Date(data.state.lastUpdated),
        funds: Object.fromEntries(
          Object.entries(data.state.funds).map(([id, fund]: [string, any]) => [
            id,
            {
              ...fund,
              createdAt: new Date(fund.createdAt),
              updatedAt: new Date(fund.updatedAt),
            },
          ])
        ),
        transactions: data.state.transactions.map((t: any) => ({
          ...t,
          date: new Date(t.date),
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        })),
      },
      budgets: (data.budgets || []).map((b: any) => ({
        ...b,
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt),
      })),
    };
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Save data to localStorage
 * @param state Financial state
 * @param budgets Budgets array
 */
export function saveToStorage(state: FinancialState, budgets: Budget[] = []): void {
  try {
    const data: StoredData = {
      version: CURRENT_VERSION,
      state,
      budgets,
      reportFilters: {
        period: 'LIFETIME',
      },
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * Export data as JSON string
 * @param state Financial state
 * @param budgets Budgets array
 * @returns JSON string
 */
export function exportData(state: FinancialState, budgets: Budget[] = []): string {
  const data: StoredData = {
    version: CURRENT_VERSION,
    state,
    budgets,
    reportFilters: {
      period: 'LIFETIME',
    },
  };
  
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON string
 * @param json JSON string to import
 * @returns Parsed data or error
 */
export function importData(json: string): { success: boolean; data?: StoredData; error?: string } {
  try {
    const parsed = JSON.parse(json);
    
    if (!parsed.version || parsed.version !== CURRENT_VERSION) {
      return {
        success: false,
        error: `Invalid data version. Expected ${CURRENT_VERSION}, got ${parsed.version}`,
      };
    }
    
    if (!parsed.state || !parsed.state.funds) {
      return {
        success: false,
        error: 'Invalid data structure',
      };
    }
    
    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse JSON',
    };
  }
}

/**
 * Clear all data from localStorage
 */
export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if data exists in localStorage
 */
export function hasStoredData(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
                              }
