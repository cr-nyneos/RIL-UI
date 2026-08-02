import { CheckCircle2, CloudUpload, FileCheck2, FileText, PackageCheck, Route, ShieldCheck, UserRoundCheck, Users } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import CardHeader from '../../components/ui/CardHeader';
import GlassCard from '../../components/ui/GlassCard';
import { REQUIRED_DOCUMENTS, ROLE_ORDER } from './constants';
import { CheckRow, SummaryRow } from './CreateOrderRows';
import { initials } from './utils';
import type { Milestone, Priority, Stakeholder, StakeholderRole, StepKey } from './types';
import type { ContractType } from '../../lib/types/order';

interface ValidationItem {
  label: string;
  done: boolean;
  waiting?: boolean;
}

interface CreateOrderSidebarProps {
  activeStep: StepKey;
  completed: Record<StepKey, boolean>;
  activeValidation: ValidationItem[];
  vendor: string;
  plant: string;
  contractType: ContractType;
  orderValue: string;
  priority: Priority;
  completionDate: string;
  workflow: Milestone[];
  totalDuration: number;
  assignedCount: number;
  uploadedCount: number;
  stakeholders: Partial<Record<StakeholderRole, Stakeholder>>;
  documents: Record<string, boolean>;
}

export default function CreateOrderSidebar({
  activeStep,
  completed,
  activeValidation,
  vendor,
  plant,
  contractType,
  orderValue,
  priority,
  completionDate,
  workflow,
  totalDuration,
  assignedCount,
  uploadedCount,
  stakeholders,
  documents,
}: CreateOrderSidebarProps) {
  return (
    <aside className="animate-panel-right space-y-4 xl:sticky xl:top-8">
      {activeStep === 'details' && (
        <GlassCard className="animate-rise p-5" style={{ animationDelay: '120ms' }}>
          <CardHeader eyebrow="Order" icon={PackageCheck} title="Order Summary" />
          <SummaryRow label="Vendor" value={vendor} />
          <SummaryRow label="Plant" value={plant} />
          <SummaryRow label="Contract" value={contractType} />
          <SummaryRow label="Value" value={orderValue ? `Rs ${orderValue}` : ''} />
          <SummaryRow label="Priority" value={priority} />
        </GlassCard>
      )}

      {activeStep === 'workflow' && (
        <>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '120ms' }}>
            <CardHeader eyebrow="Route" icon={ShieldCheck} title="Workflow Preview"  pill={`${workflow.length}`} />
            <div className="space-y-3">
              {workflow.map((milestone) => (
                <div key={milestone.label} className="glass-inset p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="truncate text-body-strong">{milestone.label}</div>
                    <Badge tone="neutral" variant="glass" size="xs">{milestone.durationDays}d</Badge>
                  </div>
                  <div className="text-meta">{milestone.owner}</div>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '160ms' }}>
            <CardHeader eyebrow="Milestones" icon={Route} title="Milestone Summary"/>
            <SummaryRow label="Stages" value={`${workflow.length}`} />
            <SummaryRow label="Duration" value={`${totalDuration} days`} />
            <SummaryRow label="Owner Rules" value="Mapped" />
          </GlassCard>
        </>
      )}

      {activeStep === 'team' && (
        <>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '120ms' }}>
            <CardHeader eyebrow="Owners" icon={Users} title="Assigned Owners"  />
            <div className="space-y-3">
              {ROLE_ORDER.map((role) => {
                const owner = stakeholders[role];
                return (
                  <div key={role} className="glass-inset flex items-center gap-3 p-3">
                    <span className="glass-ring flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-600 text-[12px] font-bold text-white">
                      {owner ? initials(owner.name) : role.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-strong">{owner?.name ?? role}</span>
                      <span className="block truncate text-meta">{owner?.plant ?? 'Unassigned'}</span>
                    </span>
                    {owner && <CheckCircle2 size={18} strokeWidth={2.4} className="text-success" />}
                  </div>
                );
              })}
            </div>
          </GlassCard>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '160ms' }}>
            <CardHeader eyebrow="Coverage" icon={UserRoundCheck} title="Role Coverage" />
            <SummaryRow label="Assigned" value={`${assignedCount} of ${ROLE_ORDER.length}`} />
            <SummaryRow label="Open Roles" value={`${ROLE_ORDER.length - assignedCount}`} />
            <SummaryRow label="Primary Plant" value={plant} />
          </GlassCard>
        </>
      )}

      {activeStep === 'documents' && (
        <>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '120ms' }}>
            <CardHeader eyebrow="Files" icon={CloudUpload} title="Uploaded Files" />
            <SummaryRow label="Uploaded" value={`${uploadedCount} of ${REQUIRED_DOCUMENTS.length}`} />
            {REQUIRED_DOCUMENTS.map((document) => (
              <CheckRow key={document} label={document} done={documents[document]} waiting={!documents[document]} />
            ))}
          </GlassCard>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '160ms' }}>
            <CardHeader eyebrow="Documents" icon={FileCheck2} title="Required Documents" />
            <div className="space-y-3">
              {REQUIRED_DOCUMENTS.map((document) => (
                <div key={document} className="glass-inset flex items-center gap-3 p-3">
                  <FileText size={17} strokeWidth={2.2} className="text-brand-700" />
                  <span className="text-body-strong">{document}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </>
      )}

      {activeStep === 'review' && (
        <>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '120ms' }}>
            <CardHeader eyebrow="Complete" icon={PackageCheck} title="Complete Order Summary"  />
            <SummaryRow label="Vendor" value={vendor} />
            <SummaryRow label="Plant" value={plant} />
            <SummaryRow label="Value" value={orderValue ? `Rs ${orderValue}` : ''} />
            <SummaryRow label="Completion" value={completionDate} />
          </GlassCard>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '160ms' }}>
            <CardHeader eyebrow="Route" icon={Route} title="Workflow Summary" />
            <SummaryRow label="Contract Type" value={contractType} />
            <SummaryRow label="Milestones" value={`${workflow.length}`} />
            <SummaryRow label="Duration" value={`${totalDuration} days`} />
          </GlassCard>
          <GlassCard className="animate-rise p-5" style={{ animationDelay: '200ms' }}>
            <CardHeader eyebrow="Owners" icon={Users} title="Assigned Team" />
            <SummaryRow label="Assigned" value={`${assignedCount} of ${ROLE_ORDER.length}`} />
            <SummaryRow label="Documents" value={`${uploadedCount} of ${REQUIRED_DOCUMENTS.length}`} />
          </GlassCard>
        </>
      )}

      <GlassCard className="animate-rise p-5" style={{ animationDelay: '240ms' }}>
        <CardHeader
          eyebrow="Checks"
          icon={UserRoundCheck}
          title={activeStep === 'review' ? 'Final Validation' : 'Validation'}
          pill={completed[activeStep] ? 'READY' : 'PENDING'}
        />
        <div className="space-y-3">
          {activeValidation.map((item) => (
            <CheckRow key={item.label} label={item.label} done={item.done} waiting={item.waiting} />
          ))}
        </div>
      </GlassCard>
    </aside>
  );
}

