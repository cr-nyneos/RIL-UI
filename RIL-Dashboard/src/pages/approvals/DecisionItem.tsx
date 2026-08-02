import { ArrowRight, Check, ClipboardCheck, FileCheck2, Gavel, ShieldCheck, Wallet } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/ui/Button';
import DecisionCard from '../../components/ui/DecisionCard';
import { formatCurrency, formatDate } from '../../lib/format';
import type { DecisionAction, DecisionTrack, PendingDecision } from '../../lib/types/approvals';
import type { Tone } from '../../lib/types/ui';
import DecisionPreview from './DecisionPreview';

const TRACK_ICON: Record<DecisionTrack, ReactNode> = {
  security: <ShieldCheck size={17} strokeWidth={2.2} />,
  documents: <FileCheck2 size={17} strokeWidth={2.2} />,
  qc: <ClipboardCheck size={17} strokeWidth={2.2} />,
  governance: <Gavel size={17} strokeWidth={2.2} />,
  finance: <Wallet size={17} strokeWidth={2.2} />,
};

const ACCENT: Record<PendingDecision['urgency'], Tone> = {
  breached: 'danger',
  today: 'warning',
  scheduled: 'brand',
};

function dueLabel(decision: PendingDecision): string {
  if (decision.blocked) return 'Held at gate';
  if (decision.dueInDays < 0) return `${Math.abs(decision.dueInDays)} days over target`;
  if (decision.dueInDays === 0) return 'Due today';
  if (decision.dueInDays === 1) return 'Due tomorrow';
  return `Due in ${decision.dueInDays} days`;
}

function status(decision: PendingDecision): { label: string; tone: Tone } | undefined {
  if (decision.escalated) return { label: 'Escalated', tone: 'danger' };
  if (decision.blocked) return { label: 'Blocked', tone: 'danger' };
  if (decision.priority === 'Critical') return { label: 'Critical', tone: 'danger' };
  if (decision.priority === 'High') return { label: 'High', tone: 'warning' };
  return undefined;
}

interface DecisionItemProps {
  decision: PendingDecision;
  expanded: boolean;
  onToggle: () => void;
  onAct: (decision: PendingDecision, action: DecisionAction) => void;
  style?: CSSProperties;
}

export default function DecisionItem({ decision, expanded, onToggle, onAct, style }: DecisionItemProps) {
  const navigate = useNavigate();

  return (
    <DecisionCard
      icon={TRACK_ICON[decision.track]}
      gate={decision.gateLabel}
      orderId={decision.order.id}
      orderTo={`/orders/${decision.order.id}`}
      subtitle={`${decision.order.vendor} · ${formatCurrency(decision.order.valueCr)}`}
      question={decision.question}
      stages={decision.stages}
      accent={ACCENT[decision.urgency]}
      due={dueLabel(decision)}
      status={status(decision)}
      facts={[
        { label: 'Owner', value: decision.owner.name },
        {
          label: 'Waiting',
          value: `${decision.waitingDays} ${decision.waitingDays === 1 ? 'day' : 'days'}`,
          tone: decision.urgency === 'breached' ? 'danger' : undefined,
        },
        { label: 'Decision Target', value: formatDate(decision.dueAt) },
      ]}
      actions={
        <>
          <Button
            variant="primary"
            size="sm"
            icon={<Check size={15} strokeWidth={2.6} />}
            onClick={() => onAct(decision, 'approve')}
            className="cursor-pointer"
          >
            Approve
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAct(decision, 'reject')}
            className="cursor-pointer bg-[var(--color-surface-section)]"
          >
            Return
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAct(decision, 'escalate')}
            className="cursor-pointer bg-[var(--color-surface-section)]"
          >
            Escalate
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAct(decision, 'delegate')}
            className="cursor-pointer bg-[var(--color-surface-section)]"
          >
            Delegate
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowRight size={15} strokeWidth={2.4} />}
            iconPosition="right"
            onClick={() =>
              navigate(`/orders/${decision.order.id}/gates/${decision.gateKey}`, {
                state: { from: '/approvals', fromLabel: 'Approvals' },
              })
            }
            className="ml-auto cursor-pointer bg-[var(--color-surface-section)]"
          >
            Open Workspace
          </Button>
        </>
      }
      expanded={expanded}
      onToggle={onToggle}
      className="animate-rise"
      style={style}
    >
      <DecisionPreview decision={decision} />
    </DecisionCard>
  );
}
