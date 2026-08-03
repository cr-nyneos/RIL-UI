import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Receipt, RotateCcw } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import KpiGroupCard, { type KpiGroup } from '../components/dashboard/KpiGroupCard';
import StatusBadge from '../components/ui/StatusBadge';
import DataTable, { type Column, type SortState } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';

import { ORDER_PLANTS } from '../lib/mockData/orders';
import { INVOICES, INVOICE_VENDORS } from '../lib/mockData/finance';
import { formatCurrency, formatDate } from '../lib/format';
import type { Invoice, ScfStatus } from '../lib/types/finance';

const DEFAULT_PAGE_SIZE = 10;

const EMPTY_FILTERS = {
  query: '',
  vendor: 'all',
  plant: 'all',
  invoiceStatus: 'all',
  paymentStatus: 'all',
};

type FinanceFilters = typeof EMPTY_FILTERS;

const VENDOR_OPTIONS = [
  { value: 'all', label: 'All Vendors' },
  ...INVOICE_VENDORS.map((v) => ({ value: v, label: v })),
];
const PLANT_OPTIONS = [{ value: 'all', label: 'All Plants' }, ...ORDER_PLANTS.map((p) => ({ value: p, label: p }))];
const INVOICE_STATUS_OPTIONS = [
  { value: 'all', label: 'All Invoices' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Matched', label: 'Matched' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Mismatch', label: 'Mismatch' },
  { value: 'Rejected', label: 'Rejected' },
];
const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All Payments' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Released', label: 'Released' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Overdue', label: 'Overdue' },
];

const SCF_TONE: Record<ScfStatus, 'success' | 'neutral'> = {
  Eligible: 'success',
  Discounted: 'success',
  'Not Eligible': 'neutral',
};

function matches(invoice: Invoice, filters: FinanceFilters): boolean {
  const query = filters.query.trim().toLowerCase();
  if (
    query &&
    ![invoice.invoiceNo, invoice.vendor, invoice.orderId].some((field) => field.toLowerCase().includes(query))
  ) {
    return false;
  }
  if (filters.vendor !== 'all' && invoice.vendor !== filters.vendor) return false;
  if (filters.plant !== 'all' && invoice.plant !== filters.plant) return false;
  if (filters.invoiceStatus !== 'all' && invoice.invoiceStatus !== filters.invoiceStatus) return false;
  if (filters.paymentStatus !== 'all' && invoice.paymentStatus !== filters.paymentStatus) return false;
  return true;
}

function compare(a: Invoice, b: Invoice, key: string): number {
  switch (key) {
    case 'amount':
      return a.amountCr - b.amountCr;
    case 'due':
      return a.dueDate.localeCompare(b.dueDate);
    case 'vendor':
      return a.vendor.localeCompare(b.vendor);
    case 'order':
      return a.orderId.localeCompare(b.orderId);
    case 'plant':
      return a.plant.localeCompare(b.plant);
    case 'status':
      return a.invoiceStatus.localeCompare(b.invoiceStatus);
    default:
      return a.invoiceNo.localeCompare(b.invoiceNo);
  }
}

/** The five closure steps, sized by how much of the filtered book has cleared each one. */
// function PaymentPipeline({ invoices }: { invoices: Invoice[] }) {
//   return (
//     <ol className="grid grid-cols-1 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
//       {PIPELINE.map((stage, index) => {
//         const cleared = invoices.filter(stage.match);
//         const valueCr = cleared.reduce((total, invoice) => total + invoice.amountCr, 0);
//         const reached = cleared.length > 0;

//         return (
//           <li key={stage.key} className="relative flex min-w-0 flex-col gap-2 px-1">
//             {index < PIPELINE.length - 1 && (
//               <span
//                 aria-hidden
//                 className="absolute top-[7px] right-0 left-[calc(50%+14px)] hidden border-t-2 lg:block"
//                 style={{ borderColor: reached ? 'var(--color-brand-500)' : 'var(--color-border)' }}
//               />
//             )}

//             <span
//               aria-hidden
//               className="relative z-1 h-3.5 w-3.5 flex-none rounded-full border-2"
//               style={{
//                 borderColor: reached ? 'var(--color-brand-600)' : 'var(--color-border-strong)',
//                 background: reached ? 'var(--color-brand-600)' : 'var(--color-surface-section)',
//               }}
//             />

//             <span className="truncate text-[13px] leading-5 font-semibold text-ink-800" title={stage.label}>
//               {stage.label}
//             </span>
//             <span className="text-[24px] leading-8 font-semibold tabular-nums text-ink-900">{cleared.length}</span>
//             <span className="text-meta tabular-nums">{formatCurrency(valueCr)}</span>
//           </li>
//         );
//       })}
//     </ol>
//   );
// }

