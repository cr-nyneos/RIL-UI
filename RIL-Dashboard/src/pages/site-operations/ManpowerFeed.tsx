import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

import Badge from '../../components/ui/Badge';
import DataTable, { type Column, type SortState } from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import KeyValue from '../../components/ui/KeyValue';
import ProgressMeter from '../../components/ui/ProgressMeter';
import SectionCard from '../../components/ui/SectionCard';
import { formatDate } from '../../lib/format';
import type { ManpowerRecord } from '../../lib/types/siteOps';

interface ManpowerFeedProps {
  records: ManpowerRecord[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}

function compare(a: ManpowerRecord, b: ManpowerRecord, key: string): number {
  switch (key) {
    case 'vendor':
      return a.vendor.localeCompare(b.vendor);
    case 'onSite':
      return a.current - b.current;
    case 'entered':
      return a.enteredToday - b.enteredToday;
    case 'exited':
      return a.exitedToday - b.exitedToday;
    case 'supervisor':
      return a.supervisor.localeCompare(b.supervisor);
    case 'passes':
      return a.passesExpiring - b.passesExpiring;
    default:
      return 0;
  }
}

function ExpandedManpower({ record }: { record: ManpowerRecord }) {
  const peak = Math.max(...record.trades.map((trade) => trade.count), 1);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <KeyValue
        columns={2}
        items={[
          { label: 'Supervisor Contact', value: record.supervisorContact },
          { label: 'Shift', value: record.shift },
          { label: 'Safety Induction Valid To', value: formatDate(record.inductionValidTo) },
          { label: 'Passes Expiring', value: record.passesExpiring },
          {
            label: 'Linked Order',
            value: (
              <Link
                to={`/orders/${record.orderId}`}
                onClick={(event) => event.stopPropagation()}
                className="font-semibold text-brand-700 hover:underline hover:underline-offset-[3px]"
              >
                {record.orderId}
              </Link>
            ),
          },
          { label: 'Site Zone', value: record.zone },
        ]}
      />

      <div>
        <div className="mb-3 text-[11px] leading-4 font-bold tracking-[0.07em] text-ink-500 uppercase">
          Trade Composition
        </div>
        <div className="grid gap-3">
          {record.trades.map((trade) => (
            <div key={trade.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
              <span className="truncate text-[14px] leading-5 font-semibold text-ink-700">{trade.label}</span>
              <span className="text-[14px] leading-5 font-bold text-ink-900 tabular-nums">{trade.count}</span>
              <ProgressMeter value={Math.round((trade.count / peak) * 100)} className="col-span-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ManpowerFeed({ records, expandedId, onToggle }: ManpowerFeedProps) {
  const [sort, setSort] = useState<SortState>({ key: 'onSite', dir: 'desc' });

  const rows = useMemo(() => {
    const sorted = [...records].sort((a, b) => {
      const result = compare(a, b, sort.key);
      return sort.dir === 'asc' ? result : -result;
    });
    return sorted;
  }, [records, sort]);

  const columns: Column<ManpowerRecord>[] = [
    {
      key: 'vendor',
      header: 'Vendor',
      sortable: true,
      render: (record) => (
        <div className="min-w-0">
          <div className="truncate text-[14px] leading-5 font-bold text-ink-900">{record.vendor}</div>
          <div className="mt-0.5 truncate text-[13px] leading-5 font-medium text-ink-500">
            {record.plant} · {record.zone}
          </div>
        </div>
      ),
    },
    {
      key: 'onSite',
      header: 'On Site',
      width: '110px',
      sortable: true,
      render: (record) => (
        <span className="text-[17px] leading-6 font-bold text-ink-900 tabular-nums">{record.current}</span>
      ),
    },
    {
      key: 'entered',
      header: 'Entered',
      width: '110px',
      sortable: true,
      render: (record) => (
        <span className="flex items-center gap-1.5 text-[14px] leading-5 font-semibold text-ink-800 tabular-nums">
          <ArrowDownRight size={14} strokeWidth={2.4} className="flex-none text-success" />
          {record.enteredToday}
        </span>
      ),
    },
    {
      key: 'exited',
      header: 'Exited',
      width: '110px',
      sortable: true,
      render: (record) => (
        <span className="flex items-center gap-1.5 text-[14px] leading-5 font-semibold text-ink-800 tabular-nums">
          <ArrowUpRight size={14} strokeWidth={2.4} className="flex-none text-ink-500" />
          {record.exitedToday}
        </span>
      ),
    },
    {
      key: 'supervisor',
      header: 'Supervisor',
      width: '180px',
      sortable: true,
      render: (record) => (
        <div className="min-w-0">
          <div className="truncate text-[14px] leading-5 font-semibold text-ink-800">{record.supervisor}</div>
          <div className="truncate text-[13px] leading-5 font-medium text-ink-500">{record.supervisorContact}</div>
        </div>
      ),
    },
    {
      key: 'passes',
      header: 'Passes Expiring',
      width: '150px',
      sortable: true,
      render: (record) =>
        record.passesExpiring > 0 ? (
          <Badge tone="warning" shape="square" size="sm">
            {record.passesExpiring} expiring
          </Badge>
        ) : (
          <span className="text-[14px] leading-5 font-medium text-ink-400">—</span>
        ),
    },
    {
      key: 'expand',
      header: '',
      width: '56px',
      align: 'center',
      render: (record) => (
        <ChevronDown
          size={16}
          strokeWidth={2.4}
          aria-hidden
          className={`accordion-chevron mx-auto text-ink-400 ${expandedId === record.id ? 'rotate-180' : ''}`}
        />
      ),
    },
  ];

  return (
    <SectionCard title="Vendor Manpower" padded={false}>
      <DataTable
        surface={false}
        columns={columns}
        rows={rows}
        rowKey={(record) => record.id}
        onRowClick={(record) => onToggle(record.id)}
        sort={sort}
        onSortChange={setSort}
        minWidth="980px"
        expandedKey={expandedId}
        renderExpanded={(record) => <ExpandedManpower record={record} />}
        emptyState={
          <EmptyState title="No manpower on site" description="Adjust the filters to view vendor headcount." />
        }
      />
    </SectionCard>
  );
}
