import { useMemo, useState } from 'react';
import { ArrowRight, CircleAlert, Clock3, FilterX, RefreshCw, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AppShell from '../components/layout/AppShell';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import SearchInput from '../components/ui/SearchInput';
import Section from '../components/ui/Section';
import Select from '../components/ui/Select';
import Toast from '../components/ui/Toast';

import { formatDate, formatRelative } from '../lib/format';
import { ORDER_PLANTS, TODAY } from '../lib/mockData/orders';
import { getOrders } from '../lib/orderStore';
import type { Gate, Order } from '../lib/types/order';
import type { Tone } from '../lib/types/ui';

const WORKFLOW_STAGES = [
  { key: 'clearance', label: 'Security Clearance', short: 'Security' },
  { key: 'documents', label: 'Document Verification', short: 'Docs' },
  { key: 'gate-in', label: 'Material Gate-In', short: 'Gate' },
  { key: 'qc', label: 'QC Inspection', short: 'QC' },
  { key: 'delivery', label: 'Delivery Confirmation', short: 'Delivery' },
  { key: 'governance', label: 'Governance Approval', short: 'Governance' },
  { key: 'payment', label: 'Payment Release', short: 'Payment' },
] as const;

const OWNER_BY_GATE: Record<string, { name: string; role: string }> = {
  clearance: { name: 'Amit Kulkarni', role: 'Security Desk' },
  documents: { name: 'Neha Shah', role: 'Document Control' },
  'gate-in': { name: 'Ravi Menon', role: 'Gate Supervisor' },
  qc: { name: 'Priya Nair', role: 'QA Officer' },
  delivery: { name: 'Sandeep Iyer', role: 'Site Lead' },
  governance: { name: 'Meera Rao', role: 'Governance Auditor' },
  payment: { name: 'Karan Mehta', role: 'Finance Controller' },
};

type PriorityFilter = 'all' | 'critical' | 'high' | 'medium';
type StageFilter = 'all' | (typeof WORKFLOW_STAGES)[number]['key'];
type StatusFilter = 'all' | 'blocked' | 'waiting' | 'delayed' | 'in-progress' | 'completed';
type AssignmentFilter = 'all' | keyof typeof OWNER_BY_GATE;
type BoardStatus = Exclude<StatusFilter, 'all'>;

interface BoardOrder {
  order: Order;
  gate: Gate;
  gateIndex: number;
  owner: { name: string; role: string };
  priority: Exclude<PriorityFilter, 'all'>;
  status: BoardStatus;
  reason: string;
}

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'Priority' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
];

const STAGE_OPTIONS: { value: StageFilter; label: string }[] = [
  { value: 'all', label: 'Stage' },
  ...WORKFLOW_STAGES.map((stage) => ({ value: stage.key, label: stage.label })),
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Status' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const ASSIGNMENT_OPTIONS: { value: AssignmentFilter; label: string }[] = [
  { value: 'all', label: 'Assignee' },
  ...WORKFLOW_STAGES.map((stage) => ({ value: stage.key, label: OWNER_BY_GATE[stage.key].role })),
];

const STATUS_META: Record<BoardStatus, { label: string; tone: Tone; accent: string; icon: typeof Clock3 }> = {
  blocked: { label: 'Blocked', tone: 'danger', accent: 'var(--color-danger)', icon: ShieldAlert },
  waiting: { label: 'Waiting', tone: 'warning', accent: 'var(--color-warning)', icon: Clock3 },
  delayed: { label: 'Delayed', tone: 'danger', accent: 'var(--color-danger)', icon: CircleAlert },
  'in-progress': { label: 'In Progress', tone: 'neutral', accent: 'var(--color-brand-600)', icon: RefreshCw },
  completed: { label: 'Completed', tone: 'success', accent: 'var(--color-success)', icon: RefreshCw },
};

function activeGate(order: Order): { gate: Gate; index: number } {
  const currentIndex = order.gates.findIndex((gate) => gate.state === 'current');
  if (currentIndex >= 0) return { gate: order.gates[currentIndex], index: currentIndex };
  const fallbackIndex = Math.max(0, order.gates.length - 1);
  return { gate: order.gates[fallbackIndex], index: fallbackIndex };
}

function isOverdue(order: Order): boolean {
  const expected = new Date(`${order.expected}T00:00:00`);
  return order.progress < 100 && expected.getTime() < TODAY.getTime();
}

