import { useState } from 'react';

import Button from '../../components/ui/Button';
import KeyValue from '../../components/ui/KeyValue';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import TextField from '../../components/ui/TextField';
import { delegateOptions } from '../../lib/approvalsStore';
import { formatCurrency, formatDate } from '../../lib/format';
import type { DecisionAction, DecisionSubmission, PendingDecision } from '../../lib/types/approvals';

const TITLE: Record<DecisionAction, string> = {
  approve: 'Approve Decision',
  reject: 'Return For Rework',
  escalate: 'Escalate Decision',
  delegate: 'Delegate Decision',
};

const CONFIRM: Record<DecisionAction, string> = {
  approve: 'Approve And Close Gate',
  reject: 'Return To Owner',
  escalate: 'Raise Escalation',
  delegate: 'Assign Reviewer',
};

const PROMPT: Record<DecisionAction, string> = {
  approve: 'Closing this gate unlocks the next step in the execution chain.',
  reject: 'The gate is held open and returned to its owner with your reason.',
  escalate: 'The gate keeps running while senior review is requested.',
  delegate: 'Ownership moves to the reviewer you select.',
};

const ESCALATION_REASONS = [
  'Value threshold exceeded',
  'Dependency unresolved',
  'Vendor risk',
  'Compliance exception',
  'Delivery commitment at risk',
];

interface DecisionModalProps {
  decision: PendingDecision;
  action: DecisionAction;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (submission: DecisionSubmission) => void;
}

/** Mounted per decision — the caller keys it, so every opening starts clean. */
export default function DecisionModal({ decision, action, submitting, onClose, onSubmit }: DecisionModalProps) {
  const delegates = delegateOptions(decision);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState(ESCALATION_REASONS[0]);
  const [delegateTo, setDelegateTo] = useState(delegates[0]?.value ?? '');
  const [touched, setTouched] = useState(false);

  const noteRequired = action === 'reject' || action === 'escalate';
  const invalid = (noteRequired && !note.trim()) || (action === 'delegate' && !delegateTo);

  function handleSubmit() {
    setTouched(true);
    if (invalid || submitting) return;
    onSubmit({
      action,
      note,
      reason: action === 'escalate' ? reason : undefined,
      delegateTo: action === 'delegate' ? delegateTo : undefined,
    });
  }

  return (
    <Modal
      open
      title={TITLE[action]}
      description={`${decision.gateLabel} · ${decision.order.id}`}
      onClose={onClose}
      width="560px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="primary" loading={submitting} onClick={handleSubmit} className="cursor-pointer">
            {CONFIRM[action]}
          </Button>
        </>
      }
    >
      <div className="grid gap-5">
        <KeyValue
          columns={2}
          items={[
            { label: 'Vendor', value: decision.order.vendor },
            { label: 'Plant', value: decision.order.plant },
            { label: 'Order Value', value: formatCurrency(decision.order.valueCr) },
            { label: 'Decision Target', value: formatDate(decision.dueAt) },
            { label: 'Current Owner', value: `${decision.owner.name} · ${decision.owner.role}` },
            { label: 'Waiting', value: `${decision.waitingDays} days` },
          ]}
        />

        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3">
          <p className="text-[13px] leading-5 font-bold text-ink-900">{decision.question}</p>
          <p className="text-meta mt-1">{PROMPT[action]}</p>
        </div>

        {action === 'delegate' && (
          <label className="grid gap-1.5">
            <span className="text-[13px] font-semibold text-ink-700">Reviewer</span>
            <Select
              value={delegateTo}
              onChange={setDelegateTo}
              options={delegates}
              ariaLabel="Reviewer"
              className="w-full"
            />
          </label>
        )}

        {action === 'escalate' && (
          <label className="grid gap-1.5">
            <span className="text-[13px] font-semibold text-ink-700">Escalation reason</span>
            <Select
              value={reason}
              onChange={setReason}
              options={ESCALATION_REASONS.map((value) => ({ value, label: value }))}
              ariaLabel="Escalation reason"
              className="w-full"
            />
          </label>
        )}

        <TextField
          label={noteRequired ? 'Comment (required)' : 'Comment'}
          value={note}
          onChange={setNote}
          placeholder={
            action === 'reject' ? 'What has to change before this gate can close?' : 'Add context for the audit trail'
          }
          error={touched && noteRequired && !note.trim() ? 'A comment is required for this decision.' : undefined}
        />
        {touched && action === 'delegate' && !delegateTo && (
          <p className="text-[12px] font-semibold text-danger">Select a reviewer to continue.</p>
        )}
      </div>
    </Modal>
  );
}
