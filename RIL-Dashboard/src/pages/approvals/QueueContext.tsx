import PanelRow, { PanelEmpty } from '../../components/ui/PanelRow';
import ProgressMeter from '../../components/ui/ProgressMeter';
import Section from '../../components/ui/Section';
import { formatCurrency, formatDate, formatTime } from '../../lib/format';
import type { DecisionRecord, PendingDecision } from '../../lib/types/approvals';
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

  const longest = [...decisions].sort((a, b) => b.waitingDays - a.waitingDays)[0];

  const tracks = decisions.reduce<Record<string, number>>((totals, decision) => {
    totals[decision.trackLabel] = (totals[decision.trackLabel] ?? 0) + 1;
    return totals;
  }, {});
  const distribution = Object.entries(tracks).sort((a, b) => b[1] - a[1]);
  const peak = Math.max(...distribution.map(([, count]) => count), 1);

  return (
    <>
      <Section
        title="Take These First"
        description={
          longest
            ? `Longest wait is ${longest.order.id} at ${longest.waitingDays} days`
            : 'Nothing is waiting on you right now'
        }
        padded={false}
      >
        {priority.length ? (
          priority.map((decision) => (
            <PanelRow
              key={decision.id}
              tone={decision.urgency === 'breached' ? 'danger' : decision.urgency === 'today' ? 'warning' : 'brand'}
              primary={`${decision.order.id} · ${decision.trackLabel}`}
              secondary={`${decision.order.vendor} · ${decision.owner.name}`}
              trailing={formatCurrency(decision.order.valueCr)}
            />
          ))
        ) : (
          <PanelEmpty label="The queue is clear." />
        )}
      </Section>

      <Section title="Decision Windows" description="Closing within the next three days." padded={false}>
        {windows.length ? (
          windows.map((decision) => (
            <PanelRow
              key={decision.id}
              primary={`${decision.order.id} · ${decision.gateLabel}`}
              secondary={`Target ${formatDate(decision.dueAt)}`}
              trailing={dueLabel(decision)}
            />
          ))
        ) : (
          <PanelEmpty label="No decision window closes this week." />
        )}
      </Section>

      <Section title="Queue By Track" description="Where the pending work sits.">
        <div className="grid gap-4">
          {distribution.length ? (
            distribution.map(([label, count]) => (
              <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
                <span className="truncate text-[13px] leading-5 font-semibold text-ink-700">{label}</span>
                <span className="text-[13px] leading-5 font-bold text-ink-900 tabular-nums">{count}</span>
                <ProgressMeter value={Math.round((count / peak) * 100)} className="col-span-2" />
              </div>
            ))
          ) : (
            <p className="text-meta">No pending decisions to distribute.</p>
          )}
        </div>
      </Section>

      <Section title="Recent Decisions" description="Everything you have settled in this session." padded={false}>
        {records.length ? (
          records
            .slice(0, 5)
            .map((record) => (
              <PanelRow
                key={`${record.id}-${record.at}`}
                tone={ACTION_TONE[record.action]}
                primary={`${record.orderId} · ${record.gateLabel}`}
                secondary={`${ACTION_LABEL[record.action]}${record.delegateTo ? ` to ${record.delegateTo}` : ''} by ${record.actor}`}
                trailing={formatTime(record.at)}
              />
            ))
        ) : (
          <PanelEmpty label="No decisions recorded yet today." />
        )}
      </Section>
    </>
  );
}
