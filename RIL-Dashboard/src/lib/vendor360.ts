// Everything Vendor 360 shows is derived here from the stores that already own
// the data — the order register, order detail, the approvals queue and site
// operations. Nothing about a vendor is stored twice.

import { getOrderBucket } from './orderFilters';
import { orderDetailFor } from './orderDetailStore';
import { getOrders } from './orderStore';
import { useApprovals } from './approvalsStore';
import { dwellMinutes, isOnSite, useSiteOperations } from './siteOpsStore';
import { VENDORS } from './mockData/vendors';
import { VENDOR_PROFILES } from './mockData/vendorProfiles';
import { TODAY } from './mockData/orders';
import type { PendingDecision } from './types/approvals';
import type { Order } from './types/order';
import type { ActivityEntry, AttachedDocument, Invoice, ScfRecord } from './types/orderDetail';
import type { ManpowerRecord, Movement } from './types/siteOps';
import type { Vendor, VendorCertification, VendorProfile } from './types/vendor';

/** A document or invoice always keeps the order it belongs to. */
export type VendorDocument = AttachedDocument & { orderId: string };
export type VendorInvoice = Invoice & { orderId: string };

export interface VendorCertificationStatus extends VendorCertification {
  /** Days until expiry, negative once expired. */
  daysLeft: number;
  status: 'Valid' | 'Expiring' | 'Expired';
}

export interface VendorFinancials {
  outstandingCr: number;
  outstandingCount: number;
  releasedCr: number;
  releasedCount: number;
  overdueCount: number;
  scfStatus: string;
  paymentHealth: 'Healthy' | 'Watch' | 'At Risk';
}

export interface VendorSnapshot {
  vendor: Vendor;
  profile: VendorProfile;
  orders: Order[];
  activeOrders: Order[];
  completedOrders: Order[];
  delayedOrders: Order[];
  orderValueCr: number;
  approvals: PendingDecision[];
  breachedApprovals: number;
  movements: Movement[];
  onSite: Movement[];
  entriesToday: number;
  exitsToday: number;
  averageDwellMinutes: number | null;
  manpower: ManpowerRecord[];
  workforce: number;
  documents: VendorDocument[];
  invoices: VendorInvoice[];
  scf: ScfRecord[];
  financials: VendorFinancials;
  certifications: VendorCertificationStatus[];
  activity: ActivityEntry[];
  /** 0–100 composite of compliance, delivery reliability and site discipline. */
  health: number;
}

const PAID = ['paid', 'released', 'settled'];

function daysBetween(iso: string, clock: Date): number {
  const target = new Date(`${iso}T00:00:00`).getTime();
  const from = new Date(clock);
  from.setHours(0, 0, 0, 0);
  return Math.round((target - from.getTime()) / 86_400_000);
}

function certificationStatus(certification: VendorCertification, clock: Date): VendorCertificationStatus {
  const daysLeft = daysBetween(certification.validTo, clock);
  return {
    ...certification,
    daysLeft,
    status: daysLeft < 0 ? 'Expired' : daysLeft <= 60 ? 'Expiring' : 'Valid',
  };
}

function financialsFor(invoices: VendorInvoice[], scf: ScfRecord[], clock: Date): VendorFinancials {
  const released = invoices.filter((invoice) => PAID.some((k) => invoice.paymentStatus.toLowerCase().includes(k)));
  const outstanding = invoices.filter((invoice) => !released.includes(invoice));
  const overdueCount = outstanding.filter((invoice) => daysBetween(invoice.due, clock) < 0).length;
  const outstandingCr = outstanding.reduce((total, invoice) => total + invoice.amountCr, 0);

  return {
    outstandingCr,
    outstandingCount: outstanding.length,
    releasedCr: released.reduce((total, invoice) => total + invoice.amountCr, 0),
    releasedCount: released.length,
    overdueCount,
    scfStatus: scf.find((record) => record.blockedReason !== null)?.status ?? scf[0]?.status ?? 'Not Applicable',
    paymentHealth: overdueCount > 1 ? 'At Risk' : overdueCount === 1 ? 'Watch' : 'Healthy',
  };
}

