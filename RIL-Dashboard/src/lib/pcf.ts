import { ownerFor } from './mockData/orderDetail';
import type { Order } from './types/order';
import type { OrderDetail } from './types/orderDetail';

export type PcfItemStatus = 'Complete' | 'Pending';

export interface PcfChecklistItem {
  id: string;
  label: string;
  stage: string;
  status: PcfItemStatus;
  completedAt: string | null;
  completedBy: string;
  documents: PcfDocument[];
}

export interface PcfDocument {
  name: string;
  file: string;
  type: string;
  size: string;
  stage: string;
}

export interface PcfStageTrace {
  stage: string;
  documents: PcfDocument[];
}

export interface PcfRecord {
  orderId: string;
  status: 'Complete' | 'Pending';
  completionPct: number;
  collected: number;
  total: number;
  checklist: PcfChecklistItem[];
  missing: string[];
  documents: PcfDocument[];
  traceability: PcfStageTrace[];
  completionDate: string | null;
  generatedAt: string | null;
  generatedBy: string;
  totalDeliveries: number;
  workflowType: string;
  workflowVersion: string;
  pcfVersion: string;
  workflowEngine: string;
  stagesCompleted: number;
  stagesTotal: number;
  approvalsCompleted: number;
  approvalsTotal: number;
  deliveriesCompleted: number;
  awardDate: string;
  durationDays: number | null;
}

interface ChecklistDefinition {
  id: string;
  label: string;
  stage: string;
  gateKey?: string;
  offset: number;
  documents: { name: string; file: string; type: string }[];
}

const WORKFLOW_STAGES = [
  'Order Award',
  'Security Clearance',
  'Document Verification',
  'Material Gate-In',
  'QC Inspection',
  'Delivery Confirmation',
  'Governance Approval',
  'Payment Release',
];

const APPROVAL_STAGES = [
  'Document Verification',
  'QC Inspection',
  'Delivery Confirmation',
  'Governance Approval',
  'Payment Release',
];

const STAGE_ROLE: Record<string, string> = {
  'Order Award': 'Vendor Coordinator',
  'Security Clearance': 'Security Desk',
  'Document Verification': 'QA Officer',
  'Material Gate-In': 'Gate Supervisor',
  'QC Inspection': 'QA Officer',
  'Delivery Confirmation': 'Site Lead',
  'Governance Approval': 'Governance Auditor',
  'Payment Release': 'Finance Controller',
  'Project Completion': 'Governance Auditor',
};

export const PCF_VERSION = '1.0';
export const WORKFLOW_ENGINE = 'NyneOS Execution Engine';

const COMPLETION_OVERRIDES: Record<string, boolean> = {
  'ORD-2044': false,
  'ORD-2049': true,
  'ORD-2055': true,
  'ORD-2061': false,
  'ORD-2063': true,
  'ORD-2088': false,
};

function seedOf(orderId: string): number {
  let seed = 7;
  for (let index = 0; index < orderId.length; index += 1) {
    seed = (seed * 31 + orderId.charCodeAt(index)) % 100_000;
  }
  return seed;
}

const recorded = new Set<string>();

export function recordPcfArtefacts(orderId: string) {
  recorded.add(orderId);
}

export function isPcfComplete(orderId: string): boolean {
  if (recorded.has(orderId)) return true;
  const override = COMPLETION_OVERRIDES[orderId];
  if (override !== undefined) return override;
  return seedOf(orderId) % 100 < 76;
}

function shiftDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function slug(value: string): string {
  return value
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 28);
}

function definitions(order: Order): ChecklistDefinition[] {
  const id = order.id.replace('ORD-', '');
  const vendor = slug(order.vendor);
  const po = slug(order.po);

  return [
    {
      id: 'purchase-order',
      label: 'Purchase Order',
      stage: 'Order Award',
      offset: -96,
      documents: [{ name: 'Purchase Order', file: `Purchase_Order_${po}.pdf`, type: 'Purchase Order' }],
    },
    {
      id: 'contract',
      label: 'Contract',
      stage: 'Order Award',
      offset: -94,
      documents: [
        { name: 'Executed Contract', file: `Contract_${id}.pdf`, type: 'Contract' },
        { name: 'Contract Annexure', file: `Contract_Annexure_${id}.pdf`, type: 'Contract' },
      ],
    },
    {
      id: 'clearance',
      label: 'Security Clearance',
      stage: 'Security Clearance',
      gateKey: 'clearance',
      offset: -88,
      documents: [{ name: 'Security Clearance Record', file: `Security_Clearance_${id}.pdf`, type: 'Clearance' }],
    },
    {
      id: 'kyc',
      label: 'Vendor KYC Documents',
      stage: 'Document Verification',
      gateKey: 'documents',
      offset: -82,
      documents: [
        { name: 'Vendor KYC Pack', file: `Vendor_KYC_${vendor}.pdf`, type: 'KYC' },
        { name: 'GST Registration', file: `GST_Registration_${vendor}.pdf`, type: 'KYC' },
      ],
    },
    {
      id: 'material',
      label: 'Material Certificates',
      stage: 'Material Gate-In',
      gateKey: 'gate-in',
      offset: -46,
      documents: [{ name: 'Material Test Certificate', file: `Material_Certificate_${id}.pdf`, type: 'Certificate' }],
    },
    {
      id: 'inspection',
      label: 'Inspection Reports',
      stage: 'QC Inspection',
      gateKey: 'qc',
      offset: -34,
      documents: [{ name: 'Inspection Report', file: `Inspection_Report_${id}.pdf`, type: 'Inspection Report' }],
    },
    {
      id: 'qc',
      label: 'QC Reports',
      stage: 'QC Inspection',
      gateKey: 'qc',
      offset: -32,
      documents: [{ name: 'QC Report', file: `QC_Report_${id}.pdf`, type: 'QC Report' }],
    },
    {
      id: 'delivery',
      label: 'Delivery Confirmation',
      stage: 'Delivery Confirmation',
      gateKey: 'delivery',
      offset: -20,
      documents: [{ name: 'Delivery Proof', file: `Delivery_Proof_${id}.pdf`, type: 'POD' }],
    },
    {
      id: 'governance',
      label: 'Governance Approval',
      stage: 'Governance Approval',
      gateKey: 'governance',
      offset: -12,
      documents: [{ name: 'Governance Approval Note', file: `Governance_Approval_${id}.pdf`, type: 'Approval' }],
    },
    {
      id: 'payment',
      label: 'Payment Release',
      stage: 'Payment Release',
      gateKey: 'payment',
      offset: -4,
      documents: [{ name: 'Payment Release Advice', file: `Payment_Release_${id}.pdf`, type: 'Payment' }],
    },
    {
      id: 'warranty',
      label: 'Vendor Warranty Letter',
      stage: 'Project Completion',
      offset: -2,
      documents: [{ name: 'Vendor Warranty Letter', file: `Vendor_Warranty_Letter_${id}.pdf`, type: 'Warranty' }],
    },
    {
      id: 'certificate',
      label: 'Final Completion Certificate',
      stage: 'Project Completion',
      offset: 2,
      documents: [{ name: 'Completion Certificate', file: `Completion_Certificate_${id}.pdf`, type: 'Certificate' }],
    },
  ];
}

