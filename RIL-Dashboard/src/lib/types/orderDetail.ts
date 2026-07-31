import type { Plant } from './order';

export type MilestoneState = 'complete' | 'current' | 'locked' | 'blocked';

export interface MilestoneDependency {
  label: string;
  met: boolean;
  reason?: string;
}

export interface MilestoneOwner {
  name: string;
  role: string;
}

export interface Milestone {
  key: string;
  label: string;
  state: MilestoneState;
  owner?: MilestoneOwner;
  timestamp?: string;
  dependencies?: MilestoneDependency[];
  detail?: string;
  documents?: string[];
  history?: { at: string; note: string }[];
}

export type ShipmentMode = 'Road' | 'Air' | 'Sea';

export interface AttachedDocument {
  id: string;
  name: string;
  type: string;
  status: string;
  uploadedBy?: string;
  uploadedAt?: string;
  size?: string;
}

export interface Shipment {
  id: string;
  dispatch: string;
  mode: ShipmentMode;
  carrier: string;
  vehicle: string;
  expected: string;
  actual: string | null;
  ordered: number;
  received: number | null;
  missing: number;
  damaged: number;
  qc: string;
  tracking: string;
  driver: string;
  transporter: string;
  gateIn: string | null;
  weighment: string | null;
  remarks: string | null;
  documents: AttachedDocument[];
}

export interface SecurityPass {
  id: string;
  holder: string;
  designation: string;
  validFrom: string;
  validTo: string;
  milestone: string;
  status: string;
}

export type AssignmentMode = 'Auto' | 'Manual';

export interface StakeholderAssignment {
  gateKey: string;
  gate: string;
  owner: string;
  role: string;
  plant: Plant;
  assignment: AssignmentMode;
}

export interface Invoice {
  id: string;
  amountCr: number;
  match: string;
  approval: string;
  paymentStatus: string;
  due: string;
}

export interface ScfRecord {
  eligibility: string;
  triggerMilestone: string;
  financedCr: number | null;
  status: string;
  condition: string;
  blockedReason: string | null;
}

export type PcfArtifactStatus = 'Collected' | 'Pending' | 'N/A';

export interface PcfArtifact {
  id: string;
  name: string;
  type: string;
  status: PcfArtifactStatus;
  uploadedBy?: string;
  uploadedAt?: string;
}

export type ActivityType = 'gate' | 'delivery' | 'document' | 'finance';

export interface ActivityEntry {
  id: string;
  actor: string;
  action: string;
  target?: { label: string; to?: string };
  timestamp: string;
  type: ActivityType;
}

export interface OrderDetail {
  orderId: string;
  milestones: Milestone[];
  shipments: Shipment[];
  documents: AttachedDocument[];
  securityPasses: SecurityPass[];
  stakeholders: StakeholderAssignment[];
  invoices: Invoice[];
  scf: ScfRecord;
  pcfArtifacts: PcfArtifact[];
  activity: ActivityEntry[];
}

/** Every quantity on the Deliveries tab derives from the shipment records. */
export interface DeliveryTotals {
  ordered: number;
  received: number;
  missing: number;
  damaged: number;
  pending: number;
}
