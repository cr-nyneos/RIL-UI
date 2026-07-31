import { FileBadge, FileCheck2, FileSpreadsheet, FileText, Receipt, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Badge from './Badge';
import Button from './Button';
import { getStatusTone } from './StatusBadge';

interface DocumentRowProps {
  name: string;
  type: string;
  status: string;
  uploadedBy?: string;
  uploadedAt?: string;
  size?: string;
  onView?: () => void;
}

const TYPE_ICON: { match: string; icon: LucideIcon }[] = [
  { match: 'certificate', icon: FileBadge },
  { match: 'insurance', icon: ShieldCheck },
  { match: 'licence', icon: FileCheck2 },
  { match: 'license', icon: FileCheck2 },
  { match: 'invoice', icon: Receipt },
  { match: 'packing', icon: FileSpreadsheet },
  { match: 'report', icon: FileSpreadsheet },
];

function iconFor(type: string): LucideIcon {
  const key = type.toLowerCase();
  return TYPE_ICON.find((entry) => key.includes(entry.match))?.icon ?? FileText;
}

export default function DocumentRow({
  name,
  type,
  status,
  uploadedBy,
  uploadedAt,
  size,
  onView,
}: DocumentRowProps) {
  const Icon = iconFor(type);
  const meta = [type, uploadedBy, uploadedAt, size].filter(Boolean).join(' · ');

  return (
    <div className="flex h-14 items-center gap-3.5 border-b border-[var(--color-glass-hairline)] px-5 last:border-b-0">
      <span
        className="flex h-8 w-8 flex-none items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)]"
        style={{ background: 'var(--color-surface-subtle)' }}
      >
        <Icon size={15} strokeWidth={2.2} className="text-ink-600" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-body-strong truncate">{name}</div>
        <div className="text-meta truncate tabular-nums">{meta || '—'}</div>
      </div>

      <Badge tone={getStatusTone(status)} shape="square" size="sm" className="flex-none">
        {status}
      </Badge>

      {onView && (
        <Button variant="ghost" size="sm" onClick={onView} className="flex-none cursor-pointer">
          View
        </Button>
      )}
    </div>
  );
}
