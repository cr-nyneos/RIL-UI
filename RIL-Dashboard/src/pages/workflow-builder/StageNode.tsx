import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import {
  CircleDot,
  ClipboardCheck,
  FileCheck2,
  Flag,
  Gavel,
  IndianRupee,
  PackageCheck,
  Play,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react';

import Badge from '../../components/ui/Badge';

const STAGE_ICONS: Record<string, LucideIcon> = {
  'security-clearance': ShieldCheck,
  'document-verification': FileCheck2,
  'gate-in': Truck,
  qc: ClipboardCheck,
  delivery: PackageCheck,
  governance: Gavel,
  payment: IndianRupee,
};

export function stageIcon(id: string): LucideIcon {
  return STAGE_ICONS[id] ?? CircleDot;
}

export type StageNodeData = {
  name: string;
  role: string;
  duration: string;
  stageId: string;
  optional: boolean;
  disabled: boolean;
};

export type TerminalNodeData = {
  label: string;
  kind: 'start' | 'finish';
};

const HANDLE_STYLE = {
  width: 9,
  height: 9,
  background: 'var(--color-surface-section)',
  border: '2px solid var(--color-brand-600)',
};

export function StageNode({ data, selected }: NodeProps<Node<StageNodeData>>) {
  const Icon = stageIcon(data.stageId);

  return (
    <div
      className={`w-[320px] cursor-pointer rounded-[var(--radius-lg)] border bg-[var(--color-surface-section)] px-4 py-3.5 transition-colors duration-150 ${
        selected
          ? 'border-brand-600 bg-[var(--color-surface-selected)]'
          : 'border-[var(--color-border-strong)] hover:border-brand-500'
      } ${data.disabled ? 'opacity-60' : ''}`}
      style={{ boxShadow: 'var(--shadow-glass)' }}
    >
      <Handle type="target" position={Position.Left} style={HANDLE_STYLE} />

      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-md)]"
          style={{ background: 'var(--color-brand-soft2)', color: 'var(--color-brand-700)' }}
        >
          <Icon size={20} strokeWidth={2.1} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] leading-6 font-semibold text-ink-900" title={data.name}>
            {data.name}
          </p>
          <p className="truncate text-[14px] leading-5 font-semibold text-ink-600" title={data.role}>
            {data.role}
          </p>
        </div>

        {data.disabled ? (
          <Badge size="sm" tone="neutral" className="flex-none">
            Disabled
          </Badge>
        ) : (
          <span className="flex-none text-[14px] leading-5 font-semibold tabular-nums text-brand-700">
            {data.duration}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Right} style={HANDLE_STYLE} />
    </div>
  );
}

export function TerminalNode({ data }: NodeProps<Node<TerminalNodeData>>) {
  const Icon = data.kind === 'start' ? Play : Flag;

  return (
    <div
      className="flex w-[150px] items-center justify-center gap-2 rounded-[var(--radius-lg)] border px-4 py-2.5"
      style={{
        background: 'var(--color-brand-600)',
        borderColor: 'var(--color-brand-700)',
        color: '#FFFFFF',
      }}
    >
      {data.kind === 'finish' && <Handle type="target" position={Position.Left} style={HANDLE_STYLE} />}
      <Icon size={15} strokeWidth={2.4} />
      <span className="text-[14px] leading-5 font-semibold tracking-[0.04em] uppercase">{data.label}</span>
      {data.kind === 'start' && <Handle type="source" position={Position.Right} style={HANDLE_STYLE} />}
    </div>
  );
}
