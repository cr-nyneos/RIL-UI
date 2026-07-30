import { useMemo, useState } from 'react';
import AppShell from '../components/layout/AppShell';
// import GreetingHero from '../components/dashboard/GreetingHero';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import KpiRow from '../components/dashboard/KpiRow';
import OrderStatusCard from '../components/dashboard/OrderStatusCard';
import PlantLoadCard from '../components/dashboard/PlantLoadCard';
import DeliveryTrendCard from '../components/dashboard/DeliveryTrendCard';
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
    <>
    <AppShell>
      <div className="flex flex-col gap-8">
        <GreetingHero /> 
        <DashboardFilters
          plant={plant}
          onPlantChange={setPlant}
          contractType={contractType}
          onContractTypeChange={setContractType}
          period={period}
          onPeriodChange={setPeriod}
        />

        <KpiRow totals={totals} />

        <div className="grid grid-cols-1">
          <div className="animate-rise h-[30rem] w-full" style={{ animationDelay: '520ms' }}>
            <DeliveryTrendCard actual={actual} planned={planned} />
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
          <div className="animate-rise" style={{ animationDelay: '600ms' }}>
            <OrderStatusCard data={statusData} activeCount={totals.activeOrders} />
          </div>
          <div className="animate-rise" style={{ animationDelay: '680ms' }}>
            <PlantLoadCard data={plantData} />
          </div>
        </div>
      </div>
    </AppShell>
    </>
  );
}