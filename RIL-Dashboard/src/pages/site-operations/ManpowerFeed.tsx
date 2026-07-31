import { ArrowDownRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import KeyValue from '../../components/ui/KeyValue';
import ProgressMeter from '../../components/ui/ProgressMeter';
import Section from '../../components/ui/Section';
import { formatDate } from '../../lib/format';
import type { ManpowerRecord } from '../../lib/types/siteOps';

interface ManpowerFeedProps {
  records: ManpowerRecord[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}

function ManpowerRow({
  record,
  expanded,
  onToggle,
}: {
  record: ManpowerRecord;
  expanded: boolean;
  onToggle: () => void;
}) {
  const peak = Math.max(...record.trades.map((trade) => trade.count), 1);

  return (
    <div className="border-b border-[var(--color-glass-hairline)] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={`focus-bloom flex w-full cursor-pointer items-center gap-5 px-5 py-4 text-left transition-colors duration-150 ${
          expanded ? 'bg-[var(--color-surface-selected)]' : 'hover:bg-[var(--color-surface-hover)]'
        }`}
      >
        <div className="w-[86px] flex-none">
          <div className="text-[22px] leading-7 font-bold tracking-[-0.02em] text-ink-900 tabular-nums">
            {record.current}
          </div>
          <div className="text-meta">on site</div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] leading-5 font-bold text-ink-900">{record.vendor}</div>
          <div className="text-meta mt-0.5 truncate">
            {record.plant} · {record.zone}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-meta flex items-center gap-1 tabular-nums">
              <ArrowDownRight size={13} strokeWidth={2.4} className="text-success" />
              {record.enteredToday} entered
            </span>
            <span className="text-meta flex items-center gap-1 tabular-nums">
              <ArrowUpRight size={13} strokeWidth={2.4} className="text-ink-400" />
              {record.exitedToday} exited
            </span>
          </div>
        </div>

        <div className="hidden min-w-0 flex-none text-right sm:block">
          <div className="truncate text-[13px] leading-5 font-semibold text-ink-800">{record.supervisor}</div>
          <div className="text-meta">Site supervisor</div>
        </div>

        {record.passesExpiring > 0 && (
          <Badge tone="warning" shape="square" size="sm" className="hidden flex-none lg:inline-flex">
            {record.passesExpiring} passes expiring
          </Badge>
        )}

        <ChevronDown
          size={16}
          strokeWidth={2.4}
          aria-hidden
          className={`accordion-chevron flex-none text-ink-400 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      <div className={`accordion-grid grid ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-[var(--color-border)] bg-[var(--color-brand-soft2)] px-5 py-5">
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
                <div className="text-table-head mb-3">Trade Composition</div>
                <div className="grid gap-3">
                  {record.trades.map((trade) => (
                    <div key={trade.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
                      <span className="truncate text-[13px] leading-5 font-semibold text-ink-700">{trade.label}</span>
                      <span className="text-[13px] leading-5 font-bold text-ink-900 tabular-nums">{trade.count}</span>
                      <ProgressMeter value={Math.round((trade.count / peak) * 100)} className="col-span-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManpowerFeed({ records, expandedId, onToggle }: ManpowerFeedProps) {
  return (
    <Section
      title="Vendor Manpower"
      description="Live headcount by vendor, with today's movement through the personnel gates."
      padded={false}
    >
      {records.length ? (
        records.map((record) => (
          <ManpowerRow
            key={record.id}
            record={record}
            expanded={expandedId === record.id}
            onToggle={() => onToggle(record.id)}
          />
        ))
      ) : (
        <EmptyState title="No manpower on site" description="Adjust the filters to view vendor headcount." />
      )}
    </Section>
  );
}
