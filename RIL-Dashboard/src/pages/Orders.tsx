import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardPlus, Download, PackageSearch } from 'lucide-react';
import * as XLSX from 'xlsx';

import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import SummaryStrip from '../components/ui/SummaryStrip';
import Tabs from '../components/ui/Tabs';
import DataTable, { type Column, type SortState } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import Section from '../components/ui/Section';
import StatusBadge from '../components/ui/StatusBadge';
import TypeBadge from '../components/ui/TypeBadge';
import ProgressMeter from '../components/ui/ProgressMeter';
import GateRail from '../components/ui/GateRail';
import ExceptionFlags from '../components/ui/ExceptionFlags';
import Toast from '../components/ui/Toast';
import Button from '../components/ui/Button';

import { ORDER_PLANTS } from '../lib/mockData/orders';
import { getOrders } from '../lib/orderStore';
import type { Order } from '../lib/types/order';
import {
  formatExpected,
  formatValue,
  getOrderBucket,
  matchesFilter,
  matchesSearch,
  type OrderFilter,
} from '../lib/orderFilters';
import Select from '../components/ui/Select';

const PAGE_SIZE = 5;

const PLANT_OPTIONS = [
  { value: 'all', label: 'All Plants' },
  ...ORDER_PLANTS.map((plant) => ({ value: plant, label: plant })),
];

function exportOrdersToExcel(orders: Order[]) {
  const worksheet = XLSX.utils.json_to_sheet(
    orders.map((order) => {
      const currentGate = order.gates.find((gate) => gate.state === 'current')?.label ?? 'All gates cleared';
      const expected = formatExpected(order.expected, order.progress >= 100);
      const flags = order.flags.map((flag) => flag.detail || flag.type).join(', ');

      return {
        Order: order.id,
        PO: order.po,
        Vendor: order.vendor,
        Plant: order.plant,
        Type: order.type,
        Gate: currentGate,
        Progress: `${order.progress}%`,
        Expected: `${expected.label} ${expected.relative}`,
        Status: order.status,
        Flags: flags,
        Value: formatValue(order.valueCr),
      };
    }),
  );
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 14 },
    { wch: 28 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 10 },
    { wch: 24 },
    { wch: 24 },
    { wch: 32 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
  XLSX.writeFile(workbook, `orders-${new Date().toISOString().slice(0, 10)}.xlsx`, { compression: true });
}

function compare(a: Order, b: Order, key: string): number {
  switch (key) {
    case 'order':
      return a.id.localeCompare(b.id);
    case 'vendor':
      return a.vendor.localeCompare(b.vendor);
    case 'type':
      return a.type.localeCompare(b.type);
    case 'progress':
      return a.progress - b.progress;
    case 'expected':
      return a.expected.localeCompare(b.expected);
    case 'value':
      return a.valueCr - b.valueCr;
    default:
      return 0;
  }
}

