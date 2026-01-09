'use client';

import { TransactionForm } from '@/components/financial/TransactionForm';
import Link from 'next/link';

export default function AddTransactionPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Transaction</h1>
        <p className="text-gray-600">
          Record income (with cost of production) or expenses (from specific funds).
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TransactionForm />
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Important Rules</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">💰</span>
                <span><strong>Income</strong> = Revenue - Cost of Production</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <span>Only <strong>profit</strong> is distributed to funds</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💸</span>
                <span>Cost of production <strong>never</strong> enters funds</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎯</span>
                <span>Expenses deduct from <strong>one specific fund</strong></span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/funds"
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                View all funds
              </Link>
              <Link
                href="/dashboard"
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Back to dashboard
              </Link>
              <Link
                href="/reports"
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                View reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
