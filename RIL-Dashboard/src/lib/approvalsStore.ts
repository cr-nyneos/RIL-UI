// Single access point for the approvals queue. Nothing here is stored: every
// pending decision is derived from the order register and its execution gates,
// so completing a gate anywhere in the product removes it from this queue.

import { useSyncExternalStore } from 'react';
import { formatCurrency } from './format';
import { eligibleOwners } from './mockData/orderDetail';
import { TODAY } from './mockData/orders';
import {
  completeGate,
  deliveryTotals,
  orderDetailFor,
  orderDetailVersion,
  reassignStakeholder,
  recordGateDecision,
  subscribeOrderDetail,
} from './orderDetailStore';
import { getOrders } from './orderStore';
import type {
  DecisionNote,
  DecisionPriority,
  DecisionRecord,
  DecisionRisk,
  DecisionSubmission,
  DecisionTrack,
  DecisionUrgency,
  PendingDecision,
  PreviousApproval,
} from './types/approvals';
import type { Order } from './types/order';
import type { Milestone, OrderDetail } from './types/orderDetail';
import type { JourneyStage } from './types/siteOps';

/** The signed-in reviewer — the queue is personal, so "Mine" resolves here. */
export const CURRENT_USER = { name: 'Ramesh Subramanian', role: 'Governance Auditor' };

interface TrackConfig {
  track: DecisionTrack;
  label: string;
  /** Working days the decision window allows before the order slips. */
  slaDays: number;
}

const DECISION_GATES: Record<string, TrackConfig> = {
  clearance: { track: 'security', label: 'Security', slaDays: 1 },
  documents: { track: 'documents', label: 'Documents', slaDays: 2 },
  qc: { track: 'qc', label: 'QC', slaDays: 3 },
  governance: { track: 'governance', label: 'Governance', slaDays: 3 },
  payment: { track: 'finance', label: 'Finance', slaDays: 5 },
};

/** Short forms for the card rail — the labelled chain stays readable at width. */
const RAIL_LABEL: Record<string, string> = {
  clearance: 'Security',
  documents: 'Documents',
  'gate-in': 'Gate-In',
  qc: 'QC',
  delivery: 'Delivery',
  governance: 'Governance',
  payment: 'Payment',
};

/** Days each remaining gate needs if the order is still to land on time. */
const GATE_LEAD_DAYS = 3;

const listeners = new Set<() => void>();
let records: DecisionRecord[] = [];
let version = 0;

function emit() {
  version += 1;
  listeners.forEach((listener) => listener());
}

function subscribeDecisions(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getDecisionVersion(): number {
  return version;
}

function shiftDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86_400_000,
  );
}

function today(): string {
  return TODAY.toISOString().slice(0, 10);
}

/** The most recent thing recorded against the order — the decision has waited since. */
function lastEvent(detail: OrderDetail, milestone: Milestone): string {
  const now = today();
  const candidates = [
    ...detail.milestones.flatMap((entry) => [
      ...(entry.timestamp ? [entry.timestamp] : []),
      ...(entry.history ?? []).map((history) => history.at),
    ]),
    ...detail.activity.map((entry) => entry.timestamp.slice(0, 10)),
  ].filter((date) => date <= now);

  const latest = candidates.sort().at(-1);
  return latest ?? milestone.timestamp ?? now;
}

function toStages(milestones: Milestone[]): JourneyStage[] {
  return milestones.map((milestone) => ({
    key: milestone.key,
    label: RAIL_LABEL[milestone.key] ?? milestone.label,
    state:
      milestone.state === 'complete'
        ? 'complete'
        : milestone.state === 'blocked'
          ? 'blocked'
          : milestone.state === 'current'
            ? 'current'
            : 'upcoming',
  }));
}

function question(track: DecisionTrack, order: Order, detail: OrderDetail): string {
  const totals = deliveryTotals(detail.shipments);

  switch (track) {
    case 'security':
      return `Clear site access for ${order.vendor} personnel at ${order.plant}?`;
    case 'documents':
      return `Verify the compliance pack submitted against ${order.po}?`;
    case 'qc':
      return totals.missing + totals.damaged > 0
        ? `Accept the inspection result with ${totals.missing} missing and ${totals.damaged} damaged units?`
        : `Accept the inspection result for the ${order.plant} consignment?`;
    case 'governance':
      return `Approve the ${formatCurrency(order.valueCr)} award release for ${order.vendor}?`;
    case 'finance':
      return `Release payment against ${detail.invoices[0]?.id ?? order.po} for ${order.vendor}?`;
  }
}

