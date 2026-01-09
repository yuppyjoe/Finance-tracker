# # Hybrid Business + Family Finance Tracker

A deterministic, auditable finance tracker that strictly separates business finance, profit distribution, and family budgeting.

## Features

### Phase 1: Core Finance Engine (Complete)
- ✅ Fund-based architecture with real-time balances
- ✅ Income tracking with cost of production
- ✅ Automatic profit calculation & distribution
- ✅ Expense logging with source fund selection
- ✅ Lifetime inflow/outflow tracking
- ✅ localStorage persistence
- ✅ Financial invariants enforcement

### Phase 2: Budgets & Auto-allocation (Complete)
- ✅ Budget creation with target amounts
- ✅ Allocation rules across multiple funds
- ✅ Auto-pull from linked funds
- ✅ Budget progress tracking

### Phase 3: Reporting & Analytics (Coming Soon)
- Time-period filters (Weekly, Monthly, Quarterly, Yearly, Custom)
- Income vs Expenses reports
- Profit distribution analysis
- Fund performance tracking

### Phase 4: UI Polish & Settings (Complete)
- Clean financial dashboard
- Settings panel with profit distribution
- Data export/import
- Tax fund toggle

## Tech Stack

- **Next.js 15+** (App Router, React 19+)
- **TypeScript 5+** (Strict mode)
- **Tailwind CSS 4+**
- **Zustand** for state management
- **localStorage** for persistence
- **Vercel** deployment ready

## Getting Started

1. **Clone and install:**
```bash
git clone <repository-url>
cd finance-tracker
npm install
