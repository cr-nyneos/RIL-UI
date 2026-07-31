import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  FileUp,
  Lock,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import AppShell from '../components/layout/AppShell';
import ActivityFeed from '../components/ui/ActivityFeed';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import DocumentRow from '../components/ui/DocumentRow';
import EmptyState from '../components/ui/EmptyState';
import KeyValue from '../components/ui/KeyValue';
import ProgressMeter from '../components/ui/ProgressMeter';
import Section from '../components/ui/Section';
import Select from '../components/ui/Select';
import StatusBadge from '../components/ui/StatusBadge';
import TextField from '../components/ui/TextField';
import Toast from '../components/ui/Toast';

import { formatCurrency, formatDate } from '../lib/format';
import { completeGate, deliveryTotals, useOrderDetail } from '../lib/orderDetailStore';
import type { Milestone, OrderDetail } from '../lib/types/orderDetail';
import type { Tone } from '../lib/types/ui';

type FieldKind = 'text' | 'number' | 'date' | 'time' | 'select';

interface GateField {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface GateConfig {
  description: string;
  department: string;
  priority: 'Critical' | 'High' | 'Medium';
  checklist: string[];
  fields: GateField[];
  requiredDocuments: string[];
}

const GATE_CONFIG: Record<string, GateConfig> = {
  clearance: {
    description: 'Confirm site access readiness before the order can move into document verification.',
    department: 'Security Operations',
    priority: 'High',
    checklist: [
      'Identity verified',
      'Vehicle verified',
      'Vendor validated',
      'Safety induction confirmed',
      'Security clearance approved',
    ],
    fields: [
      { key: 'visitor', label: 'Visitor / lead personnel', kind: 'text', required: true, placeholder: 'Name on security pass' },
      { key: 'vehicle', label: 'Vehicle number', kind: 'text', required: true, placeholder: 'MH-04-CD-8890' },
      { key: 'approvalTime', label: 'Approval time', kind: 'time', required: true },
      { key: 'remarks', label: 'Security remarks', kind: 'text', required: true, placeholder: 'Clearance remarks' },
    ],
    requiredDocuments: ['ID Proof', 'Safety Induction Record'],
  },
  documents: {
    description: 'Verify statutory, safety and commercial documents before material reaches the plant gate.',
    department: 'Document Control',
    priority: 'High',
    checklist: [
      'Safety certificate reviewed',
      'Insurance verified',
      'Labor license checked',
      'Missing documents flagged',
      'Document pack approved',
    ],
    fields: [
      { key: 'complianceStatus', label: 'Compliance status', kind: 'select', required: true, options: ['Compliant', 'Compliant with renewal note', 'Exception raised'] },
      { key: 'verificationNotes', label: 'Verification notes', kind: 'text', required: true, placeholder: 'Document review notes' },
      { key: 'supportingDocuments', label: 'Supporting document reference', kind: 'text', placeholder: 'Contract / certificate reference' },
    ],
    requiredDocuments: ['Compliance Pack', 'Supporting Documents'],
  },
  'gate-in': {
    description: 'Record inbound movement, vehicle evidence and weighment before QC starts.',
    department: 'Site Operations',
    priority: 'High',
    checklist: [
      'Vehicle arrival recorded',
      'Driver and transporter verified',
      'Gate pass attached',
      'Weighment captured',
      'Inbound movement closed',
    ],
    fields: [
      { key: 'vehicle', label: 'Vehicle number', kind: 'text', required: true },
      { key: 'gate', label: 'Gate', kind: 'select', required: true, options: ['Gate 1', 'Gate 2', 'Project Gate', 'Hazardous Material Gate'] },
      { key: 'grossWeight', label: 'Gross weight', kind: 'number', required: true },
      { key: 'arrivalTime', label: 'Arrival time', kind: 'time', required: true },
    ],
    requiredDocuments: ['Gate Pass', 'Weighment Slip'],
  },
  qc: {
    description: 'Reconcile accepted, missing and damaged quantities and attach inspection evidence.',
    department: 'Quality Assurance',
    priority: 'Critical',
    checklist: [
      'Quantities reconciled',
      'Damaged units recorded',
      'Missing units recorded',
      'Inspection report uploaded',
      'Inspection decision confirmed',
    ],
    fields: [
      { key: 'accepted', label: 'Accepted quantity', kind: 'number', required: true },
      { key: 'rejected', label: 'Rejected quantity', kind: 'number', required: true },
      { key: 'missing', label: 'Missing quantity', kind: 'number', required: true },
      { key: 'damaged', label: 'Damaged quantity', kind: 'number', required: true },
      { key: 'inspector', label: 'Inspector', kind: 'text', required: true },
      { key: 'inspectionDate', label: 'Inspection date', kind: 'date', required: true },
    ],
    requiredDocuments: ['Inspection Report', 'Damage Evidence'],
  },
  delivery: {
    description: 'Confirm handover to the receiver and collect proof of delivery.',
    department: 'Site Leadership',
    priority: 'Medium',
    checklist: [
      'Receiver confirmed',
      'Delivery date recorded',
      'Proof of delivery uploaded',
      'Completion remarks captured',
    ],
    fields: [
      { key: 'receiver', label: 'Receiver', kind: 'text', required: true },
      { key: 'deliveryDate', label: 'Delivery date', kind: 'date', required: true },
      { key: 'podReference', label: 'POD reference', kind: 'text', required: true },
      { key: 'remarks', label: 'Completion remarks', kind: 'text' },
    ],
    requiredDocuments: ['Proof of Delivery', 'Delivery Challan'],
  },
  governance: {
    description: 'Capture governance decision, risk posture and escalation rationale for high-value orders.',
    department: 'Governance',
    priority: 'High',
    checklist: [
      'Documents reviewed',
      'Compliance validated',
      'Budget verified',
      'Risk decision recorded',
      'Governance approval captured',
    ],
    fields: [
      { key: 'decision', label: 'Decision', kind: 'select', required: true, options: ['Approve', 'Reject', 'Escalate'] },
      { key: 'risk', label: 'Risk', kind: 'select', required: true, options: ['Low', 'Medium', 'High'] },
      { key: 'comments', label: 'Comments', kind: 'text', required: true },
      { key: 'escalationReason', label: 'Escalation reason', kind: 'text' },
    ],
    requiredDocuments: ['Governance Note', 'Compliance Evidence'],
  },
  payment: {
    description: 'Validate invoice, SCF eligibility and release amount before commercial closure.',
    department: 'Finance',
    priority: 'High',
    checklist: [
      'Invoice validated',
      'SCF eligibility confirmed',
      'Release amount verified',
      'Finance notes captured',
      'Payment release approved',
    ],
    fields: [
      { key: 'invoice', label: 'Invoice number', kind: 'text', required: true },
      { key: 'scf', label: 'SCF decision', kind: 'select', required: true, options: ['Trigger SCF', 'Release without SCF', 'Hold'] },
      { key: 'releaseAmount', label: 'Release amount', kind: 'number', required: true },
      { key: 'financeNotes', label: 'Finance notes', kind: 'text', required: true },
    ],
    requiredDocuments: ['Invoice', 'Payment Advice'],
  },
};

const STATE_LABEL: Record<Milestone['state'], string> = {
  complete: 'Completed',
  current: 'In progress',
  locked: 'Locked',
  blocked: 'Blocked',
};

const STATE_TONE: Record<Milestone['state'], Tone> = {
  complete: 'success',
  current: 'brand',
  locked: 'neutral',
  blocked: 'danger',
};

function normalizeGate(gate: string | undefined): string {
  return decodeURIComponent(gate ?? '').trim();
}

function initialForm(fields: GateField[]): Record<string, string> {
  return fields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.key] = field.options?.[0] ?? '';
    return accumulator;
  }, {});
}

