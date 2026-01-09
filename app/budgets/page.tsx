'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store/financeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Budget, BudgetAllocation } from '@/types';

export default function BudgetsPage() {
  const funds = useFinanceStore((state) => state.funds);
  const budgets = useFinanceStore((state) => state.budgets);
  const addBudget = useFinanceStore((state) => state.addBudget);
  const updateBudget = useFinanceStore((state) => state.updateBudget);
  const deleteBudget = useFinanceStore((state) => state.deleteBudget);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetTarget, setNewBudgetTarget] = useState('');
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const handleAddAllocation = () => {
    const fundIds = Object.keys(funds);
    if (fundIds.length === 0) {
      setError('No funds available');
      return;
    }
    
    const availableFunds = fundIds.filter(
      fundId => !allocations.some(a => a.fundId === fundId)
    );
    
    if (availableFunds.length === 0) {
      setError('All funds already allocated');
      return;
    }
    
    setAllocations([
      ...allocations,
      { fundId: availableFunds[0], percentage: 0 },
    ]);
  };
  
  const handleAllocationChange = (index: number, updates: Partial<BudgetAllocation>) => {
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], ...updates };
    setAllocations(newAllocations);
  };
  
  const handleRemoveAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };
  
  const handleCreateBudget = () => {
    if (!newBudgetName.trim()) {
      setError('Budget name is required');
      return;
    }
    
    const targetAmount = parseFloat(newBudgetTarget);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      setError('Valid target amount is required');
      return;
    }
    
    if (allocations.length === 0) {
      setError('At least one fund allocation is required');
      return;
    }
    
    const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      setError(Allocations must sum to 100% (currently ${totalPercentage.toFixed(2)}%));
      return;
    }
    
    try {
      addBudget({
        name: newBudgetName,
        targetAmount,
        allocations,
      });
      
      // Reset form
      setNewBudgetName('');
      setNewBudgetTarget('');
      setAllocations([]);
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create budget');
    }
  };
  
  const totalAllocationPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);
  const allocationValidation = Math.abs(totalAllocationPercentage - 100) < 0.01;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600">
            Set savings targets that automatically pull from funds when money arrives.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'Create New Budget'}
        </Button>
      </div>
      
      {/* Create Budget Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Budget</CardTitle>
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
                  Budget Name *
                </label>
                <input
                  type="text"
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g., New Laptop Budget"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newBudgetTarget}
                  onChange={(e) => setNewBudgetTarget(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="1500.00"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fund Allocations
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddAllocation}
                  >
                    Add Fund
                  </Button>
                </div>
                
                {allocations.length === 0 ? (
                  <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-md">
                    <p className="text-sm text-gray-500">
                      Add at least one fund to allocate money from
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allocations.map((allocation, index) => {
                      const fund = funds[allocation.fundId];
                      return (
                        <div key={index} className="flex items-center space-x-3">
                          <select
                            value={allocation.fundId}
                            onChange={(e) => handleAllocationChange(index, { fundId: e.target.value })}
                            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                          >
                            {Object.values(funds).map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name} (${f.currentBalance.toFixed(2)})
                              </option>
                            ))}
                          </select>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={allocation.percentage}
                              onChange={(e) => handleAllocationChange(index, { 
                                percentage: parseFloat(e.target.value) || 0 
                              })}
                              className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
                            />
                            <span className="text-sm text-gray-600">%</span>
                          </div>
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAllocation(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                    
                    <div className={`text-sm font-medium ${
                      allocationValidation ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Total: {totalAllocationPercentage.toFixed(2)}% 
                      {allocationValidation ? ' ✓' : ' ✗'}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleCreateBudget} disabled={!allocationValidation}>
                  Create Budget
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Active Budgets */}
      <Card>
        <CardHeader>
          <CardTitle>Active Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          {budgets.filter(b => b.status === 'ACTIVE').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active budgets. Create your first budget to start saving!
            </div>
          ) : (
            <div className="space-y-4">
              {budgets
                .filter(b => b.status === 'ACTIVE')
                .map((budget) => (
                  <BudgetCard key={budget.id} budget={budget} />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Budget Rules Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How Budgets Work</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">🎯</span>
            <span>Budgets are <strong>targets</strong>, not accounts</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🤖</span>
            <span>Auto-pull from linked funds when money arrives</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">📊</span>
            <span>Allocations must sum to <strong>exactly 100%</strong></span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">💰</span>
            <span>Money stays in original funds until budget completion</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function BudgetCard({ budget }: { budget: Budget }) {
  const funds = useFinanceStore((state) => state.funds);
  const updateBudget = useFinanceStore((state) => state.updateBudget);
  const deleteBudget = useFinanceStore((state) => state.deleteBudget);
  
  const progress = (budget.currentAmount / budget.targetAmount) * 100;
  const remaining = budget.targetAmount - budget.currentAmount;
  
  const handleComplete = () => {
    updateBudget(budget.id, { status: 'COMPLETED' });
  };
  
  const handleArchive = () => {
    updateBudget(budget.id, { status: 'ARCHIVED' });
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(budget.id);
    }
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{budget.name}</h4>
          <p className="text-sm text-gray-600">
            Target: ${budget.targetAmount.toFixed(2)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={handleComplete}>
            Complete
          </Button>
          <Button variant="ghost" size="sm" onClick={handleArchive}>
            Archive
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700">
            ${budget.currentAmount.toFixed(2)} of ${budget.targetAmount.toFixed(2)}
          </span>
          <span className="font-medium">{progress.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: ${Math.min(progress, 100)}% }}
          />
        </div>
        {remaining > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            ${remaining.toFixed(2)} remaining
          </p>
        )}
      </div>
      
      {/* Allocations */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Fund Allocations:</p>
        <div className="space-y-1">
          {budget.allocations.map((allocation, index) => {
            const fund = funds[allocation.fundId];
            if (!fund) return null;
            
            return (
              <div key={index} className="flex justify-between text-sm">
                <div className="flex items-center">
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: fund.color }}
                  />
                  <span className="text-gray-700">{fund.name}</span>
                </div>
                <span className="text-gray-900">{allocation.percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