/**
 * The composite the header reports. Compliance carries the most weight because
 * it is the only score audited outside the product; the rest is behaviour.
 */
function healthScore(
  vendor: Vendor,
  orders: Order[],
  delayed: number,
  breached: number,
  certifications: VendorCertificationStatus[],
): number {
  const reliability = orders.length === 0 ? 100 : Math.round(((orders.length - delayed) / orders.length) * 100);
  const certPenalty = certifications.filter((c) => c.status !== 'Valid').length * 6;
  const approvalPenalty = breached * 5;
  const score = vendor.compliance * 0.5 + reliability * 0.5 - certPenalty - approvalPenalty;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getVendor(id: string | undefined): Vendor | undefined {
  return id ? VENDORS.find((vendor) => vendor.id === id) : undefined;
}

export function useVendor360(id: string | undefined): VendorSnapshot | null {
  const { decisions } = useApprovals();
  const { movements: allMovements, manpower: allManpower, clock } = useSiteOperations();

  const vendor = getVendor(id);
  const profile = id ? VENDOR_PROFILES[id] : undefined;
  if (!vendor || !profile) return null;

  const orders = getOrders().filter((order) => order.vendor === vendor.name);
  const buckets = orders.map((order) => getOrderBucket(order));
  const completedOrders = orders.filter((_, index) => buckets[index] === 'completed');
  const activeOrders = orders.filter((_, index) => buckets[index] !== 'completed');
  const delayedOrders = orders.filter((_, index) => buckets[index] === 'delayed' || buckets[index] === 'blocked');

  const details = orders.map((order) => ({ order, detail: orderDetailFor(order) }));

  const documents: VendorDocument[] = details.flatMap(({ order, detail }) =>
    detail.documents.map((document) => ({ ...document, orderId: order.id })),
  );
  const invoices: VendorInvoice[] = details.flatMap(({ order, detail }) =>
    detail.invoices.map((invoice) => ({ ...invoice, orderId: order.id })),
  );
  const scf = details.map(({ detail }) => detail.scf);

  const approvals = decisions.filter((decision) => decision.order.vendor === vendor.name);
  const breachedApprovals = approvals.filter((decision) => decision.urgency === 'breached').length;

  const movements = allMovements.filter((movement) => movement.vendor === vendor.name);
  const onSite = movements.filter(isOnSite);
  const dwells = onSite.map((movement) => dwellMinutes(movement)).filter((value): value is number => value !== null);
  const manpower = allManpower.filter((record) => record.vendor === vendor.name);

  const certifications = profile.certifications
    .map((certification) => certificationStatus(certification, TODAY))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Two orders can carry the same activity id, so the feed key is scoped here.
  const activity: ActivityEntry[] = [
    ...details.flatMap(({ order, detail }) =>
      detail.activity.map((entry) => ({ ...entry, id: `${order.id}-${entry.id}` })),
    ),
    ...movements.flatMap((movement) => movement.activity.map((entry) => ({ ...entry, id: `${movement.id}-${entry.id}` }))),
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return {
    vendor,
    profile,
    orders,
    activeOrders,
    completedOrders,
    delayedOrders,
    orderValueCr: orders.reduce((total, order) => total + order.valueCr, 0),
    approvals,
    breachedApprovals,
    movements,
    onSite,
    entriesToday: movements.filter((movement) => movement.entryAt !== null).length,
    exitsToday: movements.filter((movement) => movement.exitAt !== null).length,
    averageDwellMinutes: dwells.length
      ? Math.round(dwells.reduce((total, value) => total + value, 0) / dwells.length)
      : null,
    manpower,
    workforce: manpower.reduce((total, record) => total + record.current, 0),
    documents,
    invoices,
    scf,
    financials: financialsFor(invoices, scf, clock),
    certifications,
    activity,
    health: healthScore(vendor, orders, delayedOrders.length, breachedApprovals, certifications),
  };
}
