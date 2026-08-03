import { useMemo, useState } from 'react';
import { Lightbulb, Plus, RotateCcw } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Toast from '../components/ui/Toast';
import KpiGroupCard, { type KpiGroup } from '../components/dashboard/KpiGroupCard';
import DataTable, { type Column, type SortState } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import AddOpportunityModal from './insights/AddOpportunityModal';

import {
  OPPORTUNITIES,
  OPPORTUNITY_DEPARTMENTS,
  OPPORTUNITY_PRIORITIES,
  OPPORTUNITY_STATUSES,
} from '../lib/mockData/insights';
import { formatDate } from '../lib/format';
import type {
  Opportunity,
  OpportunityImpact,
  OpportunityPriority,
  OpportunityStatus,
} from '../lib/types/insights';
import type { Tone } from '../lib/types/ui';

const DEFAULT_PAGE_SIZE = 10;

const EMPTY_FILTERS = {
  query: '',
  department: 'all',
  priority: 'all',
  status: 'all',
};

type InsightFilters = typeof EMPTY_FILTERS;

const DEPARTMENT_OPTIONS = [
  { value: 'all', label: 'All Departments' },
  ...OPPORTUNITY_DEPARTMENTS.map((department) => ({ value: department, label: department })),
];
const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  ...OPPORTUNITY_PRIORITIES.map((priority) => ({ value: priority, label: priority })),
];
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  ...OPPORTUNITY_STATUSES.map((status) => ({ value: status, label: status })),
];

const PRIORITY_ORDER: Record<OpportunityPriority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const IMPACT_ORDER: Record<OpportunityImpact, number> = { High: 0, Medium: 1, Low: 2 };

const PRIORITY_TONE: Record<OpportunityPriority, Tone> = {
  Critical: 'danger',
  High: 'warning',
  Medium: 'brand',
  Low: 'neutral',
};

const STATUS_TONE: Record<OpportunityStatus, Tone> = {
  Backlog: 'neutral',
  'In Progress': 'brand',
  'In Review': 'warning',
  Completed: 'success',
  'On Hold': 'danger',
};

const IMPACT_COLOR: Record<OpportunityImpact, string> = {
  High: 'var(--color-success)',
  Medium: 'var(--color-brand-500)',
  Low: 'var(--color-ink-400)',
};

function matches(opportunity: Opportunity, filters: InsightFilters): boolean {
  const query = filters.query.trim().toLowerCase();
  if (
    query &&
    ![opportunity.title, opportunity.owner, opportunity.department].some((field) =>
      field.toLowerCase().includes(query),
    )
  ) {
    return false;
  }
  if (filters.department !== 'all' && opportunity.department !== filters.department) return false;
  if (filters.priority !== 'all' && opportunity.priority !== filters.priority) return false;
  if (filters.status !== 'all' && opportunity.status !== filters.status) return false;
  return true;
}

function compare(a: Opportunity, b: Opportunity, key: string): number {
  switch (key) {
    case 'department':
      return a.department.localeCompare(b.department);
    case 'priority':
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    case 'owner':
      return a.owner.localeCompare(b.owner);
    case 'status':
      return a.status.localeCompare(b.status);
    case 'impact':
      return IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact];
    case 'updated':
      return a.lastUpdated.localeCompare(b.lastUpdated);
    default:
      return a.title.localeCompare(b.title);
  }
}

