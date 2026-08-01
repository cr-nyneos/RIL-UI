import { Plus } from 'lucide-react';
import Button from './Button';

/* Ported from CimplrCorpSaaS-Web `src/components/dashboard/KpiPanel.tsx`.
   Structure, spacing, radius, shadow and type scale are unchanged; only the
   colour tokens are resolved to this app's palette. */

export interface KpiItem {
  title: string;
  value: string | number;
}

export interface KpiGroup {
  header: string;
  data: KpiItem[];
  addMoreProps?: {
    text: string;
    onClick: () => void;
  };
}

export default function KpiPanel({ group }: { group: KpiGroup }) {
  return (
    <div className="space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-section)] p-6 shadow-[var(--shadow-glass)]">
      <h3 className="mb-4 text-title font-semibold text-brand-700">{group.header}</h3>

      {group.data.map((item) => (
        <div key={item.title} className="flex justify-between text-[20px] font-semibold text-ink-700">
          <span>{item.title}</span>
          <span
            className="text-[20px] font-semibold tabular-nums"
            style={{
              color: Number(item.value) < 0 ? 'var(--color-danger)' : 'var(--color-brand-700)',
            }}
          >
            {item.value}
          </span>
        </div>
      ))}

      {group.addMoreProps && (
        <div className="mt-5 flex justify-end">
          <Button
            variant="primary"
            icon={<Plus size={16} strokeWidth={2} />}
            onClick={group.addMoreProps.onClick}
          >
            {group.addMoreProps.text}
          </Button>
        </div>
      )}
    </div>
  );
}
