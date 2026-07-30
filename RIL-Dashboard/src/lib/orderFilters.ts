import type { Order } from './types/order';
import { TODAY } from './mockData/orders';
import { formatCurrency, formatDate, formatRelative } from './format';

export type OrderBucket = 'execution' | 'delayed' | 'blocked' | 'completed';

export type OrderFilter = 'all' | 'manufactured' | 'material' | OrderBucket;

export function getOrderBucket(order: Order): OrderBucket {
  if (order.progress >= 100) return 'completed';
  if (order.status.startsWith('Blocked')) return 'blocked';
  if (order.status.startsWith('Delayed')) return 'delayed';
  return 'execution';
}

export function matchesFilter(order: Order, filter: OrderFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'manufactured':
      return order.type === 'Manufactured';
    case 'material':
      return order.type === 'Material';
    default:
      return getOrderBucket(order) === filter;
  }
}

export function matchesSearch(order: Order, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    order.id.toLowerCase().includes(q) ||
    order.po.toLowerCase().includes(q) ||
    order.vendor.toLowerCase().includes(q)
  );
}

export interface ExpectedDate {
  label: string;
  relative: string;
  overdue: boolean;
}

export function formatExpected(iso: string, complete: boolean): ExpectedDate {
  const date = new Date(`${iso}T00:00:00`);
  const label = formatDate(date);
  const relative = complete ? 'delivered' : formatRelative(date, TODAY).toLowerCase();
  return { label, relative, overdue: relative.includes('overdue') };
}

export function formatValue(valueCr: number): string {
  return formatCurrency(valueCr);
}

export function currentGateLabel(order: Order): string {
  const current = order.gates.find((g) => g.state === 'current');
  return current ? current.label : 'All gates cleared';
}