export default function Insights() {
  const [items, setItems] = useState<Opportunity[]>(OPPORTUNITIES);
  const [filters, setFilters] = useState<InsightFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortState>({ key: 'updated', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [staggerRows, setStaggerRows] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => {
    const filtered = items.filter((opportunity) => matches(opportunity, filters));
    return [...filtered].sort((a, b) => {
      const result = compare(a, b, sort.key);
      return sort.dir === 'asc' ? result : -result;
    });
  }, [items, filters, sort]);

  const kpiGroups: KpiGroup[] = useMemo(
    () => [
      {
        header: 'Backlog Size',
        data: [
          { title: 'Opportunities', value: rows.length },
          { title: 'Departments', value: new Set(rows.map((o) => o.department)).size },
        ],
      },
      {
        header: 'In Flight',
        data: [
          { title: 'In Progress', value: rows.filter((o) => o.status === 'In Progress').length },
          { title: 'In Review', value: rows.filter((o) => o.status === 'In Review').length },
        ],
      },
      {
        header: 'Priority Load',
        data: [
          { title: 'Critical', value: rows.filter((o) => o.priority === 'Critical').length },
          { title: 'High', value: rows.filter((o) => o.priority === 'High').length },
        ],
      },
      {
        header: 'Delivered Impact',
        data: [
          { title: 'Completed', value: rows.filter((o) => o.status === 'Completed').length },
          { title: 'High Impact', value: rows.filter((o) => o.impact === 'High').length },
        ],
      },
    ],
    [rows],
  );

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page, pageSize]);

  const filtersActive =
    filters.query.trim() !== '' ||
    filters.department !== 'all' ||
    filters.priority !== 'all' ||
    filters.status !== 'all';

  const update = (patch: Partial<InsightFilters>) => {
    setStaggerRows(false);
    setPage(1);
    setFilters((current) => ({ ...current, ...patch }));
  };

  const addOpportunity = (draft: Omit<Opportunity, 'id' | 'lastUpdated'>) => {
    const nextNumber = items.reduce((highest, item) => Math.max(highest, Number(item.id.split('-')[1]) || 0), 300) + 1;
    const opportunity: Opportunity = {
      ...draft,
      id: `DIG-${nextNumber}`,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };

    setStaggerRows(false);
    setItems((current) => [opportunity, ...current]);
    setAddOpen(false);
    setPage(1);
    setToast(`${opportunity.id} added to the digitization backlog`);
  };

  const columns: Column<Opportunity>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (opportunity) => (
        <span className="truncate text-[14px] leading-5 font-semibold text-ink-900" title={opportunity.title}>
          {opportunity.title}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      width: '160px',
      sortable: true,
      render: (opportunity) => (
        <Badge size="xs" tone="neutral">
          {opportunity.department}
        </Badge>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      width: '120px',
      sortable: true,
      render: (opportunity) => (
        <Badge size="sm" tone={PRIORITY_TONE[opportunity.priority]}>
          {opportunity.priority}
        </Badge>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      width: '170px',
      sortable: true,
      render: (opportunity) => (
        <span className="truncate text-[14px] leading-5 font-semibold text-ink-800" title={opportunity.owner}>
          {opportunity.owner}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '140px',
      sortable: true,
      render: (opportunity) => (
        <Badge size="sm" tone={STATUS_TONE[opportunity.status]}>
          {opportunity.status}
        </Badge>
      ),
    },
    {
      key: 'impact',
      header: 'Impact',
      width: '120px',
      sortable: true,
      render: (opportunity) => (
        <span className="flex items-center gap-1.5 text-[13px] leading-5 font-semibold text-ink-700">
          <span
            className="h-1.5 w-1.5 flex-none rounded-full"
            style={{ background: IMPACT_COLOR[opportunity.impact] }}
          />
          {opportunity.impact}
        </span>
      ),
    },
    {
      key: 'updated',
      header: 'Last Updated',
      width: '140px',
      sortable: true,
      render: (opportunity) => (
        <span className="text-[14px] leading-5 font-semibold tabular-nums text-ink-800">
          {formatDate(opportunity.lastUpdated)}
        </span>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <div className="animate-rise" style={{ animationDelay: '0ms' }}>
          <PageHeader
            size="lg"
            rule
            title="Insights"
            breadcrumbs={[
              { label: 'Home', to: '/' },
              { label: 'Insights', to: '/insights' },
              { label: 'Digitization Opportunity Tracker' },
            ]}
            actions={
              <Button
                variant="primary"
                icon={<Plus size={16} strokeWidth={2.2} />}
                className="cursor-pointer"
                onClick={() => setAddOpen(true)}
              >
                Add Opportunity
              </Button>
            }
          />
        </div>

        <div
          className="tsy animate-rise grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
          style={{ animationDelay: '60ms' }}
        >
          {kpiGroups.map((group) => (
            <KpiGroupCard key={group.header} group={group} />
          ))}
        </div>

        <div
          className="animate-rise flex flex-wrap items-end justify-between gap-4"
          style={{ animationDelay: '90ms' }}
        >
          <div className="flex flex-wrap items-end gap-2.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle text-brand-700">Department</span>
              <Select
                ariaLabel="Filter by department"
                value={filters.department}
                options={DEPARTMENT_OPTIONS}
                onChange={(value) => update({ department: value })}
                className="w-[190px]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle text-brand-700">Priority</span>
              <Select
                ariaLabel="Filter by priority"
                value={filters.priority}
                options={PRIORITY_OPTIONS}
                onChange={(value) => update({ priority: value })}
                className="w-[170px]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle text-brand-700">Status</span>
              <Select
                ariaLabel="Filter by status"
                value={filters.status}
                options={STATUS_OPTIONS}
                onChange={(value) => update({ status: value })}
                className="w-[170px]"
              />
            </label>
            <Button
              icon={<RotateCcw size={16} strokeWidth={2.2} />}
              disabled={!filtersActive}
              className="cursor-pointer"
              onClick={() => {
                setStaggerRows(false);
                setPage(1);
                setFilters(EMPTY_FILTERS);
              }}
            >
              Reset Filters
            </Button>
          </div>

          <SearchInput
            value={filters.query}
            onChange={(value) => update({ query: value })}
            placeholder="Search opportunity, owner, or department"
            className="w-[280px]"
          />
        </div>

        <div className="glass-raised animate-rise" style={{ animationDelay: '120ms' }}>
          <DataTable
            surface={false}
            columns={columns}
            rows={pageRows}
            rowKey={(opportunity) => opportunity.id}
            sort={sort}
            onSortChange={(next) => {
              setStaggerRows(false);
              setPage(1);
              setSort(next);
            }}
            stagger={staggerRows}
            minWidth="1180px"
            bodyKey={`${filters.query}-${filters.department}-${filters.priority}-${filters.status}-${sort.key}-${sort.dir}-${page}-${items.length}`}
            emptyState={
              <EmptyState
                icon={<Lightbulb size={22} strokeWidth={2.1} />}
                title="No opportunities match these filters"
                description="Try clearing the search or resetting the filters."
              />
            }
            footer={
              <Pagination
                variant="entries"
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                total={rows.length}
                onPageChange={(next) => {
                  setStaggerRows(false);
                  setPage(next);
                }}
                onPageSizeChange={(next) => {
                  setStaggerRows(false);
                  setPage(1);
                  setPageSize(next);
                }}
              />
            }
          />
        </div>
      </div>

      {addOpen && (
        <AddOpportunityModal open onClose={() => setAddOpen(false)} onSubmit={addOpportunity} />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
