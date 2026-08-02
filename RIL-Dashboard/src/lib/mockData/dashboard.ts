// Hardcoded sample data for the Dashboard page — see RIL.md Part 3 & Part 6.
// Typed so this can later be swapped for a real API response without touching component code.

import {
  ShieldCheck,
  DoorOpen,
  FlaskConical,
  Truck as TruckIcon,
  PackageCheck,
  Ban,
  Factory,
  Anchor,
  Warehouse,
  Building2,
  Boxes,
} from 'lucide-react';
import type { Segment } from '../../data/segments';
import type { LinePoint } from '../../components/LineChart';

export type ContractType = 'Manufactured' | 'Material';
export type PlantId = 'Jamnagar' | 'Delhi' | 'Hyderabad' | 'Nagpur' | 'Surat';

export interface PlantBreakdown {
  id: PlantId;
  plant: string;
  activeOrders: number;
  inTransit: number;
  delayed: number;
  governanceApprovals: number;
  pendingPaymentsCr: number;
  manufactured: number;
  material: number;
}

export const PLANTS: { id: PlantId; label: string }[] = [
  { id: 'Jamnagar', label: 'Jamnagar' },
  { id: 'Delhi', label: 'Delhi' },
  { id: 'Hyderabad', label: 'Hyderabad' },
  { id: 'Nagpur', label: 'Nagpur' },
  { id: 'Surat', label: 'Surat' },
];

// Per-plant breakdown of every headline metric — sums to the Part 6 totals
// (42 active, 11 in transit, 5 delayed, 4 governance approvals, ₹4.2 Cr
// pending payments, 26 Manufactured / 16 Material).
export const PLANT_BREAKDOWN: PlantBreakdown[] = [
  { id: 'Jamnagar', plant: 'Jamnagar', activeOrders: 14, inTransit: 4, delayed: 2, governanceApprovals: 2, pendingPaymentsCr: 1.6, manufactured: 9, material: 5 },
  { id: 'Delhi', plant: 'Delhi', activeOrders: 9, inTransit: 3, delayed: 2, governanceApprovals: 1, pendingPaymentsCr: 1.0, manufactured: 4, material: 5 },
  { id: 'Hyderabad', plant: 'Hyderabad', activeOrders: 8, inTransit: 2, delayed: 1, governanceApprovals: 1, pendingPaymentsCr: 0.8, manufactured: 6, material: 2 },
  { id: 'Nagpur', plant: 'Nagpur', activeOrders: 6, inTransit: 1, delayed: 0, governanceApprovals: 0, pendingPaymentsCr: 0.5, manufactured: 4, material: 2 },
  { id: 'Surat', plant: 'Surat', activeOrders: 5, inTransit: 1, delayed: 0, governanceApprovals: 0, pendingPaymentsCr: 0.3, manufactured: 3, material: 2 },
];

// ---- KPI sparklines (7-point illustrative trend leading to today's value) ----
export const KPI_SPARKLINES = {
  activeOrders: [34, 36, 35, 38, 40, 39, 42],
  inTransit: [7, 8, 9, 8, 10, 9, 11],
  delayed: [2, 3, 3, 4, 4, 3, 5],
  governanceApprovals: [3, 4, 3, 5, 4, 5, 4],
  pendingPayments: [3.1, 3.4, 3.6, 3.9, 4.0, 3.8, 4.2],
};

// ---- Order Status Distribution (donut) — locked data hues + one neutral ----
export const STATUS_SEGMENTS: Segment[] = [
  { key: 'awaiting-clearance', label: 'Awaiting Clearance', fullLabel: 'Awaiting Security Clearance', value: 6, trend: 1.2, description: 'Vendor personnel pending site access clearance.', from: '#D8DCE5', to: '#98A2B3', glow: '#98A2B3', icon: ShieldCheck },
  { key: 'gate-in', label: 'Gate-In', fullLabel: 'Gate-In', value: 7, trend: 2.4, description: 'Material physically entering the plant gate.', from: '#93C5FD', to: '#1D4ED8', glow: '#3B82F6', icon: DoorOpen },
  { key: 'in-qc', label: 'In QC', fullLabel: 'In QC', value: 8, trend: -1.1, description: 'Undergoing quality inspection before acceptance.', from: '#F3B69C', to: '#B14A2A', glow: '#DE7356', icon: FlaskConical },
  { key: 'in-transit', label: 'In Transit', fullLabel: 'In Transit', value: 11, trend: 3.6, description: 'Dispatched and en route to site.', from: '#6EE7B7', to: '#047857', glow: '#10B981', icon: TruckIcon },
  { key: 'partially-delivered', label: 'Partial', fullLabel: 'Partially Delivered', value: 6, trend: 0.8, description: 'Some quantity received; balance pending.', from: '#FCD34D', to: '#B45309', glow: '#EAA640', icon: PackageCheck },
  { key: 'blocked', label: 'Blocked', fullLabel: 'Blocked', value: 4, trend: -4.2, description: 'Blocked pending governance sign-off.', from: '#F3B8CB', to: '#9F4C6E', glow: '#D68BA4', icon: Ban },
];

