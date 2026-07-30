import { Package, Truck, AlertTriangle, ShieldCheck, Wallet } from 'lucide-react';
import StatCard from '../ui/StatCard';
import { KPI_SPARKLINES } from '../../lib/mockData/dashboard';
import type { FilteredTotals } from '../../lib/dashboardFilters';
import { formatCurrency } from '../../lib/format';

interface KpiRowProps {
  totals: FilteredTotals;
}

function trendValue(series: number[]): string {
  return String(Math.abs(series.at(-1)! - series.at(-2)!));
}

function trendDirection(series: number[]): 'up' | 'down' {
  return series.at(-1)! >= series.at(-2)! ? 'up' : 'down';
}

export default function KpiRow({ totals }: KpiRowProps) {
  return (
    <div className="grid grid-cols-2 items-stretch gap-5 lg:grid-cols-5">
      <StatCard
        icon={Package}
        label="Active Orders"
        value={String(totals.activeOrders)}
        trend={trendDirection(KPI_SPARKLINES.activeOrders)}
        trendValue={trendValue(KPI_SPARKLINES.activeOrders)}
        bloom="info"
        trendTone="neutral"
        accentId="active-orders"
        accentFill="var(--color-kpi-brand-fill)"
        accentText="var(--color-kpi-brand-text)"
        accentIcon="var(--color-kpi-brand-text)"
        sparkline={KPI_SPARKLINES.activeOrders}
        href="/orders"
        delay={200}
      />
      <StatCard
        icon={Truck}
        label="In Transit"
        value={String(totals.inTransit)}
        trend={trendDirection(KPI_SPARKLINES.inTransit)}
        trendValue={trendValue(KPI_SPARKLINES.inTransit)}
        bloom="neutral"
        trendTone="neutral"
        accentId="in-transit"
        accentFill="var(--color-kpi-neutral-fill)"
        accentText="var(--color-kpi-neutral-text)"
        accentIcon="var(--color-kpi-neutral-icon)"
        sparkline={KPI_SPARKLINES.inTransit}
        href="/orders"
        delay={260}
      />
      <StatCard
        icon={AlertTriangle}
        label="Delayed"
        value={String(totals.delayed)}
        trend={trendDirection(KPI_SPARKLINES.delayed)}
        trendValue={trendValue(KPI_SPARKLINES.delayed)}
        bloom="danger"
        trendTone="danger"
        accentId="delayed"
        accentFill="var(--color-kpi-danger-fill)"
        accentText="var(--color-kpi-danger-text)"
        accentIcon="var(--color-kpi-danger-text)"
        sparkline={KPI_SPARKLINES.delayed}
        href="/orders"
        delay={320}
      />
      <StatCard
        icon={ShieldCheck}
        label="Governance Approvals"
        value={String(totals.governanceApprovals)}
        trend={trendDirection(KPI_SPARKLINES.governanceApprovals)}
        trendValue={trendValue(KPI_SPARKLINES.governanceApprovals)}
        bloom="warning"
        trendTone="warning"
        accentId="governance-approvals"
        accentFill="var(--color-kpi-warning-fill)"
        accentText="var(--color-kpi-warning-text)"
        accentIcon="var(--color-kpi-warning-text)"
        sparkline={KPI_SPARKLINES.governanceApprovals}
        href="/approvals"
        delay={380}
      />
      <StatCard
        icon={Wallet}
        label="Pending Payments"
        value={formatCurrency(totals.pendingPaymentsCr)}
        trend={trendDirection(KPI_SPARKLINES.pendingPayments)}
        // trendValue={trendValue(KPI_SPARKLINES.pendingPayments)}
        bloom="neutral"
        trendTone="neutral"
        accentId="pending-payments"
        accentFill="var(--color-kpi-neutral-fill)"
        accentText="var(--color-kpi-neutral-text)"
        accentIcon="var(--color-kpi-neutral-icon)"
        sparkline={KPI_SPARKLINES.pendingPayments}
        href="/payments"
        delay={440}
      />
    </div>
  );
}
