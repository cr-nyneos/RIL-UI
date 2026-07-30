import { ORDERS } from './mockData/orders';
import type { ContractType, Gate, Order, Plant } from './types/order';

type OrderMode = 'draft' | 'created';

export interface OrderWorkspacePayload {
  vendor?: string;
  plant?: string;
  type: ContractType;
  po?: string;
  expected?: string;
  value?: string;
}

const createdOrders: Order[] = [];

const GATE_CHAIN: { key: string; label: string }[] = [
  { key: 'clearance', label: 'Security Clearance' },
  { key: 'documents', label: 'Doc Verification' },
  { key: 'gate-in', label: 'Gate-In' },
  { key: 'qc', label: 'QC' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'governance', label: 'Governance' },
  { key: 'payment', label: 'Payment' },
];

function draftGates(): Gate[] {
  return GATE_CHAIN.map((gate, index) => ({
    ...gate,
    state: index === 0 ? 'current' : 'locked',
  }));
}

function nextOrderId(): string {
  const all = [...ORDERS, ...createdOrders];
  const max = all.reduce((current, order) => {
    const value = Number(order.id.replace('ORD-', ''));
    return Number.isFinite(value) ? Math.max(current, value) : current;
  }, 2064);

  return `ORD-${max + 1}`;
}

function parseValueCr(value?: string): number {
  if (!value) return 0;
  const numeric = Number(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

function makeFallbackPo(orderId: string, mode: OrderMode): string {
  const suffix = orderId.replace('ORD-', '');
  return mode === 'draft' ? `DRAFT-RIL-${suffix}` : `PO-RIL-${88000 + Number(suffix)}`;
}

export function getOrders(): Order[] {
  return [...createdOrders, ...ORDERS];
}

export function upsertWorkspaceOrder(payload: OrderWorkspacePayload, mode: OrderMode): Order {
  const id = nextOrderId();
  const order: Order = {
    id,
    po: payload.po?.trim() || makeFallbackPo(id, mode),
    vendor: payload.vendor?.trim() || 'Draft vendor',
    plant: (payload.plant || 'Jamnagar') as Plant,
    type: payload.type,
    status: mode === 'draft' ? 'Draft' : 'Awaiting Security Clearance',
    progress: 0,
    expected: payload.expected || '2026-09-30',
    valueCr: parseValueCr(payload.value),
    gates: draftGates(),
    flags: [],
  };

  createdOrders.unshift(order);
  return order;
}
