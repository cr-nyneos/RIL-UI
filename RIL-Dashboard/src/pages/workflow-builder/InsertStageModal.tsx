import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import TextField from '../../components/ui/TextField';
import type { Option } from '../../lib/types/ui';
import { ROLE_NAMES, STAGE_LIBRARY } from '../../lib/mockData/workflow';

const CUSTOM = '__custom';

const ROLE_OPTIONS: Option<string>[] = ROLE_NAMES.map((role) => ({ value: role, label: role }));

export interface InsertPayload {
  libraryId: string | null;
  name: string;
  role: string;
  slaHours: number;
}

interface InsertStageModalProps {
  open: boolean;
  position: number;
  onClose: () => void;
  onInsert: (payload: InsertPayload) => void;
}

export default function InsertStageModal({ open, position, onClose, onInsert }: InsertStageModalProps) {
  const [choice, setChoice] = useState<string>(STAGE_LIBRARY[0].id);
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLE_NAMES[0]);
  const [duration, setDuration] = useState('4');

  useEffect(() => {
    if (open) {
      setChoice(STAGE_LIBRARY[0].id);
      setName('');
      setRole(ROLE_NAMES[0]);
      setDuration('4');
    }
  }, [open]);

  const custom = choice === CUSTOM;
  const canInsert = custom ? name.trim().length > 0 : true;

  const submit = () => {
    if (!canInsert) return;
    if (custom) {
      onInsert({ libraryId: null, name: name.trim(), role, slaHours: Number(duration) || 1 });
      return;
    }
    const preset = STAGE_LIBRARY.find((item) => item.id === choice);
    if (!preset) return;
    onInsert({ libraryId: preset.id, name: preset.name, role: preset.role, slaHours: preset.slaHours });
  };

  return (
    <Modal
      open={open}
      title="Insert Stage"
      description={`Position ${position + 1} in the workflow`}
      onClose={onClose}
      footer={
        <>
          <Button className="cursor-pointer" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" className="cursor-pointer" disabled={!canInsert} onClick={submit}>
            Insert Stage
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-subtitle">Predefined Stage</span>
          <div className="grid max-h-[260px] grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
            {STAGE_LIBRARY.map((preset) => {
              const active = choice === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setChoice(preset.id)}
                  className={`focus-bloom flex cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors duration-150 ${
                    active
                      ? 'border-brand-600 bg-[var(--color-surface-selected)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface-input)] hover:bg-[var(--color-surface-hover)]'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-body-strong">{preset.name}</span>
                    <span className="text-meta block truncate">{preset.role}</span>
                  </span>
                  {active && <Check size={16} strokeWidth={2.6} className="flex-none text-brand-700" />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          aria-pressed={custom}
          onClick={() => setChoice(CUSTOM)}
          className={`focus-bloom cursor-pointer rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors duration-150 ${
            custom
              ? 'border-brand-600 bg-[var(--color-surface-selected)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface-input)] hover:bg-[var(--color-surface-hover)]'
          }`}
        >
          <span className="text-body-strong">Custom stage</span>
        </button>

        {custom && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle">Stage Name</span>
              <TextField value={name} onChange={setName} placeholder="Enter stage name" autoFocus />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle">Assigned Role</span>
              <Select ariaLabel="Assigned role" value={role} options={ROLE_OPTIONS} onChange={setRole} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-subtitle">SLA Duration (hours)</span>
              <TextField type="number" min={1} value={duration} onChange={setDuration} />
            </label>
          </div>
        )}
      </div>
    </Modal>
  );
}
