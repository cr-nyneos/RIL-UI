import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, PackageSearch } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import SummaryStrip from '../components/ui/SummaryStrip';
import Tabs from '../components/ui/Tabs';
import DataTable, { type Column, type SortState } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import StatusBadge from '../components/ui/StatusBadge';
import TypeBadge from '../components/ui/TypeBadge';
import ProgressMeter from '../components/ui/ProgressMeter';
import GateRail from '../components/ui/GateRail';
import ExceptionFlags from '../components/ui/ExceptionFlags';
import Toast from '../components/ui/Toast';
import Button from '../components/ui/Button';

import { ORDERS, ORDER_PLANTS } from '../lib/mockData/orders';
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

const PAGE_SIZE = 12;

const PLANT_OPTIONS = [
  { value: 'all', label: 'All Plants' },
  ...ORDER_PLANTS.map((plant) => ({ value: plant, label: plant })),
];

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

  const [query, setQuery] = useState('');
  const [plant, setPlant] = useState('all');
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [sort, setSort] = useState<SortState>({ key: 'expected', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [staggerRows, setStaggerRows] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Everything the strip and the tabs count is derived from this set, so the
  // numbers stay honest against the active search and plant filter.
  const scoped = useMemo(
    () => ORDERS.filter((o) => (plant === 'all' || o.plant === plant) && matchesSearch(o, query)),
    [plant, query],
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
      width: '170px',
      sortable: true,
      render: (order) => (
        <div className="min-w-0">
          <div className="truncate text-[15px] leading-5 font-bold text-ink-900">{order.id}</div>
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
          <div className="truncate text-[15px] leading-5 font-semibold text-ink-800" title={order.vendor}>
            {order.vendor}
          </div>
          <div className="text-meta truncate">{order.plant}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '140px',
      sortable: true,
      render: (order) => <TypeBadge type={order.type} />,
    },
    {
      key: 'gate',
      header: 'Gate',
      width: '190px',
      render: (order) => (
        <GateRail gates={order.gates} compact blocked={getOrderBucket(order) === 'blocked'} />
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      width: '130px',
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
      width: '150px',
      sortable: true,
      render: (order) => {
        const expected = formatExpected(order.expected, order.progress >= 100);
        return (
          <div className="min-w-0">
            <div className="truncate text-[15px] leading-5 font-semibold text-ink-800">{expected.label}</div>
            <div
              className="truncate text-[13px] leading-[18px] font-medium"
              style={{ color: expected.overdue ? '#BE123C' : 'var(--color-ink-500)' }}
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
      width: '290px',
      render: (order) => (
        <div className="flex min-w-0 items-center gap-2">
          <StatusBadge status={order.status} />
          <ExceptionFlags flags={order.flags} />
        </div>
      ),
    },
    {
      key: 'value',
      header: 'Value',
      width: '120px',
      align: 'right',
      sortable: true,
      render: (order) => (
        <span className="text-[15px] leading-5 font-bold tabular-nums text-ink-800">
          {formatValue(order.valueCr)}
        </span>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="animate-rise" style={{ animationDelay: '0ms' }}>
          <PageHeader
            title="Orders"
            actions={
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
                <Button
                  variant="secondary"
                  icon={<Download size={16} strokeWidth={2.2} />}
                  onClick={() => setToast('Export queued — available in the full release.')}
                >
                  Export
                </Button>
              </>
            }
          />
        </div>

        <div className="animate-rise" style={{ animationDelay: '90ms' }}>
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

        <div className="animate-rise" style={{ animationDelay: '160ms' }}>
          <Tabs
            active={filter}
            onChange={(key) => applyFilter(key as OrderFilter)}
            toggleOff
            tabs={[
              { key: 'all', label: 'All', count: counts.total },
              { key: 'manufactured', label: 'Manufactured', count: counts.manufactured },
              { key: 'material', label: 'Material', count: counts.material },
              { key: 'delayed', label: 'Delayed', count: counts.delayed },
              { key: 'completed', label: 'Completed', count: counts.completed },
            ]}
          />
        </div>

        <div className="animate-rise" style={{ animationDelay: '230ms' }}>
          <DataTable
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
            minWidth="1400px"
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
        </div>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