function boardStatus(order: Order): BoardStatus {
  const status = order.status.toLowerCase();
  if (order.progress >= 100 || status.includes('completed') || status.includes('delivered')) return 'completed';
  if (order.flags.some((flag) => flag.type === 'blocked') || status.includes('blocked') || status.includes('mismatch') || status.includes('escalated')) {
    return 'blocked';
  }
  if (order.flags.some((flag) => flag.type === 'delayed') || status.includes('delayed') || isOverdue(order)) return 'delayed';
  if (status.includes('awaiting') || status.includes('waiting') || status.includes('pending') || status.includes('scheduled') || status.includes('hold')) return 'waiting';
  return 'in-progress';
}

function priority(order: Order, status: BoardStatus): BoardOrder['priority'] {
  if (status === 'blocked' || order.valueCr >= 6) return 'critical';
  if (status === 'delayed' || order.valueCr >= 3) return 'high';
  return 'medium';
}

function dependencyReason(order: Order, gate: Gate, status: BoardStatus): string {
  const explicit = order.flags.find((flag) => flag.detail)?.detail;
  if (explicit) return explicit;
  if (status === 'completed') return 'Lifecycle complete';
  if (status === 'waiting') return `Waiting for ${gate.label}`;
  if (status === 'delayed') return `${gate.label} is past the expected timeline`;
  if (status === 'blocked') return 'Previous gate incomplete';
  return `${gate.label} in progress`;
}

function matchesSearch(item: BoardOrder, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.order.id, item.order.po, item.order.vendor, item.order.plant, item.owner.name, item.owner.role, item.gate.label]
    .join(' ')
    .toLowerCase()
    .includes(q);
}

function buildBoardOrder(order: Order): BoardOrder {
  const { gate, index } = activeGate(order);
  const owner = OWNER_BY_GATE[gate.key] ?? OWNER_BY_GATE.clearance;
  const status = boardStatus(order);
  return {
    order,
    gate,
    gateIndex: index,
    owner,
    status,
    priority: priority(order, status),
    reason: dependencyReason(order, gate, status),
  };
}

function priorityTone(value: BoardOrder['priority']): Tone {
  if (value === 'critical') return 'danger';
  if (value === 'high') return 'warning';
  return 'neutral';
}

