import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import KpiGroupCard, { type KpiGroup } from '../components/dashboard/KpiGroupCard';
import PieChart from '../components/PieChart';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Tabs from '../components/ui/Tabs';
import DataTable, { type Column } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import {
  MONTHLY_DELIVERIES_ACTUAL,
  MONTHLY_DELIVERIES_PLANNED,
  PLANTS,
  type PlantBreakdown,
} from '../lib/mockData/dashboard';
import { formatCurrency } from '../lib/format';
import {
  breakdownFor,
  computeFilteredTotals,
  computeFilteredStatusDistribution,
  computeFilteredPlantSegments,
  type PlantFilter,
  type ContractTypeFilter,
  type PeriodFilter,
} from '../lib/dashboardFilters';

const PAGE_SIZE = 4;

interface StatusRow {
  key: string;
  status: string;
  orders: number;
  share: string;
}

const statusColumns: Column<StatusRow>[] = [
  { key: 'status', header: 'Status' },
  { key: 'orders', header: 'Orders', align: 'right' },
  { key: 'share', header: 'Share', align: 'right' },
];

const plantColumns: Column<PlantBreakdown>[] = [
  { key: 'plant', header: 'Plant' },
  { key: 'activeOrders', header: 'Active Orders', align: 'right' },
  { key: 'inTransit', header: 'In Transit', align: 'right' },
  { key: 'delayed', header: 'Delayed', align: 'right' },
  { key: 'governanceApprovals', header: 'Approvals', align: 'right' },
  {
    key: 'pendingPaymentsCr',
    header: 'Pending Payments',
    align: 'right',
    render: (row) => formatCurrency(row.pendingPaymentsCr),
  },
];

