'use client';

import { useFinanceStore } from '@/lib/store/financeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { validateProfitDistribution } from '@/lib/finance/calculations';
import { exportData, importData, clearStorage } from '@/lib/storage/localStorage';

export default function SettingsPage() {
  const funds = useFinanceStore((state) => state.funds);
  const profitDistribution = useFinanceStore((state) => state.profitDistribution);
  const taxEnabled = useFinanceStore((state) => state.taxEnabled);
  const updateProfitDistribution = useFinanceStore((state) => state.updateProfitDistribution);
  const toggleTaxFund = useFinanceStore((state) => state.toggleTaxFund);
  const resetToDefaults = useFinanceStore((state) => state.resetToDefaults);
  const transactions = useFinanceStore((state) => state.transactions);
  const budgets = useFinanceStore((state) => state.budgets);
  
  const [distributionValues, setDistributionValues] = useState<Record<string, number>>(() => {
    const values: Record<string, number> = {};
    profitDistribution.forEach(d => {
      values[d.fundId] = d.percentage;
    });
    return values;
  });
  
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  
  const handleDistributionChange = (fundId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setDistributionValues(prev => ({
      ...prev,
      [fundId]: numValue,
    }));
  };
  
  const handleSaveDistribution = () => {
    const newDistribution = Object.entries(distributionValues)
      .map(([fundId, percentage]) => ({ fundId, percentage }))
      .filter(d => d.percentage > 0); // Remove zero percentages
    
    const validation = validateProfitDistribution(newDistribution);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }
    
    updateProfitDistribution(newDistribution);
    alert('Profit distribution updated successfully!');
  };
  
  const handleExport = () => {
    const data = exportData(useFinanceStore.getState(), budgets);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleImport = () => {
    if (!importJson.trim()) {
      setImportError('Please paste JSON data');
      return;
    }
    
    const result = importData(importJson);
    if (!result.success || !result.data) {
      setImportError(result.error || 'Invalid data');
      return;
    }
    
    if (window.confirm('Importing data will replace all current data. Continue?')) {
      // This would require a store action to import data
      // For now, we'll show a message
      setImportError('Import functionality needs additional store implementation');
      setImportSuccess(false);
      return;
    }
    
    setImportSuccess(true);
    setImportError(null);
    setImportJson('');
    
    setTimeout(() => setImportSuccess(false), 3000);
  };
  
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data to defaults? This cannot be undone.')) {
      resetToDefaults();
    }
  };
  
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearStorage();
      window.location.reload();
    }
  };
  
  const totalPercentage = Object.values(distributionValues).reduce((sum, val) => sum + val, 0);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      
      {/* Profit Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  Configure how profit from income is distributed to funds
                </p>
                <p className={`text-sm font-medium mt-1 ${
                  Math.abs(totalPercentage - 100) < 0.01 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  Total: {totalPercentage.toFixed(2)}% {Math.abs(totalPercentage - 100) < 0.01 ? '✓' : '✗'}
                </p>
              </div>
              <Button onClick={handleSaveDistribution}>
                Save Distribution
              </Button>
            </div>
            
            <div className="space-y-3">
              {profitDistribution.map((distribution) => {
                const fund = funds[distribution.fundId];
                if (!fund) return null;
                
                return (
                  <div key={distribution.fundId} className="flex items-center space-x-4">
                    <div className="flex items-center flex-1">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: fund.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 truncate">{fund.name}</div>
                        <div className="text-sm text-gray-600 truncate">{fund.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={distributionValues[distribution.fundId] || 0}
                        onChange={(e) => handleDistributionChange(distribution.fundId, e.target.value)}
                        className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tax Fund Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Fund</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Tax Fund</p>
              <p className="text-sm text-gray-600">
                When enabled, 5% of profit is automatically allocated to taxes
              </p>
            </div>
            <button
              onClick={() => toggleTaxFund(!taxEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                taxEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  taxEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {taxEnabled && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                Tax fund is enabled. 5% of all profit will be allocated to the Taxes fund.
                Other fund percentages have been scaled down to accommodate this.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
              <p className="text-sm text-gray-600 mb-3">
                Download all your financial data as a JSON file for backup or migration.
              </p>
              <Button variant="outline" onClick={handleExport}>
                Export All Data
              </Button>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Import Data</h4>
              <p className="text-sm text-gray-600 mb-3">
                Restore from a previously exported JSON backup file.
              </p>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Paste your JSON backup data here..."
                className="w-full h-32 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono"
              />
              {importError && (
                <p className="mt-2 text-sm text-red-600">{importError}</p>
              )}
              {importSuccess && (
                <p className="mt-2 text-sm text-green-600">Data imported successfully!</p>
              )}
              <div className="mt-3">
                <Button variant="outline" onClick={handleImport}>
                  Import Data
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Reset to Defaults</h4>
              <p className="text-sm text-gray-600 mb-3">
                Reset all funds, transactions, and settings to default values.
                Your data will be permanently deleted.
              </p>
              <Button variant="danger" onClick={handleReset}>
                Reset All Data
              </Button>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Clear All Data</h4>
              <p className="text-sm text-gray-600 mb-3">
                Completely clear all data from local storage. This cannot be undone.
              </p>
              <Button variant="danger" onClick={handleClearData}>
                Clear All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Funds</p>
              <p className="font-medium">{Object.keys(funds).length}</p>
            </div>
            <div>
              <p className="text-gray-600">Transactions</p>
              <p className="font-medium">{transactions.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Budgets</p>
              <p className="font-medium">{budgets.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Storage</p>
              <p className="font-medium">
                {localStorage.getItem('finance-tracker-storage') 
                  ? `${Math.round(localStorage.getItem('finance-tracker-storage')!.length / 1024)} KB` 
                  : 'Empty'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
      }