// ---- Orders by Plant (vessel bar) — locked hue per plant ----
export const PLANT_SEGMENTS: Segment[] = [
  { key: 'Jamnagar', label: 'Jamnagar', fullLabel: 'Jamnagar', value: 14, trend: 5.2, description: 'Largest active site load across the network.', from: '#93C5FD', to: '#1D4ED8', glow: '#3B82F6', icon: Factory },
  { key: 'Delhi', label: 'Delhi', fullLabel: 'Delhi', value: 9, trend: -2.1, description: 'Material-heavy site with two delayed orders.', from: '#F3B69C', to: '#B14A2A', glow: '#DE7356', icon: Anchor },
  { key: 'Hyderabad', label: 'Hyderabad', fullLabel: 'Hyderabad', value: 8, trend: 1.4, description: 'Balanced manufactured/material mix.', from: '#6EE7B7', to: '#047857', glow: '#10B981', icon: Warehouse },
  { key: 'Nagpur', label: 'Nagpur', fullLabel: 'Nagpur', value: 6, trend: 0.6, description: 'Steady load, no delays this cycle.', from: '#FCD34D', to: '#B45309', glow: '#EAA640', icon: Building2 },
  { key: 'Surat', label: 'Surat', fullLabel: 'Surat', value: 5, trend: 2.0, description: 'Smallest site by order count.', from: '#F3B8CB', to: '#9F4C6E', glow: '#D68BA4', icon: Boxes },
];

// ---- Monthly Deliveries — planned vs actual (last 6 months) ----
export const MONTHLY_DELIVERIES_ACTUAL: LinePoint[] = [
  { month: 'Feb', value: 16 },
  { month: 'Mar', value: 19 },
  { month: 'Apr', value: 20 },
  { month: 'May', value: 21 },
  { month: 'Jun', value: 22 },
  { month: 'Jul', value: 23 },
];

export const MONTHLY_DELIVERIES_PLANNED: LinePoint[] = [
  { month: 'Feb', value: 18 },
  { month: 'Mar', value: 20 },
  { month: 'Apr', value: 22 },
  { month: 'May', value: 25 },
  { month: 'Jun', value: 24 },
  { month: 'Jul', value: 26 },
];

// ---- Vendor operations health (dashboard highlight band) ----
export interface OpsHealthMetric {
  label: string;
  value: string;
  caption: string;
}

export const VENDOR_OPS_HEALTH = {
  score: 94,
  band: 'Excellent',
  summary:
    'Vendor SLA adherence, QC acceptance and gate-in punctuality are tracking above target across the network. 2 sites carry open exceptions this cycle.',
  metrics: [
    { label: 'On-time Delivery', value: '92%', caption: 'vs 88% target' },
    { label: 'QC Acceptance', value: '97%', caption: 'first-pass rate' },
    { label: 'SLA Adherence', value: '89%', caption: 'governance gates' },
    { label: 'Vendor Compliance', value: '96%', caption: 'documents current' },
  ] as OpsHealthMetric[],
};

// ---- Hero priority signals ----
export interface PrioritySignal {
  label: string;
  count: number;
  tone: 'danger' | 'warning' | 'info';
  href: string;
}

export const PRIORITY_SIGNALS: PrioritySignal[] = [
  { label: 'approvals breached SLA', count: 2, tone: 'danger', href: '/approvals' },
  { label: 'payment overdue', count: 1, tone: 'warning', href: '/finance' },
  { label: 'orders at risk', count: 5, tone: 'info', href: '/orders' },
];
