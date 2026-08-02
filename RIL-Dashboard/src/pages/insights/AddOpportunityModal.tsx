import { useState } from 'react';

import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import TextField from '../../components/ui/TextField';
import {
  OPPORTUNITY_DEPARTMENTS,
  OPPORTUNITY_IMPACTS,
  OPPORTUNITY_OWNERS,
  OPPORTUNITY_PRIORITIES,
  OPPORTUNITY_STATUSES,
} from '../../lib/mockData/insights';
import type {
  Opportunity,
  OpportunityDepartment,
  OpportunityImpact,
  OpportunityPriority,
  OpportunityStatus,
} from '../../lib/types/insights';

const toOptions = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value }));

const FIELD_LABEL = 'text-[13px] font-semibold text-ink-700';

interface AddOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (opportunity: Omit<Opportunity, 'id' | 'lastUpdated'>) => void;
}

export default function AddOpportunityModal({ open, onClose, onSubmit }: AddOpportunityModalProps) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<OpportunityDepartment>(OPPORTUNITY_DEPARTMENTS[0]);
  const [priority, setPriority] = useState<OpportunityPriority>('Medium');
  const [owner, setOwner] = useState(OPPORTUNITY_OWNERS[0]);
  const [status, setStatus] = useState<OpportunityStatus>('Backlog');
  const [impact, setImpact] = useState<OpportunityImpact>('Medium');
  const [touched, setTouched] = useState(false);

  if (!open) return null;

  const invalid = !title.trim();

  function handleSubmit() {
    setTouched(true);
    if (invalid) return;
    onSubmit({ title: title.trim(), department, priority, owner, status, impact });
  }

  return (
    <Modal
      open
      title="Add Opportunity"
      onClose={onClose}
      width="600px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} className="cursor-pointer">
            Add Opportunity
          </Button>
        </>
      }
    >
      <div className="grid gap-5">
        <TextField
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="What manual step should be digitized?"
          error={touched && invalid ? 'A title is required.' : undefined}
        />

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={FIELD_LABEL}>Department</span>
            <Select
              ariaLabel="Department"
              value={department}
              options={toOptions(OPPORTUNITY_DEPARTMENTS)}
              onChange={setDepartment}
              className="w-full"
            />
          </label>

          <label className="grid gap-1.5">
            <span className={FIELD_LABEL}>Owner</span>
            <Select
              ariaLabel="Owner"
              value={owner}
              options={toOptions(OPPORTUNITY_OWNERS)}
              onChange={setOwner}
              className="w-full"
            />
          </label>

          <label className="grid gap-1.5">
            <span className={FIELD_LABEL}>Priority</span>
            <Select
              ariaLabel="Priority"
              value={priority}
              options={toOptions(OPPORTUNITY_PRIORITIES)}
              onChange={setPriority}
              className="w-full"
            />
          </label>

          <label className="grid gap-1.5">
            <span className={FIELD_LABEL}>Impact</span>
            <Select
              ariaLabel="Impact"
              value={impact}
              options={toOptions(OPPORTUNITY_IMPACTS)}
              onChange={setImpact}
              className="w-full"
            />
          </label>

          <label className="grid gap-1.5">
            <span className={FIELD_LABEL}>Status</span>
            <Select
              ariaLabel="Status"
              value={status}
              options={toOptions(OPPORTUNITY_STATUSES)}
              onChange={setStatus}
              className="w-full"
            />
          </label>
        </div>
      </div>
    </Modal>
  );
}