function context(milestone: Milestone, order: Order): string {
  const unmet = milestone.dependencies?.find((dependency) => !dependency.met);
  if (unmet?.reason) return unmet.reason;
  if (milestone.detail) return milestone.detail;
  const flagged = order.flags.find((flag) => flag.detail)?.detail;
  if (flagged) return flagged;
  return `${milestone.label} is open and waiting on the assigned reviewer.`;
}

function risks(order: Order, detail: OrderDetail, milestone: Milestone, urgency: DecisionUrgency): DecisionRisk[] {
  const totals = deliveryTotals(detail.shipments);
  const list: DecisionRisk[] = [];

  if (urgency === 'breached') list.push({ tone: 'danger', label: 'Decision window has closed' });
  if (milestone.state === 'blocked') list.push({ tone: 'danger', label: 'Gate is blocked by an unmet dependency' });
  if (milestone.escalated) list.push({ tone: 'danger', label: 'Escalated for senior review' });
  if (totals.missing > 0 || totals.damaged > 0) {
    list.push({ tone: 'warning', label: `${totals.missing} units missing and ${totals.damaged} damaged on receipt` });
  }
  order.flags.forEach((flag) => {
    if (flag.detail) list.push({ tone: flag.type === 'delayed' ? 'warning' : 'danger', label: flag.detail });
  });
  detail.documents
    .filter((document) => document.status.toLowerCase().includes('expiring'))
    .forEach((document) => list.push({ tone: 'warning', label: `${document.name} — ${document.status}` }));
  if (order.valueCr >= 6) list.push({ tone: 'warning', label: 'Above the governance value threshold' });

  return list;
}

function notes(detail: OrderDetail, milestone: Milestone): DecisionNote[] {
  return [...(milestone.history ?? [])]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 4)
    .concat(detail.scf.blockedReason && milestone.key === 'payment' ? [{ at: today(), note: detail.scf.blockedReason }] : []);
}

function previousApprovals(detail: OrderDetail): PreviousApproval[] {
  return detail.milestones
    .filter((milestone) => milestone.state === 'complete')
    .map((milestone) => ({
      gate: milestone.label,
      owner: milestone.owner?.name ?? 'System',
      at: milestone.timestamp ?? '',
    }));
}

function priorityOf(order: Order, milestone: Milestone, urgency: DecisionUrgency): DecisionPriority {
  if (milestone.state === 'blocked' || milestone.escalated || urgency === 'breached' || order.valueCr >= 6) return 'Critical';
  if (urgency === 'today' || order.valueCr >= 3) return 'High';
  return 'Medium';
}

function buildDecision(order: Order, index: number): PendingDecision | null {
  const detail = orderDetailFor(order);
  const milestone = detail.milestones.find(
    (candidate) => candidate.state === 'current' || candidate.state === 'blocked',
  );
  if (!milestone) return null;

  const config = DECISION_GATES[milestone.key];
  if (!config) return null;

  const now = today();
  const remaining = detail.milestones.filter((candidate) => candidate.state !== 'complete').length;
  const dueAt = shiftDays(order.expected, -(remaining - 1) * GATE_LEAD_DAYS);
  const raisedAt = lastEvent(detail, milestone);
  const dueInDays = daysBetween(now, dueAt);
  const waitingDays = Math.max(0, daysBetween(raisedAt, now));

  const urgency: DecisionUrgency =
    dueInDays < 0 || milestone.state === 'blocked' ? 'breached' : dueInDays === 0 ? 'today' : 'scheduled';

  const owner = milestone.owner ?? { name: 'Unassigned', role: config.label };
  const window = Math.max(1, waitingDays + Math.max(dueInDays, 0));

  return {
    id: `APR-${700 + index}`,
    order,
    detail,
    milestone,
    gateKey: milestone.key,
    gateLabel: milestone.label,
    track: config.track,
    trackLabel: config.label,
    owner,
    mine: owner.name === CURRENT_USER.name,
    myTeam: owner.role === CURRENT_USER.role,
    question: question(config.track, order, detail),
    context: context(milestone, order),
    raisedAt,
    dueAt,
    waitingDays,
    dueInDays,
    slaDays: config.slaDays,
    slaConsumed: Math.min(100, Math.round((waitingDays / window) * 100)),
    urgency,
    priority: priorityOf(order, milestone, urgency),
    escalated: Boolean(milestone.escalated),
    blocked: milestone.state === 'blocked',
    stages: toStages(detail.milestones),
    risks: risks(order, detail, milestone, urgency),
    notes: notes(detail, milestone),
    documents: detail.documents.slice(0, 4),
    activity: detail.activity.slice(0, 5),
    previousApprovals: previousApprovals(detail),
    upcoming: detail.stakeholders
      .filter((assignment) => {
        const target = detail.milestones.find((candidate) => candidate.key === assignment.gateKey);
        return target?.state === 'locked';
      })
      .slice(0, 3)
      .map((assignment) => ({ gate: assignment.gate, owner: assignment.owner, role: assignment.role })),
  };
}

