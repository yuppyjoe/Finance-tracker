'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/store/financeStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TransactionType } from '@/types';

export function TransactionForm() {
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const funds = useFinanceStore((state) => state.funds);
  
  const [type, setType] = useState<TransactionType>('INCOME');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [costOfProduction, setCostOfProduction] = useState('');
  const [sourceFundId, setSourceFundId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    try {
      const transactionData = {
        type,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        ...(type === 'INCOME' && {
          costOfProduction: parseFloat(costOfProduction),
        }),
        ...(type === 'EXPENSE' && {
          sourceFundId,
        }),
      };
      
      addTransaction(transactionData);
      
      // Reset form
      setAmount('');
      setDescription('');
      setCostOfProduction('');
      setSourceFundId('');
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    }
  };
  
  const handleAmountChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };
  
  const handleCostChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setCostOfProduction(value);
    }
  };
  
  const profit = type === 'INCOME' && amount && costOfProduction
    ? parseFloat(amount) - parseFloat(costOfProduction)
    : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">Transaction added successfully!</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="What was this transaction for?"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($)
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="0.00"
              required
            />
          </div>
          
          {type === 'INCOME' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost of Production ($)
                <span className="text-gray-500 text-xs ml-1">
                  (Will be subtracted from income, not added to funds)
                </span>
              </label>
              <input
                type="text"
                value={costOfProduction}
                onChange={(e) => handleCostChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="0.00"
                required
              />
              
              {amount && costOfProduction && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span>Income:</span>
                    <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cost:</span>
                    <span className="font-medium">${parseFloat(costOfProduction).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-1 mt-1">
                    <span>Profit (to distribute):</span>
                    <span className="text-green-600">${profit.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {type === 'EXPENSE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay From Fund
              </label>
              <select
                value={sourceFundId}
                onChange={(e) => setSourceFundId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select a fund</option>
                {Object.values(funds).map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name} (${fund.currentBalance.toFixed(2)})
                  </option>
                ))}
              </select>
              
              {sourceFundId && funds[sourceFundId] && (
                <div className="mt-2 text-sm text-gray-600">
                  Available: ${funds[sourceFundId].currentBalance.toFixed(2)}
                </div>
              )}
            </div>
          )}
          
          <Button type="submit" className="w-full">
            Add Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
                                       }
