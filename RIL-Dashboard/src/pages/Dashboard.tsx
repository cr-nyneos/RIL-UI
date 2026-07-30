import { useMemo, useState } from 'react';
import AppShell from '../components/layout/AppShell';
// import GreetingHero from '../components/dashboard/GreetingHero';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import KpiRow from '../components/dashboard/KpiRow';
import OrderStatusCard from '../components/dashboard/OrderStatusCard';
import PlantLoadCard from '../components/dashboard/PlantLoadCard';
import DeliveryTrendCard from '../components/dashboard/DeliveryTrendCard';
import Section from '../components/ui/Section';
import { MONTHLY_DELIVERIES_ACTUAL, MONTHLY_DELIVERIES_PLANNED } from '../lib/mockData/dashboard';
import {  computeFilteredTotals,  computeFilteredStatusDistribution, computeFilteredPlantSegments,
  type PlantFilter,
  type ContractTypeFilter,
  type PeriodFilter,
} from '../lib/dashboardFilters';
import GreetingHero from '../components/dashboard/GreetingHero';

export default function Dashboard() {
  const [plant, setPlant] = useState<PlantFilter>('all');
  const [contractType, setContractType] = useState<ContractTypeFilter>('all');
  const [period, setPeriod] = useState<PeriodFilter>('6m');

  const totals = useMemo(() => computeFilteredTotals(plant, contractType), [plant, contractType]);
  const statusData = useMemo(() => computeFilteredStatusDistribution(plant, contractType), [plant, contractType]);
  const plantData = useMemo(() => computeFilteredPlantSegments(plant, contractType), [plant, contractType]);

  const actual = useMemo(
    () => (period === '3m' ? MONTHLY_DELIVERIES_ACTUAL.slice(-3) : MONTHLY_DELIVERIES_ACTUAL),
    [period],
  );
  const planned = useMemo(
    () => (period === '3m' ? MONTHLY_DELIVERIES_PLANNED.slice(-3) : MONTHLY_DELIVERIES_PLANNED),
    [period],
  );

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div className="animate-rise" style={{ animationDelay: '0ms' }}>
          <GreetingHero />
        </div>

        <Section
          title="Global Overview"
          description="Portfolio position across the selected plant, contract type and period."
          toolbar={
            <DashboardFilters
              plant={plant}
              onPlantChange={setPlant}
              contractType={contractType}
              onContractTypeChange={setContractType}
              period={period}
              onPeriodChange={setPeriod}
            />
          }
          padded={false}
          bodyClassName="p-4"
          className="animate-rise"
          style={{ animationDelay: '60ms' }}
        >
          <KpiRow totals={totals} />

          {/* Delivery trend lives in the same container as the KPI row — the
              headline numbers and the curve behind them are one reading. */}
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3 px-1 pt-4">
            <div className="min-w-0">
              <h3 className="text-section-title truncate">Delivery Trends</h3>
              <p className="text-meta mt-0.5 truncate">
                Planned against actual deliveries over the selected period.
              </p>
            </div>
            <span className="text-pill">{period === '3m' ? 'LAST 3 MONTHS' : 'LAST 6 MONTHS'}</span>
          </div>
          <div className="h-[25rem] w-full">
            <DeliveryTrendCard actual={actual} planned={planned} />
          </div>
        </Section>

        <Section
          title="Portfolio Analytics"
          description="Pipeline composition and site level load."
          padded={false}
          className="animate-rise"
          style={{ animationDelay: '180ms' }}
        >
          <div className="grid grid-cols-1 items-stretch divide-y divide-[var(--color-border)] xl:grid-cols-2 xl:divide-x xl:divide-y-0">
            <OrderStatusCard data={statusData} activeCount={totals.activeOrders} />
            <PlantLoadCard data={plantData} />
          </div>
        </Section>
      </div>
    </AppShell>
  );
}
