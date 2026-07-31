// Per-order fulfilment detail — see RIL.md §9. ORD-2044 is the demo path and is
// authored in full; every other canonical order is generated from its register
// row so no tab renders an empty state.

import type { Order, Plant } from '../types/order';
import type {
  ActivityEntry,
  AttachedDocument,
  Invoice,
  Milestone,
  MilestoneState,
  OrderDetail,
  PcfArtifact,
  ScfRecord,
  SecurityPass,
  Shipment,
  StakeholderAssignment,
} from '../types/orderDetail';

export const GATE_CHAIN: { key: string; label: string; role: string }[] = [
  { key: 'clearance', label: 'Security Clearance', role: 'Security Desk' },
  { key: 'documents', label: 'Document Verification', role: 'QA Officer' },
  { key: 'gate-in', label: 'Material Gate-In', role: 'Gate Supervisor' },
  { key: 'qc', label: 'QC / Inspection', role: 'QA Officer' },
  { key: 'delivery', label: 'Delivery Confirmation', role: 'Site Lead' },
  { key: 'governance', label: 'Governance Approval', role: 'Governance Auditor' },
  { key: 'payment', label: 'Payment Release / SCF', role: 'Finance Controller' },
];

const PLANTS: Plant[] = ['Jamnagar', 'Delhi', 'Hyderabad', 'Nagpur', 'Surat'];

/** One person per role per plant — the pool the reassign modal filters against. */
export const STAKEHOLDER_DIRECTORY: Record<string, string[]> = {
  'Security Desk': ['Rakesh Menon', 'Devendra Rao', 'Suresh Iyer', 'Ajay Kulkarni', 'Farid Shaikh'],
  'QA Officer': ['Priya Nair', 'Anand Deshpande', 'Meera Joshi', 'Sandeep Rathi', 'Vikram Sethi'],
  'Gate Supervisor': ['Mahesh Patil', 'Irfan Qureshi', 'Ganesh Shetty', 'Nitin Bhosale', 'Rohit Yadav'],
  'Site Lead': ['Arun Verma', 'Kavita Rane', 'Deepak Chauhan', 'Sunil Bhatt', 'Neha Kulkarni'],
  'Governance Auditor': ['Ramesh Subramanian', 'Anita Desai', 'Harsh Mehta', 'Pooja Agarwal', 'Vivek Nanda'],
  'Finance Controller': ['Sanjay Gokhale', 'Ritu Malhotra', 'Alok Bansal', 'Shweta Pillai', 'Karan Ahuja'],
  'Vendor Coordinator': ['Imran Sheikh', 'Tanvi Kapoor', 'Naveen Reddy', 'Prakash Jain', 'Divya Menon'],
};

export function ownerFor(role: string, plant: Plant): string {
  const pool = STAKEHOLDER_DIRECTORY[role] ?? STAKEHOLDER_DIRECTORY['Site Lead'];
  return pool[PLANTS.indexOf(plant)] ?? pool[0];
}

/** Everyone who can hold a given gate, across the plants. */
export function eligibleOwners(role: string): { name: string; plant: Plant }[] {
  const pool = STAKEHOLDER_DIRECTORY[role] ?? [];
  return pool.map((name, index) => ({ name, plant: PLANTS[index] }));
}

function shiftDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const PCF_ARTIFACTS: { name: string; type: string }[] = [
  { name: 'Contract / PO Copy', type: 'Contract' },
  { name: 'Approved Drawings', type: 'Drawing' },
  { name: 'Material Test Certificates', type: 'Test Certificate' },
  { name: 'Inspection Reports', type: 'Inspection Report' },
  { name: 'Delivery Challans / POD', type: 'POD' },
  { name: 'Gate-In Records', type: 'Gate Record' },
  { name: 'Warranty Certificate', type: 'Certificate' },
  { name: 'Final Invoice & Payment Advice', type: 'Invoice' },
  { name: 'Project Completion Certificate', type: 'Certificate' },
];

// ---------------------------------------------------------------------------
// Generic builder — every non-demo order gets a full but shallow record.
// ---------------------------------------------------------------------------

