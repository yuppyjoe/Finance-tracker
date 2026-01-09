'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">
          Phase 3: Time-period filters and detailed financial reports (Coming Soon)
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Reports Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-500">Income vs Expenses Chart</p>
              <p className="text-sm text-gray-400 mt-2">(Phase 3)</p>
            </div>
            
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-500">Profit Distribution Analysis</p>
              <p className="text-sm text-gray-400 mt-2">(Phase 3)</p>
            </div>
            
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-500">Fund Performance Over Time</p>
              <p className="text-sm text-gray-400 mt-2">(Phase 3)</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Phase 3 Features</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Weekly / Monthly / Quarterly / Yearly reports</li>
              <li>• Custom date range filters</li>
              <li>• Income vs Expenses analysis</li>
              <li>• Profit distribution tracking</li>
              <li>• Fund performance metrics</li>
              <li>• Budget utilization reports</li>
            </ul>
            <p className="text-xs text-blue-600 mt-3">
              Note: Time filters affect reports only, never fund balances
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
