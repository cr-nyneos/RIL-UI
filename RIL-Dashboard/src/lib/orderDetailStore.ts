// Single access point for order-detail data. When MockDataProvider lands
// (RIL.md Phase 5) only this file changes — pages read through useOrderDetail.

import { useSyncExternalStore } from 'react';
import { getOrders } from './orderStore';
import { buildDemoOrderDetail, buildOrderDetail, DEMO_ORDER_ID } from './mockData/orderDetail';
import type { Order } from './types/order';
import type { DeliveryTotals, Milestone, OrderDetail, Shipment } from './types/orderDetail';

const details = new Map<string, OrderDetail>();
const listeners = new Set<() => void>();

let version = 0;

function emit() {
  version += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getVersion(): number {
  return version;
}

function seed(order: Order): OrderDetail {
  const existing = details.get(order.id);
  if (existing) return existing;

  const detail = order.id === DEMO_ORDER_ID ? buildDemoOrderDetail(order) : buildOrderDetail(order);
  details.set(order.id, detail);
  return detail;
}

/** Seeds and returns the detail record for one order — the approvals queue
 *  derives every pending decision from these milestones. */
export function orderDetailFor(order: Order): OrderDetail {
  return seed(order);
}

export function subscribeOrderDetail(listener: () => void): () => void {
  return subscribe(listener);
}

export function orderDetailVersion(): number {
  return version;
}

/** Every quantity on the Deliveries tab derives from these records. */
export function deliveryTotals(shipments: Shipment[]): DeliveryTotals {
  const totals = shipments.reduce(
    (accumulator, shipment) => ({
      ordered: accumulator.ordered + shipment.ordered,
      received: accumulator.received + (shipment.received ?? 0),
      missing: accumulator.missing + shipment.missing,
      damaged: accumulator.damaged + shipment.damaged,
    }),
    { ordered: 0, received: 0, missing: 0, damaged: 0 },
  );

  return {
    ...totals,
    pending: totals.ordered - totals.received - totals.missing - totals.damaged,
  };
}

/**
 * New activity is stamped one hour after the latest existing entry rather than
 * at wall-clock time, so a mutation always lands at the top of a feed seeded
 * against the fixed demo calendar.
 */
function nextTimestamp(detail: OrderDetail): string {
  const latest = detail.activity.reduce(
    (current, entry) => (entry.timestamp > current ? entry.timestamp : current),
    detail.activity[0]?.timestamp ?? new Date().toISOString(),
  );
  const stamped = new Date(latest);
  stamped.setHours(stamped.getHours() + 1);
  return stamped.toISOString().slice(0, 19);
}

export interface ReassignPayload {
  orderId: string;
  gateKey: string;
  owner: string;
  actor: string;
  reason: string;
}

export function reassignStakeholder({ orderId, gateKey, owner, actor, reason }: ReassignPayload) {
  const detail = details.get(orderId);
  if (!detail) return;

  const assignment = detail.stakeholders.find((row) => row.gateKey === gateKey);
  if (!assignment) return;

  const previous = assignment.owner;

  detail.stakeholders = detail.stakeholders.map((row) =>
    row.gateKey === gateKey ? { ...row, owner, assignment: 'Manual' as const } : row,
  );

  detail.milestones = detail.milestones.map((milestone) =>
    milestone.key === gateKey && milestone.owner
      ? { ...milestone, owner: { ...milestone.owner, name: owner } }
      : milestone,
  );

  // Every mutation writes an activity entry — RIL.md §8.
  detail.activity = [
    {
      id: `${orderId}-act-reassign-${detail.activity.length + 1}`,
      actor,
      action: `reassigned ${assignment.gate} from ${previous} to ${owner} — ${reason}`,
      timestamp: nextTimestamp(detail),
      type: 'gate',
    },
    ...detail.activity,
  ];

  details.set(orderId, { ...detail });
  emit();
}

function updateRegisterOrder(orderId: string, milestones: Milestone[]) {
  const order = getOrders().find((candidate) => candidate.id === orderId);
  if (!order) return;

  const closed = milestones.filter((milestone) => milestone.state === 'complete').length;
  const active = milestones.find((milestone) => milestone.state === 'current' || milestone.state === 'blocked');

  order.progress = Math.round((closed / milestones.length) * 100);
  order.status = closed === milestones.length ? 'Delivered / Complete' : active ? `${active.label} in Progress` : 'In Progress';
  order.gates = order.gates.map((gate) => {
    const milestone = milestones.find((candidate) => candidate.key === gate.key);
    return {
      ...gate,
      state: milestone?.state === 'complete' ? 'done' : milestone?.state === 'current' || milestone?.state === 'blocked' ? 'current' : 'locked',
    };
  });
}

export interface CompleteGatePayload {
  orderId: string;
  gateKey: string;
  actor: string;
  note?: string;
  documents?: string[];
}

export function completeGate({ orderId, gateKey, actor, note, documents = [] }: CompleteGatePayload) {
  const detail = details.get(orderId);
  if (!detail) return;

  const index = detail.milestones.findIndex((milestone) => milestone.key === gateKey);
  if (index < 0) return;

  const timestamp = nextTimestamp(detail);
  const closedDate = timestamp.slice(0, 10);
  const current = detail.milestones[index];
  const next = detail.milestones[index + 1];

  const updatedMilestones = detail.milestones.map((milestone, milestoneIndex) => {
    if (milestoneIndex === index) {
      const mergedDocuments = Array.from(new Set([...(milestone.documents ?? []), ...documents]));
      return {
        ...milestone,
        state: 'complete' as const,
        timestamp: closedDate,
        documents: mergedDocuments.length > 0 ? mergedDocuments : milestone.documents,
        dependencies: (milestone.dependencies ?? []).map((dependency) => ({ ...dependency, met: true, reason: undefined })),
        detail: note?.trim() || milestone.detail || `${milestone.label} completed in the Gate Workspace.`,
        history: [
          ...(milestone.history ?? []),
          { at: closedDate, note: `${milestone.label} completed by ${actor}.` },
        ],
      };
    }

    if (milestoneIndex === index + 1 && milestone.state === 'locked') {
      return {
        ...milestone,
        state: 'current' as const,
        dependencies: (milestone.dependencies ?? []).map((dependency, dependencyIndex) =>
          dependencyIndex === 0 ? { ...dependency, met: true, reason: undefined } : dependency,
        ),
        history: [
          ...(milestone.history ?? []),
          { at: closedDate, note: `${milestone.label} unlocked after ${current.label} closed.` },
        ],
      };
    }

    return milestone;
  });

  detail.milestones = updatedMilestones;

  const newDocuments = documents.map((name, documentIndex) => ({
    id: `${orderId}-${gateKey}-workspace-doc-${detail.documents.length + documentIndex + 1}`,
    name,
    type: 'Gate Evidence',
    status: 'Submitted',
    uploadedBy: actor,
    uploadedAt: closedDate,
    size: 'POC',
  }));

  if (newDocuments.length > 0) {
    detail.documents = [...newDocuments, ...detail.documents];
  }

  detail.activity = [
    {
      id: `${orderId}-act-gate-workspace-${detail.activity.length + 1}`,
      actor,
      action: `completed ${current.label}${next ? ` and unlocked ${next.label}` : ''}`,
      timestamp,
      type: 'gate',
    },
    ...detail.activity,
  ];

  detail.pcfArtifacts = detail.pcfArtifacts.map((artifact, artifactIndex) =>
    artifact.status === 'Pending' && artifactIndex <= index + 1
      ? { ...artifact, status: 'Collected' as const, uploadedBy: actor, uploadedAt: closedDate }
      : artifact,
  );

  if (gateKey === 'payment') {
    detail.scf = {
      ...detail.scf,
      status: 'Financed',
      financedCr: detail.invoices[0]?.amountCr ?? null,
      blockedReason: null,
    };
  }

  details.set(orderId, { ...detail });
  updateRegisterOrder(orderId, updatedMilestones);
  emit();
}

export interface GateDecisionPayload {
  orderId: string;
  gateKey: string;
  decision: 'reject' | 'escalate';
  actor: string;
  note: string;
}

const RETURNED_DEPENDENCY = 'Reviewer decision cleared';

/**
 * A rejected gate is held open and blocked with the reviewer's reason as its
 * unmet dependency; an escalated gate keeps running under review. Both write
 * an activity entry — RIL.md §8.
 */
export function recordGateDecision({ orderId, gateKey, decision, actor, note }: GateDecisionPayload) {
  const detail = details.get(orderId);
  if (!detail) return;

  const index = detail.milestones.findIndex((milestone) => milestone.key === gateKey);
  if (index < 0) return;

  const timestamp = nextTimestamp(detail);
  const at = timestamp.slice(0, 10);
  const current = detail.milestones[index];

  detail.milestones = detail.milestones.map((milestone, milestoneIndex) => {
    if (milestoneIndex !== index) return milestone;

    if (decision === 'reject') {
      return {
        ...milestone,
        state: 'blocked' as const,
        dependencies: [
          ...(milestone.dependencies ?? []).filter((dependency) => dependency.label !== RETURNED_DEPENDENCY),
          { label: RETURNED_DEPENDENCY, met: false, reason: note },
        ],
        history: [...(milestone.history ?? []), { at, note: `${milestone.label} returned by ${actor} — ${note}` }],
      };
    }

    return {
      ...milestone,
      escalated: true,
      history: [...(milestone.history ?? []), { at, note: `${milestone.label} escalated by ${actor} — ${note}` }],
    };
  });

  detail.activity = [
    {
      id: `${orderId}-act-decision-${detail.activity.length + 1}`,
      actor,
      action: `${decision === 'reject' ? 'returned' : 'escalated'} ${current.label} — ${note}`,
      timestamp,
      type: 'gate',
    },
    ...detail.activity,
  ];

  details.set(orderId, { ...detail });
  emit();
}

export interface OrderDetailResult {
  order: Order | undefined;
  detail: OrderDetail | undefined;
  totals: DeliveryTotals;
}

export function useOrderDetail(id: string | undefined): OrderDetailResult {
  useSyncExternalStore(subscribe, getVersion, getVersion);

  const order = id ? getOrders().find((candidate) => candidate.id === id) : undefined;
  const detail = order ? seed(order) : undefined;

  return {
    order,
    detail,
    totals: deliveryTotals(detail?.shipments ?? []),
  };
}
