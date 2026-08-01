import { getOrders } from './orderStore';
import { getOrderBucket } from './orderFilters';
import type { Vendor } from './types/vendor';

export interface VendorFilters {
  query: string;
  plant: string;
  category: string;
  status: string;
  compliance: string;
  risk: string;
}

export const EMPTY_VENDOR_FILTERS: VendorFilters = {
  query: '',
  plant: 'all',
  category: 'all',
  status: 'all',
  compliance: 'all',
  risk: 'all',
};


export function activeOrderCounts(): Record<string, number> {
  return getOrders().reduce<Record<string, number>>((counts, order) => {
    if (getOrderBucket(order) === 'completed') return counts;
    counts[order.vendor] = (counts[order.vendor] ?? 0) + 1;
    return counts;
  }, {});
}

export function matchesVendorSearch(vendor: Vendor, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    vendor.name.toLowerCase().includes(q) ||
    vendor.code.toLowerCase().includes(q) ||
    vendor.id.toLowerCase().includes(q) ||
    vendor.category.toLowerCase().includes(q)
  );
}

export function matchesVendorFilters(vendor: Vendor, filters: VendorFilters): boolean {
  if (filters.plant !== 'all' && !vendor.plants.includes(filters.plant as Vendor['plants'][number])) return false;
  if (filters.category !== 'all' && vendor.category !== filters.category) return false;
  if (filters.status !== 'all' && vendor.status !== filters.status) return false;
  if (filters.compliance !== 'all' && vendor.complianceState !== filters.compliance) return false;
  if (filters.risk !== 'all' && vendor.risk !== filters.risk) return false;
  return matchesVendorSearch(vendor, filters.query);
}

export function hasActiveVendorFilters(filters: VendorFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.plant !== 'all' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    filters.compliance !== 'all' ||
    filters.risk !== 'all'
  );
}

export function compareVendors(a: Vendor, b: Vendor, key: string, orders: Record<string, number>): number {
  switch (key) {
    case 'vendor':
      return a.name.localeCompare(b.name);
    case 'category':
      return a.category.localeCompare(b.category);
    case 'plants':
      return a.plants.length - b.plants.length;
    case 'orders':
      return (orders[a.name] ?? 0) - (orders[b.name] ?? 0);
    case 'compliance':
      return a.compliance - b.compliance;
    case 'risk':
      return ['Low', 'Medium', 'High'].indexOf(a.risk) - ['Low', 'Medium', 'High'].indexOf(b.risk);
    case 'status':
      return a.status.localeCompare(b.status);
    case 'activity':
      return a.lastActivity.localeCompare(b.lastActivity);
    default:
      return 0;
  }
}