export default function Finance() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FinanceFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortState>({ key: 'due', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [staggerRows, setStaggerRows] = useState(true);

  const rows = useMemo(() => {
    const filtered = INVOICES.filter((invoice) => matches(invoice, filters));
    return [...filtered].sort((a, b) => {
      const result = compare(a, b, sort.key);
      return sort.dir === 'asc' ? result : -result;
    });
  }, [filters, sort]);

  // Every KPI reads off the filtered book, so the headline always describes the
  // same invoices the table below is showing.
  const kpiGroups: KpiGroup[] = useMemo(() => {
    const sum = (predicate: (invoice: Invoice) => boolean) =>
      formatCurrency(rows.filter(predicate).reduce((total, invoice) => total + invoice.amountCr, 0));

    return [
      {
        header: 'Outstanding Amount',
        data: [
          { title: 'Unpaid', value: sum((invoice) => invoice.paymentStatus !== 'Paid') },
          { title: 'Overdue', value: sum((invoice) => invoice.paymentStatus === 'Overdue') },
        ],
      },
      {
        header: 'Pending Invoices',
        data: [
          { title: 'Awaiting Match', value: rows.filter((invoice) => invoice.invoiceStatus === 'Submitted').length },
          { title: 'Awaiting Payment', value: rows.filter((invoice) => invoice.paymentStatus === 'Pending').length },
        ],
      },
      {
        header: 'Released Payments',
        data: [
          { title: 'Released', value: sum((invoice) => invoice.paymentStatus === 'Released') },
          { title: 'Paid', value: sum((invoice) => invoice.paymentStatus === 'Paid') },
        ],
      },
      {
        header: 'SCF Eligible',
        data: [
          { title: 'Eligible', value: rows.filter((invoice) => invoice.scfStatus === 'Eligible').length },
          { title: 'Discounted', value: rows.filter((invoice) => invoice.scfStatus === 'Discounted').length },
        ],
      },
    ];
  }, [rows]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page, pageSize]);

  const filtersActive =
    filters.query.trim() !== '' ||
    filters.vendor !== 'all' ||
    filters.plant !== 'all' ||
    filters.invoiceStatus !== 'all' ||
    filters.paymentStatus !== 'all';

  const update = (patch: Partial<FinanceFilters>) => {
    setStaggerRows(false);
    setPage(1);
    setFilters((current) => ({ ...current, ...patch }));
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNo',
      header: 'Invoice No.',
      width: '160px',
      sortable: true,
      render: (invoice) => (
        <span className="truncate text-[14px] leading-5 font-semibold text-ink-900" title={invoice.invoiceNo}>
          {invoice.invoiceNo}
        </span>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor',
      sortable: true,
      render: (invoice) => (
        <span className="truncate text-[14px] leading-5 font-semibold text-ink-800" title={invoice.vendor}>
          {invoice.vendor}
        </span>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      width: '120px',
      sortable: true,
      render: (invoice) => <span className="text-[14px] leading-5 font-semibold text-ink-700">{invoice.orderId}</span>,
    },
    {
      key: 'plant',
      header: 'Plant',
      width: '130px',
      sortable: true,
      render: (invoice) => (
        <Badge size="xs" tone="neutral">
          {invoice.plant}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '120px',
      align: 'right',
      sortable: true,
      render: (invoice) => (
        <span className="text-[14px] leading-5 font-semibold tabular-nums text-ink-900">
          {formatCurrency(invoice.amountCr)}
        </span>
      ),
    },
    {
      key: 'due',
      header: 'Due Date',
      width: '130px',
      sortable: true,
      render: (invoice) => (
        <span className="text-[14px] leading-5 font-semibold tabular-nums text-ink-800">
          {formatDate(invoice.dueDate)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      sortable: true,
      render: (invoice) => <StatusBadge status={invoice.invoiceStatus} />,
    },
    {
      key: 'scf',
      header: 'SCF Status',
      width: '130px',
      render: (invoice) => (
        <Badge size="sm" tone={SCF_TONE[invoice.scfStatus]}>
          {invoice.scfStatus}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '110px',
      align: 'right',
      render: (invoice) => (
        <Button
          variant="icon"
          size="sm"
          aria-label={`Open order ${invoice.orderId}`}
          title="Open order"
          className="cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/orders/${invoice.orderId}`);
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
            title="Finance"
            breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Finance', to: '/finance' }, { label: 'Invoices' }]}
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
              <span className="text-subtitle text-brand-700">Vendor</span>
              <Select
                ariaLabel="Filter by vendor"
                value={filters.vendor}
                options={VENDOR_OPTIONS}
                onChange={(value) => update({ vendor: value })}
                className="w-[190px]"
              />
            </label>
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
              <span className="text-subtitle text-brand-700">Invoice Status</span>
              <Select
                ariaLabel="Filter by invoice status"
                value={filters.invoiceStatus}
                options={INVOICE_STATUS_OPTIONS}
                onChange={(value) => update({ invoiceStatus: value })}
                className="w-[170px]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle text-brand-700">Payment Status</span>
              <Select
                ariaLabel="Filter by payment status"
                value={filters.paymentStatus}
                options={PAYMENT_STATUS_OPTIONS}
                onChange={(value) => update({ paymentStatus: value })}
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
            placeholder="Search invoice, vendor, or order"
            className="w-[280px]"
          />
        </div>

        <div className="glass-raised animate-rise" style={{ animationDelay: '120ms' }}>
          <DataTable
            surface={false}
            columns={columns}
            rows={pageRows}
            rowKey={(invoice) => invoice.id}
            onRowClick={(invoice) => navigate(`/orders/${invoice.orderId}`)}
            sort={sort}
            onSortChange={(next) => {
              setStaggerRows(false);
              setPage(1);
              setSort(next);
            }}
            stagger={staggerRows}
            minWidth="1180px"
            bodyKey={`${filters.query}-${filters.vendor}-${filters.plant}-${filters.invoiceStatus}-${filters.paymentStatus}-${sort.key}-${sort.dir}-${page}`}
            emptyState={
              <EmptyState
                icon={<Receipt size={22} strokeWidth={2.1} />}
                title="No invoices match these filters"
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

        {/* <SectionCard
          title="Payment Pipeline"
          className="animate-rise"
          style={{ animationDelay: '150ms' }}
          padded={false}
          bodyClassName="px-5 py-6"
        >
          <PaymentPipeline invoices={rows} />
        </SectionCard> */}
      </div>
    </AppShell>
  );
}
