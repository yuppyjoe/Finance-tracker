'use client';

import { useFinanceStore } from '@/lib/store/financeStore';
import { calculateFundTotals } from '@/lib/finance/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardPage() {
  const funds = useFinanceStore((state) => state.funds);
  const transactions = useFinanceStore((state) => state.transactions);
  const lastUpdated = useFinanceStore((state) => state.lastUpdated);
  
  const totals = calculateFundTotals(funds);
  
  // Calculate recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);
  
  // Calculate metrics
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalProfit = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + (t.profit || 0), 0);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {format(lastUpdated, 'MMM d, yyyy HH:mm')}
        </div>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              ${totals.totalBalance.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Across {Object.keys(funds).length} funds
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${totalIncome.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Lifetime total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ${totalProfit.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              After costs: ${(totalIncome - totalProfit).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Funds Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Funds Overview</CardTitle>
            <Link href="/funds">
              <Button variant="outline" size="sm">
                Manage Funds
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fund</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Current Balance</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Lifetime Inflow</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Lifetime Outflow</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Transactions</CardTitle>
            <Link href="/add-transaction">
              <Button size="sm">Add Transaction</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions yet. Add your first transaction to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(transaction.date, 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transaction.type === 'INCOME' 
                        ? `Profit: $${transaction.profit?.toFixed(2)}` 
                        : 'Expense'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
        }