export default function Dashboard() {
  const [plant, setPlant] = useState<PlantFilter>('all');
  const [contractType, setContractType] = useState<ContractTypeFilter>('all');
  const [period, setPeriod] = useState<PeriodFilter>('6m');
  const [page, setPage] = useState(1);

  const totals = useMemo(() => computeFilteredTotals(plant, contractType, period), [plant, contractType, period]);
  const statusData = useMemo(
    () => computeFilteredStatusDistribution(plant, contractType, period),
    [plant, contractType, period],
  );
  const plantData = useMemo(
    () => computeFilteredPlantSegments(plant, contractType, period),
    [plant, contractType, period],
  );

  const actual = useMemo(
    () => (period === '3m' ? MONTHLY_DELIVERIES_ACTUAL.slice(-3) : MONTHLY_DELIVERIES_ACTUAL),
    [period],
  );
  const planned = useMemo(
    () => (period === '3m' ? MONTHLY_DELIVERIES_PLANNED.slice(-3) : MONTHLY_DELIVERIES_PLANNED),
    [period],
  );

  const kpiGroups: KpiGroup[] = useMemo(
    () => [
      {
        header: 'Total Active Orders',
        data: [
          { title: 'Active', value: totals.activeOrders },
          { title: 'In Transit', value: totals.inTransit },
        ],
      },
      {
        header: 'Total Delivery Exposure',
        data: [
          { title: 'Delayed', value: totals.delayed },
          { title: 'On Track', value: Math.max(0, totals.activeOrders - totals.delayed) },
        ],
      },
      {
        header: 'Total Governance Load',
        data: [
          { title: 'Approvals', value: totals.governanceApprovals },
          { title: 'Cleared', value: Math.max(0, totals.activeOrders - totals.governanceApprovals) },
        ],
      },
      {
        header: 'Total Pending Payments',
        data: [
          { title: 'Pending', value: formatCurrency(totals.pendingPaymentsCr) },
          { title: 'Sites', value: plantData.length },
        ],
      },
    ],
    [totals, plantData.length],
  );

  const positionGroup: KpiGroup = useMemo(
    () => ({
      header: 'Network Position & Forecast',
      data: [
        { title: 'Active Orders', value: totals.activeOrders },
        { title: 'In Transit', value: totals.inTransit },
        { title: 'Delayed', value: totals.delayed },
        { title: 'Approvals', value: totals.governanceApprovals },
        { title: 'Pending Payments', value: formatCurrency(totals.pendingPaymentsCr) },
      ],
    }),
    [totals],
  );

  const statusRows: StatusRow[] = useMemo(() => {
    const total = statusData.reduce((sum, s) => sum + s.value, 0) || 1;
    return statusData.map((s) => ({
      key: s.key,
      status: s.fullLabel,
      orders: s.value,
      share: `${((s.value / total) * 100).toFixed(1)}%`,
    }));
  }, [statusData]);

  const plantRows = useMemo(() => {
    const source = breakdownFor(period);
    return plant === 'all' ? source : source.filter((row) => row.id === plant);
  }, [plant, period]);

  const pageCount = Math.max(1, Math.ceil(plantRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedPlantRows = plantRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <AppShell>
      <div className="tsy space-y-6">
        <div className="tsy-page-head">
          <h1 className="tsy-page-title">Vendor Operations Control Dashboard</h1>
          <nav aria-label="breadcrumb" className="mb-3 flex items-center gap-2 text-sm">
            <Link to="/" className="tsy-title hover:underline">
              Home
            </Link>
            <span>/</span>
            <span className="font-medium">Operations Home Page</span>
          </nav>
        </div>

        {/* Filters */}
        <div className="tsy-section grid grid-cols-1 gap-6 p-6 md:grid-cols-4">
          <div className="flex flex-col gap-1">
            <span className="tsy-title truncate font-semibold whitespace-nowrap">Plant</span>
            <Select
              ariaLabel="Filter by plant"
              value={plant}
              onChange={setPlant}
              options={[{ value: 'all', label: 'All Plants' }, ...PLANTS.map((p) => ({ value: p.id, label: p.label }))]}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="tsy-title truncate font-semibold whitespace-nowrap">Time Period</span>
            <Select
              ariaLabel="Filter by period"
              value={period}
              onChange={setPeriod}
              options={[
                { value: '3m', label: 'Last 3 Months' },
                { value: '6m', label: 'Last 6 Months' },
              ]}
            />
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="tsy-title truncate font-semibold whitespace-nowrap">Contract Type</span>
            <Tabs
              active={contractType}
              onChange={(value) => setContractType(value as ContractTypeFilter)}
              size="sm"
              variant="segmented"
              tabs={[
                { key: 'all', label: 'All' },
                { key: 'Manufactured', label: 'Manufactured' },
                { key: 'Material', label: 'Material' },
              ]}
            />
          </div>
          <div className="flex items-end justify-end">
            <Button as={Link} to="/orders/create" variant="primary" size="lg" className="tsy-btn" icon={<Plus size={16} />}>
              Create Order
            </Button>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {kpiGroups.map((group) => (
            <KpiGroupCard key={group.header} group={group} />
          ))}
        </div>

        {/* Position + pipeline composition */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="tsy-card h-125 overflow-auto p-6">
            <h3 className="tsy-title mb-6 text-[28px] font-semibold">{positionGroup.header}</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {positionGroup.data.map((item) => (
                <div key={item.title} className="tsy-section p-2">
                  <div className="tsy-title text-[28px] font-semibold">{item.value}</div>
                  <p className="text-xl font-medium uppercase">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="tsy-card p-6 xl:col-span-2">
            <h3 className="tsy-title mb-6 text-[28px] font-semibold">Orders by Status (Active)</h3>
            <PieChart
              data={statusData}
              unit=""
              valuePrefix=""
              shareLabel="Share"
              shareUnitLabel="of active orders"
              totalLabel="Total Active"
              idleHint=""
              showTrend={false}
              ariaLabel="Order status distribution"
            />
          </div>
        </div>

        {/* By status / by plant */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="tsy-card space-y-6 p-2">
            <h3 className="tsy-title pl-4 text-[28px] font-semibold">By Status</h3>
            <PieChart
              data={statusData}
              unit=""
              valuePrefix=""
              shareLabel="Share"
              shareUnitLabel="of active orders"
              totalLabel="Total Active"
              idleHint=""
              showTrend={false}
              ariaLabel="Orders by status"
            />
            <DataTable
              columns={statusColumns}
              rows={statusRows}
              rowKey={(row) => row.key}
              surface={false}
              density="compact"
              minWidth="360px"
            />
          </div>
          <div className="tsy-card space-y-6 p-2">
            <h3 className="tsy-title pl-4 text-[28px] font-semibold">By Plant</h3>
            <BarChart data={plantData} unit="" valuePrefix="" shareLabel="Share of active orders" showTrend={false} />
          </div>
        </div>

        {/* Plant-wise breakdown */}
        <div>
          <h3 className="tsy-title mb-6 text-[28px] font-semibold">Plant-wise Order & Payment Breakdown</h3>
          <div className="tsy-card overflow-hidden">
            <DataTable
              columns={plantColumns}
              rows={pagedPlantRows}
              rowKey={(row) => row.id}
              surface={false}
              minWidth="720px"
              footer={
                <Pagination
                  page={currentPage}
                  pageCount={pageCount}
                  pageSize={PAGE_SIZE}
                  total={plantRows.length}
                  onPageChange={setPage}
                />
              }
            />
          </div>
        </div>

        {/* Delivery trend */}
        <div>
          <h3 className="tsy-title mb-6 text-[28px] font-semibold">Monthly Deliveries — Planned vs. Actual</h3>
          <div className="tsy-card h-105 w-full p-4">
            <LineChart
              data={actual}
              secondaryData={planned}
              unit=""
              valuePrefix=""
              primaryLabel="Actual"
              secondaryLabel="Planned"
              periodLabel="Deliveries"
              changeLabel="MoM change"
              ariaLabel="Monthly deliveries, planned vs actual"
              fillHeight
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
