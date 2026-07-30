import { formatDate, formatRelative } from '../../lib/format';
import { TODAY } from '../../lib/mockData/orders';

export { required } from '../create-order/utils';

export function shipmentIdFor(orderId: string): string {
  const numeric = Number(orderId.replace(/\D/g, ''));
  return `SHP-${5500 + (Number.isFinite(numeric) ? numeric % 100 : 0)}`;
}

export function liveEta(expectedArrival: string): string {
  if (!expectedArrival.trim()) return '';
  const date = new Date(`${expectedArrival}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return `${formatDate(date)} · ${formatRelative(date, TODAY)}`;
}

export function transitDays(dispatchDate: string, expectedArrival: string): string {
  if (!dispatchDate.trim() || !expectedArrival.trim()) return '';
  const start = new Date(`${dispatchDate}T00:00:00`);
  const end = new Date(`${expectedArrival}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return `${days} days`;
}
