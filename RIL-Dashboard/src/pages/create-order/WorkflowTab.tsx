import { Check, CheckCircle2, Route, Sparkles } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CardHeader from '../../components/ui/CardHeader';
import GlassCard from '../../components/ui/GlassCard';
import StatusBadge from '../../components/ui/StatusBadge';
import TypeBadge from '../../components/ui/TypeBadge';
import { STEP_COPY } from './constants';
import type { Milestone } from './types';
import type { ContractType } from '../../lib/types/order';

interface WorkflowTabProps {
  contractType: ContractType;
  workflow: Milestone[];
  totalDuration: number;
  workflowAccepted: boolean;
  setWorkflowAccepted: (value: boolean) => void;
  meaningfulChange: () => void;
}

export default function WorkflowTab({ contractType, workflow, totalDuration, workflowAccepted, setWorkflowAccepted, meaningfulChange }: WorkflowTabProps) {
  return (
    <GlassCard key="workflow" bloom="cyan" className="animate-rise p-7" style={{ animationDelay: '80ms' }}>
      <CardHeader icon={Route} {...STEP_COPY.workflow} pill={<TypeBadge type={contractType} />} />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-body-strong tabular-nums">{workflow.length} milestones, {totalDuration} planned days</div>
        <Button
          variant={workflowAccepted ? 'secondary' : 'primary'}
          icon={workflowAccepted ? <Check size={16} strokeWidth={2.4} /> : <Sparkles size={16} strokeWidth={2.4} />}
          onClick={() => {
            setWorkflowAccepted(true);
            meaningfulChange();
          }}
        >
          {workflowAccepted ? 'Workflow Confirmed' : 'Confirm Workflow'}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {workflow.map((milestone, index) => (
          <GlassCard key={milestone.label} bloom="neutral" interactive className="min-h-[164px] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--wash-brand-active)] text-body-strong text-brand-700 tabular-nums">
                {index + 1}
              </span>
              <StatusBadge status={index === 0 ? 'Scheduled' : 'Pending'} size="sm" />
            </div>
            <div className="text-body-strong">{milestone.label}</div>
            <div className="mt-2 text-meta">{milestone.owner}</div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <Badge tone="neutral" variant="glass" size="xs">{milestone.durationDays} days</Badge>
              {workflowAccepted && <CheckCircle2 size={18} strokeWidth={2.4} className="text-success" />}
            </div>
          </GlassCard>
        ))}
      </div>
    </GlassCard>
  );
}
