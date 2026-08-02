import DataTable, { type Column } from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import ProgressMeter from '../../components/ui/ProgressMeter';
import SectionCard from '../../components/ui/SectionCard';
import { formatCurrency, formatDate, formatTime } from '../../lib/format';
import type { DecisionRecord, PendingDecision } from '../../lib/types/approvals';
import { toneToken } from '../../lib/tone';
import type { Tone } from '../../lib/types/ui';

const ACTION_LABEL: Record<DecisionRecord['action'], string> = {
  approve: 'Approved',
  reject: 'Returned',
  escalate: 'Escalated',
  delegate: 'Delegated',
};

const ACTION_TONE: Record<DecisionRecord['action'], Tone> = {
  approve: 'success',
  reject: 'danger',
  escalate: 'warning',
  delegate: 'brand',
};

function dueLabel(decision: PendingDecision): string {
  if (decision.dueInDays < 0) return `${Math.abs(decision.dueInDays)}d over`;
  if (decision.dueInDays === 0) return 'Today';
  return `${decision.dueInDays}d`;
}

function Primary({ label, secondary, tone }: { label: string; secondary: string; tone?: Tone }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      {tone && (
        <span
          aria-hidden
          className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full"
          style={{ background: toneToken(tone).fill }}
        />
      )}
      <div className="min-w-0">
        <div className="truncate text-[13px] leading-5 font-semibold text-ink-900 tabular-nums">{label}</div>
        <div className="truncate text-[12px] leading-4 text-ink-500">{secondary}</div>
      </div>
    </div>
  );
}

type TrackRow = { label: string; count: number; share: number };

/** The queue read sideways — what to take first, what is about to slip, and
 *  where the workload sits. */
export default function QueueContext({
  decisions,
  records,
}: {
  decisions: PendingDecision[];
  records: DecisionRecord[];
}) {
  const priority = [...decisions]
    .sort(
      (a, b) =>
        Number(b.escalated) - Number(a.escalated) ||
        Number(b.priority === 'Critical') - Number(a.priority === 'Critical') ||
        b.order.valueCr - a.order.valueCr,
    )
    .slice(0, 4);

  const windows = decisions
    .filter((decision) => decision.dueInDays <= 3)
    .sort((a, b) => a.dueInDays - b.dueInDays)
    .slice(0, 4);

  const tracks = decisions.reduce<Record<string, number>>((totals, decision) => {
    totals[decision.trackLabel] = (totals[decision.trackLabel] ?? 0) + 1;
    return totals;
  }, {});
  const distribution = Object.entries(tracks).sort((a, b) => b[1] - a[1]);
  const peak = Math.max(...distribution.map(([, count]) => count), 1);
  const trackRows: TrackRow[] = distribution.map(([label, count]) => ({
    label,
    count,
    share: Math.round((count / peak) * 100),
  }));

  const priorityColumns: Column<PendingDecision>[] = [
    {
      key: 'decision',
      header: 'Decision',
      render: (decision) => (
        <Primary
          label={`${decision.order.id} · ${decision.trackLabel}`}
          secondary={`${decision.order.vendor} · ${decision.owner.name}`}
          tone={decision.urgency === 'breached' ? 'danger' : decision.urgency === 'today' ? 'warning' : 'brand'}
        />
      ),
    },
    {
      key: 'value',
      header: 'Value',
      align: 'right',
      render: (decision) => (
        <span className="text-[13px] font-semibold text-ink-900 tabular-nums">
          {formatCurrency(decision.order.valueCr)}
        </span>
      ),
    },
  ];

  const windowColumns: Column<PendingDecision>[] = [
    {
      key: 'gate',
      header: 'Gate',
      render: (decision) => (
        <Primary
          label={`${decision.order.id} · ${decision.gateLabel}`}
          secondary={`Target ${formatDate(decision.dueAt)}`}
        />
      ),
    },
    {
      key: 'due',
      header: 'Due',
      align: 'right',
      render: (decision) => (
        <span className="text-[13px] font-semibold text-ink-900 tabular-nums">{dueLabel(decision)}</span>
      ),
    },
  ];

  const trackColumns: Column<TrackRow>[] = [
    {
      key: 'track',
      header: 'Track',
      render: (row) => (
        <div className="min-w-0">
          <div className="truncate text-[13px] leading-5 font-semibold text-ink-900">{row.label}</div>
          <ProgressMeter value={row.share} className="mt-1.5" />
        </div>
      ),
    },
    {
      key: 'count',
      header: 'Pending',
      align: 'right',
      render: (row) => <span className="text-[13px] font-semibold text-ink-900 tabular-nums">{row.count}</span>,
    },
  ];

  const recordColumns: Column<DecisionRecord>[] = [
    {
      key: 'decision',
      header: 'Decision',
      render: (record) => (
        <Primary
          label={`${record.orderId} · ${record.gateLabel}`}
          secondary={`${ACTION_LABEL[record.action]}${record.delegateTo ? ` to ${record.delegateTo}` : ''} by ${record.actor}`}
          tone={ACTION_TONE[record.action]}
        />
      ),
    },
    {
      key: 'at',
      header: 'At',
      align: 'right',
      render: (record) => (
        <span className="text-[13px] font-semibold text-ink-900 tabular-nums">{formatTime(record.at)}</span>
      ),
    },
  ];

  return (
    <>
      <SectionCard title="Take These First" collapsible defaultOpen={false} padded={false} bodyClassName="overflow-hidden">
        <DataTable
          columns={priorityColumns}
          rows={priority}
          rowKey={(decision) => decision.id}
          density="tight"
          surface={false}
          bordered={false}
          minWidth="0"
          emptyState={<EmptyState title="The queue is clear." />}
        />
      </SectionCard>

      <SectionCard title="Decision Windows" collapsible defaultOpen={false} padded={false} bodyClassName="overflow-hidden">
        <DataTable
          columns={windowColumns}
          rows={windows}
          rowKey={(decision) => decision.id}
          density="tight"
          surface={false}
          bordered={false}
          minWidth="0"
          emptyState={<EmptyState title="No decision window closes this week." />}
        />
      </SectionCard>

      <SectionCard title="Queue By Track" collapsible defaultOpen={false} padded={false} bodyClassName="overflow-hidden">
        <DataTable
          columns={trackColumns}
          rows={trackRows}
          rowKey={(row) => row.label}
          density="tight"
          surface={false}
          bordered={false}
          minWidth="0"
          emptyState={<EmptyState title="No pending decisions to distribute." />}
        />
      </SectionCard>

      <SectionCard title="Recent Decisions" collapsible defaultOpen={false} padded={false} bodyClassName="overflow-hidden">
        <DataTable
          columns={recordColumns}
          rows={records.slice(0, 5)}
          rowKey={(record) => `${record.id}-${record.at}`}
          density="tight"
          surface={false}
          bordered={false}
          minWidth="0"
          emptyState={<EmptyState title="No decisions recorded yet today." />}
        />
      </SectionCard>
    </>
  );
}