function WorkflowRail({ item }: { item: BoardOrder }) {
  const navigate = useNavigate();
  const isCompleted = item.status === 'completed';
  const isBlocked = item.status === 'blocked';
  const activeKey = item.gate.key;

  return (
    <div className="grid grid-cols-7 items-start gap-0">
      {WORKFLOW_STAGES.map((stage, index) => {
        const gate = item.order.gates.find((candidate) => candidate.key === stage.key);
        const complete = gate?.state === 'done' || isCompleted;
        const current = !isCompleted && stage.key === activeKey;
        const blockedCurrent = current && isBlocked;
        const nodeTone = blockedCurrent ? 'var(--color-danger)' : current ? 'var(--color-brand-600)' : complete ? 'var(--color-success)' : 'var(--color-border-strong)';

        return (
          <div key={stage.key} className="relative min-w-0">
            {index > 0 && (
              <span
                className={`absolute top-[13px] right-1/2 left-0 h-px ${isBlocked && index === item.gateIndex + 1 ? 'border-t border-dashed border-[var(--color-danger)]' : ''}`}
                style={{ background: isBlocked && index === item.gateIndex + 1 ? 'transparent' : complete || index <= item.gateIndex ? 'var(--color-border-strong)' : 'var(--color-border)' }}
              />
            )}
            {index < WORKFLOW_STAGES.length - 1 && (
              <span
                className={`absolute top-[13px] right-0 left-1/2 h-px ${isBlocked && index === item.gateIndex ? 'border-t border-dashed border-[var(--color-danger)]' : ''}`}
                style={{ background: isBlocked && index === item.gateIndex ? 'transparent' : complete ? 'var(--color-border-strong)' : 'var(--color-border)' }}
              />
            )}
            <div className="relative z-1 flex min-w-0 flex-col items-center gap-1.5">
              <button
                type="button"
                title={stage.label}
                aria-label={`${item.order.id} ${stage.label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  if (current) {
                    navigate(`/orders/${item.order.id}/gates/${stage.key}`, {
                      state: { from: '/execution', fromLabel: 'Execution Board' },
                    });
                  }
                }}
                disabled={!current}
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white transition-[border-color,background-color,box-shadow,transform] duration-200 ${
                  current ? 'cursor-pointer hover:scale-105 focus-bloom' : 'cursor-default'
                } ${current ? (blockedCurrent ? 'gate-pulse-danger' : 'gate-pulse') : ''}`}
                style={{ borderColor: nodeTone, background: complete || current ? nodeTone : '#FFFFFF' }}
              >
                <span className={`h-2 w-2 rounded-full ${complete || current ? 'bg-white' : 'bg-[var(--color-border-strong)]'}`} />
              </button>
              <span className={`max-w-full truncate text-center text-[11px] leading-4 ${current ? 'font-bold text-ink-900' : 'font-semibold text-ink-500'}`}>
                {stage.short}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExecutionCard({ item }: { item: BoardOrder }) {
  const navigate = useNavigate();
  const meta = STATUS_META[item.status];
  const StatusIcon = meta.icon;
  const needsAttention = item.status === 'blocked' || item.status === 'delayed';

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/orders/${item.order.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') navigate(`/orders/${item.order.id}`);
      }}
      className="group flex cursor-pointer flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 outline-none transition-[background,box-shadow,transform] duration-200 hover:-translate-y-[1px] hover:shadow-[0_16px_32px_-24px_rgba(23,37,84,0.55)] focus-bloom"
    >
      {/* Header row: identity + expected date */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold leading-5 text-ink-900">{item.order.id}</span>
            <Badge tone={priorityTone(item.priority)} size="xs" shape="square">
              {item.priority}
            </Badge>
          </div>
          <div className="mt-1 truncate text-[13px] font-semibold text-ink-700">{item.order.vendor}</div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-meta">
            <span>{item.order.plant}</span>
            <span>{item.owner.name}</span>
          </div>
        </div>

        <div className="flex shrink-0 gap-6 text-right">
          <div>
            <div className="text-table-head">Expected</div>
            <div className="mt-0.5 text-[13px] font-semibold tabular-nums text-ink-800">{formatDate(item.order.expected)}</div>
            <div className="text-meta">{formatRelative(item.order.expected, TODAY, item.status === 'completed')}</div>
          </div>
          <div>
            <div className="text-table-head">Current Stage</div>
            <div className="mt-0.5 flex items-center justify-end gap-1.5 text-[13px] font-semibold text-ink-800">
              <StatusIcon size={14} strokeWidth={2.4} style={{ color: meta.accent }} />
              <span className="truncate">{item.gate.label}</span>
            </div>
            <div className="text-meta tabular-nums">{item.order.progress}% complete</div>
          </div>
        </div>
      </div>

      {/* Workflow rail: full width, own row */}
      <div className="rounded-xl bg-[var(--color-surface-subtle)] px-4 py-3">
        <WorkflowRail item={item} />
      </div>

      {/* Footer: blocking reason (or status) + action, full width */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-2.5 ${
          needsAttention ? '' : 'bg-[var(--color-surface-subtle)]'
        }`}
        style={needsAttention ? { background: item.status === 'blocked' ? 'var(--color-danger-subtle, #FEF2F2)' : 'var(--color-warning-subtle, #FFFBEB)' } : undefined}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          {needsAttention && <StatusIcon size={14} strokeWidth={2.4} style={{ color: meta.accent }} />}
          <p className={`truncate text-[13px] font-medium ${needsAttention ? '' : 'text-ink-500'}`} style={needsAttention ? { color: meta.accent } : undefined}>
            {needsAttention ? `${meta.label} — ${item.reason}` : item.reason}
          </p>
        </div>
        <Button
          variant="link"
          icon={<ArrowRight size={15} strokeWidth={2.4} />}
          iconPosition="right"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/orders/${item.order.id}`);
          }}
        >
          Open
        </Button>
      </div>
    </article>
  );
}

export default function ExecutionBoard() {
  const [query, setQuery] = useState('');
  const [plant, setPlant] = useState('all');
  const [vendor, setVendor] = useState('all');
  const [priorityValue, setPriorityValue] = useState<PriorityFilter>('all');
  const [stage, setStage] = useState<StageFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [assignment, setAssignment] = useState<AssignmentFilter>('all');
  const [toast, setToast] = useState<string | null>(null);

  const orders = useMemo(
    () =>
      getOrders()
        .map(buildBoardOrder)
        .sort((a, b) => {
          const statusWeight = { blocked: 0, delayed: 1, waiting: 2, 'in-progress': 3, completed: 4 };
          return statusWeight[a.status] - statusWeight[b.status] || a.gateIndex - b.gateIndex || b.order.valueCr - a.order.valueCr;
        }),
    [],
  );

  const vendorOptions = useMemo(
    () => [
      { value: 'all', label: 'Vendor' },
      ...Array.from(new Set(orders.map((item) => item.order.vendor)))
        .sort()
        .map((value) => ({ value, label: value })),
    ],
    [orders],
  );

  const plantOptions = useMemo(
    () => [{ value: 'all', label: 'Plant' }, ...ORDER_PLANTS.map((value) => ({ value, label: value }))],
    [],
  );

  const filtered = useMemo(
    () =>
      orders.filter((item) => {
        if (!matchesSearch(item, query)) return false;
        if (plant !== 'all' && item.order.plant !== plant) return false;
        if (vendor !== 'all' && item.order.vendor !== vendor) return false;
        if (priorityValue !== 'all' && item.priority !== priorityValue) return false;
        if (stage !== 'all' && item.gate.key !== stage) return false;
        if (status !== 'all' && item.status !== status) return false;
        if (assignment !== 'all' && item.gate.key !== assignment) return false;
        return true;
      }),
    [assignment, orders, plant, priorityValue, query, stage, status, vendor],
  );

  const summary = useMemo(
    () => [
      { label: 'Orders', value: filtered.length, tone: 'neutral' as Tone },
      { label: 'Active', value: filtered.filter((item) => item.status === 'in-progress' || item.status === 'waiting').length, tone: 'neutral' as Tone },
      { label: 'Blocked', value: filtered.filter((item) => item.status === 'blocked').length, tone: 'danger' as Tone },
      { label: 'Delayed', value: filtered.filter((item) => item.status === 'delayed').length, tone: 'warning' as Tone },
      { label: 'Completed Today', value: filtered.filter((item) => item.status === 'completed' && item.order.expected === '2026-07-30').length, tone: 'success' as Tone },
    ],
    [filtered],
  );

  function clearFilters() {
    setQuery('');
    setPlant('all');
    setVendor('all');
    setPriorityValue('all');
    setStage('all');
    setStatus('all');
    setAssignment('all');
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div className="animate-rise" style={{ animationDelay: '0ms' }}>
          <PageHeader title="Execution Board" />
          <p className="text-meta mt-1">Portfolio-wide tracker for order movement, blocked gates and execution ownership.</p>
        </div>

        <Section
          padded={false}
          className="animate-rise"
          style={{ animationDelay: '60ms' }}
          toolbar={
            <div className="flex w-full flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <SearchInput value={query} onChange={setQuery} placeholder="Search order, vendor, owner" className="min-w-0 flex-1" />
                <Button variant="ghost" icon={<FilterX size={15} strokeWidth={2.3} />} onClick={clearFilters} className="shrink-0 cursor-pointer">
                  Clear
                </Button>
                <Button
                  variant="secondary"
                  icon={<RefreshCw size={16} strokeWidth={2.3} />}
                  onClick={() => setToast('Execution board refreshed.')}
                  aria-label="Refresh"
                  className="shrink-0 cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Select value={plant} onChange={setPlant} options={plantOptions} ariaLabel="Plant" className="w-full" />
                <Select value={vendor} onChange={setVendor} options={vendorOptions} ariaLabel="Vendor" className="w-full" />
                <Select value={stage} onChange={setStage} options={STAGE_OPTIONS} ariaLabel="Current stage" className="w-full" />
                <Select value={priorityValue} onChange={setPriorityValue} options={PRIORITY_OPTIONS} ariaLabel="Priority" className="w-full" />
                <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} ariaLabel="Status" className="w-full" />
                <Select value={assignment} onChange={setAssignment} options={ASSIGNMENT_OPTIONS} ariaLabel="Assignment" className="w-full" />
              </div>
            </div>
          }
          headClassName="bg-[var(--color-brand-soft2)]"
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--color-border)] px-5 py-3">
            {summary.map((item) => (
              <div key={item.label} className="flex items-baseline gap-1.5">
                <span className="text-[16px] font-bold tabular-nums text-ink-900">{item.value}</span>
                <span className={`text-[12px] font-semibold ${item.tone === 'danger' ? 'text-danger' : item.tone === 'warning' ? 'text-warning' : item.tone === 'success' ? 'text-success' : 'text-ink-500'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <div className="animate-rise" style={{ animationDelay: '120ms' }}>
          <div className="mb-3 px-1">
            <h2 className="text-[15px] font-bold text-ink-900">Execution Tracker</h2>
            <p className="text-meta mt-0.5">Each card shows the active gate, expected completion and next action.</p>
          </div>

          <div className="flex flex-col gap-3 animate-fade-fast">
            {filtered.length ? (
              filtered.map((item) => <ExecutionCard key={item.order.id} item={item} />)
            ) : (
              <div className="rounded-2xl border border-[var(--color-border)] bg-white p-8">
                <EmptyState title="No orders found" description="Adjust the filters to view execution progress." />
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}