function buildMilestones(order: Order): Milestone[] {
  const start = shiftDays(order.expected, -90);

  return GATE_CHAIN.map((gate, index) => {
    const registerState = order.gates[index]?.state ?? 'locked';
    const state: MilestoneState =
      registerState === 'done' ? 'complete' : registerState === 'current' ? 'current' : 'locked';
    const owner = { name: ownerFor(gate.role, order.plant), role: gate.role };
    const timestamp = state === 'complete' ? shiftDays(start, index * 11) : undefined;

    const dependencies =
      index === 0
        ? undefined
        : [
            {
              label: `${GATE_CHAIN[index - 1].label} complete`,
              met: state !== 'locked',
              reason:
                state === 'locked'
                  ? `${GATE_CHAIN[index - 1].label} has not closed for ${order.id}.`
                  : undefined,
            },
          ];

    return {
      ...gate,
      state,
      owner,
      timestamp,
      dependencies,
      documents: state === 'complete' ? [`${gate.label} record`] : undefined,
      history: timestamp
        ? [{ at: timestamp, note: `${gate.label} closed by ${owner.name}.` }]
        : [{ at: shiftDays(start, index * 11), note: `${gate.label} assigned to ${owner.name}.` }],
    };
  });
}

function buildShipments(order: Order): Shipment[] {
  const dispatch = shiftDays(order.expected, -18);
  const ordered = 120 + PLANTS.indexOf(order.plant) * 20;
  const delivered = order.progress >= 100;
  const received = delivered ? ordered : Math.round(ordered * 0.6);

  return [
    {
      id: `SHP-56${(Number(order.id.replace('ORD-', '')) - 2000).toString().padStart(2, '0')}`,
      dispatch,
      mode: 'Road',
      carrier: 'Safexpress',
      vehicle: `GJ-01-AB-${4000 + Number(order.id.replace('ORD-', ''))}`,
      expected: shiftDays(order.expected, -12),
      actual: shiftDays(order.expected, -12),
      ordered,
      received,
      missing: 0,
      damaged: 0,
      qc: delivered ? 'Pass' : 'Pending',
      tracking: `SFX${9000 + Number(order.id.replace('ORD-', ''))}IN`,
      driver: 'Ramesh Pawar',
      transporter: 'Safexpress Pvt Ltd',
      gateIn: `${shiftDays(order.expected, -12)}T09:40:00`,
      weighment: '18.4 T gross · 6.1 T tare · 12.3 T net',
      remarks: null,
      documents: [
        {
          id: `${order.id}-doc-pl`,
          name: 'Packing List',
          type: 'Packing List',
          status: 'Verified',
          uploadedBy: ownerFor('Vendor Coordinator', order.plant),
          uploadedAt: dispatch,
          size: '210 KB',
        },
        {
          id: `${order.id}-doc-ew`,
          name: 'E-Way Bill',
          type: 'E-Way Bill',
          status: 'Verified',
          uploadedBy: ownerFor('Vendor Coordinator', order.plant),
          uploadedAt: dispatch,
          size: '96 KB',
        },
      ],
    },
  ];
}

function buildDocuments(order: Order): AttachedDocument[] {
  const uploader = ownerFor('Vendor Coordinator', order.plant);
  const at = shiftDays(order.expected, -70);

  return [
    { id: `${order.id}-safety`, name: 'Safety Certificate', type: 'Safety Certificate', status: 'Verified', uploadedBy: uploader, uploadedAt: at, size: '480 KB' },
    { id: `${order.id}-insurance`, name: 'Insurance Policy', type: 'Insurance', status: 'Verified', uploadedBy: uploader, uploadedAt: at, size: '1.2 MB' },
    { id: `${order.id}-labor`, name: 'Labor License', type: 'Labor License', status: 'Verified', uploadedBy: uploader, uploadedAt: at, size: '340 KB' },
    { id: `${order.id}-test`, name: 'Test / Inspection Certificate', type: 'Test Certificate', status: 'Pending', uploadedBy: uploader, uploadedAt: undefined, size: undefined },
  ];
}