const URGENCY_WEIGHT: Record<DecisionUrgency, number> = { breached: 0, today: 1, scheduled: 2 };

export function decisionQueue(): PendingDecision[] {
  return getOrders()
    .map((order, index) => buildDecision(order, index + 1))
    .filter((decision): decision is PendingDecision => decision !== null)
    .sort(
      (a, b) =>
        URGENCY_WEIGHT[a.urgency] - URGENCY_WEIGHT[b.urgency] ||
        Number(b.escalated) - Number(a.escalated) ||
        a.dueInDays - b.dueInDays ||
        b.order.valueCr - a.order.valueCr,
    );
}

export interface ApprovalsSummary {
  waiting: number;
  urgent: number;
  dueToday: number;
  clearedToday: number;
}

/** Everyone who could take this decision instead — the delegate pool. */
export function delegateOptions(decision: PendingDecision): { value: string; label: string }[] {
  return eligibleOwners(decision.owner.role)
    .filter((candidate) => candidate.name !== decision.owner.name)
    .map((candidate) => ({ value: candidate.name, label: `${candidate.name} · ${candidate.plant}` }));
}

function stampNow(): string {
  const stamp = new Date(TODAY);
  stamp.setHours(9 + records.length, 25, 0, 0);
  return `${today()}T${String(stamp.getHours()).padStart(2, '0')}:${String(stamp.getMinutes()).padStart(2, '0')}:00`;
}

/**
 * The decision is applied to the execution chain itself — approving closes the
 * gate and unlocks the next one, so Execution Board, Order Detail, the activity
 * timeline and the audit trail all move together.
 */
export function submitDecision(decision: PendingDecision, submission: DecisionSubmission): DecisionRecord {
  const actor = CURRENT_USER.name;
  const note = submission.note.trim();

  if (submission.action === 'approve') {
    completeGate({ orderId: decision.order.id, gateKey: decision.gateKey, actor, note });
  } else if (submission.action === 'delegate' && submission.delegateTo) {
    reassignStakeholder({
      orderId: decision.order.id,
      gateKey: decision.gateKey,
      owner: submission.delegateTo,
      actor,
      reason: note || 'Delegated from the approvals queue',
    });
  } else if (submission.action === 'reject' || submission.action === 'escalate') {
    recordGateDecision({
      orderId: decision.order.id,
      gateKey: decision.gateKey,
      decision: submission.action,
      actor,
      note: submission.reason ? `${submission.reason} — ${note}` : note,
    });
  }

  const record: DecisionRecord = {
    id: decision.id,
    orderId: decision.order.id,
    gateLabel: decision.gateLabel,
    action: submission.action,
    actor,
    at: stampNow(),
    note,
    delegateTo: submission.delegateTo,
  };

  records = [record, ...records];
  emit();
  return record;
}

export interface ApprovalsResult {
  decisions: PendingDecision[];
  records: DecisionRecord[];
  summary: ApprovalsSummary;
  clock: Date;
}

export function useApprovals(): ApprovalsResult {
  useSyncExternalStore(subscribeOrderDetail, orderDetailVersion, orderDetailVersion);
  useSyncExternalStore(subscribeDecisions, getDecisionVersion, getDecisionVersion);

  const decisions = decisionQueue();

  return {
    decisions,
    records,
    summary: {
      waiting: decisions.length,
      urgent: decisions.filter((decision) => decision.urgency === 'breached' || decision.escalated).length,
      dueToday: decisions.filter((decision) => decision.urgency === 'today').length,
      clearedToday: records.length,
    },
    clock: TODAY,
  };
}
