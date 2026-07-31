// Single access point for order-detail data. When MockDataProvider lands
// (RIL.md Phase 5) only this file changes — pages read through useOrderDetail.

import { useSyncExternalStore } from 'react';
import { getOrders } from './orderStore';
import { buildDemoOrderDetail, buildOrderDetail, DEMO_ORDER_ID } from './mockData/orderDetail';
import type { Order } from './types/order';
import type { DeliveryTotals, OrderDetail, Shipment } from './types/orderDetail';

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