function sizeFor(seed: number, index: number): string {
  const kb = 120 + ((seed + index * 137) % 880);
  return kb > 999 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export function buildPcfRecord(order: Order, detail: OrderDetail): PcfRecord {
  const seed = seedOf(order.id);
  const complete = isPcfComplete(order.id);
  const pendingExtras = new Set<string>(complete ? [] : ['certificate', ...(seed % 2 === 0 ? ['warranty'] : [])]);

  const checklist = definitions(order).map((definition, index) => {
    const milestone = definition.gateKey
      ? detail.milestones.find((entry) => entry.key === definition.gateKey)
      : undefined;
    const gatePending = Boolean(definition.gateKey) && milestone?.state !== 'complete';
    const pending = !complete && (pendingExtras.has(definition.id) || gatePending);
    const completedAt = pending ? null : milestone?.timestamp ?? shiftDays(order.expected, definition.offset);

    return {
      id: definition.id,
      label: definition.label,
      stage: definition.stage,
      status: (pending ? 'Pending' : 'Complete') as PcfItemStatus,
      completedAt,
      completedBy: ownerFor(STAGE_ROLE[definition.stage], order.plant),
      documents: definition.documents.map((document, documentIndex) => ({
        ...document,
        stage: definition.stage,
        size: sizeFor(seed, index + documentIndex),
      })),
    };
  });

  const collected = checklist.filter((item) => item.status === 'Complete').length;
  const missing = checklist.filter((item) => item.status === 'Pending').map((item) => item.label);
  const closed = checklist.filter((item) => item.status === 'Complete');
  const documents = closed.flatMap((item) => item.documents);
  const completionDate = checklist
    .map((item) => item.completedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .pop() ?? null;

  const traceability = [...WORKFLOW_STAGES, 'Project Completion']
    .map((stage) => ({ stage, documents: documents.filter((document) => document.stage === stage) }))
    .filter((trace) => trace.documents.length > 0);

  const stagesCompleted = WORKFLOW_STAGES.filter((stage) =>
    checklist.filter((item) => item.stage === stage).every((item) => item.status === 'Complete'),
  ).length;
  const approvalsCompleted = APPROVAL_STAGES.filter((stage) =>
    checklist.filter((item) => item.stage === stage).every((item) => item.status === 'Complete'),
  ).length;

  const awardDate = shiftDays(order.expected, -100);

  return {
    orderId: order.id,
    status: missing.length === 0 ? 'Complete' : 'Pending',
    completionPct: Math.round((collected / checklist.length) * 100),
    collected,
    total: checklist.length,
    checklist,
    missing,
    documents,
    traceability,
    completionDate: missing.length === 0 ? completionDate : null,
    generatedAt: missing.length === 0 && completionDate ? shiftDays(completionDate, 1) : null,
    generatedBy: ownerFor('Governance Auditor', order.plant),
    totalDeliveries: detail.shipments.length,
    workflowType: order.type,
    workflowVersion: `${order.type} Workflow v2.1`,
    pcfVersion: PCF_VERSION,
    workflowEngine: WORKFLOW_ENGINE,
    stagesCompleted,
    stagesTotal: WORKFLOW_STAGES.length,
    approvalsCompleted,
    approvalsTotal: APPROVAL_STAGES.length,
    deliveriesCompleted: detail.shipments.filter((shipment) => shipment.actual !== null).length,
    awardDate,
    durationDays: completionDate
      ? Math.round(
          (new Date(`${completionDate}T00:00:00`).getTime() - new Date(`${awardDate}T00:00:00`).getTime()) / 86_400_000,
        )
      : null,
  };
}