function buildPasses(order: Order): SecurityPass[] {
  const from = shiftDays(order.expected, -60);
  return [
    { id: `SP-${1200 + Number(order.id.replace('ORD-', ''))}`, holder: 'Site Engineer – Vendor', designation: 'Site Engineer', validFrom: from, validTo: shiftDays(order.expected, 20), milestone: 'Material Gate-In', status: 'Active' },
    { id: `SP-${1300 + Number(order.id.replace('ORD-', ''))}`, holder: 'QA Technician – Vendor', designation: 'QA Technician', validFrom: from, validTo: shiftDays(order.expected, 14), milestone: 'QC / Inspection', status: 'Active' },
    { id: `SP-${1400 + Number(order.id.replace('ORD-', ''))}`, holder: 'Logistics Coordinator – Vendor', designation: 'Logistics Coordinator', validFrom: from, validTo: shiftDays(order.expected, 4), milestone: 'Delivery Confirmation', status: 'Expiring' },
  ];
}

function buildStakeholders(order: Order): StakeholderAssignment[] {
  return GATE_CHAIN.map((gate) => ({
    gateKey: gate.key,
    gate: gate.label,
    owner: ownerFor(gate.role, order.plant),
    role: gate.role,
    plant: order.plant,
    assignment: 'Auto' as const,
  }));
}

function buildInvoices(order: Order): Invoice[] {
  const complete = order.progress >= 100;
  return [
    {
      id: `INV-9${(Number(order.id.replace('ORD-', '')) - 1900).toString().padStart(3, '0')}`,
      amountCr: Number((order.valueCr * 0.7).toFixed(2)),
      match: '2-way Matched',
      approval: complete ? 'Approved' : 'Pending',
      paymentStatus: complete ? 'Paid' : 'Scheduled',
      due: shiftDays(order.expected, 10),
    },
  ];
}

function buildScf(order: Order, milestones: Milestone[]): ScfRecord {
  const payment = milestones[6];
  const released = payment.state === 'complete';

  return {
    eligibility: order.valueCr >= 1 ? 'Eligible' : 'Eligible – small ticket',
    triggerMilestone: 'Payment Release / SCF',
    financedCr: released ? Number((order.valueCr * 0.7).toFixed(2)) : null,
    status: released ? 'Financed' : 'Not Triggered',
    condition:
      'Financing releases automatically once Payment Release / SCF closes against a matched invoice.',
    blockedReason: released
      ? null
      : `Payment Release / SCF is ${payment.state === 'blocked' ? 'blocked' : 'locked'} — its dependencies are unmet.`,
  };
}

function buildPcf(order: Order, milestones: Milestone[]): PcfArtifact[] {
  const closed = milestones.filter((m) => m.state === 'complete').length;
  const uploader = ownerFor('Vendor Coordinator', order.plant);

  return PCF_ARTIFACTS.map((artifact, index) => {
    const collected = index < Math.max(1, closed);
    return {
      id: `${order.id}-pcf-${index}`,
      name: artifact.name,
      type: artifact.type,
      status: collected ? 'Collected' : 'Pending',
      uploadedBy: collected ? uploader : undefined,
      uploadedAt: collected ? shiftDays(order.expected, -60 + index * 6) : undefined,
    };
  });
}

