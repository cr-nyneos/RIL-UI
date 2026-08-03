import { ClipboardCheck, Pencil } from 'lucide-react';

import Button from '../../components/ui/Button';
import CardHeader from '../../components/ui/CardHeader';
import GlassCard from '../../components/ui/GlassCard';
import { REQUIRED_DOCUMENTS, ROLE_ORDER, STEP_COPY } from './constants';
import { SummaryRow } from './CreateOrderRows';
import type { Milestone, Priority, Stakeholder, StakeholderRole, StepKey } from './types';
import type { ContractType } from '../../lib/types/order';

interface ReviewTabProps {
  allValid: boolean;
  vendor: string;
  plant: string;
  poNumber: string;
  contractNumber: string;
  orderValue: string;
  completionDate: string;
  priority: Priority;
  contractType: ContractType;
  workflow: Milestone[];
  totalDuration: number;
  stakeholders: Partial<Record<StakeholderRole, Stakeholder>>;
  documents: Record<string, boolean>;
  setActiveStep: (step: StepKey) => void;
}

export default function ReviewTab({
  allValid,
  vendor,
  plant,
  poNumber,
  contractNumber,
  orderValue,
  completionDate,
  priority,
  contractType,
  workflow,
  totalDuration,
  stakeholders,
  documents,
  setActiveStep,
}: ReviewTabProps) {
  return (
    <GlassCard key="review" className="animate-rise p-5" style={{ animationDelay: '80ms' }}>
      <CardHeader icon={ClipboardCheck} {...STEP_COPY.review} pill={allValid ? 'READY' : 'PENDING'} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-body-strong">Commercial Details</div>
            <Button variant="icon" size="sm" aria-label="Edit details" icon={<Pencil size={15} strokeWidth={2.3} />} onClick={() => setActiveStep('details')} />
          </div>
          <SummaryRow label="Vendor" value={vendor} />
          <SummaryRow label="Plant" value={plant} />
          <SummaryRow label="PO Number" value={poNumber} />
          <SummaryRow label="Contract Number" value={contractNumber} />
          <SummaryRow label="Order Value" value={orderValue ? `Rs ${orderValue}` : ''} />
          <SummaryRow label="Completion Date" value={completionDate} />
          <SummaryRow label="Priority" value={priority} />
        </GlassCard>
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-body-strong">Workflow Summary</div>
            <Button variant="icon" size="sm" aria-label="Edit workflow" icon={<Pencil size={15} strokeWidth={2.3} />} onClick={() => setActiveStep('workflow')} />
          </div>
          <SummaryRow label="Type" value={contractType} />
          <SummaryRow label="Milestones" value={`${workflow.length}`} />
          <SummaryRow label="Duration" value={`${totalDuration} days`} />
          <SummaryRow label="Owner Rules" value="Mapped" />
        </GlassCard>
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-body-strong">Stakeholders</div>
            <Button variant="icon" size="sm" aria-label="Edit team" icon={<Pencil size={15} strokeWidth={2.3} />} onClick={() => setActiveStep('team')} />
          </div>
          {ROLE_ORDER.map((role) => (
            <SummaryRow key={role} label={role} value={stakeholders[role]?.name ?? ''} />
          ))}
        </GlassCard>
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-body-strong">Uploaded Documents</div>
            <Button variant="icon" size="sm" aria-label="Edit documents" icon={<Pencil size={15} strokeWidth={2.3} />} onClick={() => setActiveStep('documents')} />
          </div>
          {REQUIRED_DOCUMENTS.map((document) => (
            <SummaryRow key={document} label={document} value={documents[document] ? 'Uploaded' : ''} />
          ))}
        </GlassCard>
      </div>
    </GlassCard>
  );
}