export default function Orders() {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [plant, setPlant] = useState('all');
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [sort, setSort] = useState<SortState>({ key: 'order', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [staggerRows, setStaggerRows] = useState(true);
  const [toast, setToast] = useState<string | null>(() => {
    const state = location.state as { toast?: string } | null;
    return state?.toast ?? null;
  });
  const orders = useMemo(() => getOrders(), []);

  // Everything the strip and the tabs count is derived from this set, so the
  // numbers stay honest against the active search and plant filter.
  const scoped = useMemo(
    () => orders.filter((o) => (plant === 'all' || o.plant === plant) && matchesSearch(o, query)),
    [orders, plant, query],
  );

  const counts = useMemo(() => {
    const base = { execution: 0, delayed: 0, blocked: 0, completed: 0 };
    scoped.forEach((order) => {
      base[getOrderBucket(order)] += 1;
    });
    return {
      ...base,
      total: scoped.length,
      manufactured: scoped.filter((o) => o.type === 'Manufactured').length,
      material: scoped.filter((o) => o.type === 'Material').length,
    };
  }, [scoped]);

  const rows = useMemo(() => {
    const filtered = scoped.filter((order) => matchesFilter(order, filter));
    const sorted = [...filtered].sort((a, b) => {
      const result = compare(a, b, sort.key);
      return sort.dir === 'asc' ? result : -result;
    });
    return sorted;
  }, [scoped, filter, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const pageRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page],
  );

  // Any filter interaction resets to page 1 and stops the mount-only row cascade.
  const interact = () => {
    setStaggerRows(false);
    setPage(1);
  };

  const applyFilter = (next: OrderFilter) => {
    interact();
    setFilter((current) => (current === next ? 'all' : next));
  };

  const columns: Column<Order>[] = [
    {
      key: 'order',
      header: 'Order',
      width: '145px',
      sortable: true,
      render: (order) => (
        <div className="min-w-0">
          <div className="truncate text-[14px] leading-5 font-bold text-ink-900">{order.id}</div>
          <div className="text-meta truncate">{order.po}</div>
        </div>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor',
      sortable: true,
      render: (order) => (
        <div className="min-w-0">
          <div className="truncate text-[14px] leading-5 font-semibold text-ink-800" title={order.vendor}>
            {order.vendor}
          </div>
          <div className="text-meta truncate">{order.plant}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '125px',
      sortable: true,
      render: (order) => <TypeBadge type={order.type} />,
    },
    {
      key: 'gate',
      header: 'Gate',
      width: '170px',
      render: (order) => (
        <GateRail gates={order.gates} compact blocked={getOrderBucket(order) === 'blocked'} />
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      width: '110px',
      sortable: true,
      render: (order) => {
        const bucket = getOrderBucket(order);
        return (
          <ProgressMeter
            value={order.progress}
            showLabel
            tone={bucket === 'delayed' || bucket === 'blocked' ? 'danger' : 'neutral'}
            delay={80}
          />
        );
      },
    },
    {
      key: 'expected',
      header: 'Expected',
      width: '130px',
      sortable: true,
      render: (order) => {
        const expected = formatExpected(order.expected, order.progress >= 100);
        return (
          <div className="min-w-0">
            <div className="truncate text-[14px] leading-5 font-semibold text-ink-800">{expected.label}</div>
            <div
              className="truncate text-[12px] leading-[18px] font-medium"
              style={{ color: expected.overdue ? 'var(--color-danger)' : 'var(--color-ink-500)' }}
            >
              {expected.relative}
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '250px',
      render: (order) => (
        <div className="flex min-w-0 items-center gap-1.5 overflow-visible">
          <StatusBadge status={order.status} wrap className="max-w-[150px] justify-center leading-4" />
          <ExceptionFlags flags={order.flags} />
        </div>
      ),
    },
    {
      key: 'value',
      header: 'Value',
      width: '100px',
      align: 'right',
      sortable: true,
      render: (order) => (
        <span className="text-[14px] leading-5 font-bold tabular-nums text-ink-800">
          {formatValue(order.valueCr)}
        </span>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div className="animate-rise" style={{ animationDelay: '0ms' }}>
          <PageHeader
            title="Orders"
            actions={
              <>
                <Button
                  variant="secondary"
                  icon={<Download size={16} strokeWidth={2.2} />}
                  className="cursor-pointer"
                  onClick={() => {
                    exportOrdersToExcel(rows);
                    setToast(`Exported ${rows.length} orders.`);
                  }}
                >
                  Export
                </Button>
                <Button
                  variant="primary"
                  icon={<ClipboardPlus size={16} strokeWidth={2.2} />}
                  className="cursor-pointer"
                  onClick={() => navigate('/orders/create')}
                >
                  Create Order
                </Button>
              </>
            }
          />
        </div>

        <Section
          title="Order Register"
          description={`${rows.length} of ${counts.total} orders in the current scope.`}
          padded={false}
          className="animate-rise"
          style={{ animationDelay: '60ms' }}
          toolbar={
            <>
              <SearchInput
                value={query}
                onChange={(value) => {
                  interact();
                  setQuery(value);
                }}
                placeholder="Search order, PO, or vendor"
                className="w-[260px]"
              />
              <Select
                ariaLabel="Filter by plant"
                value={plant}
                options={PLANT_OPTIONS}
                onChange={(value) => {
                  interact();
                  setPlant(value);
                }}
              />
              <Tabs
                className="ml-auto"
                active={filter}
                onChange={(key) => applyFilter(key as OrderFilter)}
                size="sm"
                toggleOff
                tabs={[
                  { key: 'all', label: 'All', count: counts.total },
                  { key: 'manufactured', label: 'Manufactured', count: counts.manufactured },
                  { key: 'material', label: 'Material', count: counts.material },
                  { key: 'delayed', label: 'Delayed', count: counts.delayed },
                  { key: 'completed', label: 'Completed', count: counts.completed },
                ]}
              />
            </>
          }
        >
          <div className="border-b border-[var(--color-border)]">
            <SummaryStrip
              onSelect={(key) => applyFilter(key === 'total' ? 'all' : (key as OrderFilter))}
              items={[
                { key: 'total', label: 'Total', value: counts.total, active: filter === 'all' },
                { key: 'execution', label: 'In Execution', value: counts.execution, active: filter === 'execution' },
                { key: 'delayed', label: 'Delayed', value: counts.delayed, tone: 'danger', active: filter === 'delayed' },
                { key: 'blocked', label: 'Blocked', value: counts.blocked, tone: 'danger', active: filter === 'blocked' },
                { key: 'completed', label: 'Completed', value: counts.completed, active: filter === 'completed' },
              ]}
            />
          </div>

          <DataTable
            surface={false}
            columns={columns}
            rows={pageRows}
            rowKey={(order) => order.id}
            onRowClick={(order) => navigate(`/orders/${order.id}`)}
            sort={sort}
            onSortChange={(next) => {
              interact();
              setSort(next);
            }}
            stagger={staggerRows}
            minWidth="1100px"
            bodyKey={`${filter}-${query}-${plant}-${sort.key}-${sort.dir}-${page}`}
            emptyState={
              <EmptyState
                icon={<PackageSearch size={22} strokeWidth={2.1} />}
                title="No orders match these filters"
                description="Try clearing the search or switching back to All."
              />
            }
            footer={
              <Pagination
                page={page}
                pageCount={pageCount}
                pageSize={PAGE_SIZE}
                total={rows.length}
                onPageChange={(next) => {
                  interact();
                  setPage(next);
                }}
              />
            }
          />
        </Section>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