function buildActivity(order: Order, milestones: Milestone[]): ActivityEntry[] {
  const entries: ActivityEntry[] = [];

  milestones
    .filter((milestone) => milestone.state === 'complete' && milestone.timestamp)
    .forEach((milestone, index) => {
      entries.push({
        id: `${order.id}-act-gate-${index}`,
        actor: milestone.owner?.name ?? 'System',
        action: 'closed the gate',
        target: { label: milestone.label },
        timestamp: `${milestone.timestamp}T10:${(15 + index * 7) % 60}:00`,
        type: 'gate',
      });
    });

  entries.push(
    {
      id: `${order.id}-act-doc`,
      actor: ownerFor('Vendor Coordinator', order.plant),
      action: 'uploaded',
      target: { label: 'Safety Certificate' },
      timestamp: `${shiftDays(order.expected, -70)}T11:20:00`,
      type: 'document',
    },
    {
      id: `${order.id}-act-ship`,
      actor: ownerFor('Gate Supervisor', order.plant),
      action: 'recorded gate-in for',
      target: { label: 'the inbound consignment' },
      timestamp: `${shiftDays(order.expected, -12)}T09:40:00`,
      type: 'delivery',
    },
    {
      id: `${order.id}-act-inv`,
      actor: ownerFor('Finance Controller', order.plant),
      action: 'raised',
      target: { label: 'the milestone invoice', to: '/payments' },
      timestamp: `${shiftDays(order.expected, -8)}T16:05:00`,
      type: 'finance',
    },
  );

  return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function buildOrderDetail(order: Order): OrderDetail {
  const milestones = buildMilestones(order);

  return {
    orderId: order.id,
    milestones,
    shipments: buildShipments(order),
    documents: buildDocuments(order),
    securityPasses: buildPasses(order),
    stakeholders: buildStakeholders(order),
    invoices: buildInvoices(order),
    scf: buildScf(order, milestones),
    pcfArtifacts: buildPcf(order, milestones),
    activity: buildActivity(order, milestones),
  };
}

// ---------------------------------------------------------------------------
// ORD-2044 — the demo path. Authored in full; figures per RIL.md §9.
// ---------------------------------------------------------------------------

const ORD_2044_MILESTONES: Milestone[] = [
  {
    key: 'clearance',
    label: 'Security Clearance',
    state: 'complete',
    owner: { name: 'Ajay Kulkarni', role: 'Security Desk' },
    timestamp: '2026-06-28',
    detail: 'Vendor personnel cleared for Nagpur against three active site passes.',
    documents: ['ID Proof – Kirloskar personnel', 'Safety Induction Record'],
    history: [
      { at: '2026-06-24', note: 'Clearance request raised by Kirloskar Brothers.' },
      { at: '2026-06-28', note: 'Cleared by Ajay Kulkarni, Security Desk – Nagpur.' },
    ],
  },
  {
    key: 'documents',
    label: 'Document Verification',
    state: 'complete',
    owner: { name: 'Sandeep Rathi', role: 'QA Officer' },
    timestamp: '2026-07-01',
    detail: 'Safety certificate and insurance verified. Labor license flagged for renewal.',
    documents: ['Safety Certificate', 'Insurance Policy', 'Labor License'],
    history: [
      { at: '2026-06-29', note: 'Document pack submitted by vendor coordinator.' },
      { at: '2026-07-01', note: 'Verified by Sandeep Rathi with a renewal note on the labor license.' },
    ],
  },
  {
    key: 'gate-in',
    label: 'Material Gate-In',
    state: 'complete',
    owner: { name: 'Nitin Bhosale', role: 'Gate Supervisor' },
    timestamp: '2026-07-06',
    detail: 'SHP-5501 gate-in recorded in full. SHP-5502 gate-in recorded short.',
    documents: ['Gate Pass GT-4412', 'Weighment Slip'],
    history: [
      { at: '2026-07-06', note: 'SHP-5501 received in full — 200 of 200 units.' },
      { at: '2026-08-02', note: 'SHP-5502 received short — reconciliation raised at the gate.' },
    ],
  },
  {
    key: 'qc',
    label: 'QC / Inspection',
    state: 'blocked',
    owner: { name: 'Sandeep Rathi', role: 'QA Officer' },
    dependencies: [
      { label: 'Material Gate-In complete', met: true },
      {
        label: 'Full consignment received',
        met: false,
        reason:
          'SHP-5502 received short — 8 units missing, 4 damaged. Reconciliation required before QC can close.',
      },
    ],
    documents: ['Inspection Checklist (draft)'],
    history: [
      { at: '2026-08-02', note: 'QC opened against SHP-5502 and halted on the quantity mismatch.' },
    ],
  },
  {
    key: 'delivery',
    label: 'Delivery Confirmation',
    state: 'locked',
    owner: { name: 'Sunil Bhatt', role: 'Site Lead' },
    dependencies: [
      {
        label: 'QC / Inspection complete',
        met: false,
        reason: 'QC is blocked on the SHP-5502 reconciliation.',
      },
    ],
  },
  {
    key: 'governance',
    label: 'Governance Approval',
    state: 'locked',
    owner: { name: 'Pooja Agarwal', role: 'Governance Auditor' },
    dependencies: [
      {
        label: 'Delivery Confirmation complete',
        met: false,
        reason: 'Delivery Confirmation is locked behind QC / Inspection.',
      },
      { label: 'Contract value above ₹50L governance threshold', met: true },
    ],
  },
  {
    key: 'payment',
    label: 'Payment Release / SCF',
    state: 'locked',
    owner: { name: 'Shweta Pillai', role: 'Finance Controller' },
    dependencies: [
      {
        label: 'Governance Approval complete',
        met: false,
        reason: 'Governance Approval has not opened — its own dependency is unmet.',
      },
      {
        label: 'Invoice submitted against a closed milestone',
        met: false,
        reason: 'INV-9004 is raised but no milestone has closed to release it against.',
      },
    ],
  },
];

const ORD_2044_SHIPMENTS: Shipment[] = [
  {
    id: 'SHP-5501',
    dispatch: '2026-07-02',
    mode: 'Road',
    carrier: 'Safexpress',
    vehicle: 'GJ-01-AB-4521',
    expected: '2026-07-06',
    actual: '2026-07-06',
    ordered: 200,
    received: 200,
    missing: 0,
    damaged: 0,
    qc: 'Pass',
    tracking: 'SFX8841207IN',
    driver: 'Ramesh Pawar',
    transporter: 'Safexpress Pvt Ltd',
    gateIn: '2026-07-06T09:40:00',
    weighment: '22.6 T gross · 7.2 T tare · 15.4 T net',
    remarks: null,
    documents: [
      { id: 'shp5501-pl', name: 'Packing List', type: 'Packing List', status: 'Verified', uploadedBy: 'Imran Sheikh', uploadedAt: '2026-07-02', size: '218 KB' },
      { id: 'shp5501-inv', name: 'Vendor Invoice', type: 'Invoice', status: 'Verified', uploadedBy: 'Imran Sheikh', uploadedAt: '2026-07-02', size: '164 KB' },
      { id: 'shp5501-pod', name: 'Proof of Delivery', type: 'POD', status: 'Verified', uploadedBy: 'Nitin Bhosale', uploadedAt: '2026-07-06', size: '92 KB' },
    ],
  },
  {
    id: 'SHP-5502',
    dispatch: '2026-07-28',
    mode: 'Road',
    carrier: 'VRL Logistics',
    vehicle: 'MH-04-CD-8890',
    expected: '2026-08-01',
    actual: '2026-08-02',
    ordered: 150,
    received: 138,
    missing: 8,
    damaged: 4,
    qc: 'Partial Fail',
    tracking: 'VRL5560284IN',
    driver: 'Sadiq Ansari',
    transporter: 'VRL Logistics Ltd',
    gateIn: '2026-08-02T14:20:00',
    weighment: '16.9 T gross · 6.4 T tare · 10.5 T net',
    remarks:
      '8 units short against the dispatch note; 4 units damaged in transit. Carrier claim filed, reconciliation open.',
    documents: [
      { id: 'shp5502-pl', name: 'Packing List', type: 'Packing List', status: 'Verified', uploadedBy: 'Imran Sheikh', uploadedAt: '2026-07-28', size: '221 KB' },
      { id: 'shp5502-ew', name: 'E-Way Bill', type: 'E-Way Bill', status: 'Verified', uploadedBy: 'Imran Sheikh', uploadedAt: '2026-07-28', size: '88 KB' },
      { id: 'shp5502-short', name: 'Shortage & Damage Report', type: 'Inspection Report', status: 'Pending', uploadedBy: 'Nitin Bhosale', uploadedAt: '2026-08-02', size: '410 KB' },
    ],
  },
  {
    id: 'SHP-5503',
    dispatch: '2026-08-18',
    mode: 'Air',
    carrier: 'Blue Dart',
    vehicle: '6E-2231 (BLR→AMD)',
    expected: '2026-08-20',
    actual: null,
    ordered: 100,
    received: null,
    missing: 0,
    damaged: 0,
    qc: 'Pending',
    tracking: 'BD772140093',
    driver: '—',
    transporter: 'Blue Dart Aviation',
    gateIn: null,
    weighment: null,
    remarks: 'In transit. Balance quantity against the award.',
    documents: [
      { id: 'shp5503-pl', name: 'Packing List', type: 'Packing List', status: 'Submitted', uploadedBy: 'Imran Sheikh', uploadedAt: '2026-08-18', size: '196 KB' },
    ],
  },
];

const ORD_2044_DOCUMENTS: AttachedDocument[] = [
  { id: 'ord2044-safety', name: 'Safety Certificate', type: 'Safety Certificate', status: 'Verified', uploadedBy: 'Imran Sheikh', uploadedAt: '2026-06-26', size: '486 KB' },
  { id: 'ord2044-insurance', name: 'Insurance Policy', type: 'Insurance', status: 'Verified', uploadedBy: 'Imran Sheikh', uploadedAt: '2026-06-26', size: '1.2 MB' },
  { id: 'ord2044-labor', name: 'Labor License', type: 'Labor License', status: 'Expiring 2026-09-10', uploadedBy: 'Imran Sheikh', uploadedAt: '2026-06-27', size: '352 KB' },
  { id: 'ord2044-test', name: 'Test / Inspection Certificate', type: 'Test Certificate', status: 'Pending', uploadedBy: 'Kirloskar Brothers', uploadedAt: undefined, size: undefined },
];

const ORD_2044_PASSES: SecurityPass[] = [
  { id: 'SP-3341', holder: 'Vivek Kirloskar', designation: 'Site Engineer', validFrom: '2026-06-28', validTo: '2026-09-30', milestone: 'Material Gate-In', status: 'Active' },
  { id: 'SP-3342', holder: 'Sunita Barve', designation: 'QA Technician', validFrom: '2026-06-28', validTo: '2026-09-30', milestone: 'QC / Inspection', status: 'Active' },
  { id: 'SP-3343', holder: 'Prakash Gaikwad', designation: 'Logistics Coordinator', validFrom: '2026-06-28', validTo: '2026-08-12', milestone: 'Delivery Confirmation', status: 'Expiring' },
];

const ORD_2044_INVOICES: Invoice[] = [
  {
    id: 'INV-9004',
    amountCr: 0.63,
    match: '2-way Matched',
    approval: 'Approved',
    paymentStatus: 'Overdue',
    due: '2026-08-01',
  },
];

const ORD_2044_SCF: ScfRecord = {
  eligibility: 'Eligible',
  triggerMilestone: 'Payment Release / SCF',
  financedCr: null,
  status: 'Not Triggered',
  condition:
    'Financing releases automatically once Payment Release / SCF closes against a matched invoice.',
  blockedReason:
    'Payment Release / SCF is locked — Governance Approval is unmet and no milestone has closed for INV-9004 to release against.',
};

const ORD_2044_PCF: PcfArtifact[] = [
  { id: 'ord2044-pcf-0', name: 'Contract / PO Copy', type: 'Contract', status: 'Collected', uploadedBy: 'Imran Sheikh', uploadedAt: '2026-06-24' },
  { id: 'ord2044-pcf-1', name: 'Approved Drawings', type: 'Drawing', status: 'Collected', uploadedBy: 'Imran Sheikh', uploadedAt: '2026-06-30' },
  { id: 'ord2044-pcf-2', name: 'Material Test Certificates', type: 'Test Certificate', status: 'Pending' },
  { id: 'ord2044-pcf-3', name: 'Inspection Reports', type: 'Inspection Report', status: 'Pending' },
  { id: 'ord2044-pcf-4', name: 'Delivery Challans / POD', type: 'POD', status: 'Pending' },
  { id: 'ord2044-pcf-5', name: 'Gate-In Records', type: 'Gate Record', status: 'Collected', uploadedBy: 'Nitin Bhosale', uploadedAt: '2026-07-06' },
  { id: 'ord2044-pcf-6', name: 'Warranty Certificate', type: 'Certificate', status: 'N/A' },
  { id: 'ord2044-pcf-7', name: 'Final Invoice & Payment Advice', type: 'Invoice', status: 'Pending' },
  { id: 'ord2044-pcf-8', name: 'Project Completion Certificate', type: 'Certificate', status: 'Pending' },
];

const ORD_2044_ACTIVITY: ActivityEntry[] = [
  { id: 'ord2044-act-01', actor: 'Ajay Kulkarni', action: 'cleared', target: { label: 'Security Clearance' }, timestamp: '2026-06-28T10:15:00', type: 'gate' },
  { id: 'ord2044-act-02', actor: 'Imran Sheikh', action: 'uploaded', target: { label: 'Labor License' }, timestamp: '2026-06-27T15:42:00', type: 'document' },
  { id: 'ord2044-act-03', actor: 'Sandeep Rathi', action: 'verified the document pack and closed', target: { label: 'Document Verification' }, timestamp: '2026-07-01T11:05:00', type: 'gate' },
  { id: 'ord2044-act-04', actor: 'Imran Sheikh', action: 'logged shipment', target: { label: 'SHP-5501' }, timestamp: '2026-07-02T09:10:00', type: 'delivery' },
  { id: 'ord2044-act-05', actor: 'Nitin Bhosale', action: 'recorded gate-in for', target: { label: 'SHP-5501' }, timestamp: '2026-07-06T09:40:00', type: 'delivery' },
  { id: 'ord2044-act-06', actor: 'Nitin Bhosale', action: 'closed', target: { label: 'Material Gate-In' }, timestamp: '2026-07-06T12:25:00', type: 'gate' },
  { id: 'ord2044-act-07', actor: 'Imran Sheikh', action: 'logged shipment', target: { label: 'SHP-5502' }, timestamp: '2026-07-28T08:55:00', type: 'delivery' },
  { id: 'ord2044-act-08', actor: 'Nitin Bhosale', action: 'recorded a short receipt against', target: { label: 'SHP-5502' }, timestamp: '2026-08-02T14:20:00', type: 'delivery' },
  { id: 'ord2044-act-09', actor: 'Nitin Bhosale', action: 'raised a shortage and damage exception — 8 missing, 4 damaged — on', target: { label: 'SHP-5502' }, timestamp: '2026-08-02T14:48:00', type: 'delivery' },
  { id: 'ord2044-act-10', actor: 'System', action: 'blocked', target: { label: 'QC / Inspection' }, timestamp: '2026-08-02T14:49:00', type: 'gate' },
  { id: 'ord2044-act-11', actor: 'Shweta Pillai', action: 'flagged', target: { label: 'INV-9004', to: '/payments' }, timestamp: '2026-08-02T17:30:00', type: 'finance' },
  { id: 'ord2044-act-12', actor: 'Imran Sheikh', action: 'scheduled the balance consignment', target: { label: 'SHP-5503' }, timestamp: '2026-08-03T10:05:00', type: 'delivery' },
];

export function buildDemoOrderDetail(order: Order): OrderDetail {
  return {
    orderId: order.id,
    milestones: ORD_2044_MILESTONES,
    shipments: ORD_2044_SHIPMENTS,
    documents: ORD_2044_DOCUMENTS,
    securityPasses: ORD_2044_PASSES,
    stakeholders: [
      { gateKey: 'clearance', gate: 'Security Clearance', owner: 'Ajay Kulkarni', role: 'Security Desk', plant: 'Nagpur', assignment: 'Auto' },
      { gateKey: 'documents', gate: 'Document Verification', owner: 'Sandeep Rathi', role: 'QA Officer', plant: 'Nagpur', assignment: 'Auto' },
      { gateKey: 'gate-in', gate: 'Material Gate-In', owner: 'Nitin Bhosale', role: 'Gate Supervisor', plant: 'Nagpur', assignment: 'Manual' },
      { gateKey: 'qc', gate: 'QC / Inspection', owner: 'Sandeep Rathi', role: 'QA Officer', plant: 'Nagpur', assignment: 'Auto' },
      { gateKey: 'delivery', gate: 'Delivery Confirmation', owner: 'Sunil Bhatt', role: 'Site Lead', plant: 'Nagpur', assignment: 'Auto' },
      { gateKey: 'governance', gate: 'Governance Approval', owner: 'Pooja Agarwal', role: 'Governance Auditor', plant: 'Nagpur', assignment: 'Auto' },
      { gateKey: 'payment', gate: 'Payment Release / SCF', owner: 'Shweta Pillai', role: 'Finance Controller', plant: 'Nagpur', assignment: 'Auto' },
    ],
    invoices: ORD_2044_INVOICES,
    scf: ORD_2044_SCF,
    pcfArtifacts: ORD_2044_PCF,
    activity: ORD_2044_ACTIVITY,
  };
}

export const DEMO_ORDER_ID = 'ORD-2044';
