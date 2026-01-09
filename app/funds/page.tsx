'use client';

import { useFinanceStore } from '@/lib/store/financeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { Fund } from '@/types';

export default function FundsPage() {
  const funds = useFinanceStore((state) => state.funds);
  const profitDistribution = useFinanceStore((state) => state.profitDistribution);
  const updateFund = useFinanceStore((state) => state.updateFund);
  const createFund = useFinanceStore((state) => state.createFund);
  const deleteFund = useFinanceStore((state) => state.deleteFund);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFundName, setNewFundName] = useState('');
  const [newFundDescription, setNewFundDescription] = useState('');
  const [newFundColor, setNewFundColor] = useState('#3B82F6');
  const [error, setError] = useState<string | null>(null);
  
  const handleCreateFund = () => {
    if (!newFundName.trim()) {
      setError('Fund name is required');
      return;
    }
    
    try {
      createFund({
        name: newFundName,
        description: newFundDescription,
        color: newFundColor,
      });
      
      setNewFundName('');
      setNewFundDescription('');
      setNewFundColor('#3B82F6');
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create fund');
    }
  };
  
  const handleDeleteFund = (fundId: string) => {
    if (window.confirm('Are you sure you want to delete this fund?')) {
      try {
        deleteFund(fundId);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete fund');
      }
    }
  };
  
  // Get distribution percentage for each fund
  const getDistributionPercentage = (fundId: string) => {
    const distribution = profitDistribution.find(d => d.fundId === fundId);
    return distribution ? distribution.percentage : 0;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fund Management</h1>
          <p className="text-gray-600">
            All money exists in funds. Each fund tracks balance and lifetime totals.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'Create New Fund'}
        </Button>
      </div>
      
      {/* Create Fund Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Fund</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fund Name *
                </label>
                <input
                  type="text"
                  value={newFundName}
                  onChange={(e) => setNewFundName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g., Vacation Fund"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newFundDescription}
                  onChange={(e) => setNewFundDescription(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="What is this fund for?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={newFundColor}
                  onChange={(e) => setNewFundColor(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleCreateFund}>
                  Create Fund
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Funds List */}
      <Card>
        <CardHeader>
          <CardTitle>All Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fund</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Profit Distribution</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Current Balance</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Lifetime Inflow</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Lifetime Outflow</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(funds).map((fund) => (
                  <tr key={fund.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: fund.color }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{fund.name}</div>
                          <div className="text-sm text-gray-600">{fund.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-700">
                        {getDistributionPercentage(fund.id)}%
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`font-semibold ${fund.currentBalance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        ${fund.currentBalance.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-green-600">
                      ${fund.lifetimeInflow.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-red-600">
                      ${fund.lifetimeOutflow.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newName = prompt('Enter new name:', fund.name);
                            if (newName) {
                              updateFund(fund.id, { name: newName });
                            }
                          }}
                        >
                          Rename
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFund(fund.id)}
                          disabled={fund.currentBalance > 0}
                          title={fund.currentBalance > 0 ? 'Cannot delete fund with balance' : ''}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Financial Invariants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Financial Invariants</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Sum of distribution percentages = 100%</li>
            <li>✓ Expense amount = Source fund deduction</li>
            <li>✓ ∑Fund Balances = ∑Profit Distributed − ∑Expenses</li>
            <li>✓ Every transaction has complete audit trail</li>
          </ul>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Fund Properties</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Current Balance (real-time)</li>
            <li>• Lifetime Inflow (immutable)</li>
            <li>• Lifetime Outflow (immutable)</li>
            <li>• Never decreases except for expenses</li>
          </ul>
        </div>
      </div>
    </div>
  );
                    }
