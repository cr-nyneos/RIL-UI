import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Building2, RotateCcw, UserPlus } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import KpiGroupCard, { type KpiGroup } from '../components/dashboard/KpiGroupCard';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import ProgressMeter, { type ProgressTone } from '../components/ui/ProgressMeter';
import DataTable, { type Column, type SortState } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';

import { ORDER_PLANTS } from '../lib/mockData/orders';
import { VENDOR_CATEGORIES } from '../lib/mockData/vendors';
import { getVendors } from '../lib/vendorStore';
import { formatDate } from '../lib/format';
import type { Vendor, VendorRisk } from '../lib/types/vendor';
import {
  EMPTY_VENDOR_FILTERS,
  activeOrderCounts,
  compareVendors,
  hasActiveVendorFilters,
  matchesVendorFilters,
  type VendorFilters,
} from '../lib/vendorFilters';

const DEFAULT_PAGE_SIZE = 10;

const PLANT_OPTIONS = [{ value: 'all', label: 'All Plants' }, ...ORDER_PLANTS.map((p) => ({ value: p, label: p }))];
const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  ...VENDOR_CATEGORIES.map((c) => ({ value: c, label: c })),
];
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Onboarding', label: 'Onboarding' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Suspended', label: 'Suspended' },
];
const COMPLIANCE_OPTIONS = [
  { value: 'all', label: 'All Compliance' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Pending KYC', label: 'Pending KYC' },
  { value: 'Expiring', label: 'Expiring' },
  { value: 'Expired', label: 'Expired' },
];
const RISK_OPTIONS = [
  { value: 'all', label: 'All Risk' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

const RISK_COLOR: Record<VendorRisk, string> = {
  Low: 'var(--color-ink-400)',
  Medium: 'var(--color-warning-bright)',
  High: 'var(--color-danger)',
};

const RISK_METER: Record<VendorRisk, ProgressTone> = {
  Low: 'success',
  Medium: 'warning',
  High: 'danger',
};

function complianceTone(vendor: Vendor): ProgressTone {
  if (vendor.complianceState === 'Expired' || vendor.complianceState === 'Expiring') return 'danger';
  return RISK_METER[vendor.risk];
}

/** Two chips plus an overflow count keeps a five-plant vendor on one line. */
function PlantCell({ plants }: { plants: Vendor['plants'] }) {
  const shown = plants.slice(0, 2);
  const rest = plants.length - shown.length;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      {shown.map((plant) => (
        <Badge key={plant} size="sm" tone="neutral">
          {plant}
        </Badge>
      ))}
      {rest > 0 && (
        <span title={plants.slice(2).join(', ')}>
          <Badge size="sm" tone="neutral">
            +{rest}
          </Badge>
        </span>
      )}
    </div>
  );
}

export default function Vendors() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<VendorFilters>(EMPTY_VENDOR_FILTERS);
  const [sort, setSort] = useState<SortState>({ key: 'vendor', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [staggerRows, setStaggerRows] = useState(true);

  const orderCounts = useMemo(() => activeOrderCounts(), []);

  const rows = useMemo(() => {
    const filtered = getVendors().filter((vendor) => matchesVendorFilters(vendor, filters));
    return [...filtered].sort((a, b) => {
      const result = compareVendors(a, b, sort.key, orderCounts);
      return sort.dir === 'asc' ? result : -result;
    });
  }, [filters, sort, orderCounts]);

  // The KPI cards count the directory as filtered, so the numbers always
  // describe the list the user is actually looking at.
  const kpiGroups: KpiGroup[] = useMemo(
    () => [
      {
        header: 'Total Vendors',
        data: [
          { title: 'Active', value: rows.filter((v) => v.status === 'Active').length },
          { title: 'Onboarding', value: rows.filter((v) => v.status === 'Onboarding').length },
        ],
      },
      {
        header: 'Total Compliance Load',
        data: [
          { title: 'Pending KYC', value: rows.filter((v) => v.complianceState === 'Pending KYC').length },
          { title: 'Verified', value: rows.filter((v) => v.complianceState === 'Verified').length },
        ],
      },
      {
        header: 'Total Risk Exposure',
        data: [
          { title: 'High Risk', value: rows.filter((v) => v.risk === 'High').length },
          { title: 'Medium Risk', value: rows.filter((v) => v.risk === 'Medium').length },
        ],
      },
      {
        header: 'Total Directory Reach',
        data: [
          { title: 'Vendors', value: rows.length },
          { title: 'Plants', value: new Set(rows.flatMap((v) => v.plants)).size },
        ],
      },
    ],
    [rows],
  );

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page, pageSize]);

  const filtersActive = hasActiveVendorFilters(filters);

  const update = (patch: Partial<VendorFilters>) => {
    setStaggerRows(false);
    setPage(1);
    setFilters((current) => ({ ...current, ...patch }));
  };

  const columns: Column<Vendor>[] = [
    {
      key: 'vendor',
      header: 'Vendor',
      width: '260px',
      sortable: true,
      render: (vendor) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={vendor.name} size="md" />
          <div className="min-w-0">
            <div className="truncate text-sm leading-5 font-normal text-table-cell-text" title={vendor.name}>
              {vendor.name}
            </div>
            <div className="truncate text-[13px] leading-5 font-normal text-ink-500">{vendor.category}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'plants',
      header: 'Plants',
      width: '200px',
      sortable: true,
      render: (vendor) => <PlantCell plants={vendor.plants} />,
    },
    {
      key: 'orders',
      header: 'Active Orders',
      width: '120px',
      align: 'right',
      sortable: true,
      render: (vendor) => (
        <span className="text-sm leading-5 font-normal tabular-nums text-table-cell-text">
          {orderCounts[vendor.name] ?? 0}
        </span>
      ),
    },
    {
      key: 'compliance',
      header: 'Compliance',
      width: '130px',
      sortable: true,
      render: (vendor) => (
        <ProgressMeter
          value={vendor.compliance}
          showLabel
          tone={complianceTone(vendor)}
          delay={80}
        />
      ),
    },
    {
      key: 'risk',
      header: 'Risk',
      width: '100px',
      sortable: true,
      render: (vendor) => (
        <span className="flex items-center gap-1.5 text-sm leading-5 font-normal text-table-cell-text">
          <span
            className="h-1.5 w-1.5 flex-none rounded-full"
            style={{ background: RISK_COLOR[vendor.risk] }}
          />
          {vendor.risk}
        </span>
      ),
    },
    {
      key: 'activity',
      header: 'Last Activity',
      width: '130px',
      sortable: true,
      render: (vendor) => (
        <span className="truncate text-sm leading-5 font-normal text-table-cell-text">
          {formatDate(vendor.lastActivity)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '110px',
      align: 'right',
      render: (vendor) => (
        <Button
          variant="icon"
          size="sm"
          aria-label={`Open Vendor 360 for ${vendor.name}`}
          title="Open Vendor 360"
          className="cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/vendors/${vendor.id}`);
          }}
        >
          <ArrowUpRight size={16} strokeWidth={2.2} />
        </Button>
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
            title="Vendors"
            breadcrumbs={[
              { label: 'Home', to: '/' },
              { label: 'Vendors', to: '/vendors' },
              { label: 'Directory' },
            ]}
            actions={
              <Button
                variant="primary"
                size="lg"
                icon={<UserPlus size={16} strokeWidth={2.3} />}
                className="cursor-pointer"
                onClick={() => navigate('/vendors/onboard')}
              >
                Onboard Vendor
              </Button>
            }
          />
        </div>

        {/* KPI CARDS — the Dashboard's cards verbatim; `.tsy` carries the
            palette the card and its hover lift are built on. */}
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
              <span className="text-subtitle text-brand-700">Plant</span>
              <Select
                ariaLabel="Filter by plant"
                value={filters.plant}
                options={PLANT_OPTIONS}
                onChange={(value) => update({ plant: value })}
                className="w-[170px]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle text-brand-700">Category</span>
              <Select
                ariaLabel="Filter by vendor category"
                value={filters.category}
                options={CATEGORY_OPTIONS}
                onChange={(value) => update({ category: value })}
                className="w-[190px]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle text-brand-700">Status</span>
              <Select
                ariaLabel="Filter by status"
                value={filters.status}
                options={STATUS_OPTIONS}
                onChange={(value) => update({ status: value })}
                className="w-[160px]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle text-brand-700">Compliance</span>
              <Select
                ariaLabel="Filter by compliance"
                value={filters.compliance}
                options={COMPLIANCE_OPTIONS}
                onChange={(value) => update({ compliance: value })}
                className="w-[170px]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle text-brand-700">Risk</span>
              <Select
                ariaLabel="Filter by risk"
                value={filters.risk}
                options={RISK_OPTIONS}
                onChange={(value) => update({ risk: value })}
                className="w-[140px]"
              />
            </label>
            <Button
              icon={<RotateCcw size={16} strokeWidth={2.2} />}
              disabled={!filtersActive}
              className="cursor-pointer"
              onClick={() => {
                setStaggerRows(false);
                setPage(1);
                setFilters(EMPTY_VENDOR_FILTERS);
              }}
            >
              Reset Filters
            </Button>
          </div>

          <SearchInput
            value={filters.query}
            onChange={(value) => update({ query: value })}
            placeholder="Search vendor, code, or category"
            className="w-[280px]"
          />
        </div>

        <div className="glass-raised animate-rise" style={{ animationDelay: '120ms' }}>
          <DataTable
            surface={false}
            columns={columns}
            rows={pageRows}
            rowKey={(vendor) => vendor.id}
            onRowClick={(vendor) => navigate(`/vendors/${vendor.id}`)}
            sort={sort}
            onSortChange={(next) => {
              setStaggerRows(false);
              setPage(1);
              setSort(next);
            }}
            stagger={staggerRows}
            minWidth="1050px"
            bodyKey={`${filters.query}-${filters.plant}-${filters.category}-${filters.status}-${filters.compliance}-${filters.risk}-${sort.key}-${sort.dir}-${page}`}
            emptyState={
              <EmptyState
                icon={<Building2 size={22} strokeWidth={2.1} />}
                title="No vendors match these filters"
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
    </AppShell>
  );
}
