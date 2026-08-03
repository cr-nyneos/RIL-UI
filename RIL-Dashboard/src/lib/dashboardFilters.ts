import {
  PLANT_BREAKDOWN,
  PLANT_BREAKDOWN_3M,
  STATUS_SEGMENTS,
  PLANT_SEGMENTS,
  type ContractType,
  type PlantId,
} from './mockData/dashboard';
import type { Segment } from '../data/segments';

export type PlantFilter = 'all' | PlantId;
export type ContractTypeFilter = 'all' | ContractType;
export type PeriodFilter = '3m' | '6m';

export function breakdownFor(period: PeriodFilter) {
  return period === '3m' ? PLANT_BREAKDOWN_3M : PLANT_BREAKDOWN;
}

export interface FilteredTotals {
  activeOrders: number;
  inTransit: number;
  delayed: number;
  governanceApprovals: number;
  pendingPaymentsCr: number;
}

function typeShare(row: (typeof PLANT_BREAKDOWN)[number], type: ContractTypeFilter) {
  if (type === 'all') return 1;
  if (row.activeOrders === 0) return 0;
  const base = type === 'Manufactured' ? row.manufactured : row.material;
  return base / row.activeOrders;
}

export function computeFilteredTotals(
  plant: PlantFilter,
  type: ContractTypeFilter,
  period: PeriodFilter = '6m',
): FilteredTotals {
  const source = breakdownFor(period);
  const rows = plant === 'all' ? source : source.filter((r) => r.id === plant);
  let activeOrders = 0;
  let inTransit = 0;
  let delayed = 0;
  let governanceApprovals = 0;
  let pendingPaymentsCr = 0;

  for (const row of rows) {
    const share = typeShare(row, type);
    activeOrders += row.activeOrders * share;
    inTransit += row.inTransit * share;
    delayed += row.delayed * share;
    governanceApprovals += row.governanceApprovals * share;
    pendingPaymentsCr += row.pendingPaymentsCr * share;
  }

  return {
    activeOrders: Math.round(activeOrders),
    inTransit: Math.round(inTransit),
    delayed: Math.round(delayed),
    governanceApprovals: Math.round(governanceApprovals),
    pendingPaymentsCr: Math.round(pendingPaymentsCr * 10) / 10,
  };
}

function scaleSegments(
  base: Segment[],
  plant: PlantFilter,
  type: ContractTypeFilter,
  period: PeriodFilter,
): Segment[] {
  const { activeOrders } = computeFilteredTotals(plant, type, period);
  const baseTotal = base.reduce((sum, s) => sum + s.value, 0);
  const factor = baseTotal === 0 ? 0 : activeOrders / baseTotal;
  return base.map((s) => ({ ...s, value: Math.max(0, Math.round(s.value * factor)) })).filter((s) => s.value > 0);
}

export function computeFilteredStatusDistribution(
  plant: PlantFilter,
  type: ContractTypeFilter,
  period: PeriodFilter = '6m',
): Segment[] {
  return scaleSegments(STATUS_SEGMENTS, plant, type, period);
}

export function computeFilteredPlantSegments(
  plant: PlantFilter,
  type: ContractTypeFilter,
  period: PeriodFilter = '6m',
): Segment[] {
  const source = breakdownFor(period);
  const rows = plant === 'all' ? source : source.filter((r) => r.id === plant);
  const rowIds = new Set(rows.map((r) => r.id));
  return PLANT_SEGMENTS.filter((s) => rowIds.has(s.key as PlantId)).map((s) => {
    const row = source.find((r) => r.id === s.key)!;
    const value = type === 'all' ? row.activeOrders : type === 'Manufactured' ? row.manufactured : row.material;
    return { ...s, value };
  });
}
