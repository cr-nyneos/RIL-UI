import ActivityFeed from '../../components/ui/ActivityFeed';
import DocumentRow from '../../components/ui/DocumentRow';
import KeyValue from '../../components/ui/KeyValue';
import ProgressMeter from '../../components/ui/ProgressMeter';
import Section from '../../components/ui/Section';
import { formatCurrency, formatDate } from '../../lib/format';
import { toneToken } from '../../lib/tone';
import type { PendingDecision } from '../../lib/types/approvals';

/**
 * Everything a reviewer would otherwise open a page for — evidence, history and
 * risk — held inline under the card. Each block is its own container so the
 * expansion reads as a set of sections, never one long sheet.
 */
export default function DecisionPreview({ decision }: { decision: PendingDecision }) {
  const { order } = decision;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <div className="grid min-w-0 items-start gap-4">
        <Section title="Decision Context" description={`${decision.trackLabel} · queue reference ${decision.id}`}>
          {decision.context && <p className="text-meta mb-4">{decision.context}</p>}

          <div className="mb-4">
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="text-table-head">Decision Window</span>
              <span className="text-meta tabular-nums">
                {decision.waitingDays} {decision.waitingDays === 1 ? 'day' : 'days'} waiting · target{' '}
                {formatDate(decision.dueAt)}
              </span>
            </div>
            <ProgressMeter value={decision.slaConsumed} tone={decision.urgency === 'scheduled' ? 'neutral' : 'danger'} />
          </div>

          <KeyValue
            columns={2}
            items={[
              { label: 'Purchase Order', value: order.po },
              { label: 'Contract Type', value: order.type },
              { label: 'Order Value', value: formatCurrency(order.valueCr) },
              { label: 'Expected Delivery', value: formatDate(order.expected) },
              { label: 'Assigned Owner', value: decision.owner.name },
              { label: 'Role', value: decision.owner.role },
            ]}
          />
        </Section>

        <Section title="Risk Flags" description="Everything working against this decision.">
          {decision.risks.length ? (
            <ul className="grid gap-2.5">
              {decision.risks.map((risk) => (
                <li key={risk.label} className="flex items-start gap-2.5 text-[13px] leading-5 font-medium text-ink-700">
                  <span
                    aria-hidden
                    className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full"
                    style={{ background: toneToken(risk.tone).fill }}
                  />
                  {risk.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-meta">No open risk flags against this gate.</p>
          )}
        </Section>

        <Section title="Operational Notes" description="The latest word from the gate.">
          {decision.notes.length ? (
            <ul className="grid gap-3">
              {decision.notes.map((note) => (
                <li key={`${note.at}-${note.note}`} className="min-w-0">
                  <div className="text-table-head tabular-nums">{formatDate(note.at)}</div>
                  <p className="mt-0.5 text-[13px] leading-5 font-medium text-ink-700">{note.note}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-meta">No notes recorded against this gate yet.</p>
          )}
        </Section>
      </div>

      <div className="grid min-w-0 items-start gap-4">
        <Section title="Approval Trail" description="Gates already closed, and who holds the next ones." padded={false}>
          {decision.previousApprovals.map((approval) => (
            <div
              key={approval.gate}
              className="flex items-center justify-between gap-3 border-b border-[var(--color-glass-hairline)] px-5 py-2.5 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] leading-5 font-bold text-ink-900">{approval.gate}</div>
                <div className="text-meta truncate">{approval.owner}</div>
              </div>
              <span className="text-meta flex-none tabular-nums">{approval.at ? formatDate(approval.at) : '—'}</span>
            </div>
          ))}
          {decision.upcoming.map((next) => (
            <div
              key={next.gate}
              className="flex items-center justify-between gap-3 border-b border-[var(--color-glass-hairline)] px-5 py-2.5 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] leading-5 font-bold text-ink-800">{next.gate}</div>
                <div className="text-meta truncate">
                  {next.owner} · {next.role}
                </div>
              </div>
              <span className="text-meta flex-none">Next</span>
            </div>
          ))}
          {decision.previousApprovals.length === 0 && decision.upcoming.length === 0 && (
            <div className="text-meta px-5 py-3">This is the first gate on the order.</div>
          )}
        </Section>

        <Section title="Documents" description="Attached against the order." padded={false}>
          {decision.documents.length ? (
            decision.documents.map((document) => <DocumentRow key={document.id} {...document} />)
          ) : (
            <div className="text-meta px-5 py-3">No documents attached.</div>
          )}
        </Section>

        <Section title="Recent Activity" description="The order's own audit trail." padded={false}>
          <ActivityFeed entries={decision.activity} />
        </Section>
      </div>
    </div>
  );
}