function currentProgress(detail: OrderDetail): number {
  return Math.round((detail.milestones.filter((milestone) => milestone.state === 'complete').length / detail.milestones.length) * 100);
}

function missingRequirements(config: GateConfig, checked: Set<string>, form: Record<string, string>, files: string[]) {
  const missing: string[] = [];
  config.checklist.forEach((item) => {
    if (!checked.has(item)) missing.push(item);
  });
  config.fields.forEach((field) => {
    if (field.required && !form[field.key]?.trim()) missing.push(field.label);
  });
  if (files.length === 0) missing.push('At least one supporting attachment');
  return missing;
}

function adjacentMilestones(detail: OrderDetail, gateKey: string) {
  const index = detail.milestones.findIndex((milestone) => milestone.key === gateKey);
  return {
    previous: index > 0 ? detail.milestones[index - 1] : null,
    current: detail.milestones[index] ?? null,
    next: index >= 0 ? detail.milestones[index + 1] ?? null : null,
  };
}

function WorkflowBreadcrumb({ milestones, activeKey }: { milestones: Milestone[]; activeKey: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {milestones.map((milestone) => {
        const active = milestone.key === activeKey;
        return (
          <div key={milestone.key} className="flex items-center gap-2">
            <span
              className={`inline-flex h-8 items-center gap-2 rounded-[var(--radius-md)] border px-2.5 text-[12px] font-semibold transition-colors ${
                active ? 'border-brand-600 bg-[var(--color-surface-selected)] text-brand-700' : 'border-[var(--color-border)] bg-[var(--color-surface-section)] text-ink-600'
              }`}
            >
              {milestone.state === 'complete' && <Check size={13} strokeWidth={2.8} />}
              {milestone.state === 'locked' && <Lock size={13} strokeWidth={2.5} />}
              {(milestone.state === 'current' || milestone.state === 'blocked') && active && <Circle size={13} strokeWidth={2.5} />}
              {milestone.label.replace(' / SCF', '').replace(' / Inspection', '')}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Checklist({
  items,
  checked,
  onToggle,
}: {
  items: string[];
  checked: Set<string>;
  onToggle: (item: string) => void;
}) {
  return (
    <div className="grid gap-2.5">
      {items.map((item) => {
        const done = checked.has(item);
        return (
          <button
            type="button"
            key={item}
            onClick={() => onToggle(item)}
            className={`focus-bloom flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-3.5 text-left transition-colors ${
              done
                ? 'border-[var(--color-success)] bg-[var(--color-success-soft)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface-section)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <span
              className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border ${
                done ? 'border-[var(--color-success)] bg-[var(--color-success)] text-white' : 'border-[var(--color-border-strong)] text-ink-400'
              }`}
            >
              {done ? <Check size={13} strokeWidth={3} /> : null}
            </span>
            <span className={done ? 'text-body-strong' : 'text-body'}>{item}</span>
          </button>
        );
      })}
    </div>
  );
}

function DynamicForm({
  fields,
  form,
  setField,
}: {
  fields: GateField[];
  form: Record<string, string>;
  setField: (key: string, value: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((field) => {
        if (field.kind === 'select' && field.options) {
          return (
            <label key={field.key} className="grid gap-1.5">
              <span className="text-[13px] font-semibold text-ink-700">
                {field.label}
                {field.required && <span className="text-danger"> *</span>}
              </span>
              <Select
                value={form[field.key]}
                onChange={(value) => setField(field.key, value)}
                options={field.options.map((option) => ({ value: option, label: option }))}
                ariaLabel={field.label}
                className="w-full"
              />
            </label>
          );
        }

        return (
          <TextField
            key={field.key}
            label={`${field.label}${field.required ? ' *' : ''}`}
            type={field.kind}
            value={form[field.key] ?? ''}
            placeholder={field.placeholder}
            onChange={(value) => setField(field.key, value)}
          />
        );
      })}
    </div>
  );
}

function DependencyEngine({
  previous,
  current,
  next,
}: {
  previous: Milestone | null;
  current: Milestone;
  next: Milestone | null;
}) {
  const unmet = current.dependencies?.filter((dependency) => !dependency.met) ?? [];
  const locked = current.state === 'locked' || current.state === 'blocked';

  return (
    <Section title="Dependency Engine" padded={false}>
      <div className="grid grid-cols-3 border-b border-[var(--color-border)]">
        {[
          { label: 'Previous Gate', value: previous?.label ?? 'Start', state: previous?.state ?? 'complete' },
          { label: 'Current Gate', value: current.label, state: current.state },
          { label: 'Next Gate', value: next?.label ?? 'Order Complete', state: next?.state ?? 'locked' },
        ].map((item) => (
          <div key={item.label} className="border-r border-[var(--color-border)] p-3 last:border-r-0">
            <div className="text-table-head">{item.label}</div>
            <div className="text-body-strong mt-1 truncate">{item.value}</div>
            <Badge tone={STATE_TONE[item.state as Milestone['state']] ?? 'neutral'} size="sm" shape="square" className="mt-2">
              {STATE_LABEL[item.state as Milestone['state']] ?? 'Locked'}
            </Badge>
          </div>
        ))}
      </div>

      <div className={`p-4 ${locked ? 'bg-[var(--color-danger-soft)]' : 'bg-[var(--color-success-soft)]'}`}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-[var(--radius-md)] border bg-white">
            {locked ? <Lock size={16} className="text-danger" /> : <CheckCircle2 size={16} className="text-success" />}
          </span>
          <div className="min-w-0">
            <div className="text-body-strong">{locked ? `${current.label} is not ready to close` : `${current.label} can progress`}</div>
            <p className="text-body mt-1">
              {unmet[0]?.reason ??
                (next ? `Completing this gate will unlock ${next.label}.` : 'Completing this gate will close the order lifecycle.')}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default function GateWorkspace() {
  const navigate = useNavigate();
  const { id, gate } = useParams<{ id: string; gate: string }>();
  const gateKey = normalizeGate(gate);
  const { order, detail } = useOrderDetail(id);
  const milestone = detail?.milestones.find((candidate) => candidate.key === gateKey);
  const config = GATE_CONFIG[gateKey];
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<Record<string, string>>(() => initialForm(config?.fields ?? []));
  const [files, setFiles] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const totals = useMemo(() => deliveryTotals(detail?.shipments ?? []), [detail?.shipments]);
  const adjacent = detail && milestone ? adjacentMilestones(detail, milestone.key) : null;
  const closable = milestone?.state === 'current' || milestone?.state === 'blocked';
  const missing = config ? missingRequirements(config, checked, form, files) : [];
  const validationMissing = [
    ...(!closable && milestone ? [`${STATE_LABEL[milestone.state]} gates cannot be completed from this workspace`] : []),
    ...missing,
  ];
  const ready = validationMissing.length === 0;
  const progress = detail ? currentProgress(detail) : 0;

  if (!order || !detail || !milestone || !config || !id) {
    return (
      <AppShell>
        <Section title="Gate Workspace">
          <EmptyState title="Gate not found" description="Return to the order detail timeline and choose a valid execution gate." />
        </Section>
      </AppShell>
    );
  }

  const owner = milestone.owner ?? { name: 'Unassigned', role: config.department };
  const expected = milestone.timestamp ?? order.expected;
  const linkedDocuments = detail.documents.slice(0, 4);
  const recentActivity = detail.activity.slice(0, 5);

  function setField(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleCheck(item: string) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }

  function addMockUpload() {
    const next = config.requiredDocuments[files.length] ?? `${milestone.label} Evidence ${files.length + 1}`;
    setFiles((current) => [...current, next]);
  }

  function handleComplete() {
    if (!ready || submitting) return;
    setSubmitting(true);
    window.setTimeout(() => {
      completeGate({
        orderId: order.id,
        gateKey: milestone.key,
        actor: owner.name,
        note: comment,
        documents: files.length > 0 ? files : config.requiredDocuments,
      });
      setSuccess(true);
      setToast(`${milestone.label} completed. Next gate unlocked.`);
      window.setTimeout(() => navigate(`/orders/${order.id}?tab=timeline`), 900);
    }, 650);
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-4 pb-20">
        <header className="surface-section overflow-hidden">
          <div className="surface-section-head px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeft size={16} strokeWidth={2.3} />}
                  onClick={() => navigate(`/orders/${order.id}?tab=timeline`)}
                  className="mb-2 cursor-pointer"
                >
                  Back to Order
                </Button>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h1 className="text-page-title truncate">{order.id}</h1>
                  <span className="text-meta">/</span>
                  <h2 className="text-page-title truncate">{milestone.label}</h2>
                  <StatusBadge status={STATE_LABEL[milestone.state]} />
                </div>
                <p className="text-meta mt-1 truncate">
                  {order.po} / {order.vendor} / {order.plant} / Owner: {owner.name}
                </p>
              </div>

              <div className="w-full max-w-[220px]">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-table-head">Current Progress</span>
                  <span className="text-body-strong tabular-nums">{progress}%</span>
                </div>
                <ProgressMeter value={progress} />
              </div>
            </div>
          </div>
          <div className="px-5 py-3">
            <WorkflowBreadcrumb milestones={detail.milestones} activeKey={milestone.key} />
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
          <main className="flex min-w-0 flex-col gap-4">
            <Section
              title="Gate Information"
              description={config.description}
              actions={<Badge tone={config.priority === 'Critical' ? 'danger' : 'warning'} shape="square">{config.priority} Priority</Badge>}
            >
              <KeyValue
                columns={3}
                items={[
                  { label: 'Assigned User', value: owner.name },
                  { label: 'Department', value: config.department },
                  { label: 'Expected Completion', value: formatDate(expected) },
                  { label: 'Role', value: owner.role },
                  { label: 'Current State', value: STATE_LABEL[milestone.state] },
                  { label: 'Order Value', value: formatCurrency(order.valueCr) },
                ]}
              />
            </Section>

            <Section title="Execution Checklist" description="Complete each operational requirement before closing the gate.">
              <Checklist items={config.checklist} checked={checked} onToggle={toggleCheck} />
            </Section>

            <Section title="Dynamic Form" description={`${milestone.label} fields are rendered from the selected execution gate.`}>
              <DynamicForm fields={config.fields} form={form} setField={setField} />
            </Section>

            <Section title="Attachments" description="Attach gate evidence for the completion file.">
              <button
                type="button"
                onClick={addMockUpload}
                className="focus-bloom flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-6 text-center transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white">
                  <UploadCloud size={20} strokeWidth={2.2} className="text-brand-700" />
                </span>
                <span className="text-body-strong">Drop files here or click to add mock evidence</span>
                <span className="text-meta">Upload progress is mocked for this front-end proof of concept.</span>
              </button>

              <div className="mt-4 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
                {files.length === 0 ? (
                  <div className="px-5 py-4 text-meta">No workspace uploads yet.</div>
                ) : (
                  files.map((file, index) => (
                    <DocumentRow
                      key={`${file}-${index}`}
                      name={file}
                      type="Gate Evidence"
                      status={index === files.length - 1 ? 'Uploading' : 'Submitted'}
                      uploadedBy={owner.name}
                      uploadedAt={index === files.length - 1 ? 'In progress' : 'Today'}
                      size="POC"
                    />
                  ))
                )}
              </div>
            </Section>

            <Section title="Comments & Timeline" description="Internal notes, approval history and latest order activity.">
              <div className="grid gap-4">
                <TextField
                  label="Internal note"
                  value={comment}
                  onChange={setComment}
                  placeholder="Add completion comments or escalation context"
                  leadingIcon={<MessageSquareText size={16} />}
                />
                <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
                  <ActivityFeed entries={recentActivity} />
                </div>
              </div>
            </Section>
          </main>

          <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
            <Section title="Order Summary">
              <KeyValue
                columns={1}
                items={[
                  { label: 'Vendor', value: order.vendor },
                  { label: 'Plant', value: order.plant },
                  { label: 'PO', value: order.po },
                  { label: 'Contract', value: order.type },
                  { label: 'Value', value: formatCurrency(order.valueCr) },
                  { label: 'Delivery Date', value: formatDate(order.expected) },
                  { label: 'Progress', value: `${order.progress}%` },
                  { label: 'Physical Reality', value: `${totals.missing} missing / ${totals.damaged} damaged` },
                ]}
              />
            </Section>

            {adjacent && <DependencyEngine previous={adjacent.previous} current={milestone} next={adjacent.next} />}

            <Section title="Linked Documents" padded={false}>
              {linkedDocuments.map((document) => (
                <DocumentRow key={document.id} {...document} />
              ))}
            </Section>

            <Section
              title="Validation"
              actions={
                ready ? (
                  <Badge tone="success" shape="square" icon={<Check size={12} strokeWidth={2.8} />}>
                    Ready to Complete
                  </Badge>
                ) : (
                  <Badge tone="warning" shape="square" icon={<AlertTriangle size={12} strokeWidth={2.6} />}>
                    Missing Information
                  </Badge>
                )
              }
            >
              {ready ? (
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="mt-0.5 flex-none text-success" />
                  <p className="text-body">All required checklist items, form fields and attachments are complete.</p>
                </div>
              ) : (
                <ul className="grid gap-2">
                  {validationMissing.slice(0, 6).map((item) => (
                    <li key={item} className="flex items-start gap-2 text-body">
                      <X size={14} className="mt-0.5 flex-none text-danger" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </aside>
        </div>

        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="surface-section flex w-[360px] max-w-[calc(100vw-32px)] flex-col items-center p-6 text-center">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-success">
                <Sparkles size={25} strokeWidth={2.4} />
              </span>
              <h2 className="text-section-title">Gate completed</h2>
              <p className="text-body mt-2">{milestone.label} closed. The next dependent gate is now available.</p>
            </div>
          </div>
        )}

        <div className="fixed right-4 bottom-4 left-4 z-40">
          <div className="surface-section mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2 text-meta">
              <Clock3 size={15} strokeWidth={2.3} />
              Draft is held in memory for this browser session.
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => navigate(`/orders/${order.id}?tab=timeline`)}>
                Cancel
              </Button>
              <Button variant="secondary" icon={<FileUp size={15} />} onClick={() => setToast('Draft saved in memory for the POC.')}>
                Save Draft
              </Button>
              <Button variant="secondary" onClick={() => setToast('Reject action captured as a POC interaction.')}>
                Reject
              </Button>
              <Button variant="secondary" onClick={() => setToast('Escalation added to activity in the full workflow.')}>
                Escalate
              </Button>
              <Button
                variant="primary"
                icon={<ShieldCheck size={16} strokeWidth={2.3} />}
                loading={submitting}
                disabled={!ready || submitting}
                onClick={handleComplete}
              >
                Complete Gate
              </Button>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
