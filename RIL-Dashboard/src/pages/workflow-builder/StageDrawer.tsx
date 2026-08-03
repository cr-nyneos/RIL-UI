import { Trash2 } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Drawer from '../../components/ui/Drawer';
import Select from '../../components/ui/Select';
import Switch from '../../components/ui/Switch';
import TextField from '../../components/ui/TextField';
import type { Option } from '../../lib/types/ui';
import type { WorkflowStage } from '../../lib/types/workflow';
import {
  DOCUMENT_LIBRARY,
  ESCALATION_RULES,
  NOTIFICATION_TRIGGERS,
  ROLE_NAMES,
} from '../../lib/mockData/workflow';

const FIELD_LABEL = 'text-[14px] leading-5 font-semibold text-ink-700';

const toOptions = (values: string[]): Option<string>[] => values.map((value) => ({ value, label: value }));

const ROLE_OPTIONS = toOptions(ROLE_NAMES);
const ESCALATION_OPTIONS = toOptions(ESCALATION_RULES);
const NOTIFICATION_OPTIONS = toOptions(NOTIFICATION_TRIGGERS);

interface StageDrawerProps {
  open: boolean;
  stage: WorkflowStage | null;
  onClose: () => void;
  onChange: (patch: Partial<WorkflowStage>) => void;
  onDelete: () => void;
}

export default function StageDrawer({
  open,
  stage,
  onClose,
  onChange,
  onDelete,
}: StageDrawerProps) {
  if (!stage) return null;

  return (
    <Drawer
      open={open}
      title="Stage Configuration"
      description={stage.name}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            icon={<Trash2 size={16} strokeWidth={2.2} />}
            className="cursor-pointer text-danger hover:text-danger"
            onClick={onDelete}
          >
            Delete Stage
          </Button>
          <Button variant="primary" className="cursor-pointer" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 px-5 py-5">
        <label className="flex flex-col gap-1.5">
          <span className={FIELD_LABEL}>Stage Name</span>
          <TextField value={stage.name} onChange={(value) => onChange({ name: value })} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={FIELD_LABEL}>Assigned Role</span>
          <Select
            ariaLabel="Assigned role"
            value={stage.role}
            options={ROLE_OPTIONS}
            onChange={(value) => onChange({ role: value })}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={FIELD_LABEL}>Duration (hours)</span>
          <TextField
            type="number"
            min={1}
            value={String(stage.slaHours)}
            onChange={(value) => onChange({ slaHours: Number(value) || 0 })}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className={FIELD_LABEL}>Required Documents</span>
          <div className="flex flex-wrap gap-2">
            {DOCUMENT_LIBRARY.map((document) => {
              const active = stage.documents.includes(document);

              return (
                <button
                  key={document}
                  type="button"
                  aria-pressed={active}
                  className="focus-bloom cursor-pointer rounded-[var(--radius-md)]"
                  onClick={() =>
                    onChange({
                      documents: active
                        ? stage.documents.filter((item) => item !== document)
                        : [...stage.documents, document],
                    })
                  }
                >
                  <Badge size="md" tone={active ? 'brand' : 'neutral'} className="px-3 py-1 text-[14px] leading-5">
                    {document}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={FIELD_LABEL}>Escalation Rule</span>
          <Select
            ariaLabel="Escalation rule"
            value={stage.escalation}
            options={ESCALATION_OPTIONS}
            onChange={(value) => onChange({ escalation: value })}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={FIELD_LABEL}>Notification Trigger</span>
          <Select
            ariaLabel="Notification trigger"
            value={stage.notification ?? NOTIFICATION_TRIGGERS[0]}
            options={NOTIFICATION_OPTIONS}
            onChange={(value) => onChange({ notification: value })}
          />
        </label>

        <Switch
          label="Stage enabled"
          description="Disabled stages are skipped when an order runs this workflow"
          checked={stage.enabled !== false}
          onChange={(checked) => onChange({ enabled: checked })}
        />
      </div>
    </Drawer>
  );
}
