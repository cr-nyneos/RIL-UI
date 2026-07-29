import { Package, Truck, AlertTriangle, ShieldCheck, Wallet } from 'lucide-react';
import StatCard from '../ui/StatCard';
import { KPI_SPARKLINES } from '../../lib/mockData/dashboard';
import type { FilteredTotals } from '../../lib/dashboardFilters';

interface KpiRowProps {
  totals: FilteredTotals;
}

export default function KpiRow({ totals }: KpiRowProps) {
  return (
    <div className="grid grid-cols-2 items-stretch gap-5 lg:grid-cols-5">
      <StatCard
        icon={Package}
        label="Active Orders"
        value={String(totals.activeOrders)}
        trend="up"
        trendValue="6"
        tone="info"
        sparkline={KPI_SPARKLINES.activeOrders}
        href="/orders"
        gradientValue
      />
      <StatCard
        icon={Truck}
        label="In Transit"
        value={String(totals.inTransit)}
        trend="up"
        trendValue="2"
        tone="info"
        sparkline={KPI_SPARKLINES.inTransit}
        href="/orders"
      />
      <StatCard
        icon={AlertTriangle}
        label="Delayed"
        value={String(totals.delayed)}
        trend="up"
        trendValue="1"
        tone="danger"
        sparkline={KPI_SPARKLINES.delayed}
        href="/orders"
      />
      <StatCard
        icon={ShieldCheck}
        label="Governance Approvals"
        value={String(totals.governanceApprovals)}
        trend="down"
        trendValue="1"
        tone="warning"
        sparkline={KPI_SPARKLINES.governanceApprovals}
        href="/approvals"
      />
      <StatCard
        icon={Wallet}
        label="Pending Payments"
        value={`₹${totals.pendingPaymentsCr.toFixed(1)} Cr`}
        trend="up"
        trendValue="0.4"
        tone="warning"
        sparkline={KPI_SPARKLINES.pendingPayments}
        href="/payments"
      />
    </div>
  );
}
